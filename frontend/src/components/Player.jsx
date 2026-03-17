import { usePlayer } from '../context/PlayerContext';
import { useState } from 'react';
import { songsApi } from '../api';

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"/>
  </svg>
);
const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"/>
  </svg>
);
const SkipNextIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M17.7 3a.7.7 0 0 0-.7.7v6.805L5.05 3.606A.7.7 0 0 0 4 4.212v15.576a.7.7 0 0 0 1.05.606L17 13.495V20.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-1.6z"/>
  </svg>
);
const SkipPrevIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M6.3 3a.7.7 0 0 1 .7.7v6.805l11.95-6.899A.7.7 0 0 1 20 4.212v15.576a.7.7 0 0 1-1.05.606L7 13.495V20.3a.7.7 0 0 1-.7.7H4.7a.7.7 0 0 1-.7-.7V3.7a.7.7 0 0 1 .7-.7h1.6z"/>
  </svg>
);
const ShuffleIcon = ({ active }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${active ? 'text-spotify-green' : ''}`}>
    <path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356A2.25 2.25 0 0 1 11.16 4.5h1.949l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75 13.15.922zM23.609 12.5H23v-1.5h.609a2.25 2.25 0 0 0 1.724-.804l.001-.002-1.06-1.06a.75.75 0 0 1 0-1.061l2.829-2.83.707.708L25.8 8.06a3.75 3.75 0 0 1-2.19 1.368V12.5zm0 0a3.75 3.75 0 0 1-2.873-1.34l-1.196-1.427-1.131 1.13 1.19 1.42A5.25 5.25 0 0 0 23.61 14h.391v-1.5h-.391zM.391 12.5a2.25 2.25 0 0 0-1.724-.804H-2v1.5h.609A3.75 3.75 0 0 1 1.48 14.54l6.173 7.356A2.25 2.25 0 0 0 9.526 23h4.987l1.018 1.018a.75.75 0 1 0 1.06-1.06l-2.829-2.83-1.06 1.06.016.016-.022.022-1.018-1.017-1.17.001a.75.75 0 0 0 0-1.5l1.17-.001 1.018-1.018a.75.75 0 0 0-1.06-1.06L11.619 18.5H9.526a.75.75 0 0 1-.574-.268L2.78 10.876A3.75 3.75 0 0 0 .39 9.5v3zm10.133 5.424-.574.268z"/>
  </svg>
);
const RepeatIcon = ({ mode }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${mode !== 'none' ? 'text-spotify-green' : ''}`}>
    {mode === 'one'
      ? <path d="M0 13.5a1 1 0 0 1 1-1h1.5V7.547l-.943.35a1 1 0 1 1-.695-1.874L3 5.25a1 1 0 0 1 1.378.921V12.5H6a1 1 0 1 1 0 2H1a1 1 0 0 1-1-1zm9-9a1 1 0 0 1 1-1h5a5 5 0 0 1 5 5v3.232l.349-.35a1 1 0 0 1 1.414 1.415L19.707 15.35a1 1 0 0 1-1.414 0l-2.06-2.054a1 1 0 1 1 1.414-1.414l.353.352V8.5a3 3 0 0 0-3-3h-5a1 1 0 0 1-1-1zm-7 10.5a1 1 0 0 1 1.414 0l2.06 2.053a1 1 0 0 1-1.414 1.415l-.353-.353V18a3 3 0 0 0 3 3h5a1 1 0 1 1 0 2h-5A5 5 0 0 1 2 18v-3.232l-.349.349A1 1 0 1 1 .237 13.704L2.293 11.65a1 1 0 0 1 0-.65z"/>
      : <path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5h1.77l-1.97-1.97a.75.75 0 1 1 1.06-1.06l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 1 1-1.06-1.06l1.97-1.97H16v5a3.75 3.75 0 0 1-3.75 3.75h-8.5A3.75 3.75 0 0 1 0 19.25v-5h1.77l-1.97 1.97a.75.75 0 1 1-1.06-1.06l3.25-3.25a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 1 1-1.06 1.06L3.27 14.25H1.5v5a2.25 2.25 0 0 0 2.25 2.25h8.5a2.25 2.25 0 0 0 2.25-2.25v-5H0v-9.5A2.25 2.25 0 0 0 3.75 2.5h8.5A2.25 2.25 0 0 0 14.5 4.75V14H0V4.75z"/>
    }
  </svg>
);

const VolumeIcon = ({ muted, volume }) => {
  if (muted || volume === 0) return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M13 3.86v.828l-2 2V3.86a.25.25 0 0 0-.377-.215L4.5 7.77H2.25A2.25 2.25 0 0 0 0 10.02v4c0 1.24 1.01 2.25 2.25 2.25H4.5l6.123 4.126a.25.25 0 0 0 .377-.215v-3.468l2-2v5.996l-.001.002v.001a2.25 2.25 0 0 1-3.617.93L3.5 17.27H2.25A4.25 4.25 0 0 1 0 13.27v-4C0 6.784 1.005 5.02 2.25 5.02H3.5l5.882-3.959A2.25 2.25 0 0 1 13 3.861zm-2 7.243a1 1 0 0 0 0 1.414l1.998 1.998a1 1 0 1 0 1.414-1.414L12.414 11.1l1.998-1.998a1 1 0 0 0-1.414-1.414L11 9.686l-1.998-1.998a1 1 0 0 0-1.414 1.414L9.586 11.1z"/>
    </svg>
  );
  if (volume < 0.5) return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.33l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.8 3.35V2.8L2.817 6.15zm14.24 2.505a.75.75 0 0 1 1.06 0 5.8 5.8 0 0 1 0 8.194.75.75 0 0 1-1.06-1.06 4.3 4.3 0 0 0 0-6.073.75.75 0 0 1 0-1.06z"/>
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M13 3.86v16.36a2.25 2.25 0 0 1-3.617.93L3.5 17.27H2.25A2.25 2.25 0 0 1 0 15.02v-6a2.25 2.25 0 0 1 2.25-2.25H3.5l5.883-3.877A2.25 2.25 0 0 1 13 3.86zm-2 1.732L5.017 9.37A.75.75 0 0 1 4.5 9.5h-2.25a.75.75 0 0 0-.75.75v6c0 .414.336.75.75.75H4.5a.75.75 0 0 1 .517.206L11 20.558V5.592zm5.84-.259a.75.75 0 0 1 1.061 0 11 11 0 0 1 0 15.554.75.75 0 0 1-1.06-1.06 9.5 9.5 0 0 0 0-13.433.75.75 0 0 1 0-1.061zm-3.161 3.161a.75.75 0 0 1 1.06 0 6.5 6.5 0 0 1 0 9.192.75.75 0 1 1-1.06-1.06 5 5 0 0 0 0-7.072.75.75 0 0 1 0-1.06z"/>
    </svg>
  );
};

const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? '#1DB954' : 'none'} stroke={filled ? '#1DB954' : 'currentColor'} strokeWidth="2" className="w-4 h-4">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

export default function Player() {
  const {
    currentSong, isPlaying, duration, currentTime, volume, isMuted,
    isShuffle, repeatMode,
    togglePlay, next, prev, seek, setVolume, toggleMute,
    toggleShuffle, toggleRepeat,
  } = usePlayer();

  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    if (!currentSong) return;
    try {
      const { data } = await songsApi.like(currentSong.id);
      setLiked(data.liked);
    } catch {}
  };

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    seek(val);
    e.target.style.setProperty('--progress', `${(val / (duration || 1)) * 100}%`);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    e.target.style.setProperty('--progress', `${val * 100}%`);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  if (!currentSong) return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0a0a0a] to-[#121212] border-t border-white/5 flex items-center justify-center">
      <div className="flex items-center gap-3 text-spotify-light">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 opacity-40">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
        <p className="text-sm">Pick a song to start listening</p>
      </div>
    </div>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[90px] bg-gradient-to-t from-[#0a0a0a] via-[#111] to-[#161616] border-t border-white/5 px-4 flex items-center gap-4 z-50 backdrop-blur-sm">
      {/* Song info */}
      <div className="flex items-center gap-3 w-[28%] min-w-0">
        <div className="relative flex-shrink-0">
          {currentSong.cover_url ? (
            <img
              src={currentSong.cover_url}
              alt={currentSong.title}
              className="w-14 h-14 rounded-md object-cover shadow-lg"
            />
          ) : (
            <div className="w-14 h-14 rounded-md bg-[#282828] flex items-center justify-center shadow-lg">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-spotify-light">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
          )}
          {isPlaying && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-spotify-green rounded-full border-2 border-[#111]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white text-sm font-semibold truncate leading-tight">{currentSong.title}</p>
          <p className="text-spotify-light text-xs truncate mt-0.5">{currentSong.artist}</p>
        </div>
        <button
          onClick={handleLike}
          className={`flex-shrink-0 transition-all hover:scale-110 ${liked || currentSong.is_liked ? 'text-spotify-green' : 'text-spotify-light hover:text-white'}`}
        >
          <HeartIcon filled={liked || currentSong.is_liked} />
        </button>
      </div>

      {/* Controls */}
      <div className="flex-1 flex flex-col items-center gap-2">
        <div className="flex items-center gap-5">
          <button
            onClick={toggleShuffle}
            title="Shuffle"
            className={`transition-all hover:scale-110 ${isShuffle ? 'text-spotify-green' : 'text-spotify-light hover:text-white'}`}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356A2.25 2.25 0 0 1 11.16 4.5h1.949l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75 13.15.922zM.5 4.25a.75.75 0 0 1 .75-.75h.44L2.75 4.25l-.5.5H1.25A.75.75 0 0 1 .5 4.25zM13 20.89a.75.75 0 0 1 .75-.75h1.949l-1.017-1.017a.75.75 0 1 1 1.06-1.06l2.83 2.828-2.83 2.829a.75.75 0 1 1-1.06-1.061l1.017-1.018H13.75a.75.75 0 0 1-.75-.75zm-4.927-.447a2.25 2.25 0 0 1-1.724.808H4.5l-1.06-1.06L2.38 19.5H6.35a.75.75 0 0 0 .574-.268l1.19-1.42 1.131 1.13-1.172 1.5z"/>
            </svg>
          </button>
          <button onClick={prev} title="Previous" className="text-spotify-light hover:text-white transition-all hover:scale-110">
            <SkipPrevIcon />
          </button>
          <button
            onClick={togglePlay}
            className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-transform shadow-md hover:bg-gray-100"
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button onClick={next} title="Next" className="text-spotify-light hover:text-white transition-all hover:scale-110">
            <SkipNextIcon />
          </button>
          <button
            onClick={toggleRepeat}
            title={repeatMode === 'one' ? 'Repeat one' : repeatMode === 'all' ? 'Repeat all' : 'No repeat'}
            className={`transition-all hover:scale-110 ${repeatMode !== 'none' ? 'text-spotify-green' : 'text-spotify-light hover:text-white'}`}
          >
            {repeatMode === 'one' ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M0 13.5a1 1 0 0 1 1-1h1.5V7.547l-.943.35a1 1 0 1 1-.695-1.874L3 5.25a1 1 0 0 1 1.378.921V12.5H6a1 1 0 1 1 0 2H1a1 1 0 0 1-1-1zm9-9a1 1 0 0 1 1-1h5a5 5 0 0 1 5 5v3.232l.349-.35a1 1 0 0 1 1.414 1.415L19.707 15.35a1 1 0 0 1-1.414 0l-2.06-2.054a1 1 0 1 1 1.414-1.414l.353.352V8.5a3 3 0 0 0-3-3h-5a1 1 0 0 1-1-1zm-7 10.5a1 1 0 0 1 1.414 0l2.06 2.053a1 1 0 0 1-1.414 1.415l-.353-.353V18a3 3 0 0 0 3 3h5a1 1 0 1 1 0 2h-5A5 5 0 0 1 2 18v-3.232l-.349.349A1 1 0 1 1 .237 13.704L2.293 11.65a1 1 0 0 1 0-.65z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5h1.77l-1.97-1.97a.75.75 0 1 1 1.06-1.06l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 1 1-1.06-1.06l1.97-1.97H16v5a3.75 3.75 0 0 1-3.75 3.75h-8.5A3.75 3.75 0 0 1 0 19.25v-5h1.77l-1.97 1.97a.75.75 0 1 1-1.06-1.06L2.987 12l-2.243-2.237A.75.75 0 0 1 1.77 8.75H0v-4zm3.75-2.25A2.25 2.25 0 0 0 1.5 4.75v3.575L3.47 6.356a.75.75 0 1 1 1.06 1.06L2.75 9.194V14.5H1.5v4.75c0 1.243 1.007 2.25 2.25 2.25h8.5A2.25 2.25 0 0 0 14.5 19.25v-5H16v-5.054L13.97 11.47a.75.75 0 0 1-1.06-1.06L14.69 8.63l.001-.001A2.25 2.25 0 0 0 12.25 2.5h-8.5z"/>
              </svg>
            )}
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 w-full max-w-xl">
          <span className="text-xs text-spotify-light tabular-nums w-10 text-right">{formatTime(currentTime)}</span>
          <div className="flex-1 relative group">
            <input
              type="range"
              min="0"
              max={duration || 1}
              step="0.5"
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 w-full"
              style={{ '--progress': `${progress}%` }}
            />
          </div>
          <span className="text-xs text-spotify-light tabular-nums w-10">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume + extra */}
      <div className="flex items-center gap-3 w-[28%] justify-end">
        <button
          onClick={toggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
          className="text-spotify-light hover:text-white transition-colors hover:scale-110"
        >
          <VolumeIcon muted={isMuted} volume={volume} />
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="w-24 h-1"
          style={{ '--progress': `${(isMuted ? 0 : volume) * 100}%` }}
        />
      </div>
    </div>
  );
}
