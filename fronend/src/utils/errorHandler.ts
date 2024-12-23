import { AxiosError } from 'axios';

// Define a structured error response interface
export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

// Comprehensive API error handling utility
export const handleApiError = (error: unknown): ApiErrorResponse => {
  // Default error response
  const defaultError: ApiErrorResponse = {
    message: 'An unexpected error occurred',
    status: 500
  };

  // Handle Axios errors
  if (error instanceof AxiosError) {
    const response = error.response;
    
    // Log detailed error information
    console.group('❌ API Error Details');
    console.error('Full Error Object:', error);
    console.log('Response Status:', response?.status);
    console.log('Response Data:', response?.data);
    console.groupEnd();

    // Structured error parsing
    if (response) {
      return {
        message: response.data?.message || 
                 response.data?.error || 
                 'An error occurred while processing your request',
        errors: response.data?.errors,
        status: response.status
      };
    }

    // Network errors or other Axios-specific errors
    if (error.code === 'ECONNABORTED') {
      return {
        message: 'Request timed out. Please check your internet connection.',
        status: 408
      };
    }

    return {
      ...defaultError,
      message: error.message || defaultError.message
    };
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    return {
      ...defaultError,
      message: error.message
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      ...defaultError,
      message: error
    };
  }

  // Fallback for any other unexpected error types
  return defaultError;
};

// Utility function to display user-friendly error messages
export const displayErrorMessage = (error: ApiErrorResponse) => {
  // You can replace this with your preferred notification method
  // For example, using a toast library or custom alert
  console.error(`Error (${error.status}): ${error.message}`);
  
  // Optionally log specific field errors
  if (error.errors) {
    Object.entries(error.errors).forEach(([field, messages]) => {
      console.error(`${field} errors:`, messages);
    });
  }
};

// Global error handler for uncaught exceptions
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
    event.preventDefault(); // Prevent error from being logged to console
    
    const apiError = handleApiError(event.reason);
    displayErrorMessage(apiError);
  });

  // Handle global JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Uncaught Error:', event.error);
    
    const apiError = handleApiError(event.error);
    displayErrorMessage(apiError);
  });
};
