import { useNavigate } from 'react-router-dom';

export default function Header({ title, gradient, children }) {
  const navigate = useNavigate();
  return (
    <div className={`sticky top-0 z-10 ${gradient || 'bg-gradient-to-b from-spotify-dark to-transparent'}`}>
      <div className="flex items-center gap-4 px-6 pt-4 pb-3">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M15.957 2.793a1 1 0 0 1 0 1.414L9.164 11l6.793 6.793a1 1 0 1 1-1.414 1.414L7.043 12.29a1.25 1.25 0 0 1 0-1.58l7.5-7.916a1 1 0 0 1 1.414 0z"/>
          </svg>
        </button>
        {title && <h1 className="text-2xl font-bold truncate">{title}</h1>}
        {children}
      </div>
    </div>
  );
}
