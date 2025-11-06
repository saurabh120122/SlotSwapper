import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// This handles errors for all API calls in one place
api.interceptors.response.use(
  (response) => {
    // If the response is good, just return it
    return response;
  },
  (error) => {
    // Check if the error is a 401 (Unauthorized)
    if (error.response?.status === 401) {
      // This means the token is expired or invalid
      // 1. Clear the bad token from storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // 2. Force a full page reload.
      // This will reset the AuthContext and send the user to the login page.
      window.location.href = '/login';
      
      console.error("Unauthorized! Logging out.");
    }

    // Return the error to the component's .catch() block
    return Promise.reject(error);
  }
);

export default api;