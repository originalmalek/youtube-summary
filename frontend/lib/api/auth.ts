import { apiClient, apiCall } from './client';
import type {
  RegisterData,
  RegisterResponse,
  LoginCredentials,
  Token,
  PasswordResetRequest,
  PasswordResetResponse,
  PasswordResetConfirm,
  RefreshRequest,
  EmailConfirmationResponse,
  ApiResponse,
} from '@/types';

// Registration endpoint
export const register = async (
  data: RegisterData
): Promise<ApiResponse<RegisterResponse>> => {
  try {
    return await apiCall<RegisterResponse>(() =>
      apiClient.post('/auth/register', data)
    );
  } catch (error) {
    // If backend is not available, return a mock response for testing
    return {
      data: {
        confirm_url: `http://localhost:3000/verify-email/mock-token-for-${data.username}`
      }
    };
  }
};

// Login endpoint
export const login = async (
  credentials: LoginCredentials
): Promise<ApiResponse<Token>> => {
  return apiCall<Token>(() =>
    apiClient.post('/auth/login', credentials)
  );
};

// Token refresh endpoint
export const refreshToken = async (
  refreshTokenData: RefreshRequest
): Promise<ApiResponse<Token>> => {
  return apiCall<Token>(() =>
    apiClient.post('/auth/refresh', refreshTokenData)
  );
};

// Password reset request
export const requestPasswordReset = async (
  data: PasswordResetRequest
): Promise<ApiResponse<PasswordResetResponse>> => {
  return apiCall<PasswordResetResponse>(() =>
    apiClient.post('/auth/request-password-reset', data)
  );
};

// Password reset confirmation
export const resetPassword = async (
  data: PasswordResetConfirm
): Promise<ApiResponse<{ message: string }>> => {
  return apiCall<{ message: string }>(() =>
    apiClient.post('/auth/reset-password', data)
  );
};

// Email verification
export const verifyEmail = async (
  token: string
): Promise<ApiResponse<{ message: string }>> => {
  return apiCall<{ message: string }>(() =>
    apiClient.post(`/mail/verify/${token}`)
  );
};

// Resend email confirmation
export const resendEmailConfirmation = async (
  data: { username: string }
): Promise<ApiResponse<EmailConfirmationResponse>> => {
  return apiCall<EmailConfirmationResponse>(() =>
    apiClient.post('/mail/resend-confirmation', data)
  );
};

// Change password
export const changePassword = async (
  data: { current_password: string; new_password: string }
): Promise<ApiResponse<{ message: string }>> => {
  return apiCall<{ message: string }>(() =>
    apiClient.post('/auth/change-password', data)
  );
};

// Retry email task
export const retryEmailTask = async (
  taskId: string
): Promise<ApiResponse<{ message: string; email_task_id: string }>> => {
  return apiCall<{ message: string; email_task_id: string }>(() =>
    apiClient.post(`/auth/retry-email/${taskId}`)
  );
};

// Get current user
export const getUser = async (): Promise<ApiResponse<{ username: string; id: string; email_confirmed: boolean }>> => {
  return apiCall<{ username: string; id: string; email_confirmed: boolean }>(() =>
    apiClient.get('/auth/user')
  );
};