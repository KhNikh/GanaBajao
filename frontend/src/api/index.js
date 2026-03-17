import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('gb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('gb_token');
      localStorage.removeItem('gb_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (username, email, password) => api.post('/auth/register', { username, email, password }),
  me: () => api.get('/auth/me'),
};

export const songsApi = {
  getAll: (params) => api.get('/songs', { params }),
  getTrending: () => api.get('/songs/trending'),
  getGenres: () => api.get('/songs/genres'),
  getLiked: () => api.get('/songs/liked'),
  getById: (id) => api.get(`/songs/${id}`),
  like: (id) => api.post(`/songs/${id}/like`),
  play: (id, data = {}) => api.post(`/songs/${id}/play`, data),
  upload: (formData) => api.post('/songs', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const playlistsApi = {
  getAll: (params) => api.get('/playlists', { params }),
  getMy: () => api.get('/playlists/my'),
  getById: (id) => api.get(`/playlists/${id}`),
  create: (data) => api.post('/playlists', data),
  update: (id, data) => api.put(`/playlists/${id}`, data),
  delete: (id) => api.delete(`/playlists/${id}`),
  addSong: (id, song_id) => api.post(`/playlists/${id}/songs`, { song_id }),
  removeSong: (id, songId) => api.delete(`/playlists/${id}/songs/${songId}`),
  follow: (id) => api.post(`/playlists/${id}/follow`),
};

export const saavnApi = {
  search: (query, limit = 20) => api.get('/saavn/search', { params: { query, limit } }),
  trending: () => api.get('/saavn/trending'),
};

export const recommendationsApi = {
  getSimilar: (songId, limit = 10) => api.get(`/recommendations/similar/${songId}`, { params: { limit } }),
  getForMe: (limit = 20) => api.get('/recommendations/for-me', { params: { limit } }),
  getTrending: (limit = 20) => api.get('/recommendations/trending', { params: { limit } }),
  searchBased: (query, limit = 10) => api.get('/recommendations/search-based', { params: { query, limit } }),
};

export default api;
