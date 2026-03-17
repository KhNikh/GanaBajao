# Song Recommendations System - Implementation Guide

## 🎯 Overview

Your music app now has a **Spotify-like recommendation system** that suggests similar songs based on:
- User listening history
- Song metadata (artist, genre, album)
- User preferences (liked songs)
- Search context

---

## 📊 How It Works

### **Recommendation Engine Algorithm**

The system uses a **hybrid content-based approach** with the following priority:

```
Similarity Score Calculation:
├── Artist Match (40%) - Same artist is strongest signal
├── Genre Match (30%) - Musical style similarity
├── Album Match (20%) - Songs from same album/project
└── Title Keywords (10%) - For covers, remixes, collaborations
```

**Example Calculation:**
- Song A: "Shape of You" by Ed Sheeran (Genre: Pop)
- Song B: "Thinking Out Loud" by Ed Sheeran (Genre: Pop)
- Similarity Score: 40 (artist) + 30 (genre) = **70/100**

---

## 🔄 Data Flow

### 1. **Play Tracking** (User Backend)
When a user plays a song:
```javascript
songsApi.play(songId, {
  durationPlayed: 180,  // seconds played
  completed: 1,         // 0 = skipped, 1 = completed
  source: 'player'      // 'player' or 'search'
})
```

**Database Entry:**
- Stores in `play_history` table
- Tracks: user_id, song_id, play time, completion status
- Used to build user preference profile

### 2. **Recommendation Requests**
Frontend requests recommendations via 4 endpoints:

#### **A. Similar Songs (Song-Based)**
```javascript
GET /api/recommendations/similar/:songId?limit=10
```
Returns songs similar to a specific track
- Used: When user plays a song → shows "More Like This"
- Algorithm: Finds songs with high similarity score

#### **B. Personalized For You (User-Based)**
```javascript
GET /api/recommendations/for-me?limit=20
```
Returns personalized recommendations based on user's history
- Used: Home page, new user greeting
- Algorithm: Analyzes last 30 days of plays + likes → finds similar songs

#### **C. Search-Based**
```javascript
GET /api/recommendations/search-based?query=artist+name&limit=10
```
Returns songs similar to search results
- Used: Search page recommendations
- Algorithm: Finds songs similar to what user searched for

#### **D. Trending**
```javascript
GET /api/recommendations/trending?limit=20
```
Returns popular songs globally
- Fallback for new/anonymous users
- Based on play count across all users

---

## 📁 Database Schema

### New Tables Added:

```sql
-- Play History Tracking
CREATE TABLE play_history (
  id INTEGER PRIMARY KEY,
  user_id TEXT,           -- Who played it
  song_id TEXT,           -- What was played
  played_at DATETIME,     -- When it was played
  duration_played INTEGER, -- How many seconds
  completed INTEGER,      -- Did they finish it?
  source TEXT             -- From 'player' or 'search'
);
CREATE INDEX idx_play_history_user ON play_history(user_id, played_at);

-- Similar Songs Cache (for future optimization)
CREATE TABLE similar_songs (
  song_id TEXT,              -- Base song
  similar_song_id TEXT,      -- Similar to
  similarity_score REAL,     -- 0-100 score
  reason TEXT,               -- Why: 'artist'|'genre'|'album'
  created_at DATETIME
);
CREATE INDEX idx_similar_songs ON similar_songs(song_id);
```

---

## 🎨 Frontend Components

### 1. **RecommendationsSection.jsx**
Reusable component for displaying recommendation cards:
```jsx
<RecommendationsSection
  title="Recommended For You"
  type="for-me"        // 'for-me' | 'similar' | 'trending' | 'search-based'
  limit={10}
  className="mb-8"
/>
```

**Features:**
- Loading skeleton animation
- Error handling
- Empty state handling
- Responsive grid layout

### 2. **SimilarSongsModal.jsx**
Modal for viewing similar songs to current track:
```jsx
<SimilarSongsModal 
  song={currentSong}
  isOpen={showSimilar}
  onClose={() => setShowSimilar(false)}
/>
```

### 3. **PlayerContext.jsx Updates**
Now tracks:
- Song start time
- Duration played
- Completion status
- Skip detection

---

## 🚀 Integration Points

### **Home Page**
```jsx
<RecommendationsSection
  title="Recommended For You"
  type="for-me"
  limit={10}
/>
```
✅ Shows personalized recommendations for authenticated users

### **Search Page**
```jsx
<RecommendationsSection
  title="Explore More"
  type="search-based"
  query={searchQuery}
  limit={10}
/>
```
✅ Shows related songs when user searches in library

### **Player**
When song ends:
- Automatically tracks play history
- Calculates completion percentage
- Stores in database for future recommendations

---

## 📈 Deployment Checklist

- [x] Update DB schema with migration
- [x] Create recommendations API route
- [x] Update play endpoint to track history
- [x] Add frontend recommendation components
- [x] Integrate into Home page
- [x] Integrate into Search page
- [x] Update PlayerContext for tracking

**Manual Steps Required:**
1. Stop backend: `npm run stop` or Ctrl+C
2. Start fresh backend: `npm run dev` or `node src/server.js`
   - This runs migration to create new tables
3. Clear old data if needed: `rm -rf backend/data/`

---

## 🔮 Future Improvements (Tier 2+)

### **Advanced Features to Add:**

#### 1. **Collaborative Filtering**
```
Find users with similar taste → Recommend what they like
"Users who liked Song A also liked Song B"
```

#### 2. **Natural Language Processing**
```
Analyze lyrics, mood, tempo
Recommend by vibe: "sad", "energetic", "romantic"
```

#### 3. **Deep Learning Model**
```
Train neural network on:
- User behavior patterns
- Song embeddings
- Temporal trends
Would require ML backend (Python + TensorFlow)
```

#### 4. **Markov Chain Playlist Generation**
```
Generate infinite playlists from seed song
Based on transition probabilities
```

#### 5. **Real-time Trending**
```
Track played_count with time decay
Recent plays weighted higher than old plays
```

---

## 🐛 Testing Your Implementation

### **Test Similar Songs:**
```bash
curl "http://localhost:5000/api/recommendations/similar/song123"
```

### **Test Personalized Recommendations:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/recommendations/for-me"
```

### **Test Search-Based:**
```bash
curl "http://localhost:5000/api/recommendations/search-based?query=Arijit%20Singh"
```

---

## 📊 Recommendation Quality Factors

| Factor | Weight | Impact |
|--------|--------|---------|
| Same Artist | 40% | Strongest signal for similarity |
| Genre Match | 30% | Musical style consistency |
| Album Match | 20% | Studio coherence |
| Keywords | 10% | Covers, remixes, features |

---

## ⚡ Performance Tips

1. **Caching Future:** Add `similar_songs` table for pre-computed recommendations
2. **Limit Results:** Query only top N songs instead of all
3. **Index Play History:** Added `idx_play_history_user` for fast user queries
4. **Background Jobs:** Use worker threads for heavy computations

---

## 🎓 How to Extend

### Add Custom Recommendation Strategy:
```javascript
// In recommendations.js
function calculateMoodSimilarity(song1, song2) {
  // Analyze tempo, key, loudness
  const tempoMatch = Math.abs(song1.tempo - song2.tempo) < 10 ? 20 : 0;
  const keyMatch = song1.key === song2.key ? 30 : 0;
  return tempoMatch + keyMatch;
}
```

### Add New Endpoint:
```javascript
router.get('/mood/:mood', optionalAuth, (req, res) => {
  const songs = db.prepare(
    'SELECT * FROM songs WHERE mood = ? LIMIT ?'
  ).all(req.params.mood, 20);
  res.json({ recommendations: songs });
});
```

---

## 🎵 Example Usage From Frontend

```jsx
// In a component
import { recommendationsApi } from '../api';

function PlayerWidget() {
  const [similar, setSimilar] = useState([]);
  
  useEffect(() => {
    if (currentSong) {
      recommendationsApi.getSimilar(currentSong.id, 10)
        .then(res => setSimilar(res.data.recommendations))
        .catch(err => console.error(err));
    }
  }, [currentSong?.id]);

  return (
    <div>
      <h3>More Like This</h3>
      {similar.map(song => (
        <SongCard key={song.id} song={song} />
      ))}
    </div>
  );
}
```

---

## 📝 Summary

Your recommendation system now:
✅ Tracks user listening behavior  
✅ Calculates song similarity (content-based)  
✅ Provides personalized recommendations  
✅ Shows similar songs  
✅ Handles new user cold-start (trending fallback)  
✅ Integrates seamlessly with existing UI  

**The system will get better as users play more songs!** 🚀

