/**
 * API Client for communicating with the backend
 */

export interface ChatRequest {
  user_id: string;
  message: string;
}

export interface ChatResponse {
  response: string;
}

export interface MemoryRequest {
  user_id: string;
  content: string;
  importance?: number;
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

  constructor() {
    // Default to localhost:8000 for development
    this.baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
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

  /**
   * Send a chat message and get AI response
   */
  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    return this.makeRequest<ChatResponse>('/chat/respond', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Store a memory
   */
  async storeMemory(request: MemoryRequest): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>('/memory/', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string }> {
    return this.makeRequest<{ status: string }>('/ping');
  }

  /**
   * Test root endpoint
   */
  async testConnection(): Promise<{ msg: string }> {
    return this.makeRequest<{ msg: string }>('/');
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Utility functions for easier usage
export const chatAPI = {
  sendMessage: (userId: string, message: string) => 
    apiClient.sendChatMessage({ user_id: userId, message }),
  
  storeMemory: (userId: string, content: string, importance?: number) =>
    apiClient.storeMemory({ user_id: userId, content, importance }),
    
  healthCheck: () => apiClient.healthCheck(),
  
  testConnection: () => apiClient.testConnection(),
};