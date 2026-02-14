import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('hoopref_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authWithGoogle = (token: string) => api.post('/auth/google', { token });
export const register = (data: any) => api.post('/auth/register', data);
export const login = (data: any) => api.post('/auth/login', data);
export const analyzePlay = (situation: string) => api.post('/analyze', { situation });
export const getHistory = () => api.get('/history');
export const deleteHistory = (id: string) => api.delete(`/history/${id}`);

export default api;
