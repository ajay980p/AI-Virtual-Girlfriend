import { Request, Response } from 'express';
import { ChatRequest, ChatResponse } from '../types/chat';
import { generateChatResponse } from '../services/memory.service';
import { getAuthClient } from '../services/auth.service';

export async function respondToUser(req: Request<unknown, unknown, ChatRequest>, res: Response<ChatResponse | { message: string }>) {
    try {
        const payload = req.body;
        if (!payload?.message || !payload.message.trim()) {
            return res.status(400).json({ message: 'Message cannot be empty' } as any);
        }
        const effectiveUserId = req.user?.userId || payload.user_id;
        if (!effectiveUserId || !String(effectiveUserId).trim()) {
            return res.status(400).json({ message: 'User ID cannot be empty' } as any);
        }

        const aiResponse = await generateChatResponse({ user_id: effectiveUserId, message: payload.message });

        let conversationId = payload.conversation_id || undefined;
        const token = req.token || payload.auth_token || undefined;
        const authClient = getAuthClient();

        if (token) {
            try {
                if (!conversationId) {
                    const title = payload.message.slice(0, 50) + (payload.message.length > 50 ? '...' : '');
                    conversationId = await authClient.createConversation({
                        userId: String(effectiveUserId),
                        title,
                        authToken: token,
                    }) || undefined;
                }
                if (conversationId) {
                    await authClient.addMessage({ conversationId, role: 'user', content: payload.message, authToken: token });
                    await authClient.addMessage({ conversationId, role: 'assistant', content: aiResponse, authToken: token });
                }
            } catch (e) {
                // non-fatal
                // eslint-disable-next-line no-console
                console.error('Conversation persistence error:', e);
            }
        }

        return res.json({ response: aiResponse, conversation_id: conversationId });
    } catch (e: any) {
        // eslint-disable-next-line no-console
        console.error('Unexpected error in chat response:', e);
        return res.status(500).json({ message: 'An unexpected error occurred' } as any);
    }
}
