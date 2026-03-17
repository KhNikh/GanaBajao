const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = file.fieldname === 'audio'
      ? path.join(__dirname, '../../uploads/songs')
      : path.join(__dirname, '../../uploads/covers');
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

router.get('/', optionalAuth, (req, res) => {
  const { search, genre, artist, limit = 50, offset = 0 } = req.query;
  let query = 'SELECT * FROM songs WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (title LIKE ? OR artist LIKE ? OR album LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }
  if (genre) { query += ' AND genre = ?'; params.push(genre); }
  if (artist) { query += ' AND artist LIKE ?'; params.push(`%${artist}%`); }

  query += ' ORDER BY plays DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const songs = db.prepare(query).all(...params);

  if (req.user) {
    const likedIds = new Set(
      db.prepare('SELECT song_id FROM liked_songs WHERE user_id = ?').all(req.user.id).map(r => r.song_id)
    );
    songs.forEach(s => { s.is_liked = likedIds.has(s.id); });
  }

  res.json(songs);
});

router.get('/trending', optionalAuth, (req, res) => {
  const songs = db.prepare('SELECT * FROM songs ORDER BY plays DESC LIMIT 20').all();
  res.json(songs);
});

router.get('/genres', (req, res) => {
  const genres = db.prepare('SELECT DISTINCT genre FROM songs ORDER BY genre').all().map(r => r.genre);
  res.json(genres);
});

router.get('/liked', authMiddleware, (req, res) => {
  const songs = db.prepare(`
    SELECT s.*, 1 as is_liked FROM songs s
    JOIN liked_songs ls ON s.id = ls.song_id
    WHERE ls.user_id = ?
    ORDER BY ls.liked_at DESC
  `).all(req.user.id);
  res.json(songs);
});

router.get('/:id', optionalAuth, (req, res) => {
  const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(req.params.id);
  if (!song) return res.status(404).json({ error: 'Song not found' });
  if (req.user) {
    const liked = db.prepare('SELECT 1 FROM liked_songs WHERE user_id = ? AND song_id = ?').get(req.user.id, song.id);
    song.is_liked = !!liked;
  }
  res.json(song);
});

router.post('/:id/like', authMiddleware, (req, res) => {
  const song = db.prepare('SELECT id FROM songs WHERE id = ?').get(req.params.id);
  if (!song) return res.status(404).json({ error: 'Song not found' });

  const existing = db.prepare('SELECT 1 FROM liked_songs WHERE user_id = ? AND song_id = ?').get(req.user.id, song.id);
  if (existing) {
    db.prepare('DELETE FROM liked_songs WHERE user_id = ? AND song_id = ?').run(req.user.id, song.id);
    res.json({ liked: false });
  } else {
    db.prepare('INSERT INTO liked_songs (user_id, song_id) VALUES (?, ?)').run(req.user.id, song.id);
    res.json({ liked: true });
  }
});

router.post('/:id/play', optionalAuth, (req, res) => {
  const { durationPlayed = 0, completed = 0, source = 'player' } = req.body;
  
  try {
    // Update global play count (works for any song - local or external)
    const song = db.prepare('SELECT id FROM songs WHERE id = ?').get(req.params.id);
    if (song) {
      db.prepare('UPDATE songs SET plays = plays + 1 WHERE id = ?').run(req.params.id);
    }

    // Track in user's play history only for songs in local database
    if (req.user && song) {
      db.prepare(`
        INSERT INTO play_history (user_id, song_id, duration_played, completed, source)
        VALUES (?, ?, ?, ?, ?)
      `).run(req.user.id, req.params.id, parseInt(durationPlayed), completed ? 1 : 0, source);
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Play history error:', err.message);
    // Don't fail the request - just log the error
    res.json({ ok: true });
  }
});

router.post('/', authMiddleware, upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), (req, res) => {
  const { title, artist, album, genre, duration } = req.body;
  if (!title || !artist || !req.files?.audio)
    return res.status(400).json({ error: 'Title, artist, and audio file are required' });

  const id = uuidv4();
  const audioUrl = `/uploads/songs/${req.files.audio[0].filename}`;
  const coverUrl = req.files?.cover ? `/uploads/covers/${req.files.cover[0].filename}` : null;

  db.prepare(`
    INSERT INTO songs (id, title, artist, album, genre, duration, cover_url, audio_url, uploaded_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, title, artist, album || 'Unknown Album', genre || 'Unknown', parseInt(duration) || 0, coverUrl, audioUrl, req.user.id);

  const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(id);
  res.status(201).json(song);
});

module.exports = router;
