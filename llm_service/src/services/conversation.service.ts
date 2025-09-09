import { Types } from 'mongoose';
import { Conversation, Message } from '../models';

export interface ConversationSummary {
    id: string;
    title: string;
    lastMessageAt: Date;
    lastMessagePreview: string;
    messageCount: number;
    isArchived: boolean;
}

export interface MessageWithMetadata {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: {
        emotion?: string;
        messageType?: string;
        urgency?: string;
        topics?: string[];
        responseTime?: number;
        tokenCount?: number;
        model?: string;
    };
    reactions?: Array<{
        type: string;
        timestamp: Date;
    }>;
}

export class ConversationService {

    /**
     * Get all conversations for a user
     */
    static async getUserConversations(userId: string, limit: number = 20, offset: number = 0): Promise<ConversationSummary[]> {
        try {
            const conversations = await Conversation.find({
                userId: new Types.ObjectId(userId),
                isArchived: false
            })
                .sort({ lastMessageAt: -1 })
                .limit(limit)
                .skip(offset)
                .lean();

            const conversationSummaries: ConversationSummary[] = [];

            for (const conv of conversations) {
                const messageCount = await Message.countDocuments({
                    conversationId: conv._id,
                    isDeleted: false
                });

                conversationSummaries.push({
                    id: conv._id.toString(),
                    title: conv.title,
                    lastMessageAt: conv.lastMessageAt || new Date(),
                    lastMessagePreview: conv.lastMessagePreview || '',
                    messageCount,
                    isArchived: conv.isArchived
                });
            }

            return conversationSummaries;
        } catch (error) {
            console.error('Error fetching user conversations:', error);
            throw error;
        }
    }

    /**
     * Get messages from a specific conversation
     */
    static async getConversationMessages(
        conversationId: string,
        userId: string,
        limit: number = 50,
        before?: Date
    ): Promise<MessageWithMetadata[]> {
        try {
            const query: any = {
                conversationId: new Types.ObjectId(conversationId),
                userId: new Types.ObjectId(userId),
                isDeleted: false
            };

            if (before) {
                query.createdAt = { $lt: before };
            }

            const messages = await Message.find(query)
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean();

            return messages.reverse().map(msg => ({
                id: msg._id.toString(),
                role: msg.role as 'user' | 'assistant' | 'system',
                content: msg.content,
                timestamp: msg.createdAt,
                metadata: msg.metadata ? {
                    emotion: msg.metadata.emotion || undefined,
                    messageType: msg.metadata.messageType || undefined,
                    urgency: msg.metadata.urgency || undefined,
                    topics: msg.metadata.topics || undefined,
                    responseTime: msg.metadata.responseTime || undefined,
                    tokenCount: msg.metadata.tokenCount || undefined,
                    model: msg.metadata.model || undefined
                } : undefined,
                reactions: msg.reactions || undefined
            }));
        } catch (error) {
            console.error('Error fetching conversation messages:', error);
            throw error;
        }
    }

    /**
     * Archive a conversation
     */
    static async archiveConversation(conversationId: string, userId: string): Promise<void> {
        try {
            await Conversation.updateOne(
                {
                    _id: new Types.ObjectId(conversationId),
                    userId: new Types.ObjectId(userId)
                },
                { isArchived: true }
            );
        } catch (error) {
            console.error('Error archiving conversation:', error);
            throw error;
        }
    }

    /**
     * Delete a conversation and all its messages
     */
    static async deleteConversation(conversationId: string, userId: string): Promise<void> {
        try {
            // Soft delete messages
            await Message.updateMany(
                {
                    conversationId: new Types.ObjectId(conversationId),
                    userId: new Types.ObjectId(userId)
                },
                { isDeleted: true }
            );

            // Delete conversation
            await Conversation.deleteOne({
                _id: new Types.ObjectId(conversationId),
                userId: new Types.ObjectId(userId)
            });
        } catch (error) {
            console.error('Error deleting conversation:', error);
            throw error;
        }
    }

    /**
     * Update conversation title
     */
    static async updateConversationTitle(conversationId: string, userId: string, newTitle: string): Promise<void> {
        try {
            await Conversation.updateOne(
                {
                    _id: new Types.ObjectId(conversationId),
                    userId: new Types.ObjectId(userId)
                },
                { title: newTitle }
            );
        } catch (error) {
            console.error('Error updating conversation title:', error);
            throw error;
        }
    }

    /**
     * Get conversation statistics for a user
     */
    static async getConversationStats(userId: string): Promise<{
        totalConversations: number;
        totalMessages: number;
        averageMessagesPerConversation: number;
        mostActiveDay: string;
        favoriteTopics: string[];
    }> {
        try {
            const totalConversations = await Conversation.countDocuments({
                userId: new Types.ObjectId(userId),
                isArchived: false
            });

            const totalMessages = await Message.countDocuments({
                userId: new Types.ObjectId(userId),
                isDeleted: false
            });

            // Get topic statistics
            const topicAggregation = await Message.aggregate([
                { $match: { userId: new Types.ObjectId(userId), isDeleted: false } },
                { $unwind: '$metadata.topics' },
                { $group: { _id: '$metadata.topics', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ]);

            const favoriteTopics = topicAggregation.map(item => item._id);

            // Get most active day
            const dailyActivity = await Message.aggregate([
                { $match: { userId: new Types.ObjectId(userId), isDeleted: false } },
                {
                    $group: {
                        _id: { $dayOfWeek: '$createdAt' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 1 }
            ]);

            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const mostActiveDay = dailyActivity.length > 0 ? dayNames[dailyActivity[0]._id - 1] : 'No data';

            return {
                totalConversations,
                totalMessages,
                averageMessagesPerConversation: totalConversations > 0 ? Math.round(totalMessages / totalConversations) : 0,
                mostActiveDay,
                favoriteTopics
            };
        } catch (error) {
            console.error('Error getting conversation stats:', error);
            throw error;
        }
    }
}
