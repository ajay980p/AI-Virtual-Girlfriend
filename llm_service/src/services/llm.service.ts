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
