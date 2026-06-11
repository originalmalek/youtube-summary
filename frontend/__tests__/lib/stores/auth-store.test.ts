import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '@/lib/stores/auth-store';
import * as authApi from '@/lib/api/auth';
import * as cookies from '@/lib/utils/cookies';

// Mock the API and cookie utilities
vi.mock('@/lib/api/auth');
vi.mock('@/lib/utils/cookies');

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      rememberMe: false,
    });
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('successfully logs in user and stores tokens', async () => {
      const mockTokens = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
      };
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        username: 'test@example.com',
        emailConfirmed: true,
        createdAt: new Date().toISOString(),
      };

      vi.mocked(authApi.login).mockResolvedValue({
        data: mockTokens,
      });
      vi.mocked(authApi.getUser).mockResolvedValue({
        data: {
          id: 'user-id',
          username: 'test@example.com',
          email_confirmed: true,
        },
      });

      const { login } = useAuthStore.getState();
      await login({ username: 'test@example.com', password: 'password' }, true);

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.accessToken).toBe(mockTokens.access_token);
      expect(state.refreshToken).toBe(mockTokens.refresh_token);
      expect(state.rememberMe).toBe(true);
      expect(state.user?.email).toBe('test@example.com');

      expect(cookies.setAccessToken).toHaveBeenCalledWith(mockTokens.access_token, true);
      expect(cookies.setRefreshToken).toHaveBeenCalledWith(mockTokens.refresh_token, true);
    });

    it('handles login failure', async () => {
      vi.mocked(authApi.login).mockResolvedValue({
        error: { detail: 'Invalid credentials', status_code: 401 },
      });

      const { login } = useAuthStore.getState();
      await expect(
        login({ username: 'test@example.com', password: 'wrong' }, false)
      ).rejects.toThrow('Invalid credentials');

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.accessToken).toBeNull();
    });
  });

  describe('logout', () => {
    it('clears auth state and cookies', () => {
      // Set initial state
      useAuthStore.setState({
        user: { id: '1', email: 'test@example.com', username: 'test@example.com', emailConfirmed: true, createdAt: '' },
        accessToken: 'token',
        refreshToken: 'refresh',
        isAuthenticated: true,
      });

      const { logout } = useAuthStore.getState();
      logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(cookies.clearAuthCookies).toHaveBeenCalled();
    });
  });

  describe('refreshAccessToken', () => {
    it('successfully refreshes tokens', async () => {
      const newTokens = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      };

      vi.mocked(cookies.getRefreshToken).mockReturnValue('old-refresh-token');
      vi.mocked(authApi.refreshToken).mockResolvedValue({
        data: newTokens,
      });
      vi.mocked(cookies.getUserFromToken).mockReturnValue({
        sub: 'user-id',
        email: 'test@example.com',
      });

      useAuthStore.setState({
        user: { id: '1', email: 'test@example.com', username: 'test@example.com', emailConfirmed: true, createdAt: '' },
        refreshToken: 'old-refresh-token',
        rememberMe: true,
      });

      const { refreshAccessToken } = useAuthStore.getState();
      await refreshAccessToken();

      const state = useAuthStore.getState();
      expect(state.accessToken).toBe(newTokens.access_token);
      expect(state.refreshToken).toBe(newTokens.refresh_token);
      expect(cookies.setAccessToken).toHaveBeenCalledWith(newTokens.access_token, true);
      expect(cookies.setRefreshToken).toHaveBeenCalledWith(newTokens.refresh_token, true);
    });

    it('logs out user on refresh failure', async () => {
      vi.mocked(cookies.getRefreshToken).mockReturnValue('old-refresh-token');
      vi.mocked(authApi.refreshToken).mockResolvedValue({
        error: { detail: 'Invalid token', status_code: 401 },
      });

      const { refreshAccessToken } = useAuthStore.getState();
      await expect(refreshAccessToken()).rejects.toThrow('Invalid token');

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.accessToken).toBeNull();
      expect(cookies.clearAuthCookies).toHaveBeenCalled();
    });
  });

  describe('checkAuth', () => {
    it('sets authenticated state when valid token exists', async () => {
      vi.mocked(cookies.getAccessToken).mockReturnValue('valid-token');
      vi.mocked(cookies.getRefreshToken).mockReturnValue('refresh-token');
      vi.mocked(cookies.isTokenExpired).mockReturnValue(false);
      vi.mocked(cookies.getUserFromToken).mockReturnValue({
        sub: 'user-id',
        email: 'test@example.com',
      });
      vi.mocked(authApi.getUser).mockResolvedValue({
        data: {
          id: 'user-id',
          username: 'test@example.com',
          email_confirmed: true,
        },
      });

      const { checkAuth } = useAuthStore.getState();
      await checkAuth();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.accessToken).toBe('valid-token');
      expect(state.isLoading).toBe(false);
    });

    it('refreshes token when access token is expired', async () => {
      vi.mocked(cookies.getAccessToken).mockReturnValue('expired-token');
      vi.mocked(cookies.getRefreshToken).mockReturnValue('refresh-token');
      vi.mocked(cookies.isTokenExpired).mockReturnValue(true);
      vi.mocked(authApi.refreshToken).mockResolvedValue({
        data: {
          access_token: 'new-token',
          refresh_token: 'new-refresh',
        },
      });
      vi.mocked(authApi.getUser).mockResolvedValue({
        data: {
          id: 'user-id',
          username: 'test@example.com',
          email_confirmed: true,
        },
      });

      const { checkAuth } = useAuthStore.getState();
      await checkAuth();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('sets unauthenticated state when no tokens exist', async () => {
      vi.mocked(cookies.getAccessToken).mockReturnValue(null);
      vi.mocked(cookies.getRefreshToken).mockReturnValue(null);

      const { checkAuth } = useAuthStore.getState();
      await checkAuth();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });
});