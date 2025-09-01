import { Router } from 'express';
import Joi from 'joi';
import { 
  getUserConversations,
  getConversationById,
  createConversation,
  addMessageToConversation,
  updateConversationTitle,
  deleteConversation,
  getConversationStats,
  searchConversations
} from '../controllers/conversation.controller';
import { authenticate as authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Validation schemas
const createConversationSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).optional(),
  modelId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  firstMessage: Joi.string().trim().min(1).max(10000).optional()
}).or('title', 'firstMessage');

const addMessageSchema = Joi.object({
  role: Joi.string().valid('user', 'assistant', 'system').required(),
  content: Joi.string().trim().min(1).max(10000).required(),
  meta: Joi.object({
    pinned: Joi.boolean().optional(),
    memoryScore: Joi.number().min(0).max(10).optional(),
    modelId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional()
  }).optional()
});

const updateTitleSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required()
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  modelId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional()
});

const searchSchema = Joi.object({
  q: Joi.string().trim().min(1).max(200).required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10)
});

const conversationIdSchema = Joi.object({
  conversationId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
});

/**
 * @swagger
 * /api/conversations:
 *   get:
 *     summary: Get user's conversations
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of conversations per page
 *       - in: query
 *         name: modelId
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Filter by specific AI model
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     conversations:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 */
router.get(
  '/',
  validateRequest(paginationSchema, 'query'),
  getUserConversations
);

/**
 * @swagger
 * /api/conversations/stats:
 *   get:
 *     summary: Get conversation statistics for user
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/stats', getConversationStats);

/**
 * @swagger
 * /api/conversations/search:
 *   get:
 *     summary: Search conversations by content
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 200
 *         description: Search query
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 */
router.get(
  '/search',
  validateRequest(searchSchema, 'query'),
  searchConversations
);

/**
 * @swagger
 * /api/conversations/{conversationId}:
 *   get:
 *     summary: Get specific conversation with all messages
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: Conversation retrieved successfully
 *       404:
 *         description: Conversation not found
 */
router.get(
  '/:conversationId',
  validateRequest(conversationIdSchema, 'params'),
  getConversationById
);

/**
 * @swagger
 * /api/conversations:
 *   post:
 *     summary: Create a new conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 description: Conversation title
 *               modelId:
 *                 type: string
 *                 pattern: '^[0-9a-fA-F]{24}$'
 *                 description: AI model ID (optional)
 *               firstMessage:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 10000
 *                 description: First message content
 *             anyOf:
 *               - required: [title]
 *               - required: [firstMessage]
 *     responses:
 *       201:
 *         description: Conversation created successfully
 */
router.post(
  '/',
  validateRequest(createConversationSchema),
  createConversation
);

/**
 * @swagger
 * /api/conversations/{conversationId}/messages:
 *   post:
 *     summary: Add a message to conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Conversation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *               - content
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, assistant, system]
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 10000
 *               meta:
 *                 type: object
 *                 properties:
 *                   pinned:
 *                     type: boolean
 *                   memoryScore:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 10
 *                   modelId:
 *                     type: string
 *                     pattern: '^[0-9a-fA-F]{24}$'
 *     responses:
 *       200:
 *         description: Message added successfully
 *       404:
 *         description: Conversation not found
 */
router.post(
  '/:conversationId/messages',
  validateRequest(conversationIdSchema, 'params'),
  validateRequest(addMessageSchema),
  addMessageToConversation
);

/**
 * @swagger
 * /api/conversations/{conversationId}/title:
 *   patch:
 *     summary: Update conversation title
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Conversation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *     responses:
 *       200:
 *         description: Title updated successfully
 *       404:
 *         description: Conversation not found
 */
router.patch(
  '/:conversationId/title',
  validateRequest(conversationIdSchema, 'params'),
  validateRequest(updateTitleSchema),
  updateConversationTitle
);

/**
 * @swagger
 * /api/conversations/{conversationId}:
 *   delete:
 *     summary: Delete conversation (soft delete)
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: Conversation deleted successfully
 *       404:
 *         description: Conversation not found
 */
router.delete(
  '/:conversationId',
  validateRequest(conversationIdSchema, 'params'),
  deleteConversation
);

export default router;