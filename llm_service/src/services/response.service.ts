import { callLLM } from "./llm.service";

export async function generateResponse(params: { userMessage: string; retrievedMemories?: Array<Record<string, any>>; userId?: string; }): Promise<string> {
    const { userMessage, retrievedMemories } = params;
    let context = '';
    if (retrievedMemories?.length) {
        const parts: string[] = [];
        for (const m of retrievedMemories) {
            const text = m?.metadata?.text;
            if (text) parts.push(text);
            if (parts.length >= 3) break;
        }
        context = parts.join('\n');
    }
    const systemPrompt = `You are Aria, a caring and warm AI companion.\n\nPrevious conversation context:\n${context || 'This appears to be a new conversation or no previous context is available.'}\n\nUser message: ${userMessage}\n\nRespond naturally and warmly as Aria.`;
    return callLLM(systemPrompt);
}