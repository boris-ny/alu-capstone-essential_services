import axios from "axios";

const localUrl = import.meta.env.LOCAL_API_URL as string

// Determine the API base URL based on environment
const getBaseUrl = () => {
  // For local development
  if (import.meta.env.NODE_ENV === 'development') {
    return localUrl
  }

  // For production, use the deployed backend URL or fall back to a default
  return import.meta.env.VITE_API_URL;
};

// Create an axios instance with the appropriate base URL
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
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