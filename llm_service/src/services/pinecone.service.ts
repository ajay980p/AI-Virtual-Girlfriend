import { config } from '../config';

const USE_REAL = !!(config.pineconeApiKey && config.pineconeIndex);

type Memory = { id: string; values: number[]; metadata: { user_id: string; text: string; type: string; timestamp: string } };

// Simple in-memory mock store keyed by user
const mockStore: Record<string, Memory[]> = {};

export async function storeMemory(params: { userId: string; text: string; vector: number[]; memoryType?: string }): Promise<boolean> {
    if (!USE_REAL) {
        const list = mockStore[params.userId] ||= [];
        const id = `${params.userId}-${Math.abs(hashCode(params.text))}`;
        const timestamp = new Date().toISOString();
        const existingIdx = list.findIndex(m => m.id === id);
        const mem: Memory = { id, values: params.vector, metadata: { user_id: params.userId, text: params.text, type: params.memoryType || 'conversation', timestamp } };
        if (existingIdx >= 0) list[existingIdx] = mem; else list.push(mem);
        return true;
    }
    // TODO: integrate real Pinecone client if needed
    return true;
}

export async function queryMemories(params: { userId: string; queryVector: number[]; topK?: number }): Promise<any[]> {
    if (!USE_REAL) {
        const list = mockStore[params.userId] || [];
        // naive cosine similarity
        const scored = list.map(m => ({ memory: m, score: cosine(params.queryVector, m.values) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, params.topK ?? 3)
            .map(s => ({ id: s.memory.id, score: s.score, metadata: s.memory.metadata }));
        return scored;
    }
    // TODO: real query
    return [];
}

function hashCode(str: string): number {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    return h;
}

function cosine(a: number[], b: number[]): number {
    const len = Math.min(a.length, b.length);
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < len; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
    return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}
