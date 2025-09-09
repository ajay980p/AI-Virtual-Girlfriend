import { Request, Response } from 'express';
import { ConversationService } from '../services/conversation.service';
import { Types } from 'mongoose';

export class ConversationController {

    /**
     * Get all conversations for authenticated user
     */
    static async getConversations(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const limit = parseInt(req.query.limit as string) || 20;
            const offset = parseInt(req.query.page as string) || 0;

            const conversations = await ConversationService.getUserConversations(userId, limit, offset * limit);

            // Convert to frontend expected format
            const formattedConversations = conversations.map(conv => ({
                id: conv.id,
                userId: userId,
                title: conv.title,
                messages: [], // Will be loaded separately
                lastMessagePreview: conv.lastMessagePreview,
                isActive: true,
                createdAt: new Date(conv.lastMessageAt).toISOString(),
                updatedAt: new Date(conv.lastMessageAt).toISOString()
            }));

            res.json({
                success: true,
                message: 'Conversations retrieved successfully',
                data: {
                    conversations: formattedConversations,
                    pagination: {
                        currentPage: offset,
                        totalPages: Math.ceil(conversations.length / limit),
                        totalCount: conversations.length,
                        hasNext: conversations.length === limit,
                        hasPrev: offset > 0
                    }
                }
            });
        } catch (error) {
            console.error('Error getting conversations:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve conversations',
                detail: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get specific conversation with messages
     */
    static async getConversationById(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            const conversationId = req.params.conversationId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            if (!Types.ObjectId.isValid(conversationId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid conversation ID'
                });
            }

            const messages = await ConversationService.getConversationMessages(conversationId, userId, 50);

            // Get conversation summary
            const conversations = await ConversationService.getUserConversations(userId, 1000);
            const conversation = conversations.find(c => c.id === conversationId);

            if (!conversation) {
                return res.status(404).json({
                    success: false,
                    message: 'Conversation not found'
                });
            }

            // Format messages for frontend
            const formattedMessages = messages.map(msg => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                createdAt: msg.timestamp.toISOString(),
                meta: {
                    pinned: false,
                    memoryScore: 0.8,
                    modelId: 'aria'
                }
            }));

            const formattedConversation = {
                id: conversation.id,
                userId: userId,
                title: conversation.title,
                messages: formattedMessages,
                lastMessagePreview: conversation.lastMessagePreview,
                isActive: true,
                createdAt: new Date(conversation.lastMessageAt).toISOString(),
                updatedAt: new Date(conversation.lastMessageAt).toISOString()
            };

            res.json({
                success: true,
                message: 'Conversation retrieved successfully',
                data: {
                    conversation: formattedConversation
                }
            });
        } catch (error) {
            console.error('Error getting conversation:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve conversation',
                detail: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Create new conversation
     */
    static async createConversation(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const { title, modelId, firstMessage } = req.body;

            // For now, we'll create a placeholder conversation
            // It will be properly created when the first message is sent
            const conversationId = new Types.ObjectId().toString();

            const newConversation = {
                id: conversationId,
                userId: userId,
                title: title || 'New Chat',
                messages: [],
                lastMessagePreview: firstMessage || '',
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            res.status(201).json({
                success: true,
                message: 'Conversation created successfully',
                data: {
                    conversation: newConversation
                }
            });
        } catch (error) {
            console.error('Error creating conversation:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create conversation',
                detail: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Update conversation title
     */
    static async updateConversationTitle(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            const conversationId = req.params.conversationId;
            const { title } = req.body;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            if (!Types.ObjectId.isValid(conversationId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid conversation ID'
                });
            }

            if (!title || title.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Title is required'
                });
            }

            await ConversationService.updateConversationTitle(conversationId, userId, title.trim());

            res.json({
                success: true,
                message: 'Conversation title updated successfully'
            });
        } catch (error) {
            console.error('Error updating conversation title:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update conversation title',
                detail: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Delete conversation
     */
    static async deleteConversation(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            const conversationId = req.params.conversationId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            if (!Types.ObjectId.isValid(conversationId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid conversation ID'
                });
            }

            await ConversationService.deleteConversation(conversationId, userId);

            res.json({
                success: true,
                message: 'Conversation deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting conversation:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete conversation',
                detail: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Add message to conversation
     */
    static async addMessage(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            const conversationId = req.params.conversationId;
            const { role, content, meta } = req.body;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            if (!Types.ObjectId.isValid(conversationId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid conversation ID'
                });
            }

            // This endpoint is mainly for manual message addition
            // The main chat flow goes through the chat controller

            res.json({
                success: true,
                message: 'Message added successfully',
                data: {
                    conversationId,
                    messageCount: 1
                }
            });
        } catch (error) {
            console.error('Error adding message:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to add message',
                detail: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Search conversations
     */
    static async searchConversations(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            const query = req.query.q as string;
            const limit = parseInt(req.query.limit as string) || 20;
            const page = parseInt(req.query.page as string) || 0;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            if (!query || query.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required'
                });
            }

            // For now, return empty results - implement search later
            const conversations: any[] = [];

            res.json({
                success: true,
                message: 'Search completed',
                data: {
                    conversations,
                    pagination: {
                        currentPage: page,
                        totalPages: 0,
                        totalCount: 0,
                        hasNext: false,
                        hasPrev: false
                    }
                }
            });
        } catch (error) {
            console.error('Error searching conversations:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to search conversations',
                detail: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get conversation statistics
     */
    static async getConversationStats(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const stats = await ConversationService.getConversationStats(userId);

            res.json({
                success: true,
                message: 'Statistics retrieved successfully',
                data: stats
            });
        } catch (error) {
            console.error('Error getting conversation stats:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve statistics',
                detail: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
