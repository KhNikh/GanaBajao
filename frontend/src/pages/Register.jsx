import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-spotify-black flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <svg viewBox="0 0 24 24" className="w-12 h-12 text-spotify-green" fill="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <path fill="black" d="M8 14.5c2.5-1 5.5-1 8 0M7.5 11.5c3-1.5 6.5-1.5 9 0M8.5 8.5c2.5-1 5-1 7 0"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-center mb-8">Create your account</h1>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              className="w-full bg-[#3E3E3E] border border-[#535353] rounded px-3 py-3 text-white placeholder-spotify-light focus:outline-none focus:border-white transition-colors"
              placeholder="Username"
              required minLength={3}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full bg-[#3E3E3E] border border-[#535353] rounded px-3 py-3 text-white placeholder-spotify-light focus:outline-none focus:border-white transition-colors"
              placeholder="Email address"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full bg-[#3E3E3E] border border-[#535353] rounded px-3 py-3 text-white placeholder-spotify-light focus:outline-none focus:border-white transition-colors"
              placeholder="Password (min 6 chars)"
              required minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 border-t border-spotify-hover pt-6 text-center">
          <p className="text-spotify-light text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-white font-semibold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
