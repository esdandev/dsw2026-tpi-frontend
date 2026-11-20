import axios from 'axios';

const instance = axios.create({
  baseURL: '/',
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

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
      const role = localStorage.getItem('role');

      const isAdmin =
        role === 'ADMINISTRADOR' ||
        (role !== 'PACIENTE' && window.location.pathname.startsWith('/admin'));

      const loginPath = isAdmin ? '/admin/login' : '/login';

      ['token', 'role', 'dni', 'email'].forEach((key) => {
        localStorage.removeItem(key);
      });

      if (window.location.pathname !== loginPath) {
        window.location.replace(loginPath);
      }
    }

    return Promise.reject(error);
  }
);

export { instance };
