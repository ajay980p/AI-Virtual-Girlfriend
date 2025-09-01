"use client";

import { useEffect, ReactNode } from "react";
import { useAuthStore } from "../../store/auth.store";
import { useTokenRefresh } from "../../hooks/useTokenRefresh";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { initializeAuth } = useAuthStore();
  
  // Use the token refresh hook
  useTokenRefresh();

  useEffect(() => {
    // Initialize auth state from cookies on app start
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}