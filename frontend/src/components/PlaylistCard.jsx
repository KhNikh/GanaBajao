import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { playlistsApi } from '../api';

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"/>
  </svg>
);

export default function PlaylistCard({ playlist }) {
  const navigate = useNavigate();
  const { playSong } = usePlayer();

  const handlePlayAll = async (e) => {
    e.stopPropagation();
    try {
      const { data } = await playlistsApi.getById(playlist.id);
      if (data.songs?.length) {
        playSong(data.songs[0], data.songs);
      }
    } catch {}
  };

  return (
    <div
      onClick={() => navigate(`/playlist/${playlist.id}`)}
      className="card-hover group relative"
    >
      <div className="relative mb-4">
        {playlist.cover_url ? (
          <img src={playlist.cover_url} alt={playlist.name} className="w-full aspect-square object-cover rounded shadow-lg" />
        ) : (
          <div className="w-full aspect-square bg-spotify-hover rounded shadow-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-spotify-light">
              <path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.464a1 1 0 0 0-.5-.866l-6-3.464zM9 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1z"/>
            </svg>
          </div>
        )}
        <button
          onClick={handlePlayAll}
          className="absolute bottom-2 right-2 w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 text-black"
        >
          <PlayIcon />
        </button>
      </div>
      <p className="font-semibold truncate">{playlist.name}</p>
      <p className="text-sm text-spotify-light truncate mt-1">
        {playlist.description || `By ${playlist.username || 'Unknown'}`}
      </p>
    </div>
  );
}
