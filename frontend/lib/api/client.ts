import axios from 'axios';
import type { ApiResponse } from '@/types';
import { getAccessToken, getRefreshToken } from '@/lib/utils/cookies';

// Global navigation function to avoid full page reloads
let globalRouter: any = null;

// Set router from component
export const setGlobalRouter = (router: any) => {
  globalRouter = router;
};

// Navigate without full page reload
const navigateToLogin = () => {
  if (globalRouter) {
    globalRouter.push('/login');
  } else {
    // Fallback to window.location if router not available
    window.location.href = '/login';
  }
};

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const url = typeof originalRequest?.url === 'string' ? originalRequest.url : '';
    const isLogin = url.includes('/auth/login');
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      // Guard: do not refresh/redirect on login failures
      if (isLogin) {
        return Promise.reject(new Error('Invalid email or password'));
      }
      if (!originalRequest._retry) {
        originalRequest._retry = true;
      }
      
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          // Import auth store dynamically to avoid circular dependency
          const { useAuthStore } = await import('@/lib/stores/auth-store');
          await useAuthStore.getState().refreshAccessToken();
          
          // Retry original request with new token
          const newToken = getAccessToken();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, logout user
          const { useAuthStore } = await import('@/lib/stores/auth-store');
          useAuthStore.getState().logout();
          
          // Only redirect if we're not already on the login page
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            navigateToLogin();
          }
          
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, logout user
        const { useAuthStore } = await import('@/lib/stores/auth-store');
        useAuthStore.getState().logout();
        
        // Redirect to login if we're in the browser
        if (typeof window !== 'undefined') {
          navigateToLogin();
        }
      }
    }
    
    // Handle common HTTP errors
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error(data.detail || 'Bad request');
        case 401:
          throw new Error('Invalid email or password');
        case 403:
          throw new Error(data.detail || 'Email not confirmed');
        case 404:
          throw new Error(data.detail || 'Not found');
        case 422:
          throw new Error(data.detail || 'Validation error');
        case 500:
          throw new Error(data.detail || 'Server error. Please try again later.');
        default:
          throw new Error(data.detail || 'Something went wrong');
      }
    }
    
    // Network error
    if (error.request) {
      throw new Error('Network error. Please check your connection.');
    }
    
    throw new Error('An unexpected error occurred');
  }
);

// Helper function to wrap API calls
export const apiCall = async <T>(
  request: () => Promise<{ data: T }>
): Promise<ApiResponse<T>> => {
  try {
    const response = await request();
    return {
      data: response.data,
    };
  } catch (error) {
    return {
      error: {
        detail: error instanceof Error ? error.message : 'Unknown error',
        status_code: 0,
      },
    };
  }
};
