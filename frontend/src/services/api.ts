import axios from "axios";

// Determine the API base URL based on environment
const getBaseUrl = () => {
  // For local development, use the Vite proxy
  if (import.meta.env.DEV) {
    return '/api';  // This matches your proxy configuration in vite.config.ts
  }

  // For production, use your deployed backend URL
  return import.meta.env.VITE_API_URL as string;
};

// Create an axios instance with the appropriate base URL
const api = axios.create({
  baseURL: getBaseUrl(),
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors (401, 403, 500, etc.)
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;