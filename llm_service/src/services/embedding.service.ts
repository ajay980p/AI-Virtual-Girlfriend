import crypto from 'crypto';

const EMBEDDING_DIM = 3072;

export async function embedText(text: string): Promise<number[]> {
    if (!text || !text.trim()) throw new Error('Input text cannot be empty.');
    // For now, use mock embedding; can integrate real provider later
    return generateMockEmbedding(text);
}

export async function embedTextsBatch(texts: string[]): Promise<number[][]> {
    if (!texts?.length) throw new Error('Input texts list cannot be empty.');
    return Promise.all(texts.map(embedText));
}

function generateMockEmbedding(text: string, dimension: number = EMBEDDING_DIM): number[] {
    // Deterministic seed from hash
    const hash = crypto.createHash('sha256').update(text).digest();
    const rng = mulberry32(hash.readUInt32BE(0));
    const vec = new Array(dimension).fill(0).map(() => rng() * 2 - 1);
    // L2 normalize
    const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
    return vec.map(v => v / (norm || 1));
}

function mulberry32(a: number) {
    return function () {
        let t = (a += 0x6D2B79F5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function getEmbeddingDimension() { return EMBEDDING_DIM; }
