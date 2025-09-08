import { embedText, embedTextsBatch } from './embedding.service';
import { queryMemories, storeMemory } from './pinecone.service';
import { generateResponse } from './llm.service';

export async function generateChatResponse(payload: { user_id: string; message: string; }): Promise<string> {
    const embeddedQuery = await embedText(payload.message);
    const retrieved = await queryMemories({ userId: payload.user_id, queryVector: embeddedQuery, topK: 5 });
    const response = await generateResponse({ userMessage: payload.message, retrievedMemories: retrieved, userId: payload.user_id });
    await storeConversationMemory(payload.user_id, payload.message, response);
    return response;
}

async function storeConversationMemory(userId: string, userMessage: string, aiResponse: string) {
    const texts = [
        `User said: ${userMessage}`,
        `Aria responded: ${aiResponse}`,
    ];
    const embeddings = await embedTextsBatch(texts);
    await storeMemory({ userId, text: texts[0], vector: embeddings[0], memoryType: 'user_message' });
    await storeMemory({ userId, text: texts[1], vector: embeddings[1], memoryType: 'ai_response' });
}
