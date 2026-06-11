import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { AuthState, LoginCredentials, RegisterData, RegisterResponse, User } from '@/types';
import { login as apiLogin, refreshToken as apiRefreshToken, getUser as apiGetUser } from '@/lib/api/auth';
import {
  setAccessToken,
  setRefreshToken,
  getAccessToken,
  getRefreshToken,
  clearAuthCookies,
  getUserFromToken,
  isTokenExpired,
} from '@/lib/utils/cookies';

interface AuthStore extends AuthState {
  rememberMe: boolean;
  setRememberMe: (value: boolean) => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: true,
        rememberMe: false,

        setRememberMe: (value: boolean) => set({ rememberMe: value }),

        fetchUser: async () => {
          try {
            const response = await apiGetUser();
            if (response.data) {
              const currentState = get();
              const user: User = {
                id: response.data.id,
                email: response.data.username, // The username field contains the email
                username: response.data.username,
                emailConfirmed: response.data.email_confirmed,
                createdAt: new Date().toISOString(),
              };
              
              set({
                ...currentState,
                user,
              });
            }
          } catch (error) {
            console.error('Failed to fetch user data:', error);
          }
        },

        login: async (credentials: LoginCredentials, rememberMe: boolean = false) => {
          try {
            set({ isLoading: true });
            const response = await apiLogin(credentials);

            if (response.error) {
              throw new Error(response.error.detail);
            }

            if (response.data) {
              const { access_token, refresh_token } = response.data;

              // Store tokens in cookies
              setAccessToken(access_token, rememberMe);
              setRefreshToken(refresh_token, rememberMe);

              // Set initial auth state
              set({
                accessToken: access_token,
                refreshToken: refresh_token,
                isAuthenticated: true,
                isLoading: false,
                rememberMe,
              });

              // Fetch actual user data from the API
              await get().fetchUser();
            }
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },

        register: async (data: RegisterData): Promise<RegisterResponse> => {
          // Registration doesn't log the user in, just returns the confirmation URL
          set({ isLoading: true });
          try {
            const response = await apiLogin({ username: data.username, password: data.password });
            set({ isLoading: false });
            return { confirm_url: '' }; // This will be handled by the register form
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },

        logout: () => {
          clearAuthCookies();
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            rememberMe: false,
          });
        },

        refreshAccessToken: async () => {
          const refreshTokenValue = getRefreshToken();
          if (!refreshTokenValue) {
            get().logout();
            throw new Error('No refresh token available');
          }

          try {
            const response = await apiRefreshToken({ refresh_token: refreshTokenValue });

            if (response.error) {
              // Clear cookies immediately on error
              clearAuthCookies();
              set({
                user: null,
                accessToken: null,
                refreshToken: null,
                isAuthenticated: false,
                isLoading: false,
              });
              throw new Error(response.error.detail);
            }

            if (response.data) {
              const { access_token, refresh_token } = response.data;
              const { rememberMe } = get();

              // Update tokens in cookies
              setAccessToken(access_token, rememberMe);
              setRefreshToken(refresh_token, rememberMe);

              // Extract user info from new token
              const userInfo = getUserFromToken(access_token);
              const currentUser = get().user;
              
              if (userInfo && currentUser) {
                set({
                  accessToken: access_token,
                  refreshToken: refresh_token,
                  user: {
                    ...currentUser,
                    email: userInfo.email,
                  },
                });
              }
            }
          } catch (error) {
            // Clear cookies immediately on error
            clearAuthCookies();
            set({
              user: null,
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
            });
            throw error;
          }
        },

        checkAuth: async () => {
          const accessTokenValue = getAccessToken();
          const refreshTokenValue = getRefreshToken();

          if (!accessTokenValue && !refreshTokenValue) {
            set({ isAuthenticated: false, isLoading: false });
            return;
          }

          if (accessTokenValue && !isTokenExpired(accessTokenValue)) {
            const userInfo = getUserFromToken(accessTokenValue);
            if (userInfo) {
              set({
                accessToken: accessTokenValue,
                refreshToken: refreshTokenValue || null,
                isAuthenticated: true,
                isLoading: false,
              });

              // Fetch actual user data from the API
              get().fetchUser();
            }
          } else if (refreshTokenValue) {
            // Token expired, keep loading state while refreshing
            set({ isLoading: true });
            
            try {
              await get().refreshAccessToken();
              // Success - set authenticated state
              set({ 
                isAuthenticated: true, 
                isLoading: false 
              });
              // Fetch user data after successful refresh
              get().fetchUser();
            } catch (error) {
              console.warn('Failed to refresh token:', error);
              // Clear auth state and stop loading
              clearAuthCookies();
              set({ 
                user: null,
                accessToken: null,
                refreshToken: null,
                isAuthenticated: false, 
                isLoading: false 
              });
            }
          } else {
            set({ isAuthenticated: false, isLoading: false });
          }
        },

        updateUser: (user: User) => {
          set({ user });
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          rememberMe: state.rememberMe,
        }),
      }
    )
  )
);

// Initialize auth check on app load
if (typeof window !== 'undefined') {
  useAuthStore.getState().checkAuth();
}