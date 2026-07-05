import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true
});

let refreshPromise = null;

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    
    if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = instance
          .post('/auth/refresh')
          .catch((err) => {
            localStorage.removeItem('gym_user');
            window.location.href = '/login';
            return Promise.reject(err);
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      return refreshPromise.then(() => {
        return instance(originalRequest);
      });
    }

    return Promise.reject(error);
  }
);

export default instance;