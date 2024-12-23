import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000', // Laravel default port
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Add a request interceptor to handle CSRF token
axiosInstance.interceptors.request.use(async (config) => {
  // Fetch CSRF token before making requests
  await axios.get('http://localhost:8000/sanctum/csrf-cookie');
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosInstance;
