import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { playlistsApi } from '../api';

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v6H20V7.577l-7.5-4.33zm-2-1.732a3 3 0 0 1 3 0l7.5 4.33A2 2 0 0 1 22 7.577V21a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1v-6h-3v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.577a2 2 0 0 1 1-1.732l7.5-4.33z"/>
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M10.533 1.279c-5.18 0-9.407 4.14-9.407 9.279s4.226 9.279 9.407 9.279c2.234 0 4.29-.77 5.907-2.058l4.353 4.353a1 1 0 1 0 1.414-1.414l-4.344-4.344a9.157 9.157 0 0 0 2.077-5.816c0-5.14-4.226-9.28-9.407-9.28zm-7.407 9.279c0-4.006 3.302-7.28 7.407-7.28s7.407 3.274 7.407 7.28-3.302 7.279-7.407 7.279-7.407-3.273-7.407-7.28z"/>
  </svg>
);
const LibraryIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.464a1 1 0 0 0-.5-.866l-6-3.464zM9 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1z"/>
  </svg>
);
const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="w-6 h-6">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 3a1 1 0 0 1 1 1v7h7a1 1 0 1 1 0 2h-7v7a1 1 0 1 1-2 0v-7H4a1 1 0 1 1 0-2h7V4a1 1 0 0 1 1-1z"/>
  </svg>
);

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    playlistsApi.getMy().then(r => setPlaylists(r.data)).catch(() => {});
  }, []);

  const handleCreatePlaylist = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const { data } = await playlistsApi.create({ name: `My Playlist #${playlists.length + 1}` });
      setPlaylists(prev => [data, ...prev]);
      navigate(`/playlist/${data.id}`);
    } catch {}
    setCreating(false);
  };

  return (
    <aside className="w-64 bg-spotify-black flex flex-col flex-shrink-0 h-full">
      {/* Logo */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center gap-2 mb-6">
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-spotify-green" fill="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <path fill="black" d="M8 14.5c2.5-1 5.5-1 8 0M7.5 11.5c3-1.5 6.5-1.5 9 0M8.5 8.5c2.5-1 5-1 7 0"/>
          </svg>
          <span className="text-xl font-bold text-white">GaanaBajao</span>
        </div>

        <nav className="space-y-1">
          <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active font-bold' : ''}`}>
            <HomeIcon /><span>Home</span>
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => `sidebar-link ${isActive ? 'active font-bold' : ''}`}>
            <SearchIcon /><span>Search</span>
          </NavLink>
          <NavLink to="/library" className={({ isActive }) => `sidebar-link ${isActive ? 'active font-bold' : ''}`}>
            <LibraryIcon /><span>Your Library</span>
          </NavLink>
        </nav>
      </div>

      {/* Divider */}
      <div className="mx-6 my-3 border-t border-spotify-hover" />

      {/* Quick links */}
      <div className="px-6 space-y-1">
        <button onClick={handleCreatePlaylist} className="sidebar-link w-full text-left">
          <span className="w-6 h-6 bg-spotify-light text-black rounded-sm flex items-center justify-center">
            <PlusIcon />
          </span>
          <span>Create Playlist</span>
        </button>
        <NavLink to="/liked" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-blue-600 rounded-sm flex items-center justify-center">
            <HeartIcon filled />
          </span>
          <span>Liked Songs</span>
        </NavLink>
      </div>

      <div className="mx-6 my-3 border-t border-spotify-hover" />

      {/* Playlist list */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <div className="space-y-1">
          {playlists.map(p => (
            <NavLink
              key={p.id}
              to={`/playlist/${p.id}`}
              className={({ isActive }) => `block text-sm py-1 truncate ${isActive ? 'text-white' : 'text-spotify-light hover:text-white'} transition-colors`}
            >
              {p.name}
            </NavLink>
          ))}
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-3 border-t border-spotify-hover">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-spotify-hover transition-colors">
          <div className="w-8 h-8 rounded-full bg-spotify-green flex items-center justify-center text-sm font-bold text-black flex-shrink-0">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.username}</p>
            <p className="text-xs text-spotify-light truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 rounded-full text-spotify-light hover:text-white hover:bg-[#535353] transition-colors flex-shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
