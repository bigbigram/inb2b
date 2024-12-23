import axios, { AxiosError } from 'axios';

// Export axios and AxiosError
export { default as axios, AxiosError } from 'axios';

// Create a custom axios instance with comprehensive logging and configuration
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api', 
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    // Explicitly add potential CSRF token headers
    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
    'X-XSRF-TOKEN': document.cookie.replace(/(?:(?:^|.*;\s*)XSRF-TOKEN\s*\=\s*([^;]*).*$)|^.*$/, "$1") || ''
  },
  
  // Enable full request and response logging
  transformRequest: [
    (data, headers) => {
      console.group('%c🚀 Axios Request Transform', 'color: orange; font-weight: bold');
      console.log('Headers:', headers);
      console.log('Raw Data:', data);
      console.log('Stringified Data:', JSON.stringify(data));
      console.groupEnd();
      return JSON.stringify(data);
    }
  ],
  
  transformResponse: [
    (data) => {
      console.group('%c📥 Axios Response Transform', 'color: green; font-weight: bold');
      try {
        const parsedData = JSON.parse(data);
        console.log('Parsed Response:', parsedData);
      } catch (e) {
        console.log('Raw Response:', data);
      }
      console.groupEnd();
      return data;
    }
  ]
});

// Comprehensive request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    console.group('%c🔍 Axios Request Details', 'color: blue; font-weight: bold');
    console.log('URL:', config.url);
    console.log('Method:', config.method);
    console.log('Base URL:', config.baseURL);
    console.log('Headers:', JSON.stringify(config.headers, null, 2));
    
    try {
      console.log('Data:', JSON.stringify(config.data, null, 2));
    } catch (e) {
      console.log('Data (Raw):', config.data);
    }
    
    console.groupEnd();

    return config;
  }, 
  (error) => {
    console.error('Axios Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Comprehensive response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.group('%c✅ Axios Response Details', 'color: green; font-weight: bold');
    console.log('Status:', response.status);
    
    try {
      console.log('Data:', JSON.stringify(response.data, null, 2));
    } catch (e) {
      console.log('Data (Raw):', response.data);
    }
    
    console.log('Headers:', JSON.stringify(response.headers, null, 2));
    console.groupEnd();
    
    return response;
  },
  (error) => {
    console.group('%c❌ Axios Error Details', 'color: red; font-weight: bold');
    console.error('Full Error:', error);
    
    if (error.response) {
      console.log('Response Status:', error.response.status);
      console.log('Response Headers:', JSON.stringify(error.response.headers, null, 2));
      
      try {
        console.log('Response Data:', JSON.stringify(error.response.data, null, 2));
      } catch (e) {
        console.log('Response Data (Raw):', error.response.data);
      }
    }
    
    console.log('Request Config:', error.config);
    console.groupEnd();
    
    return Promise.reject(error);
  }
);

// Export the custom axios instance as default and named export
export default axiosInstance;
export { axiosInstance };
