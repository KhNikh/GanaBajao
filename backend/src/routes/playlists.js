const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuth, (req, res) => {
  const { user_id } = req.query;
  let query = 'SELECT p.*, u.username FROM playlists p JOIN users u ON p.user_id = u.id WHERE p.is_public = 1';
  const params = [];
  if (user_id) { query = 'SELECT p.*, u.username FROM playlists p JOIN users u ON p.user_id = u.id WHERE p.user_id = ?'; params.push(user_id); }
  const playlists = db.prepare(query + ' ORDER BY p.created_at DESC').all(...params);
  playlists.forEach(p => {
    p.song_count = db.prepare('SELECT COUNT(*) as c FROM playlist_songs WHERE playlist_id = ?').get(p.id).c;
  });
  res.json(playlists);
});

router.get('/my', authMiddleware, (req, res) => {
  const playlists = db.prepare(`
    SELECT p.*, u.username FROM playlists p JOIN users u ON p.user_id = u.id
    WHERE p.user_id = ? ORDER BY p.created_at DESC
  `).all(req.user.id);
  playlists.forEach(p => {
    p.song_count = db.prepare('SELECT COUNT(*) as c FROM playlist_songs WHERE playlist_id = ?').get(p.id).c;
  });
  res.json(playlists);
});

router.get('/:id', optionalAuth, (req, res) => {
  const playlist = db.prepare(`
    SELECT p.*, u.username FROM playlists p JOIN users u ON p.user_id = u.id WHERE p.id = ?
  `).get(req.params.id);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

  const songs = db.prepare(`
    SELECT s.*, ps.position, ps.added_at FROM songs s
    JOIN playlist_songs ps ON s.id = ps.song_id
    WHERE ps.playlist_id = ? ORDER BY ps.position
  `).all(req.params.id);

  if (req.user) {
    const likedIds = new Set(
      db.prepare('SELECT song_id FROM liked_songs WHERE user_id = ?').all(req.user.id).map(r => r.song_id)
    );
    songs.forEach(s => { s.is_liked = likedIds.has(s.id); });
    playlist.is_following = !!db.prepare('SELECT 1 FROM followed_playlists WHERE user_id = ? AND playlist_id = ?').get(req.user.id, playlist.id);
  }

  res.json({ ...playlist, songs });
});

router.post('/', authMiddleware, (req, res) => {
  const { name, description, is_public } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const id = uuidv4();
  db.prepare('INSERT INTO playlists (id, name, description, user_id, is_public) VALUES (?, ?, ?, ?, ?)').run(
    id, name, description || '', req.user.id, is_public !== false ? 1 : 0
  );
  const playlist = db.prepare('SELECT p.*, u.username FROM playlists p JOIN users u ON p.user_id = u.id WHERE p.id = ?').get(id);
  res.status(201).json({ ...playlist, songs: [], song_count: 0 });
});

router.put('/:id', authMiddleware, (req, res) => {
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
  if (playlist.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const { name, description, is_public } = req.body;
  db.prepare('UPDATE playlists SET name = ?, description = ?, is_public = ? WHERE id = ?').run(
    name || playlist.name, description ?? playlist.description, is_public !== undefined ? (is_public ? 1 : 0) : playlist.is_public, playlist.id
  );
  res.json(db.prepare('SELECT * FROM playlists WHERE id = ?').get(playlist.id));
});

router.delete('/:id', authMiddleware, (req, res) => {
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
  if (playlist.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  db.prepare('DELETE FROM playlists WHERE id = ?').run(playlist.id);
  res.json({ ok: true });
});

router.post('/:id/songs', authMiddleware, (req, res) => {
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
  if (playlist.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const { song_id } = req.body;
  if (!song_id) return res.status(400).json({ error: 'song_id is required' });
  const song = db.prepare('SELECT id FROM songs WHERE id = ?').get(song_id);
  if (!song) return res.status(404).json({ error: 'Song not found' });

  const existing = db.prepare('SELECT 1 FROM playlist_songs WHERE playlist_id = ? AND song_id = ?').get(playlist.id, song_id);
  if (existing) return res.status(409).json({ error: 'Song already in playlist' });

  const maxPos = db.prepare('SELECT MAX(position) as m FROM playlist_songs WHERE playlist_id = ?').get(playlist.id).m ?? -1;
  db.prepare('INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES (?, ?, ?)').run(playlist.id, song_id, maxPos + 1);
  res.json({ ok: true });
});

router.delete('/:id/songs/:songId', authMiddleware, (req, res) => {
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
  if (playlist.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  db.prepare('DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?').run(playlist.id, req.params.songId);
  res.json({ ok: true });
});

router.post('/:id/follow', authMiddleware, (req, res) => {
  const playlist = db.prepare('SELECT id FROM playlists WHERE id = ?').get(req.params.id);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
  const existing = db.prepare('SELECT 1 FROM followed_playlists WHERE user_id = ? AND playlist_id = ?').get(req.user.id, playlist.id);
  if (existing) {
    db.prepare('DELETE FROM followed_playlists WHERE user_id = ? AND playlist_id = ?').run(req.user.id, playlist.id);
    res.json({ following: false });
  } else {
    db.prepare('INSERT INTO followed_playlists (user_id, playlist_id) VALUES (?, ?)').run(req.user.id, playlist.id);
    res.json({ following: true });
  }
});

module.exports = router;
