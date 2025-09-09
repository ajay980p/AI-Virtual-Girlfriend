import { embedText } from './embedding.service';
import { queryMemories, storeMemory } from './pinecone.service';
import { generateResponse } from './response.service';
import { connectDB } from '../config/database';
import { Conversation, Message } from '../models';
import { Types } from 'mongoose';

interface ChatPayload {
    user_id: string;
    message: string;
    agent_id?: string;
    conversation_id?: string;
}

export async function generateChatResponse(payload: ChatPayload): Promise<string> {
    const startTime = Date.now();

    // Ensure database connection
    await connectDB();

    // Embed user send text into vector
    const embeddedQuery = await embedText(payload.message);

    // Retrieve user previous query
    const retrieved = await queryMemories({ userId: payload.user_id, queryVector: embeddedQuery, topK: 5 });

    // Generate Response based on the user query
    const response = await generateResponse({ userMessage: payload.message, retrievedMemories: retrieved, userId: payload.user_id });

    const responseTime = Date.now() - startTime;

    // Store the conversation into the database
    await storeConversationToDB({
        userId: payload.user_id,
        agentId: payload.agent_id || new Types.ObjectId().toString(), // Default agent if not provided
        userMessage: payload.message,
        aiResponse: response,
        conversationId: payload.conversation_id,
        responseTime
    });

    // Store conversation memory in vector database
    // await storeConversationMemory(payload.user_id, payload.message, response);

    // Send the response
    return response;
}

interface StoreConversationParams {
    userId: string;
    agentId: string;
    userMessage: string;
    aiResponse: string;
    conversationId?: string;
    responseTime: number;
}

async function storeConversationToDB(params: StoreConversationParams): Promise<string> {
    const { userId, agentId, userMessage, aiResponse, conversationId, responseTime } = params;

    try {
        let conversation;

        // Find or create conversation
        if (conversationId) {
            conversation = await Conversation.findById(conversationId);
        }

        if (!conversation) {
            // Create new conversation
            conversation = new Conversation({
                userId: new Types.ObjectId(userId),
                agentId: new Types.ObjectId(agentId),
                title: generateConversationTitle(userMessage),
                lastMessageAt: new Date(),
                lastMessagePreview: aiResponse ? aiResponse : ''
            });
            await conversation.save();
        } else {
            // Update existing conversation
            conversation.lastMessageAt = new Date();
            conversation.lastMessagePreview = aiResponse ? aiResponse : '';
            await conversation.save();
        }

        // Analyze message for metadata
        const messageAnalysis = await analyzeMessageForDB(userMessage);

        // Store user message
        const userMsg = new Message({
            conversationId: conversation._id,
            userId: new Types.ObjectId(userId),
            agentId: new Types.ObjectId(agentId),
            role: 'user',
            content: userMessage,
            metadata: {
                emotion: messageAnalysis.emotion,
                messageType: messageAnalysis.messageType,
                urgency: messageAnalysis.urgency,
                topics: messageAnalysis.topics
            }
        });
        await userMsg.save();

        // Store AI response
        const aiMsg = new Message({
            conversationId: conversation._id,
            userId: new Types.ObjectId(userId),
            agentId: new Types.ObjectId(agentId),
            role: 'assistant',
            content: aiResponse,
            metadata: {
                responseTime,
                model: 'gemini-pro',
                tokenCount: Math.ceil(aiResponse.length / 4) // Rough token estimate
            }
        });
        await aiMsg.save();

        console.log(`✅ Stored conversation messages for user ${userId}`);
        return conversation._id.toString();

    } catch (error) {
        console.error('❌ Error storing conversation to DB:', error);
        throw error;
    }
}



async function storeConversationMemory(userId: string, userMessage: string, aiResponse: string): Promise<void> {
    try {
        const texts = [
            `User said: ${userMessage}`,
            `Aria responded: ${aiResponse}`,
        ];

        // Store individual messages in vector database
        for (let i = 0; i < texts.length; i++) {
            const embedding = await embedText(texts[i]);
            await storeMemory({
                userId,
                text: texts[i],
                vector: embedding,
                memoryType: i === 0 ? 'user_message' : 'ai_response'
            });
        }

        console.log(`✅ Stored conversation memory vectors for user ${userId}`);
    } catch (error) {
        console.error('❌ Error storing conversation memory:', error);
        // Don't throw error here as it's not critical for the main flow
    }
}





function generateConversationTitle(firstMessage: string): string {
    // Generate a title based on the first message
    const words = firstMessage.split(' ').slice(0, 6);
    let title = words.join(' ');

    if (title.length > 50) {
        title = title.substring(0, 47) + '...';
    } else if (title.length < 10) {
        title = 'Chat with Aria';
    }

    return title;
}



async function analyzeMessageForDB(message: string): Promise<{
    emotion: string;
    messageType: 'question' | 'sharing' | 'seeking_support' | 'casual' | 'romantic';
    urgency: 'low' | 'medium' | 'high';
    topics: string[];
}> {
    try {
        const { callLLM } = await import('./llm.service');

        const analysisPrompt = `Analyze the following user message and return ONLY a valid JSON object with these exact fields:

Message: "${message}"

Return a JSON object with:
- emotion: one of "neutral", "happy", "sad", "angry", "anxious", "romantic", "excited", "frustrated", "lonely", "grateful"
- messageType: one of "question", "sharing", "seeking_support", "casual", "romantic"  
- urgency: one of "low", "medium", "high"
- topics: array of relevant topics from these categories: ["work", "family", "social", "romance", "health", "aspirations", "hobbies", "travel", "food", "entertainment", "education", "technology", "spirituality", "personal_growth", "memories", "future_plans"]

Example response format:
{
  "emotion": "happy",
  "messageType": "sharing",
  "urgency": "low", 
  "topics": ["work", "personal_growth"]
}

Respond ONLY with the JSON object, no additional text:`;

        const analysisResult = await callLLM(analysisPrompt);

        // Parse the LLM response
        const cleanedResult = analysisResult.trim();
        let analysis;

        try {
            // Try to extract JSON if it's wrapped in markdown or has extra text
            const jsonMatch = cleanedResult.match(/\{[\s\S]*\}/);
            const jsonString = jsonMatch ? jsonMatch[0] : cleanedResult;
            analysis = JSON.parse(jsonString);
        } catch (parseError) {
            console.warn('Failed to parse LLM analysis, using fallback:', parseError);
            // Fallback to simple analysis
            return fallbackAnalysis(message);
        }

        // Validate and sanitize the response
        const validatedAnalysis = {
            emotion: validateEmotion(analysis.emotion),
            messageType: validateMessageType(analysis.messageType),
            urgency: validateUrgency(analysis.urgency),
            topics: validateTopics(analysis.topics)
        };

        return validatedAnalysis;

    } catch (error) {
        console.warn('Error in LLM message analysis, using fallback:', error);
        return fallbackAnalysis(message);
    }
}

// Validation functions
function validateEmotion(emotion: any): string {
    const validEmotions = ['neutral', 'happy', 'sad', 'angry', 'anxious', 'romantic', 'excited', 'frustrated', 'lonely', 'grateful'];
    return validEmotions.includes(emotion) ? emotion : 'neutral';
}

function validateMessageType(messageType: any): 'question' | 'sharing' | 'seeking_support' | 'casual' | 'romantic' {
    const validTypes = ['question', 'sharing', 'seeking_support', 'casual', 'romantic'];
    return validTypes.includes(messageType) ? messageType : 'casual';
}

function validateUrgency(urgency: any): 'low' | 'medium' | 'high' {
    const validUrgencies = ['low', 'medium', 'high'];
    return validUrgencies.includes(urgency) ? urgency : 'low';
}

function validateTopics(topics: any): string[] {
    if (!Array.isArray(topics)) return [];
    const validTopics = ['work', 'family', 'social', 'romance', 'health', 'aspirations', 'hobbies', 'travel', 'food', 'entertainment', 'education', 'technology', 'spirituality', 'personal_growth', 'memories', 'future_plans'];
    return topics.filter(topic => validTopics.includes(topic));
}

// Fallback analysis using simple pattern matching
function fallbackAnalysis(message: string): {
    emotion: string;
    messageType: 'question' | 'sharing' | 'seeking_support' | 'casual' | 'romantic';
    urgency: 'low' | 'medium' | 'high';
    topics: string[];
} {
    const lowerMessage = message.toLowerCase();

    // Detect emotion
    let emotion = 'neutral';
    if (lowerMessage.match(/sad|depressed|down|upset|crying|hurt/)) emotion = 'sad';
    else if (lowerMessage.match(/happy|excited|joy|great|amazing|wonderful/)) emotion = 'happy';
    else if (lowerMessage.match(/angry|mad|frustrated|annoyed/)) emotion = 'angry';
    else if (lowerMessage.match(/scared|afraid|worried|anxious|nervous/)) emotion = 'anxious';
    else if (lowerMessage.match(/love|miss|care|sweet|romantic/)) emotion = 'romantic';

    // Detect topics
    const topics: string[] = [];
    if (lowerMessage.match(/work|job|career|office|boss/)) topics.push('work');
    if (lowerMessage.match(/family|mom|dad|parent|sibling/)) topics.push('family');
    if (lowerMessage.match(/friend|social|party|people/)) topics.push('social');
    if (lowerMessage.match(/love|relationship|date|romantic/)) topics.push('romance');
    if (lowerMessage.match(/health|sick|doctor|medicine/)) topics.push('health');
    if (lowerMessage.match(/dream|goal|future|plan/)) topics.push('aspirations');

    // Detect urgency
    let urgency: 'low' | 'medium' | 'high' = 'low';
    if (lowerMessage.match(/urgent|emergency|help|crisis|immediately/)) urgency = 'high';
    else if (lowerMessage.match(/important|need|should|worried/)) urgency = 'medium';

    // Detect message type
    let messageType: 'question' | 'sharing' | 'seeking_support' | 'casual' | 'romantic' = 'casual';
    if (lowerMessage.includes('?') || lowerMessage.match(/what|how|why|when|where|should/)) messageType = 'question';
    else if (lowerMessage.match(/feel|felt|happened|today|yesterday/)) messageType = 'sharing';
    else if (lowerMessage.match(/help|support|advice|what should/)) messageType = 'seeking_support';
    else if (lowerMessage.match(/love|miss|beautiful|kiss|hug|romantic/)) messageType = 'romantic';

    return { emotion, topics, urgency, messageType };
}
