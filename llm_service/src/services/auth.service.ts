import axios from 'axios';
import { config } from '../config';

type MessageData = { role: 'user' | 'assistant' | 'system'; content: string; meta?: Record<string, any> };

class AuthServiceClient {
    private baseUrl = config.authServiceApiUrl;
    async createConversation(params: { userId: string; title?: string; firstMessage?: string; modelId?: string; authToken?: string; }): Promise<string | null> {
        try {
            const res = await axios.post(`${this.baseUrl}/conversations`, {
                title: params.title,
                modelId: params.modelId,
                firstMessage: params.firstMessage,
            }, { headers: this.#headers(params.authToken) });
            if (res.data?.success) return res.data.data?.conversation?.id ?? null;
            return null;
        } catch {
            return null;
        }
    }

    async addMessage(params: { conversationId: string; role: MessageData['role']; content: string; meta?: Record<string, any>; authToken?: string; }): Promise<boolean> {
        try {
            const res = await axios.post(`${this.baseUrl}/conversations/${params.conversationId}/messages`, {
                role: params.role,
                content: params.content,
                meta: params.meta,
            }, { headers: this.#headers(params.authToken) });
            return !!res.data;
        } catch {
            return false;
        }
    }

    async healthCheck(): Promise<boolean> {
        try {
            const res = await axios.get(`${config.authServiceUrl}/health`);
            return res.status === 200;
        } catch {
            return false;
        }
    }

    #headers(token?: string) {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return headers;
    }
}

const client = new AuthServiceClient();
export function getAuthClient() { return client; }
