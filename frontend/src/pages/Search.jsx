import { useState, useEffect, useRef } from 'react';
import { songsApi, saavnApi } from '../api';
import SongCard from '../components/SongCard';
import RecommendationsSection from '../components/RecommendationsSection';

const GENRES = ['Bollywood', 'Indie', 'Pop', 'Rock', 'Classical', 'Hip-Hop', 'Electronic', 'Jazz', 'Folk'];
const GENRE_COLORS = {
  Bollywood: '#E91429', Indie: '#8D67AB', Pop: '#EB5757', Rock: '#1E3264',
  Classical: '#BC5900', 'Hip-Hop': '#E8115B', Electronic: '#0D73EC', Jazz: '#509BF5', Folk: '#148A08'
};

export default function Search() {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('saavn'); // 'saavn' | 'library'
  const [results, setResults] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const timeoutRef = useRef(null);

  useEffect(() => {
    songsApi.getGenres().then(r => setGenres(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    clearTimeout(timeoutRef.current);
    setError('');
    if (!query.trim() && !selectedGenre) { setResults([]); setSearched(false); return; }

    setLoading(true);
    timeoutRef.current = setTimeout(async () => {
      try {
        if (tab === 'saavn' && query.trim()) {
          const { data } = await saavnApi.search(query.trim(), 30);
          setResults(data);
        } else {
          const { data } = await songsApi.getAll({
            search: query.trim() || undefined,
            genre: selectedGenre || undefined,
            limit: 50,
          });
          setResults(data);
        }
        setSearched(true);
      } catch (err) {
        setError(err.response?.data?.error || 'Search failed. Please try again.');
        setResults([]);
      }
      setLoading(false);
    }, 400);
    return () => clearTimeout(timeoutRef.current);
  }, [query, selectedGenre, tab]);

  const handleTabChange = (t) => {
    setTab(t);
    setResults([]);
    setSearched(false);
    setSelectedGenre(null);
    setError('');
  };

  return (
    <div className="px-6 pt-6">
      <h1 className="text-3xl font-bold mb-6">Search</h1>

      {/* Search input */}
      <div className="relative mb-4">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-black">
          <path d="M10.533 1.279c-5.18 0-9.407 4.14-9.407 9.279s4.226 9.279 9.407 9.279c2.234 0 4.29-.77 5.907-2.058l4.353 4.353a1 1 0 1 0 1.414-1.414l-4.344-4.344a9.157 9.157 0 0 0 2.077-5.816c0-5.14-4.226-9.28-9.407-9.28zm-7.407 9.279c0-4.006 3.302-7.28 7.407-7.28s7.407 3.274 7.407 7.28-3.302 7.279-7.407 7.279-7.407-3.273-7.407-7.28z"/>
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={tab === 'saavn' ? 'Search any Bollywood song on JioSaavn...' : 'Search your library...'}
          className="w-full bg-white text-black placeholder-gray-500 rounded-full py-3 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-white"
          autoFocus
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); setSearched(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M5.293 5.293a1 1 0 0 1 1.414 0L12 10.586l5.293-5.293a1 1 0 1 1 1.414 1.414L13.414 12l5.293 5.293a1 1 0 0 1-1.414 1.414L12 13.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L10.586 12 5.293 6.707a1 1 0 0 1 0-1.414z"/>
            </svg>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => handleTabChange('saavn')}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${tab === 'saavn' ? 'bg-white text-black' : 'bg-spotify-card text-white hover:bg-spotify-hover'}`}
        >
          🎵 JioSaavn
        </button>
        <button
          onClick={() => handleTabChange('library')}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${tab === 'library' ? 'bg-white text-black' : 'bg-spotify-card text-white hover:bg-spotify-hover'}`}
        >
          📚 My Library
        </button>
      </div>

      {/* Genre browse (library tab only, no query) */}
      {tab === 'library' && !query && !selectedGenre && (
        <div>
          <h2 className="text-xl font-bold mb-4">Browse by genre</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {(genres.length ? genres : GENRES).map(genre => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className="relative h-24 rounded-lg overflow-hidden text-left p-3 font-bold text-lg hover:scale-105 transition-transform"
                style={{ backgroundColor: GENRE_COLORS[genre] || '#535353' }}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Genre chip */}
      {selectedGenre && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-spotify-light text-sm">Genre:</span>
          <button
            onClick={() => setSelectedGenre(null)}
            className="flex items-center gap-1 bg-spotify-green text-black text-sm font-semibold px-3 py-1 rounded-full"
          >
            {selectedGenre}
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
              <path d="M5.293 5.293a1 1 0 0 1 1.414 0L12 10.586l5.293-5.293a1 1 0 1 1 1.414 1.414L13.414 12l5.293 5.293a1 1 0 0 1-1.414 1.414L12 13.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L10.586 12 5.293 6.707a1 1 0 0 1 0-1.414z"/>
            </svg>
          </button>
        </div>
      )}

      {/* JioSaavn hint when no query */}
      {tab === 'saavn' && !query && (
        <div className="text-center py-12 text-spotify-light">
          <div className="text-5xl mb-4">🎵</div>
          <p className="text-lg font-semibold text-white mb-2">Search JioSaavn</p>
          <p className="text-sm">Find and play any Bollywood, Hindi, or regional song instantly</p>
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            {['Kesariya', 'Tum Hi Ho', 'Raataan Lambiyan', 'Pehle Bhi Main', 'Channa Mereya'].map(s => (
              <button key={s} onClick={() => setQuery(s)}
                className="bg-spotify-card hover:bg-spotify-hover px-3 py-1.5 rounded-full text-sm transition-colors">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-spotify-green border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="text-center py-8">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {!loading && !error && searched && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">
              {results.length > 0
                ? `${results.length} result${results.length !== 1 ? 's' : ''}`
                : 'No results found'}
            </h2>
            {tab === 'saavn' && results.length > 0 && (
              <span className="text-xs text-spotify-light">Powered by JioSaavn</span>
            )}
          </div>
          <div className="space-y-1">
            {results.map((song, i) => (
              <SongCard key={song.id} song={song} index={i} songList={results} showIndex />
            ))}
          </div>

          {/* Show recommendations based on search query */}
          {query && tab === 'library' && results.length > 0 && (
            <RecommendationsSection
              title="Explore More"
              type="search-based"
              query={query}
              limit={10}
              className="mt-8"
            />
          )}
        </div>
      )}
    </div>
  );
}
