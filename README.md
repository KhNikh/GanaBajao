# 🎵 GaanaBajao - Add Free Music Streaming Application

A full-stack music streaming platform with Spotify-like smart recommendations, built with React, Node.js, and SQLite.

## ⚡ Quick Start

```bash
git clone https://github.com/KhNikh/GanaBajao.git
cd GanaBajao
npm start
```

Then open [http://localhost:5173](http://localhost:5173) and log in:
- **Email:** demo@gaanabajao.com  
- **Password:** demo123

That's it! 🎉

## ✨ Features

- 🎤 **Stream Music** - Play songs from JioSaavn or your local library
- 🎵 **Smart Recommendations** - Get personalized song suggestions based on:
  - Similar artists and genres
  - Your listening history
  - Search context
  - Trending songs
- ❤️ **Like Songs** - Build your collection of favorite tracks
- 📚 **Playlists** - Create and manage custom playlists
- 🎧 **Player Controls** - Play, pause, shuffle, repeat, seek, volume control
- 🔐 **User Authentication** - Secure login with JWT tokens
- 📱 **Responsive Design** - Works on desktop and mobile

## 🚀 Tech Stack

### Backend
- **Node.js + Express** - REST API server
- **SQLite (better-sqlite3)** - Local database
- **JWT** - Authentication tokens
- **Axios** - JioSaavn API integration

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool (blazing fast!)
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS
- **Context API** - State management

## 📋 Prerequisites

- Node.js (v16+)
- npm or yarn
- Git

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/KhNikh/GanaBajao.git
cd GanaBajao
```

### 2. Run the app (one command!)
```bash
npm start
```

That's it! The script will automatically:
- ✅ Install backend & frontend dependencies (if needed)
- ✅ Create `.env` file from `.env.example` (if needed)
- ✅ Start both backend (port 5000) and frontend (port 5173)
- ✅ Show you the app URL to open in browser

### 3. Access the app
The terminal will show:
```
📱 Local:    http://localhost:5173
🌐 Network:  http://YOUR_IP:5173
👤 Demo:     demo@gaanabajao.com / demo123
```

Just open `http://localhost:5173` in your browser!

### 4. Stop the app
Press `Ctrl+C` in the terminal - it will cleanly stop both services.

---

## 💡 Alternative: Manual Setup (if you prefer)

If you want to run backend and frontend separately in different terminals:

### Terminal 1 - Backend
```bash
cd backend
npm install
npm run dev  # or: npm start
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:5173`

## 📝 Demo Account

```
Email: demo@gaanabajao.com
Password: demo123
```

## 🎯 How Smart Recommendations Work

The app learns from what you play:

1. **Play a song** → System tracks duration and completion
2. **System analyzes** → Checks artist, genre, album, keywords
3. **Recommendations update** → Next time you visit, you get personalized picks
4. **Get better suggestions** → The more you play, the smarter it gets!

### Recommendation Types:

- **Recommended For You** (Home page) - Personalized based on history
- **Similar Songs** - When viewing a specific song
- **Search Context** - When you search, related suggestions appear
- **Trending** - Popular songs globally

## 🗂️ Project Structure

```
GanaBajao/
├── backend/
│   ├── src/
│   │   ├── server.js           # Express server
│   │   ├── db/                 # Database setup
│   │   ├── routes/             # API endpoints
│   │   │   ├── auth.js
│   │   │   ├── songs.js
│   │   │   ├── playlists.js
│   │   │   ├── saavn.js        # JioSaavn API wrapper
│   │   │   └── recommendations.js  # Smart recommendations
│   │   └── middleware/
│   │       └── auth.js         # JWT verification
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api/                # API client
│   │   ├── components/         # React components
│   │   ├── context/            # State management
│   │   │   ├── AuthContext.jsx
│   │   │   └── PlayerContext.jsx  # Music player state
│   │   └── pages/              # Page components
│   ├── vite.config.js
│   └── package.json
│
└── package.json
```

## 📚 Database Schema

### Key Tables:
- `users` - User accounts
- `songs` - Song metadata
- `playlists` - User playlists
- `liked_songs` - Liked songs per user
- **`play_history`** - Tracks when/how users play songs (for recommendations)

## � Available Scripts

### Main Command
```bash
npm start              # 🎵 Start everything! Backend + Frontend
# or: bash start.sh
```

### Individual Commands
```bash
# Install dependencies
npm run install:all    # Install backend & frontend deps

# Development (separate terminals)
npm run dev:backend    # Start backend only
npm run dev:frontend   # Start frontend only
npm run dev            # Start both (needs concurrently)
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Songs
- `GET /api/songs` - Get all songs (with filters)
- `GET /api/songs/trending` - Trending songs
- `POST /api/songs/:id/like` - Like/unlike song
- `POST /api/songs/:id/play` - Record play (with duration)

### Playlists
- `GET /api/playlists` - Get all playlists
- `POST /api/playlists` - Create playlist
- `POST /api/playlists/:id/songs` - Add song to playlist

### Recommendations ⭐
- `GET /api/recommendations/similar/:songId` - Similar to a song
- `GET /api/recommendations/for-me` - Personalized picks
- `GET /api/recommendations/trending` - Trending
- `GET /api/recommendations/search-based?query=...` - Related to search

### JioSaavn
- `GET /api/saavn/search?query=...` - Search JioSaavn
- `GET /api/saavn/trending` - Trending from JioSaavn

## � Troubleshooting

### Port already in use
If you get "port 5000/5173 already in use":
```bash
# Kill process using port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process using port 5173 (frontend)
lsof -ti:5173 | xargs kill -9

# Then run again
npm start
```

### Dependencies not installing
```bash
# Clear npm cache
npm cache clean --force

# Remove existing node_modules
rm -rf backend/node_modules frontend/node_modules

# Try again
npm start
```

### Check logs
If something fails, check the log files generated:
```bash
tail -f backend.log    # Backend errors
tail -f frontend.log   # Frontend errors
```

### Fresh start
```bash
# Remove everything and start fresh
rm -rf backend/node_modules frontend/node_modules backend/.env
npm install:all
npm start
```

## 🚀 Production Deploy

### Deploy Backend (Heroku, Railway, etc.)
```bash
# Ensure .env variables are set in hosting platform
npm start
```

### Deploy Frontend (Vercel, Netlify, etc.)
```bash
npm run build
# Upload the 'dist' folder
```

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📖 Learn More

- [Spotify Recommendations Algorithm](https://research.spotify.com/)
- [Building Recommendation Systems](https://developers.google.com/machine-learning/recommendation)

## ⚖️ License

MIT License - feel free to use this project

## 🐛 Known Issues & Future Improvements

- [ ] Add more sophisticated ML-based recommendations
- [ ] Implement user following
- [ ] Add podcast support
- [ ] Queue persistence (save queue locally)
- [ ] Offline mode
- [ ] Better search indexing for large libraries

## 📧 Contact & Support

For issues, feature requests, or questions:
- Open an issue on GitHub
- Email: support@gaanabajao.com

---

**Made with ❤️ for music lovers**
