import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
});

// Request interceptor for comprehensive logging and token management
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', {
      method: config.method,
      url: config.url,
      data: config.data,
      headers: config.headers
    });

    // Optional: Add token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Optional CSRF token handling
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    // Comprehensive request logging
    console.group('🚀 Outgoing Request');
    console.log('URL:', config.url);
    console.log('Method:', config.method);
    console.log('Headers:', config.headers);
    console.log('Data:', config.data);
    console.groupEnd();

    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with detailed error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      data: response.data
    });

    console.group('✅ Incoming Response');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    console.log('Headers:', response.headers);
    console.groupEnd();
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });

    console.group('❌ Detailed Error');
    console.error('Full Error Object:', error);
    
    // Detailed error logging
    if (error.response) {
      console.error('Server Response Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('Network Error - No Response:', {
        request: error.request,
        message: error.message
      });
    } else {
      console.error('Request Setup Error:', error.message);
    }
    console.groupEnd();

    // Specific error handling
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    // Specific handling for 422 errors
    if (error.response && error.response.status === 422) {
      console.error('🔍 Detailed Validation Errors:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;
