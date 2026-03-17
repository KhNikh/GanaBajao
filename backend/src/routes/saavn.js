const express = require('express');
const axios = require('axios');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();
const SAAVN_API = 'https://jiosaavn-api-privatecvc2.vercel.app';

const saavn = axios.create({
  baseURL: SAAVN_API,
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
    'Accept': 'application/json',
  },
});

function pickAudio(downloadUrl) {
  if (!downloadUrl?.length) return null;
  // API uses "link" field
  return (
    downloadUrl.find(d => d.quality === '160kbps')?.link ||
    downloadUrl.find(d => d.quality === '96kbps')?.link ||
    downloadUrl.find(d => d.quality === '48kbps')?.link ||
    downloadUrl[downloadUrl.length - 1]?.link ||
    // fallback if "url" field is used
    downloadUrl.find(d => d.quality === '160kbps')?.url ||
    downloadUrl[downloadUrl.length - 1]?.url
  );
}

function pickCover(images) {
  if (!images?.length) return null;
  return (
    images.find(i => i.quality === '500x500')?.link ||
    images.find(i => i.quality === '150x150')?.link ||
    images[images.length - 1]?.link ||
    images.find(i => i.quality === '500x500')?.url ||
    images[images.length - 1]?.url
  );
}

function normalizeSong(song) {
  return {
    id: `saavn_${song.id}`,
    title: song.name,
    artist: song.primaryArtists || song.artists?.primary?.map(a => a.name).join(', ') || 'Unknown',
    album: song.album?.name || 'Unknown Album',
    genre: 'Bollywood',
    duration: parseInt(song.duration) || 0,
    cover_url: pickCover(song.image),
    audio_url: pickAudio(song.downloadUrl),
    plays: parseInt(song.playCount) || 0,
    is_liked: false,
    source: 'saavn',
  };
}

router.get('/search', optionalAuth, async (req, res) => {
  const { query, limit = 20 } = req.query;
  if (!query?.trim()) return res.status(400).json({ error: 'query is required' });

  try {
    const { data } = await saavn.get('/search/songs', {
      params: { query: query.trim(), limit },
    });
    const songs = (data?.data?.results || [])
      .map(normalizeSong)
      .filter(s => s.audio_url);
    res.json(songs);
  } catch (err) {
    console.error('Saavn search error:', err.message);
    res.status(502).json({ error: 'Failed to fetch from JioSaavn' });
  }
});

router.get('/trending', async (req, res) => {
  try {
    const { data } = await saavn.get('/search/songs', {
      params: { query: 'top hindi songs 2024', limit: 20 },
    });
    const songs = (data?.data?.results || [])
      .map(normalizeSong)
      .filter(s => s.audio_url);
    res.json(songs);
  } catch (err) {
    res.status(502).json({ error: 'Failed to fetch from JioSaavn' });
  }
});

module.exports = router;
