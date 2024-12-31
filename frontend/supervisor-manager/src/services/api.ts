import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL, // Defina no .env.local
    timeout: 5000,
});

export default api;
