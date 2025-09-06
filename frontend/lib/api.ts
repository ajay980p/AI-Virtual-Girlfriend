/**
 * API Client for communicating with the backend
 */

import { ensureValidToken } from '../hooks/useTokenRefresh';
import { getAccessToken } from '../lib/cookies';
import { getConfig } from './env-config';
import API_CONFIG from './api-config';

export interface ChatRequest {
  user_id: string;
  message: string;
  conversation_id?: string;
  auth_token?: string;
}

export interface ChatResponse {
  response: string;
  conversation_id?: string;
}

export interface MemoryRequest {
  user_id: string;
  content: string;
  importance?: number;
}

// Conversation API types
export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  meta?: {
    pinned?: boolean;
    memoryScore?: number;
    modelId?: string;
  };
}

export interface Conversation {
  id: string;
  userId: string;
  modelId?: string;
  title: string;
  messages: ConversationMessage[];
  lastMessagePreview?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationListResponse {
  success: boolean;
  message: string;
  data: {
    conversations: Conversation[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface ConversationResponse {
  success: boolean;
  message: string;
  data: {
    conversation: Conversation;
  };
}

export interface CreateConversationRequest {
  title?: string;
  modelId?: string;
  firstMessage?: string;
}

export interface AddMessageRequest {
  role: 'user' | 'assistant' | 'system';
  content: string;
  meta?: {
    pinned?: boolean;
    memoryScore?: number;
    modelId?: string;
  };
}

export interface ApiError {
  detail: string;
  status: number;
}

export class BackendAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail: string
  ) {
    super(message);
    this.name = 'BackendAPIError';
  }
}

class APIClient {
  private baseURL: string;
  private authServiceURL: string;

  constructor() {
    // Use API_CONFIG for reliable configuration
    this.baseURL = API_CONFIG.BACKEND_URL;
    this.authServiceURL = API_CONFIG.AUTH_SERVICE_URL;

    console.log('🔧 API Client Config:');
    console.log('Backend URL:', this.baseURL);
    console.log('Auth Service URL:', this.authServiceURL);
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_AUTH_SERVICE_URL: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL,
      NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL
    });
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await ensureValidToken();
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Get auth headers if needed
    const authHeaders = includeAuth ? await this.getAuthHeaders() : {};

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorDetail = 'An error occurred';
        try {
          const errorData = await response.json();
          errorDetail = errorData.detail || errorDetail;
        } catch {
          // Failed to parse error response
        }

        throw new BackendAPIError(
          `HTTP ${response.status}: ${errorDetail}`,
          response.status,
          errorDetail
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof BackendAPIError) {
        throw error;
      }

      // Network or other errors
      throw new BackendAPIError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0,
        'Network connection failed'
      );
    }
  }

  private async makeAuthServiceRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true
  ): Promise<T> {
    const url = `${this.authServiceURL}${endpoint}`;

    // Get auth headers if needed
    const authHeaders = includeAuth ? await this.getAuthHeaders() : {};

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorDetail = 'An error occurred';
        try {
          const errorData = await response.json();
          errorDetail = errorData.detail || errorData.message || errorDetail;
        } catch {
          // Failed to parse error response
        }

        throw new BackendAPIError(
          `HTTP ${response.status}: ${errorDetail}`,
          response.status,
          errorDetail
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof BackendAPIError) {
        throw error;
      }

      // Network or other errors
      throw new BackendAPIError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0,
        'Network connection failed'
      );
    }
  }

  /**
   * Send a chat message and get AI response
   */
  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    return this.makeRequest<ChatResponse>('/chat/respond', {
      method: 'POST',
      body: JSON.stringify(request),
    }, true); // Include auth
  }

  /**
   * Store a memory
   */
  async storeMemory(request: MemoryRequest): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>('/memory/', {
      method: 'POST',
      body: JSON.stringify(request),
    }, true); // Include auth
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string }> {
    return this.makeRequest<{ status: string }>('/ping', {}, false); // No auth needed
  }

  /**
   * Test root endpoint
   */
  async testConnection(): Promise<{ msg: string }> {
    return this.makeRequest<{ msg: string }>('/', {}, false); // No auth needed
  }

  // Conversation API methods

  /**
   * Get user's conversations
   */
  async getConversations(params?: {
    page?: number;
    limit?: number;
    modelId?: string;
  }): Promise<ConversationListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.modelId) queryParams.append('modelId', params.modelId);

    const query = queryParams.toString();
    return this.makeAuthServiceRequest<ConversationListResponse>(
      `/conversations${query ? `?${query}` : ''}`,
      {},
      true
    );
  }

  /**
   * Get specific conversation by ID
   */
  async getConversationById(conversationId: string): Promise<ConversationResponse> {
    return this.makeAuthServiceRequest<ConversationResponse>(
      `/conversations/${conversationId}`,
      {},
      true
    );
  }

  /**
   * Create new conversation
   */
  async createConversation(request: CreateConversationRequest): Promise<ConversationResponse> {
    return this.makeAuthServiceRequest<ConversationResponse>(
      '/conversations',
      {
        method: 'POST',
        body: JSON.stringify(request),
      },
      true
    );
  }

  /**
   * Add message to conversation
   */
  async addMessageToConversation(
    conversationId: string,
    message: AddMessageRequest
  ): Promise<{ success: boolean; message: string; data: { conversationId: string; messageCount: number } }> {
    return this.makeAuthServiceRequest(
      `/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify(message),
      },
      true
    );
  }

  /**
   * Update conversation title
   */
  async updateConversationTitle(
    conversationId: string,
    title: string
  ): Promise<{ success: boolean; message: string }> {
    return this.makeAuthServiceRequest(
      `/conversations/${conversationId}/title`,
      {
        method: 'PATCH',
        body: JSON.stringify({ title }),
      },
      true
    );
  }

  /**
   * Delete conversation
   */
  async deleteConversation(conversationId: string): Promise<{ success: boolean; message: string }> {
    return this.makeAuthServiceRequest(
      `/conversations/${conversationId}`,
      { method: 'DELETE' },
      true
    );
  }

  /**
   * Search conversations
   */
  async searchConversations(params: {
    q: string;
    page?: number;
    limit?: number;
  }): Promise<ConversationListResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('q', params.q);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    return this.makeAuthServiceRequest<ConversationListResponse>(
      `/conversations/search?${queryParams.toString()}`,
      {},
      true
    );
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Utility functions for easier usage
export const chatAPI = {
  sendMessage: (userId: string, message: string, conversationId?: string, authToken?: string) =>
    apiClient.sendChatMessage({
      user_id: userId,
      message,
      conversation_id: conversationId,
      auth_token: authToken
    }),

  storeMemory: (userId: string, content: string, importance?: number) =>
    apiClient.storeMemory({ user_id: userId, content, importance }),

  healthCheck: () => apiClient.healthCheck(),

  testConnection: () => apiClient.testConnection(),
};

// Conversation API utilities
export const conversationAPI = {
  getConversations: (params?: { page?: number; limit?: number; modelId?: string }) =>
    apiClient.getConversations(params),

  getConversationById: (conversationId: string) =>
    apiClient.getConversationById(conversationId),

  createConversation: (request: CreateConversationRequest) =>
    apiClient.createConversation(request),

  addMessage: (conversationId: string, message: AddMessageRequest) =>
    apiClient.addMessageToConversation(conversationId, message),

  updateTitle: (conversationId: string, title: string) =>
    apiClient.updateConversationTitle(conversationId, title),

  deleteConversation: (conversationId: string) =>
    apiClient.deleteConversation(conversationId),

  searchConversations: (params: { q: string; page?: number; limit?: number }) =>
    apiClient.searchConversations(params),
};