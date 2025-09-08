import { Request, Response } from 'express';
import { MemoryRequest } from '../types/memory.js';
import { embedText } from '../services/embedding.service.js';
import { storeMemory } from '../services/pinecone.service.js';

export function ping(_req: Request, res: Response) {
    res.json({ msg: 'pong' });
}

export async function storeMemoryHandler(req: Request<unknown, unknown, MemoryRequest>, res: Response) {
    try {
        const payload = req.body;
        if (!payload?.text || !payload.text.trim()) {
            return res.status(400).json({ message: 'Text cannot be empty' });
        }
        if (!payload?.user_id || !String(payload.user_id).trim()) {
            return res.status(400).json({ message: 'User ID cannot be empty' });
        }

        const vector = await embedText(payload.text);
        await storeMemory({ userId: payload.user_id, text: payload.text, vector, memoryType: payload.memory_type || 'conversation' });
        res.json({ message: '🧠 Memory stored or updated successfully!' });
    } catch (e: any) {
        res.status(500).json({ message: e?.message || 'Internal Server Error' });
    }
}
