import Cookies from 'js-cookie';

const ACCESS_TOKEN_KEY = 'youtube_summary_access_token';
const REFRESH_TOKEN_KEY = 'youtube_summary_refresh_token';

// Cookie options for different token types
const getAccessTokenOptions = (rememberMe: boolean): Cookies.CookieAttributes => ({
  expires: rememberMe ? 7 : undefined, // 7 days if remember me, session otherwise
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
});

const getRefreshTokenOptions = (rememberMe: boolean): Cookies.CookieAttributes => ({
  expires: rememberMe ? 30 : 7, // 30 days if remember me, 7 days otherwise
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
});

// Token storage functions
export const setAccessToken = (token: string, rememberMe: boolean = false): void => {
  Cookies.set(ACCESS_TOKEN_KEY, token, getAccessTokenOptions(rememberMe));
};

export const getAccessToken = (): string | undefined => {
  return Cookies.get(ACCESS_TOKEN_KEY);
};

export const removeAccessToken = (): void => {
  Cookies.remove(ACCESS_TOKEN_KEY, { path: '/' });
};

export const setRefreshToken = (token: string, rememberMe: boolean = false): void => {
  Cookies.set(REFRESH_TOKEN_KEY, token, getRefreshTokenOptions(rememberMe));
};

export const getRefreshToken = (): string | undefined => {
  return Cookies.get(REFRESH_TOKEN_KEY);
};

export const removeRefreshToken = (): void => {
  Cookies.remove(REFRESH_TOKEN_KEY, { path: '/' });
};

// Clear all auth cookies
export const clearAuthCookies = (): void => {
  removeAccessToken();
  removeRefreshToken();
};

// Check if tokens exist
export const hasTokens = (): boolean => {
  return !!(getAccessToken() || getRefreshToken());
};

// JWT token decoding (client-side only, for expiry check)
export const decodeToken = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

// Get user info from access token
export const getUserFromToken = (token: string): { email: string; sub: string } | null => {
  const decoded = decodeToken(token);
  if (!decoded) return null;
  
  return {
    email: decoded.sub,
    sub: decoded.sub,
  };
};