import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  setAuthTokens,
  getAuthTokens,
  clearAuthTokens,
  getAccessToken as getCookieAccessToken,
  getRefreshToken as getCookieRefreshToken
} from '@/lib/cookies';

// User interface based on the auth service
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  avatar?: string;
  preferences: {
    avatarId?: string;
    personalityTraits?: string[];
    communicationStyle?: string;
  };
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth tokens interface
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Auth response from login/register
export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// Login/Register request interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  preferences?: {
    avatarId?: string;
    personalityTraits?: string[];
    communicationStyle?: string;
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Auth store state interface
interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string;

  // Actions
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  updateProfile: (data: UpdateProfileRequest) => Promise<boolean>;
  changePassword: (data: ChangePasswordRequest) => Promise<boolean>;
  clearError: () => void;
  initializeAuth: () => void;

  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUser: (user: User | null) => void;
}

// Auth service API client
class AuthService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3001/api';
    console.log('✅ AuthService baseURL:', this.baseURL); // <--- Add this
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for refresh token
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorMessage = 'An error occurred';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}`;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Request failed');
      }

      return data.data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  private getAuthHeaders(accessToken?: string): Record<string, string> {
    const token = accessToken || getCookieAccessToken();
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async refreshToken(refreshToken?: string): Promise<{ tokens: AuthTokens }> {
    const token = refreshToken || getCookieRefreshToken();
    if (!token) {
      throw new Error('No refresh token available');
    }
    return this.makeRequest<{ tokens: AuthTokens }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: token }),
    });
  }

  async logout(accessToken?: string, refreshToken?: string): Promise<void> {
    const aToken = accessToken || getCookieAccessToken();
    const rToken = refreshToken || getCookieRefreshToken();

    if (aToken) {
      await this.makeRequest<void>('/auth/logout', {
        method: 'POST',
        headers: this.getAuthHeaders(aToken),
        body: JSON.stringify({ refreshToken: rToken }),
      });
    }
  }

  async logoutAll(accessToken?: string): Promise<void> {
    const token = accessToken || getCookieAccessToken();
    if (token) {
      await this.makeRequest<void>('/auth/logout-all', {
        method: 'POST',
        headers: this.getAuthHeaders(token),
      });
    }
  }

  async getProfile(accessToken?: string): Promise<User> {
    return this.makeRequest<User>('/auth/profile', {
      method: 'GET',
      headers: this.getAuthHeaders(accessToken),
    });
  }

  async updateProfile(data: UpdateProfileRequest, accessToken?: string): Promise<User> {
    return this.makeRequest<User>('/auth/profile', {
      method: 'PATCH',
      headers: this.getAuthHeaders(accessToken),
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: ChangePasswordRequest, accessToken?: string): Promise<void> {
    await this.makeRequest<void>('/auth/change-password', {
      method: 'POST',
      headers: this.getAuthHeaders(accessToken),
      body: JSON.stringify(data),
    });
  }
}

const authService = new AuthService();

// Zustand store with persistence (only user data, tokens in cookies)
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      token: '',

      // Initialize auth state from cookies
      initializeAuth: () => {
        const { accessToken, refreshToken } = getAuthTokens();
        if (accessToken && refreshToken) {
          set({ isAuthenticated: true });
          // Optionally fetch user profile if tokens exist
          authService.getProfile().then((user) => {
            set({ user });
          }).catch(() => {
            // If profile fetch fails, clear tokens
            clearAuthTokens();
            set({ isAuthenticated: false });
          });
        } else {
          set({ isAuthenticated: false, user: null });
        }
      },

      // Actions
      login: async (credentials: LoginRequest): Promise<boolean> => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.login(credentials);

          // Store tokens in cookies
          setAuthTokens(response.tokens.accessToken, response.tokens.refreshToken);

          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({
            isLoading: false,
            error: errorMessage,
            user: null,
            isAuthenticated: false,
          });
          return false;
        }
      },

      register: async (userData: RegisterRequest): Promise<boolean> => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.register(userData);

          // Store tokens in cookies
          setAuthTokens(response.tokens.accessToken, response.tokens.refreshToken);

          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed';
          set({
            isLoading: false,
            error: errorMessage,
            user: null,
            isAuthenticated: false,
          });
          return false;
        }
      },

      logout: async (): Promise<void> => {
        try {
          await authService.logout();
        } catch (error) {
          // Continue with logout even if API call fails
          console.error('Logout API error:', error);
        }

        // Clear tokens from cookies
        clearAuthTokens();

        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      logoutAll: async (): Promise<void> => {
        try {
          await authService.logoutAll();
        } catch (error) {
          console.error('Logout all API error:', error);
        }

        // Clear tokens from cookies
        clearAuthTokens();

        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      refreshToken: async (): Promise<boolean> => {
        const refreshToken = getCookieRefreshToken();

        if (!refreshToken) {
          clearAuthTokens();
          set({
            user: null,
            isAuthenticated: false,
          });
          return false;
        }

        try {
          const response = await authService.refreshToken();

          // Update tokens in cookies
          setAuthTokens(response.tokens.accessToken, response.tokens.refreshToken);

          set({
            error: null,
          });

          return true;
        } catch (error) {
          console.error('Token refresh failed:', error);
          clearAuthTokens();
          set({
            user: null,
            isAuthenticated: false,
            error: 'Session expired. Please login again.',
          });
          return false;
        }
      },

      updateProfile: async (data: UpdateProfileRequest): Promise<boolean> => {
        const accessToken = getCookieAccessToken();

        if (!accessToken) {
          set({ error: 'Not authenticated' });
          return false;
        }

        set({ isLoading: true, error: null });

        try {
          const updatedUser = await authService.updateProfile(data);

          set({
            user: updatedUser,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          return false;
        }
      },

      changePassword: async (data: ChangePasswordRequest): Promise<boolean> => {
        const accessToken = getCookieAccessToken();

        if (!accessToken) {
          set({ error: 'Not authenticated' });
          return false;
        }

        set({ isLoading: true, error: null });

        try {
          await authService.changePassword(data);

          // Password change logs out all devices, clear tokens
          clearAuthTokens();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Password change failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          return false;
        }
      },

      // Utility actions
      clearError: () => set({ error: null }),

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      setError: (error: string | null) => set({ error }),

      setUser: (user: User | null) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Token management utility
export const getAccessToken = (): string | null => {
  return getCookieAccessToken();
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch {
    return true;
  }
};

// Auto token refresh utility
export const ensureValidToken = async (): Promise<string | null> => {
  const accessToken = getCookieAccessToken();

  if (!accessToken) {
    return null;
  }

  // Check if access token is expired or will expire in the next 5 minutes
  if (isTokenExpired(accessToken)) {
    const refreshSuccess = await useAuthStore.getState().refreshToken();
    if (!refreshSuccess) {
      return null;
    }
    return getCookieAccessToken();
  }

  return accessToken;
};