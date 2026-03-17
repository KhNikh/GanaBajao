const db = require('./index');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const saavn = axios.create({
  baseURL: 'https://jiosaavn-api-privatecvc2.vercel.app',
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
    'Accept': 'application/json',
  },
});

function pickAudio(arr) {
  if (!arr?.length) return null;
  return (
    arr.find(d => d.quality === '160kbps')?.link ||
    arr.find(d => d.quality === '96kbps')?.link ||
    arr.find(d => d.quality === '48kbps')?.link ||
    arr[arr.length - 1]?.link ||
    arr.find(d => d.quality === '160kbps')?.url ||
    arr[arr.length - 1]?.url
  );
}

function pickCover(arr) {
  if (!arr?.length) return null;
  return (
    arr.find(i => i.quality === '500x500')?.link ||
    arr.find(i => i.quality === '150x150')?.link ||
    arr[arr.length - 1]?.link ||
    arr[arr.length - 1]?.url
  );
}

async function searchSong(query) {
  try {
    const { data } = await saavn.get('/search/songs', { params: { query, limit: 1 } });
    const song = data?.data?.results?.[0];
    if (!song) return null;
    const audio_url = pickAudio(song.downloadUrl);
    if (!audio_url) return null;
    return {
      title: song.name,
      artist: song.primaryArtists || 'Unknown',
      album: song.album?.name || 'Unknown Album',
      duration: parseInt(song.duration) || 0,
      cover_url: pickCover(song.image),
      audio_url,
    };
  } catch (e) {
    console.warn(`  Failed: "${query}" — ${e.message}`);
    return null;
  }
}

const SONGS = [
  { query: 'Kesariya Arijit Singh Brahmastra', genre: 'Bollywood' },
  { query: 'Tum Hi Ho Arijit Singh Aashiqui 2', genre: 'Bollywood' },
  { query: 'Raataan Lambiyan Jubin Nautiyal Shershaah', genre: 'Bollywood' },
  { query: 'Pehle Bhi Main Vishal Mishra Animal', genre: 'Bollywood' },
  { query: 'Tera Yaar Hoon Main Arijit Singh', genre: 'Bollywood' },
  { query: 'Channa Mereya Arijit Singh Ae Dil Hai Mushkil', genre: 'Bollywood' },
  { query: 'Kho Gaye Hum Kahan Jasleen Royal', genre: 'Indie' },
  { query: 'Zinda Banda Jawan Shah Rukh Khan', genre: 'Bollywood' },
  { query: 'O Maahi Arijit Singh Dunki', genre: 'Bollywood' },
  { query: 'Apna Bana Le Arijit Singh Bhediya', genre: 'Bollywood' },
  { query: 'Tere Vaaste Varun Jain', genre: 'Bollywood' },
  { query: 'Jai Jai Shivshankar War Hrithik', genre: 'Bollywood' },
];

async function main() {
  console.log('Seeding database with real songs from JioSaavn...\n');

  const password = bcrypt.hashSync('demo123', 10);
  const demoUserId = uuidv4();
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@gaanabajao.com');

  if (!existingUser) {
    db.prepare('INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)')
      .run(demoUserId, 'demo_user', 'demo@gaanabajao.com', password);
    console.log('Created demo user: demo@gaanabajao.com / demo123\n');
  }
  const userId = existingUser?.id || demoUserId;

  db.prepare('DELETE FROM playlist_songs').run();
  db.prepare('DELETE FROM playlists').run();
  db.prepare('DELETE FROM liked_songs').run();
  db.prepare('DELETE FROM songs').run();
  console.log('Cleared old songs.\n');

  const insertSong = db.prepare(`
    INSERT INTO songs (id, title, artist, album, genre, duration, cover_url, audio_url, plays, uploaded_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const songIds = [];
  for (const { query, genre } of SONGS) {
    process.stdout.write(`Fetching: ${query}... `);
    const song = await searchSong(query);
    if (!song) { console.log('SKIPPED'); continue; }
    const id = uuidv4();
    songIds.push(id);
    insertSong.run(id, song.title, song.artist, song.album, genre,
      song.duration, song.cover_url, song.audio_url,
      Math.floor(Math.random() * 500000), userId);
    console.log(`OK — ${song.title} by ${song.artist}`);
  }

  console.log(`\nInserted ${songIds.length} songs.\n`);

  if (songIds.length > 0) {
    const insertPS = db.prepare('INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES (?, ?, ?)');

    const pl1 = uuidv4();
    db.prepare('INSERT INTO playlists (id, name, description, user_id, is_public) VALUES (?, ?, ?, ?, 1)')
      .run(pl1, 'Top Bollywood Hits', 'Best of Bollywood music', userId);
    songIds.slice(0, 6).forEach((id, i) => insertPS.run(pl1, id, i));

    const arijitIds = db.prepare("SELECT id FROM songs WHERE artist LIKE '%Arijit%'").all().map(r => r.id);
    if (arijitIds.length > 0) {
      const pl2 = uuidv4();
      db.prepare('INSERT INTO playlists (id, name, description, user_id, is_public) VALUES (?, ?, ?, ?, 1)')
        .run(pl2, 'Arijit Singh Favorites', 'Best of Arijit Singh', userId);
      arijitIds.forEach((id, i) => insertPS.run(pl2, id, i));
    }
    console.log('Created playlists.');
  }

  console.log('\nDone!');
}

main().catch(err => { console.error(err); process.exit(1); });
