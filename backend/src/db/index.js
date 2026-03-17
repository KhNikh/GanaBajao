const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(path.join(dbDir, 'gaanabajao.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS songs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT DEFAULT 'Unknown Album',
    genre TEXT DEFAULT 'Unknown',
    duration INTEGER DEFAULT 0,
    cover_url TEXT DEFAULT NULL,
    audio_url TEXT NOT NULL,
    plays INTEGER DEFAULT 0,
    uploaded_by TEXT REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS playlists (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    cover_url TEXT DEFAULT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_public INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS playlist_songs (
    playlist_id TEXT REFERENCES playlists(id) ON DELETE CASCADE,
    song_id TEXT REFERENCES songs(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (playlist_id, song_id)
  );

  CREATE TABLE IF NOT EXISTS liked_songs (
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    song_id TEXT REFERENCES songs(id) ON DELETE CASCADE,
    liked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, song_id)
  );

  CREATE TABLE IF NOT EXISTS followed_playlists (
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    playlist_id TEXT REFERENCES playlists(id) ON DELETE CASCADE,
    followed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, playlist_id)
  );

  CREATE TABLE IF NOT EXISTS play_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    song_id TEXT REFERENCES songs(id) ON DELETE CASCADE,
    played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    duration_played INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 0,
    source TEXT DEFAULT 'search'
  );

  CREATE TABLE IF NOT EXISTS similar_songs (
    song_id TEXT REFERENCES songs(id) ON DELETE CASCADE,
    similar_song_id TEXT REFERENCES songs(id) ON DELETE CASCADE,
    similarity_score REAL DEFAULT 0,
    reason TEXT DEFAULT 'artist',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (song_id, similar_song_id)
  );

  CREATE INDEX IF NOT EXISTS idx_play_history_user ON play_history(user_id, played_at);
  CREATE INDEX IF NOT EXISTS idx_play_history_song ON play_history(song_id);
  CREATE INDEX IF NOT EXISTS idx_similar_songs ON similar_songs(song_id);
`);

module.exports = db;
