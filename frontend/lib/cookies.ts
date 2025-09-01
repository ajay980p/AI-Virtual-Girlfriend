/**
 * Cookie utility functions for secure token storage
 */

export interface CookieOptions {
  expires?: Date;
  maxAge?: number; // seconds
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Set a cookie in the browser
 */
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  if (typeof document === 'undefined') return; // SSR safety

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options.expires) {
    cookieString += `; expires=${options.expires.toUTCString()}`;
  }

  if (options.maxAge) {
    cookieString += `; max-age=${options.maxAge}`;
  }

  if (options.domain) {
    cookieString += `; domain=${options.domain}`;
  }

  if (options.path) {
    cookieString += `; path=${options.path}`;
  }

  if (options.secure) {
    cookieString += '; secure';
  }

  if (options.httpOnly) {
    cookieString += '; httponly';
  }

  if (options.sameSite) {
    cookieString += `; samesite=${options.sameSite}`;
  }

  document.cookie = cookieString;
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null; // SSR safety

  const nameEQ = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }

  return null;
}

/**
 * Delete a cookie by name
 */
export function deleteCookie(name: string, path: string = '/', domain?: string): void {
  if (typeof document === 'undefined') return; // SSR safety

  const options: CookieOptions = {
    expires: new Date(0),
    path,
  };

  if (domain) {
    options.domain = domain;
  }

  setCookie(name, '', options);
}

/**
 * Check if a cookie exists
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null;
}

// Token-specific cookie utilities
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Cookie options for tokens
const getTokenCookieOptions = (isRefreshToken: boolean = false): CookieOptions => ({
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: isRefreshToken ? 7 * 24 * 60 * 60 : 15 * 60, // 7 days for refresh, 15 minutes for access
});

/**
 * Set access token in cookie
 */
export function setAccessToken(token: string): void {
  setCookie(ACCESS_TOKEN_KEY, token, getTokenCookieOptions(false));
}

/**
 * Set refresh token in cookie
 */
export function setRefreshToken(token: string): void {
  setCookie(REFRESH_TOKEN_KEY, token, getTokenCookieOptions(true));
}

/**
 * Get access token from cookie
 */
export function getAccessToken(): string | null {
  return getCookie(ACCESS_TOKEN_KEY);
}

/**
 * Get refresh token from cookie
 */
export function getRefreshToken(): string | null {
  return getCookie(REFRESH_TOKEN_KEY);
}

/**
 * Remove all auth tokens from cookies
 */
export function clearAuthTokens(): void {
  deleteCookie(ACCESS_TOKEN_KEY);
  deleteCookie(REFRESH_TOKEN_KEY);
}

/**
 * Set both access and refresh tokens
 */
export function setAuthTokens(accessToken: string, refreshToken: string): void {
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
}

/**
 * Get both tokens from cookies
 */
export function getAuthTokens(): { accessToken: string | null; refreshToken: string | null } {
  return {
    accessToken: getAccessToken(),
    refreshToken: getRefreshToken(),
  };
}