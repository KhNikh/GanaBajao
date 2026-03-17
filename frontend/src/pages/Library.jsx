import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { playlistsApi } from '../api';
import { useAuth } from '../context/AuthContext';
import PlaylistCard from '../components/PlaylistCard';

export default function Library() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const fetchPlaylists = () => {
    playlistsApi.getMy().then(r => setPlaylists(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPlaylists(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim() || creating) return;
    setCreating(true);
    try {
      const { data } = await playlistsApi.create({ name: newName.trim() });
      setPlaylists(prev => [data, ...prev]);
      setNewName('');
      setShowCreate(false);
      navigate(`/playlist/${data.id}`);
    } catch {}
    setCreating(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-spotify-green border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="px-6 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Your Library</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="w-8 h-8 bg-spotify-light text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12 3a1 1 0 0 1 1 1v7h7a1 1 0 1 1 0 2h-7v7a1 1 0 1 1-2 0v-7H4a1 1 0 1 1 0-2h7V4a1 1 0 0 1 1-1z"/>
          </svg>
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-spotify-card p-4 rounded-lg mb-6 flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Playlist name..."
            className="flex-1 bg-spotify-hover text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white"
            autoFocus
          />
          <button type="submit" disabled={creating} className="btn-primary py-2 px-4 text-sm">
            Create
          </button>
          <button type="button" onClick={() => setShowCreate(false)} className="text-spotify-light hover:text-white text-sm px-2">
            Cancel
          </button>
        </form>
      )}

      {/* Liked songs */}
      <div
        onClick={() => navigate('/liked')}
        className="flex items-center gap-3 p-2 hover:bg-spotify-hover rounded-md cursor-pointer group mb-4 transition-colors"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-blue-600 rounded flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
        <div>
          <p className="font-semibold">Liked Songs</p>
          <p className="text-xs text-spotify-light">Playlist</p>
        </div>
      </div>

      <div className="border-t border-spotify-hover mb-4" />

      {playlists.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-spotify-light">You haven't created any playlists yet.</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary mt-4">
            Create playlist
          </button>
        </div>
      ) : (
        <div>
          <div className="space-y-1 mb-6">
            {playlists.map(p => (
              <div
                key={p.id}
                onClick={() => navigate(`/playlist/${p.id}`)}
                className="flex items-center gap-3 p-2 hover:bg-spotify-hover rounded-md cursor-pointer transition-colors"
              >
                {p.cover_url ? (
                  <img src={p.cover_url} alt={p.name} className="w-12 h-12 rounded object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 bg-spotify-hover rounded flex-shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-spotify-light">
                      <path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.464a1 1 0 0 0-.5-.866l-6-3.464zM9 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1z"/>
                    </svg>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium truncate">{p.name}</p>
                  <p className="text-xs text-spotify-light">{p.song_count || 0} songs</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
