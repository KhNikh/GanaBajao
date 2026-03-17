require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Placeholder cover generator
app.get('/api/covers/placeholder/:title/:color', (req, res) => {
  const { color } = req.params;
  const title = decodeURIComponent(req.params.title);
  const initial = title[0]?.toUpperCase() || '?';
  const bg = `#${color}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
    <rect width="300" height="300" fill="${bg}"/>
    <text x="150" y="175" font-family="Arial,sans-serif" font-size="120" font-weight="bold"
      fill="rgba(255,255,255,0.9)" text-anchor="middle">${initial}</text>
  </svg>`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(svg);
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/songs', require('./routes/songs'));
app.use('/api/playlists', require('./routes/playlists'));
app.use('/api/saavn', require('./routes/saavn'));
app.use('/api/recommendations', require('./routes/recommendations'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'GaanaBajao', version: '1.0.0' }));

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => console.log(`GaanaBajao backend running on http://0.0.0.0:${PORT}`));
