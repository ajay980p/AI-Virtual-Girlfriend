"use client";

import { useEffect, useRef } from 'react';
import { useAuthStore, isTokenExpired } from '@/store/auth.store';
import { getAccessToken, getRefreshToken } from '@/lib/cookies';

/**
 * Hook to automatically refresh tokens before they expire
 */
export function useTokenRefresh() {
  const { refreshToken, logout, isAuthenticated } = useAuthStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      // Clear interval if user is not authenticated
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const checkAndRefreshToken = async () => {
      const accessToken = getAccessToken();
      const refreshTokenValue = getRefreshToken();

      if (!accessToken || !refreshTokenValue) {
        await logout();
        return;
      }

      // Check if token will expire in the next 5 minutes (300 seconds)
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = payload.exp - currentTime;

        // If token expires in less than 5 minutes, refresh it
        if (timeUntilExpiry < 300) {
          console.log('Token expiring soon, refreshing...');
          const success = await refreshToken();
          if (!success) {
            console.error('Failed to refresh token, logging out');
            await logout();
          }
        }
      } catch (error) {
        console.error('Error checking token expiry:', error);
        await logout();
      }
    };

    // Check immediately
    checkAndRefreshToken();

    // Set up interval to check every 2 minutes
    intervalRef.current = setInterval(checkAndRefreshToken, 2 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated, refreshToken, logout]);
}

/**
 * Hook to ensure valid token for API calls
 */
export async function ensureValidToken(): Promise<string | null> {
  const accessToken = getAccessToken();
  
  if (!accessToken) {
    return null;
  }

  // Check if token is expired
  if (isTokenExpired(accessToken)) {
    // Try to refresh
    const success = await useAuthStore.getState().refreshToken();
    if (!success) {
      return null;
    }
    // Return the new token
    return getAccessToken();
  }

  return accessToken;
}