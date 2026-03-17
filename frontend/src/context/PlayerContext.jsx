import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { songsApi } from '../api';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem('gb_volume') || '0.8'));
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); // none | one | all
  const audioRef = useRef(new Audio());
  const playedRef = useRef(false);
  const songStartTimeRef = useRef(0);

  const currentSong = queue[currentIndex] || null;

  // Helper: Track song completion when moving to next
  const trackSongCompletion = useCallback((songId, secondsPlayed, isCompleted) => {
    if (!songId) return;
    const thresholdPercent = 0.8; // Consider 80% of song played as completed
    const isReallyCompleted = isCompleted || (duration > 0 && secondsPlayed / duration >= thresholdPercent);
    
    songsApi.play(songId, {
      durationPlayed: Math.floor(secondsPlayed),
      completed: isReallyCompleted ? 1 : 0,
      source: 'player',
    }).catch(() => {});
  }, [duration]);

  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;
    audio.muted = isMuted;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      // Song completed naturally
      trackSongCompletion(currentSong?.id, audioRef.current.currentTime, true);
      
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else if (repeatMode === 'all' || currentIndex < queue.length - 1) {
        next();
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [currentIndex, queue.length, repeatMode, duration, currentSong?.id, trackSongCompletion]);

  useEffect(() => {
    const audio = audioRef.current;
    if (currentSong) {
      audio.src = currentSong.audio_url;
      audio.load();
      playedRef.current = false;
      songStartTimeRef.current = Date.now();
      audio.play()
        .then(() => {
          if (!playedRef.current) {
            // Initial play tracking
            songsApi.play(currentSong.id, { source: 'player' }).catch(() => {});
            playedRef.current = true;
          }
        })
        .catch(err => console.warn('Autoplay blocked:', err));
    }
  }, [currentSong?.id]);

  useEffect(() => {
    audioRef.current.volume = volume;
    localStorage.setItem('gb_volume', volume);
  }, [volume]);

  useEffect(() => {
    audioRef.current.muted = isMuted;
  }, [isMuted]);

  const playSong = useCallback((song, songList = null) => {
    if (songList) {
      const idx = songList.findIndex(s => s.id === song.id);
      setQueue(songList);
      setCurrentIndex(idx >= 0 ? idx : 0);
    } else {
      const idx = queue.findIndex(s => s.id === song.id);
      if (idx >= 0) {
        if (idx === currentIndex) {
          togglePlay();
          return;
        }
        setCurrentIndex(idx);
      } else {
        setQueue(prev => [...prev, song]);
        setCurrentIndex(queue.length);
      }
    }
  }, [queue, currentIndex]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!currentSong) return;
    if (isPlaying) audio.pause();
    else audio.play().catch(() => {});
  }, [currentSong, isPlaying]);

  const next = useCallback(() => {
    // Track current song before skipping
    if (currentSong && audioRef.current.currentTime > 0) {
      trackSongCompletion(currentSong.id, audioRef.current.currentTime, false);
    }
    
    if (!queue.length) return;
    if (isShuffle) {
      const idx = Math.floor(Math.random() * queue.length);
      setCurrentIndex(idx);
    } else {
      setCurrentIndex(prev => (prev + 1) % queue.length);
    }
  }, [queue.length, isShuffle, currentSong, trackSongCompletion]);

  const prev = useCallback(() => {
    const audio = audioRef.current;
    if (audio.currentTime > 3) { audio.currentTime = 0; return; }
    if (!queue.length) return;
    if (isShuffle) {
      setCurrentIndex(Math.floor(Math.random() * queue.length));
    } else {
      setCurrentIndex(prevIdx => (prevIdx - 1 + queue.length) % queue.length);
    }
  }, [queue.length, isShuffle]);

  const seek = useCallback((time) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const toggleShuffle = useCallback(() => setIsShuffle(prevVal => !prevVal), []);
  const toggleRepeat = useCallback(() => {
    setRepeatMode(prevMode => prevMode === 'none' ? 'all' : prevMode === 'all' ? 'one' : 'none');
  }, []);
  const toggleMute = useCallback(() => setIsMuted(prevVal => !prevVal), []);

  const addToQueue = useCallback((song) => {
    setQueue(prevQueue => [...prevQueue, song]);
  }, []);

  const clearQueue = useCallback(() => {
    audioRef.current.pause();
    setQueue([]);
    setCurrentIndex(-1);
    setIsPlaying(false);
  }, []);

  return (
    <PlayerContext.Provider value={{
      queue, currentIndex, currentSong, isPlaying,
      duration, currentTime, volume, isMuted,
      isShuffle, repeatMode,
      playSong, togglePlay, next, prev, seek,
      setVolume, toggleMute, toggleShuffle, toggleRepeat,
      addToQueue, clearQueue,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);
