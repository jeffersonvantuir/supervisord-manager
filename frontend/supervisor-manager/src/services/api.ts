import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(
    (config) => {
        config.headers['x-correlation-id'] = uuidv4();
        config.headers['x-hostname'] = window.location.hostname;
        config.headers['x-client-id'] = process.env.NEXT_HTTP_CLIENT_ID;

        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
