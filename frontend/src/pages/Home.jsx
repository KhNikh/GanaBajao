import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { songsApi, playlistsApi } from '../api';
import { usePlayer } from '../context/PlayerContext';
import SongCard from '../components/SongCard';
import PlaylistCard from '../components/PlaylistCard';
import RecommendationsSection from '../components/RecommendationsSection';
import { useAuth } from '../context/AuthContext';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Home() {
  const { user } = useAuth();
  const { playSong } = usePlayer();
  const [trending, setTrending] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      songsApi.getTrending(),
      playlistsApi.getAll(),
    ]).then(([songsRes, playlistsRes]) => {
      setTrending(songsRes.data);
      setPlaylists(playlistsRes.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-spotify-green border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="px-6 pt-6">
      <h1 className="text-3xl font-bold mb-6">{getGreeting()}, {user?.username}!</h1>

      {/* Featured playlists grid */}
      {playlists.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {playlists.slice(0, 6).map(p => (
            <a
              key={p.id}
              href={`/playlist/${p.id}`}
              onClick={e => { e.preventDefault(); window.location.href = `/playlist/${p.id}`; }}
              className="flex items-center bg-spotify-card hover:bg-spotify-hover rounded overflow-hidden gap-3 group transition-colors"
            >
              {p.cover_url ? (
                <img src={p.cover_url} alt={p.name} className="w-16 h-16 object-cover flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 bg-spotify-hover flex-shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-spotify-light">
                    <path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.464a1 1 0 0 0-.5-.866l-6-3.464zM9 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1z"/>
                  </svg>
                </div>
              )}
              <span className="font-semibold text-sm truncate pr-2">{p.name}</span>
            </a>
          ))}
        </div>
      )}

      {/* Trending */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Trending</h2>
          <a href="/search" className="text-xs font-semibold text-spotify-light hover:text-white uppercase tracking-wider transition-colors">
            See all
          </a>
        </div>
        <div className="space-y-1">
          {trending.slice(0, 8).map((song, i) => (
            <SongCard key={song.id} song={song} index={i} songList={trending} showIndex />
          ))}
        </div>
      </section>

      {/* Personalized Recommendations */}
      {user && (
        <RecommendationsSection
          title="Recommended For You"
          type="for-me"
          limit={10}
          className="mb-8"
        />
      )}

      {/* All playlists */}
      {playlists.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Featured Playlists</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {playlists.map(p => (
              <PlaylistCard key={p.id} playlist={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
