import axios from 'axios';
import router from '@/router';

// Function to get CSRF cookie
const initializeCsrf = async () => {
  try {
    // Create a separate axios instance for CSRF token retrieval
    const csrfAxios = axios.create({
      baseURL: process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8000' 
        : 'https://api.indob2c.com',
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    // First, attempt to get CSRF cookie via Sanctum endpoint
    await csrfAxios.get('/sanctum/csrf-cookie');

    // Fetch CSRF token from backend
    const tokenResponse = await csrfAxios.get('/api/csrf-token');
    
    // Extract token from response or headers
    const csrfToken = tokenResponse.data?.csrf_token || 
                      tokenResponse.headers['x-csrf-token'] || 
                      '';

    // Validate token
    if (!csrfToken) {
      console.error('❌ Failed to retrieve CSRF token');
      throw new Error('CSRF Token Retrieval Failed');
    }

    // Ensure token is set in meta tag for consistent access
    const existingMetaTag = document.querySelector('meta[name="csrf-token"]');
    if (existingMetaTag) {
      existingMetaTag.setAttribute('content', csrfToken);
    } else {
      const newMetaTag = document.createElement('meta');
      newMetaTag.setAttribute('name', 'csrf-token');
      newMetaTag.setAttribute('content', csrfToken);
      document.head.appendChild(newMetaTag);
    }

    // Update document cookie for frontend access
    document.cookie = `XSRF-TOKEN=${csrfToken}; path=/; SameSite=Lax`;

    // Log token retrieval details
    console.log('CSRF Token Retrieved:', {
      fromResponse: tokenResponse.data?.csrf_token,
      fromHeaders: tokenResponse.headers['x-csrf-token'],
      finalToken: csrfToken
    });

    return csrfToken;
  } catch (error) {
    console.error('CSRF Cookie initialization failed:', error);
    throw error;
  }
};

// Create a base Axios instance with robust configuration
const createApiInstance = () => {
  const instance = axios.create({
    baseURL: process.env.NODE_ENV === 'development' 
      ? 'http://localhost:8000' 
      : 'https://api.indob2c.com',
    withCredentials: true,
    headers: {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json'
    }
  });

  // Add request interceptor to handle CSRF token
  instance.interceptors.request.use(async (config) => {
    try {
      // Ensure CSRF token is present
      const csrfToken = await initializeCsrf();
      
      // Add CSRF token to headers
      config.headers['X-CSRF-TOKEN'] = csrfToken;
      config.headers['X-XSRF-TOKEN'] = csrfToken;

      return config;
    } catch (error) {
      console.error('Failed to add CSRF token to request', error);
      return config;
    }
  }, (error) => {
    return Promise.reject(error);
  });

  // Add response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      // Specifically handle 419 CSRF token errors
      if (error.response && error.response.status === 419) {
        console.warn('CSRF Token Expired. Attempting to regenerate...');
        
        try {
          // Force regenerate CSRF token
          await initializeCsrf();
          
          // Retry the original request
          return axios.request(error.config);
        } catch (regenerateError) {
          console.error('Failed to regenerate CSRF token', regenerateError);
        }
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

// Create main API instance with CORS protection
const api = createApiInstance();

// Authentication API for login/register
const authApi = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : 'https://api.indob2c.com',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true,
  timeout: 10000
});

// Export as default and named export
export default api;
export { api, initializeCsrf, authApi };
