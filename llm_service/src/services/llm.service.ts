import { config } from '../config';
import { GoogleGenAI } from "@google/genai";


// Function for generating text responses
export async function callLLM(prompt: string): Promise<string> {
    if (!config.googleApiKey) {
        return "Hello! I'm a mock AI response since no API key is configured. How can I help you today?";
    }

    const ai = new GoogleGenAI({ apiKey: config.googleApiKey });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";
}




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
