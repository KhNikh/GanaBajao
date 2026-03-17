import { useState, useEffect } from 'react';
import { recommendationsApi } from '../api';
import SongCard from './SongCard';

export default function RecommendationsSection({ 
  title = 'Recommended For You', 
  type = 'for-me',  // 'for-me' | 'similar' | 'trending' | 'search-based'
  songId = null,
  query = null,
  limit = 10,
  className = ''
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError('');
      try {
        let response;
        
        if (type === 'similar' && songId) {
          response = await recommendationsApi.getSimilar(songId, limit);
          setRecommendations(response.data.recommendations || []);
        } else if (type === 'for-me') {
          response = await recommendationsApi.getForMe(limit);
          setRecommendations(response.data.recommendations || []);
        } else if (type === 'trending') {
          response = await recommendationsApi.getTrending(limit);
          setRecommendations(response.data.recommendations || []);
        } else if (type === 'search-based' && query) {
          response = await recommendationsApi.searchBased(query, limit);
          setRecommendations(response.data.recommendations || []);
        }
      } catch (err) {
        console.error('Recommendations fetch error:', err);
        setError('Failed to load recommendations');
      }
      setLoading(false);
    };

    const timer = setTimeout(fetchRecommendations, 300);
    return () => clearTimeout(timer);
  }, [type, songId, query, limit]);

  if (loading) {
    return (
      <div className={`py-6 ${className}`}>
        <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-spotify-card rounded-lg p-4 animate-pulse">
              <div className="aspect-square bg-spotify-hover rounded mb-3"></div>
              <div className="h-4 bg-spotify-hover rounded mb-2"></div>
              <div className="h-3 bg-spotify-hover rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !recommendations.length) {
    return null; // Don't show section if empty or error
  }

  return (
    <div className={`py-6 ${className}`}>
      <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {recommendations.map(song => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>
    </div>
  );
}
