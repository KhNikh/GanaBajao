import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { playlistsApi, songsApi } from '../api';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import SongCard from '../components/SongCard';

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
    <path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"/>
  </svg>
);
const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
    <path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"/>
  </svg>
);

export default function Playlist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayer();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    playlistsApi.getById(id).then(r => {
      setPlaylist(r.data);
      setEditName(r.data.name);
      setEditDesc(r.data.description || '');
    }).catch(() => navigate('/')).finally(() => setLoading(false));
  }, [id]);

  const isOwner = playlist?.user_id === user?.id;
  const isPlayingThis = playlist?.songs?.some(s => s.id === currentSong?.id);

  const handlePlayAll = () => {
    if (!playlist?.songs?.length) return;
    if (isPlayingThis) { togglePlay(); return; }
    playSong(playlist.songs[0], playlist.songs);
  };

  const handleSaveEdit = async () => {
    try {
      await playlistsApi.update(id, { name: editName, description: editDesc });
      setPlaylist(p => ({ ...p, name: editName, description: editDesc }));
      setEditing(false);
    } catch {}
  };

  const handleDelete = async () => {
    if (!confirm('Delete this playlist?')) return;
    setDeleting(true);
    try {
      await playlistsApi.delete(id);
      navigate('/library');
    } catch {}
    setDeleting(false);
  };

  const handleRemoveSong = async (songId) => {
    try {
      await playlistsApi.removeSong(id, songId);
      setPlaylist(p => ({ ...p, songs: p.songs.filter(s => s.id !== songId) }));
    } catch {}
  };

  const handleFollow = async () => {
    try {
      const { data } = await playlistsApi.follow(id);
      setPlaylist(p => ({ ...p, is_following: data.following }));
    } catch {}
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-spotify-green border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!playlist) return null;

  const totalDuration = playlist.songs?.reduce((a, s) => a + (s.duration || 0), 0) || 0;
  const durationStr = totalDuration > 3600
    ? `${Math.floor(totalDuration / 3600)} hr ${Math.floor((totalDuration % 3600) / 60)} min`
    : `${Math.floor(totalDuration / 60)} min`;

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-900 to-spotify-dark px-6 pb-6 pt-16">
        <button onClick={() => navigate(-1)} className="mb-4 text-spotify-light hover:text-white transition-colors">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M15.957 2.793a1 1 0 0 1 0 1.414L9.164 11l6.793 6.793a1 1 0 1 1-1.414 1.414L7.043 12.29a1.25 1.25 0 0 1 0-1.58l7.5-7.916a1 1 0 0 1 1.414 0z"/>
          </svg>
        </button>
        <div className="flex items-end gap-6">
          <div className="w-48 h-48 flex-shrink-0 shadow-2xl">
            {playlist.cover_url ? (
              <img src={playlist.cover_url} alt={playlist.name} className="w-full h-full object-cover rounded" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-700 rounded flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24 text-white/80">
                  <path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.464a1 1 0 0 0-.5-.866l-6-3.464zM9 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1z"/>
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase font-bold mb-2">Playlist</p>
            {editing ? (
              <div className="space-y-2 mb-3">
                <input value={editName} onChange={e => setEditName(e.target.value)}
                  className="bg-black/40 text-white text-3xl font-bold rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-white" />
                <input value={editDesc} onChange={e => setEditDesc(e.target.value)}
                  className="bg-black/40 text-spotify-light text-sm rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-white" placeholder="Description..." />
                <div className="flex gap-2">
                  <button onClick={handleSaveEdit} className="bg-white text-black text-xs font-bold px-3 py-1 rounded-full">Save</button>
                  <button onClick={() => setEditing(false)} className="text-spotify-light text-xs px-3 py-1 hover:text-white">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-4xl font-bold mb-2 truncate">{playlist.name}</h1>
                {playlist.description && <p className="text-spotify-light text-sm mb-2">{playlist.description}</p>}
              </>
            )}
            <p className="text-sm text-spotify-light">
              {playlist.username} • {playlist.songs?.length || 0} songs
              {totalDuration > 0 && `, ${durationStr}`}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 flex items-center gap-4">
        {playlist.songs?.length > 0 && (
          <button onClick={handlePlayAll} className="w-14 h-14 bg-spotify-green rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform shadow-lg">
            {isPlayingThis && isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
        )}
        {!isOwner && (
          <button onClick={handleFollow} className={`btn-secondary text-sm py-1.5 px-5 ${playlist.is_following ? 'border-white text-white' : ''}`}>
            {playlist.is_following ? 'Following' : 'Follow'}
          </button>
        )}
        {isOwner && (
          <>
            <button onClick={() => setEditing(true)} className="text-spotify-light hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M11.172 2a3 3 0 0 1 2.121.879l7.656 7.656a3 3 0 0 1 0 4.243l-4.829 4.828a3 3 0 0 1-4.242 0L4.222 11.95A3 3 0 0 1 3.343 9.83L3.172 3.5A1.5 1.5 0 0 1 4.672 2h6.5zM7.5 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
              </svg>
            </button>
            <button onClick={handleDelete} disabled={deleting} className="text-spotify-light hover:text-red-400 transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Songs */}
      <div className="px-6 pb-8">
        {!playlist.songs?.length ? (
          <div className="text-center py-12 text-spotify-light">
            <p>This playlist is empty.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {playlist.songs.map((song, i) => (
              <div key={song.id} className="group/row relative">
                <SongCard song={song} index={i} songList={playlist.songs} showIndex />
                {isOwner && (
                  <button
                    onClick={() => handleRemoveSong(song.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/row:opacity-100 text-spotify-light hover:text-red-400 transition-all p-1"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M5.293 5.293a1 1 0 0 1 1.414 0L12 10.586l5.293-5.293a1 1 0 1 1 1.414 1.414L13.414 12l5.293 5.293a1 1 0 0 1-1.414 1.414L12 13.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L10.586 12 5.293 6.707a1 1 0 0 1 0-1.414z"/>
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
