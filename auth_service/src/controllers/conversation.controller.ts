import { Response } from 'express';
import mongoose from 'mongoose';
import { Conversation } from '../models';
import { IMessage } from '../models/Conversation';
import { AuthenticatedRequest } from '../types/express.types';
import { asyncHandler, AppError } from '../middleware/error.middleware';

/**
 * Get all conversations for the authenticated user
 */
export const getUserConversations = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  const { page = 1, limit = 20, modelId } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  // Build query
  const query: any = { 
    userId: new mongoose.Types.ObjectId(userId),
    isActive: true 
  };
  
  if (modelId) {
    query.modelId = new mongoose.Types.ObjectId(modelId as string);
  }

  // Get conversations with pagination
  const conversations = await Conversation.find(query)
    .populate('modelId', 'name images personality')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  // Get total count for pagination
  const totalCount = await Conversation.countDocuments(query);

  res.json({
    success: true,
    message: 'Conversations retrieved successfully',
    data: {
      conversations,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
        totalCount,
        hasNext: skip + Number(limit) < totalCount,
        hasPrev: Number(page) > 1
      }
    }
  });
});

/**
 * Get a specific conversation by ID with all messages
 */
export const getConversationById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { conversationId } = req.params;

  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new AppError('Invalid conversation ID', 400);
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    userId: new mongoose.Types.ObjectId(userId),
    isActive: true
  }).populate('modelId', 'name images personality');

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  res.json({
    success: true,
    message: 'Conversation retrieved successfully',
    data: {
      conversation
    }
  });
});

/**
 * Create a new conversation
 */
export const createConversation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  const { title, modelId, firstMessage } = req.body;

  if (!title && !firstMessage) {
    throw new AppError('Either title or first message is required', 400);
  }

  // Validate modelId if provided
  if (modelId && !mongoose.Types.ObjectId.isValid(modelId)) {
    throw new AppError('Invalid model ID', 400);
  }

  const conversation = new Conversation({
    userId: new mongoose.Types.ObjectId(userId),
    modelId: modelId ? new mongoose.Types.ObjectId(modelId) : undefined,
    title: title || (firstMessage ? firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : '') : 'New Conversation'),
    messages: [],
    isActive: true
  });

  // Add first message if provided
  if (firstMessage) {
    await conversation.addMessage({
      role: 'user',
      content: firstMessage
    });
  }

  await conversation.save();

  // Populate modelId for response
  await conversation.populate('modelId', 'name images personality');

  res.status(201).json({
    success: true,
    message: 'Conversation created successfully',
    data: {
      conversation
    }
  });
});

/**
 * Add a message to an existing conversation
 */
export const addMessageToConversation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { conversationId } = req.params;
  const { role, content, meta } = req.body;

  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new AppError('Invalid conversation ID', 400);
  }

  if (!role || !content) {
    throw new AppError('Role and content are required', 400);
  }

  if (!['user', 'assistant', 'system'].includes(role)) {
    throw new AppError('Invalid message role', 400);
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    userId: new mongoose.Types.ObjectId(userId),
    isActive: true
  });

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  // Add the message
  await conversation.addMessage({
    role,
    content,
    meta
  });

  res.json({
    success: true,
    message: 'Message added successfully',
    data: {
      conversationId: conversation._id,
      messageCount: conversation.getMessageCount()
    }
  });
});

/**
 * Update conversation title
 */
export const updateConversationTitle = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { conversationId } = req.params;
  const { title } = req.body;

  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new AppError('Invalid conversation ID', 400);
  }

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    throw new AppError('Valid title is required', 400);
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    userId: new mongoose.Types.ObjectId(userId),
    isActive: true
  });

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  await conversation.updateTitle(title.trim());

  res.json({
    success: true,
    message: 'Conversation title updated successfully'
  });
});

/**
 * Delete a conversation (soft delete)
 */
export const deleteConversation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { conversationId } = req.params;

  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new AppError('Invalid conversation ID', 400);
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    userId: new mongoose.Types.ObjectId(userId)
  });

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  // Soft delete by setting isActive to false
  conversation.isActive = false;
  await conversation.save();

  res.json({
    success: true,
    message: 'Conversation deleted successfully'
  });
});

/**
 * Get conversation statistics for user
 */
export const getConversationStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  const stats = await Conversation.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        isActive: true
      }
    },
    {
      $group: {
        _id: null,
        totalConversations: { $sum: 1 },
        totalMessages: { $sum: { $size: '$messages' } },
        avgMessagesPerConversation: { $avg: { $size: '$messages' } }
      }
    }
  ]);

  const result = stats.length > 0 ? stats[0] : {
    totalConversations: 0,
    totalMessages: 0,
    avgMessagesPerConversation: 0
  };

  res.json({
    success: true,
    message: 'Conversation statistics retrieved successfully',
    data: {
      stats: result
    }
  });
});

/**
 * Search conversations by content
 */
export const searchConversations = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  const { q: searchQuery, page = 1, limit = 10 } = req.query;

  if (!searchQuery || typeof searchQuery !== 'string' || searchQuery.trim().length === 0) {
    throw new AppError('Search query is required', 400);
  }

  const skip = (Number(page) - 1) * Number(limit);

  // Search in conversation titles and message content
  const conversations = await Conversation.find({
    userId: new mongoose.Types.ObjectId(userId),
    isActive: true,
    $or: [
      { title: { $regex: searchQuery.trim(), $options: 'i' } },
      { 'messages.content': { $regex: searchQuery.trim(), $options: 'i' } }
    ]
  })
    .populate('modelId', 'name images personality')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  const totalCount = await Conversation.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    isActive: true,
    $or: [
      { title: { $regex: searchQuery.trim(), $options: 'i' } },
      { 'messages.content': { $regex: searchQuery.trim(), $options: 'i' } }
    ]
  });

  res.json({
    success: true,
    message: 'Search results retrieved successfully',
    data: {
      conversations,
      searchQuery: searchQuery.trim(),
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
        totalCount,
        hasNext: skip + Number(limit) < totalCount,
        hasPrev: Number(page) > 1
      }
    }
  });
});