import { useState, useEffect } from 'react';
import { recommendationsApi } from '../api';
import SongCard from './SongCard';

export default function SimilarSongsModal({ song, isOpen, onClose }) {
  const [similarSongs, setSimilarSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && song) {
      setLoading(true);
      recommendationsApi
        .getSimilar(song.id, 15)
        .then(res => {
          setSimilarSongs(res.data.recommendations || []);
        })
        .catch(err => {
          console.error('Failed to fetch similar songs:', err);
          setSimilarSongs([]);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, song?.id]);

  if (!isOpen || !song) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-spotify-darker rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-spotify-card">
        {/* Header */}
        <div className="sticky top-0 bg-spotify-dark border-b border-spotify-card px-6 py-4 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">Songs Like</h2>
            <p className="text-spotify-light text-sm">
              {song.title} by {song.artist}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-spotify-light hover:text-white transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M5.293 5.293a1 1 0 0 1 1.414 0L12 10.586l5.293-5.293a1 1 0 1 1 1.414 1.414L13.414 12l5.293 5.293a1 1 0 0 1-1.414 1.414L12 13.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L10.586 12 5.293 6.707a1 1 0 0 1 0-1.414z"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-spotify-green border-t-transparent rounded-full animate-spin" />
            </div>
          ) : similarSongs.length > 0 ? (
            <div className="space-y-2">
              {similarSongs.map(song => (
                <SongCard key={song.id} song={song} compact />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-spotify-light">No similar songs found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
