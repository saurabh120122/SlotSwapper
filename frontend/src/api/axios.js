import axios from 'axios';

// 1. Define the backend API's base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// 2. Create the axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // This is crucial for cookies (like our refreshToken)
});

// 3. Create an interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage (which AuthContext set)
    const token = localStorage.getItem('token');
    if (token) {
      // Add the "Bearer <token>" header
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;