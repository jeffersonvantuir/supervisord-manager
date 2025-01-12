import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { message } from 'antd';
import Router from 'next/router';

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
    (response) => {
        return response;
    },
    (error) => {
        // Verifica se o erro é 401
        if (error.response?.status === 401) {
            message.error('Sua sessão expirou. Faça login novamente.');
            // Redireciona para a página de login
            Router.push('/login');
        }
        // Rejeita o erro para ser tratado onde a requisição foi feita
        return Promise.reject(error);
    }
);


export default api;
