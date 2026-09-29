import axios from 'axios';
import { getCookie } from 'cookies-next';

const isProd = process.env.NODE_ENV === 'production';
export const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
export const backend = process.env.NEXT_PUBLIC_API_URL;
export const localBackend = isProd
  ? process.env.NEXT_PUBLIC_API_URL
  : 'http://194.163.167.131:7200/api/v1';

export const api = axios.create({
  baseURL: backend,
});

export const AuthApi = axios.create({
  baseURL: backend,
  headers: {
    Authorization: `Bearer ${getCookie('token')}`,
  },
});

// Ensure the latest token (cookie) is attached to every request.
// This handles cases where the cookie is set/updated after module initialization.

AuthApi.interceptors.request.use(
  (config) => {
    try {
      const token = getCookie('token');
      if (token) {
        (config.headers as any)['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export const fetcher = (url: string) =>
  fetch(backend + url, {
    headers: {
      Authorization: `Bearer ${getCookie('token')}`,
    },
  }).then((res) => res.json());
export const clientUrl =
  process.env.NODE_ENV !== 'production' ? 'http://localhost:5443' : 'http://194.163.167.131:5275';

export const rcaLogo = '/logo.png';

export const getFile = (fileName: string | null) =>
  fileName ? `${baseUrl}/api/v1/files/${fileName}` : null;
