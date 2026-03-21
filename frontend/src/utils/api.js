import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
// Automatically append /api if it's missing to prevent 404 errors in production
const normalizedBaseUrl = rawBaseUrl.endsWith("/api") 
  ? rawBaseUrl 
  : `${rawBaseUrl.replace(/\/$/, "")}/api`;

const api = axios.create({
  baseURL: normalizedBaseUrl,
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
