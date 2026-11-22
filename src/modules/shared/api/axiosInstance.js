import axios from 'axios';
import {
  SESSION_FIELDS,
  clearSession,
  readSession,
} from '../../auth/services/sessionStorage';

const TIMEOUT_MS = 15000;

const instance = axios.create({
  baseURL: '/',
  // Sin timeout, con el back colgado la pantalla queda cargando para siempre.
  timeout: TIMEOUT_MS,
});

instance.interceptors.request.use(
  (config) => {
    const token = readSession(SESSION_FIELDS.TOKEN);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    const isLoginRequest = /^\/?api\/auth\/(admin|patient)\/login\/?$/.test(
      requestUrl
    );

    if (error.response?.status === 401 && !isLoginRequest) {
      const loginPath = window.location.pathname.startsWith('/admin')
        ? '/admin/login'
        : '/login';

      clearSession();

      if (window.location.pathname !== loginPath) {
        window.location.replace(loginPath);
      }
    }

    if (error.response?.status === 403) {
      window.dispatchEvent(new Event('api:access-denied'));
    }

    return Promise.reject(error);
  }
);

export { instance };
