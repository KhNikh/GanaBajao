import { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { songsApi, playlistsApi } from '../api';

function formatDuration(s) {
  if (!s) return '--:--';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function formatPlays(n) {
  if (!n) return '0';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"/>
  </svg>
);
const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"/>
  </svg>
);

export default function SongCard({ song, index, songList, onLikeChange, showIndex = false }) {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const [isLiked, setIsLiked] = useState(song.is_liked || false);
  const [showMenu, setShowMenu] = useState(false);
  const isActive = currentSong?.id === song.id;

  const handlePlay = () => playSong(song, songList || [song]);

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      const { data } = await songsApi.like(song.id);
      setIsLiked(data.liked);
      onLikeChange?.(song.id, data.liked);
    } catch {}
  };

  return (
    <div
      onClick={handlePlay}
      className={`flex items-center gap-4 p-2 rounded-md group cursor-pointer hover:bg-spotify-hover transition-colors ${isActive ? 'bg-spotify-hover' : ''}`}
    >
      {showIndex && (
        <div className="w-6 text-center flex-shrink-0">
          <span className={`text-sm group-hover:hidden ${isActive ? 'text-spotify-green hidden' : 'text-spotify-light'}`}>
            {index + 1}
          </span>
          <span className={`hidden group-hover:flex items-center justify-center ${isActive ? 'flex text-spotify-green' : ''}`}>
            {isActive && isPlaying ? <PauseIcon /> : <PlayIcon />}
          </span>
        </div>
      )}

      <div className="relative flex-shrink-0 w-10 h-10">
        {song.cover_url ? (
          <img src={song.cover_url} alt={song.title} className="w-10 h-10 rounded object-cover" />
        ) : (
          <div className="w-10 h-10 rounded bg-spotify-card flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-spotify-light">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
        )}
        {!showIndex && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 rounded transition-opacity">
            {isActive && isPlaying ? <PauseIcon /> : <PlayIcon />}
          </div>
        )}
        {isActive && isPlaying && !showIndex && (
          <div className="absolute bottom-0.5 right-0.5">
            <span className="block w-2 h-2 bg-spotify-green rounded-full animate-ping" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? 'text-spotify-green' : 'text-white'}`}>{song.title}</p>
        <p className="text-xs text-spotify-light truncate">{song.artist}</p>
      </div>

      <p className="hidden md:block text-xs text-spotify-light truncate max-w-[120px]">{song.album}</p>

      <div className="flex items-center gap-3 ml-auto flex-shrink-0">
        <button
          onClick={handleLike}
          className={`opacity-0 group-hover:opacity-100 transition-all ${isLiked ? '!opacity-100 text-spotify-green' : 'text-spotify-light hover:text-white'}`}
        >
          <svg viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <span className="text-xs text-spotify-light">{formatDuration(song.duration)}</span>
      </div>
    </div>
  );
}
