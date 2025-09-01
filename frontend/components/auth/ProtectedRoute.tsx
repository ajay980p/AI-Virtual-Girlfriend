"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { getAccessToken, isTokenExpired } from "@/store/auth.store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/auth/signin',
  '/auth/signup',
];

// Routes that require authentication to be redirected away (like auth pages when already logged in)
const AUTH_ROUTES = [
  '/auth/signin',
  '/auth/signup',
];

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, initializeAuth, logout } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize auth state from cookies on mount
    initializeAuth();
    setIsInitialized(true);
  }, [initializeAuth]);

  useEffect(() => {
    if (!isInitialized) return;

    const accessToken = getAccessToken();
    const isCurrentRoutePublic = PUBLIC_ROUTES.includes(pathname);
    const isCurrentRouteAuth = AUTH_ROUTES.includes(pathname);

    // Check if token exists and is valid
    if (accessToken && isTokenExpired(accessToken)) {
      // Token expired, logout user
      logout();
      if (!isCurrentRoutePublic) {
        router.push('/auth/signin');
      }
      return;
    }

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (isAuthenticated && isCurrentRouteAuth) {
      router.push('/dashboard');
      return;
    }

    // If user is not authenticated and trying to access protected routes
    if (!isAuthenticated && !isCurrentRoutePublic) {
      router.push('/auth/signin');
      return;
    }
  }, [isAuthenticated, pathname, router, logout, isInitialized]);

  // Show loading state while initializing
  if (!isInitialized) {
    return fallback || (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}