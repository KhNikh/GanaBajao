import { useEffect, useState } from 'react';
import { songsApi } from '../api';
import { usePlayer } from '../context/PlayerContext';
import SongCard from '../components/SongCard';

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
    <path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"/>
  </svg>
);

export default function LikedSongs() {
  const { playSong, togglePlay, currentSong, isPlaying } = usePlayer();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    songsApi.getLiked().then(r => setSongs(r.data)).finally(() => setLoading(false));
  }, []);

  const handlePlayAll = () => {
    if (!songs.length) return;
    const isPlayingThis = songs.some(s => s.id === currentSong?.id);
    if (isPlayingThis) { togglePlay(); return; }
    playSong(songs[0], songs);
  };

  const handleLikeChange = (songId, liked) => {
    if (!liked) setSongs(prev => prev.filter(s => s.id !== songId));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-spotify-green border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="bg-gradient-to-b from-indigo-900 to-spotify-dark px-6 pb-6 pt-16">
        <div className="flex items-end gap-6">
          <div className="w-48 h-48 bg-gradient-to-br from-indigo-400 to-blue-700 rounded flex items-center justify-center shadow-2xl flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="white" className="w-24 h-24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <div>
            <p className="text-xs uppercase font-bold mb-2">Playlist</p>
            <h1 className="text-5xl font-bold mb-4">Liked Songs</h1>
            <p className="text-spotify-light text-sm">{songs.length} songs</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        {songs.length > 0 && (
          <button onClick={handlePlayAll} className="w-14 h-14 bg-spotify-green rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform shadow-lg mb-4">
            <PlayIcon />
          </button>
        )}

        {songs.length === 0 ? (
          <div className="text-center py-12 text-spotify-light">
            <p>Songs you like will appear here.</p>
            <p className="text-sm mt-2">Click the heart icon on any song to like it.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {songs.map((song, i) => (
              <SongCard key={song.id} song={song} index={i} songList={songs} showIndex onLikeChange={handleLikeChange} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
