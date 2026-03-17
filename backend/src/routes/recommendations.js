const express = require('express');
const db = require('../db');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * Calculate similarity score between two songs
 * Factors: artist match (40%), genre match (30%), album match (20%), keyword match (10%)
 */
function calculateSimilarity(song1, song2) {
  let score = 0;

  // Artist match (primary factor - 40%)
  if (song1.artist && song2.artist) {
    if (song1.artist.toLowerCase() === song2.artist.toLowerCase()) {
      score += 40;
    } else if (song1.artist.toLowerCase().includes(song2.artist.toLowerCase()) ||
               song2.artist.toLowerCase().includes(song1.artist.toLowerCase())) {
      score += 20;
    }
  }

  // Genre match (30%)
  if (song1.genre && song2.genre && 
      song1.genre.toLowerCase() === song2.genre.toLowerCase()) {
    score += 30;
  }

  // Album match (20%)
  if (song1.album && song2.album && 
      song1.album.toLowerCase() === song2.album.toLowerCase()) {
    score += 20;
  }

  // Title keyword match (10%) - helps find remixes, covers, etc
  const title1Words = song1.title.toLowerCase().split(/\s+/);
  const title2Words = song2.title.toLowerCase().split(/\s+/);
  const commonWords = title1Words.filter(w => title2Words.includes(w) && w.length > 3);
  if (commonWords.length > 0) {
    score += 10;
  }

  return score;
}

/**
 * Get similar songs for a given song (content-based)
 * GET /api/recommendations/similar/:songId?limit=10
 */
router.get('/similar/:songId', optionalAuth, (req, res) => {
  try {
    const { songId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(songId);
    if (!song) return res.status(404).json({ error: 'Song not found' });

    // Get all songs except the requested one
    const allSongs = db.prepare('SELECT * FROM songs WHERE id != ?').all(songId);

    // Calculate similarity for each song
    const similarSongs = allSongs
      .map(s => ({
        ...s,
        similarity: calculateSimilarity(song, s),
      }))
      .filter(s => s.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    // Mark liked songs for user
    if (req.user) {
      const likedIds = new Set(
        db.prepare('SELECT song_id FROM liked_songs WHERE user_id = ?')
          .all(req.user.id)
          .map(r => r.song_id)
      );
      similarSongs.forEach(s => { s.is_liked = likedIds.has(s.id); });
    }

    res.json({
      reason: 'similar_songs',
      base_song: song,
      recommendations: similarSongs,
    });
  } catch (err) {
    console.error('Recommendations error:', err.message);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

/**
 * Get personalized recommendations for user based on play history
 * GET /api/recommendations/for-me?limit=20
 */
router.get('/for-me', optionalAuth, (req, res) => {
  try {
    if (!req.user) {
      // For anonymous users, return trending songs
      const trending = db.prepare(
        'SELECT * FROM songs ORDER BY plays DESC LIMIT ? OFFSET 0'
      ).all(Math.min(parseInt(req.query.limit) || 20, 50));
      return res.json({ reason: 'trending', recommendations: trending });
    }

    const limit = Math.min(parseInt(req.query.limit) || 20, 50);

    // Get user's play history (last 30 days, last 50 songs)
    const playHistory = db.prepare(`
      SELECT DISTINCT song_id FROM play_history 
      WHERE user_id = ? AND played_at > datetime('now', '-30 days')
      ORDER BY played_at DESC 
      LIMIT 50
    `).all(req.user.id);

    // Get user's liked songs
    const likedSongs = db.prepare(`
      SELECT song_id FROM liked_songs WHERE user_id = ?
    `).all(req.user.id);

    const userSongIds = new Set([
      ...playHistory.map(p => p.song_id),
      ...likedSongs.map(l => l.song_id),
    ]);

    if (userSongIds.size === 0) {
      // New user: return trending
      const trending = db.prepare(
        'SELECT * FROM songs ORDER BY plays DESC LIMIT ?'
      ).all(limit);
      return res.json({ reason: 'trending', recommendations: trending });
    }

    // Get songs user has interacted with to find similar ones
    const interactedSongs = db.prepare(`
      SELECT * FROM songs WHERE id IN (${Array(userSongIds.size).fill('?').join(',')})
    `).all(...Array.from(userSongIds));

    // Find songs similar to what user likes
    const allSongs = db.prepare('SELECT * FROM songs').all();
    const candidateSongs = new Map();

    for (const userSong of interactedSongs) {
      for (const candidate of allSongs) {
        if (userSongIds.has(candidate.id)) continue; // Skip already interacted songs

        const similarity = calculateSimilarity(userSong, candidate);
        if (similarity > 0) {
          const existing = candidateSongs.get(candidate.id) || {
            ...candidate,
            totalSimilarity: 0,
            matchCount: 0,
          };
          existing.totalSimilarity += similarity;
          existing.matchCount += 1;
          candidateSongs.set(candidate.id, existing);
        }
      }
    }

    // Sort by average similarity score
    const recommendations = Array.from(candidateSongs.values())
      .map(s => ({
        ...s,
        avgSimilarity: s.totalSimilarity / s.matchCount,
      }))
      .sort((a, b) => b.avgSimilarity - a.avgSimilarity)
      .slice(0, limit);

    // Mark liked songs
    const likedIds = new Set(likedSongs.map(l => l.song_id));
    recommendations.forEach(s => { s.is_liked = likedIds.has(s.id); });

    res.json({
      reason: 'personalized',
      recommendations,
    });
  } catch (err) {
    console.error('Personalized recommendations error:', err.message);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

/**
 * Get trending songs across all users
 * GET /api/recommendations/trending?limit=20
 */
router.get('/trending', (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const trending = db.prepare(`
      SELECT * FROM songs 
      ORDER BY plays DESC 
      LIMIT ?
    `).all(limit);

    res.json({
      reason: 'trending',
      recommendations: trending,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trending' });
  }
});

/**
 * Get recommendations based on search query context
 * GET /api/recommendations/search?query=artist%20name&limit=10
 */
router.get('/search-based', optionalAuth, (req, res) => {
  try {
    const { query } = req.query;
    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'query parameter required' });
    }

    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const searchTerm = `%${query.trim()}%`;

    // Find songs matching the search
    const matchingSongs = db.prepare(`
      SELECT * FROM songs 
      WHERE title LIKE ? OR artist LIKE ? OR album LIKE ?
      LIMIT ?
    `).all(searchTerm, searchTerm, searchTerm, limit);

    if (matchingSongs.length === 0) {
      return res.json({ reason: 'search_based', recommendations: [] });
    }

    // Find similar songs for all matching songs
    const allSongs = db.prepare('SELECT * FROM songs').all();
    const candidateSongs = new Map();

    for (const userSong of matchingSongs) {
      for (const candidate of allSongs) {
        if (candidate.id === userSong.id) continue;

        const similarity = calculateSimilarity(userSong, candidate);
        if (similarity > 0) {
          const existing = candidateSongs.get(candidate.id) || {
            ...candidate,
            totalSimilarity: 0,
          };
          existing.totalSimilarity += similarity;
          candidateSongs.set(candidate.id, existing);
        }
      }
    }

    const recommendations = Array.from(candidateSongs.values())
      .sort((a, b) => b.totalSimilarity - a.totalSimilarity)
      .slice(0, limit);

    if (req.user) {
      const likedIds = new Set(
        db.prepare('SELECT song_id FROM liked_songs WHERE user_id = ?')
          .all(req.user.id)
          .map(r => r.song_id)
      );
      recommendations.forEach(s => { s.is_liked = likedIds.has(s.id); });
    }

    res.json({
      reason: 'search_based',
      query,
      recommendations,
    });
  } catch (err) {
    console.error('Search-based recommendations error:', err.message);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

module.exports = router;
