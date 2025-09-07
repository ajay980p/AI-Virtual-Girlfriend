import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth';
import ConversationModel from '../models/Conversation.model';
import MessageModel from '../models/Message.model';

const router = Router();

/**
 * @swagger
 * /api/conversations:
 *   get:
 *     summary: Get all conversations for the authenticated user
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of conversations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Conversation'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/conversations', authMiddleware, async (req, res: Response) => {
    const userId = req.user!.id;
    const conversations = await ConversationModel.find({ userId }).sort({ updatedAt: -1 });
    res.json({ success: true, data: conversations });
});

/**
 * @swagger
 * /api/conversations:
 *   post:
 *     summary: Create a new conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Conversation title
 *                 example: "Chat with Aria"
 *               agent:
 *                 type: string
 *                 description: AI agent name
 *                 default: "aria"
 *                 example: "aria"
 *     responses:
 *       201:
 *         description: Conversation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Conversation'
 *       400:
 *         description: Bad request - Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/conversations', authMiddleware, async (req, res: Response) => {
    const userId = req.user!.id;
    const { title, agent = 'aria' } = req.body;

    const convo = await ConversationModel.create({
        userId,
        title: title || 'Chat with Aria',
        agent,
    });

    res.status(201).json({ success: true, data: convo });
});

/**
 * @swagger
 * /api/conversations/{id}/messages:
 *   get:
 *     summary: Get messages in a conversation with pagination
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Pagination cursor (timestamp)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 30
 *         description: Number of messages to retrieve
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *                 nextCursor:
 *                   type: string
 *                   nullable: true
 *                   description: Cursor for next page of results
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Conversation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/conversations/:id/messages', authMiddleware, async (req, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const { cursor, limit = 30 } = req.query;

    const q: any = { conversationId: id, userId };
    if (cursor) q.createdAt = { $lt: new Date(String(cursor)) };

    const messages = await MessageModel.find(q)
        .sort({ createdAt: -1 })
        .limit(Math.min(Number(limit), 100))
        .lean();

    const nextCursor = messages.length ? messages[messages.length - 1].createdAt : null;

    res.json({ success: true, data: messages, nextCursor });
});

/**
 * @swagger
 * /api/conversations/{id}/messages:
 *   post:
 *     summary: Add a message to a conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *                 enum: [user, ai, system]
 *                 description: Message sender role
 *                 example: "user"
 *               content:
 *                 type: string
 *                 description: Message content
 *                 example: "Hello, how are you today?"
 *               clientMessageId:
 *                 type: string
 *                 description: Client-side message ID for deduplication
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: Message attachments
 *     responses:
 *       201:
 *         description: Message created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       400:
 *         description: Bad request - Missing role or content
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Conversation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/conversations/:id/messages', authMiddleware, async (req, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const { role, content, clientMessageId, attachments } = req.body;

    if (!content || !role) {
        return res.status(400).json({ success: false, message: 'role and content required' });
    }

    const msg = await MessageModel.create({
        conversationId: id,
        userId,
        role,
        content,
        clientMessageId,
        attachments,
    });

    // update conversation preview
    await ConversationModel.updateOne(
        { _id: id, userId },
        { $set: { lastMessageAt: new Date(), lastMessagePreview: content.slice(0, 180) } }
    );

    res.status(201).json({ success: true, data: msg });
});

/**
 * @swagger
 * /api/conversations/{id}:
 *   patch:
 *     summary: Update a conversation (rename, archive, etc.)
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: New conversation title
 *                 example: "Updated Chat Title"
 *               isArchived:
 *                 type: boolean
 *                 description: Archive status
 *                 example: false
 *     responses:
 *       200:
 *         description: Conversation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Conversation'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Conversation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/conversations/:id', authMiddleware, async (req, res) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const { title, isArchived } = req.body;

    const convo = await ConversationModel.findOneAndUpdate(
        { _id: id, userId },
        { $set: { ...(title && { title }), ...(isArchived !== undefined && { isArchived }) } },
        { new: true }
    );

    if (!convo) {
        return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    res.json({ success: true, data: convo });
});

/**
 * @swagger
 * /api/conversations/{id}:
 *   delete:
 *     summary: Delete a conversation and all its messages
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: Conversation deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Conversation and messages deleted"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Conversation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/conversations/:id', authMiddleware, async (req, res) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const convo = await ConversationModel.findOneAndDelete({ _id: id, userId });
    if (!convo) {
        return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    await MessageModel.deleteMany({ conversationId: id, userId });

    res.json({ success: true, message: 'Conversation and messages deleted' });
});

/**
 * @swagger
 * /api/public-info:
 *   get:
 *     summary: Public health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Chat service is healthy"
 */
router.get('/public-info', (_req, res) => {
    res.json({ success: true, message: 'Chat service is healthy' });
});

export default router;