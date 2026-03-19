import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor: attach Authorization: Bearer <token> if token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("edugrade_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: on 401, logout and redirect to /login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("edugrade_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
