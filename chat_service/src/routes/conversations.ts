import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import ConversationModel from '../models/Conversation.model.js';
import MessageModel from '../models/Message.model.js';

const router = Router();

/**
 * GET all conversations for the logged-in user
 */
router.get('/conversations', authMiddleware, async (req, res) => {
    const userId = req.user!.id;
    const conversations = await ConversationModel.find({ userId }).sort({ updatedAt: -1 });
    res.json({ success: true, data: conversations });
});

/**
 * POST create a new conversation
 */
router.post('/conversations', authMiddleware, async (req, res) => {
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
 * GET messages in a conversation (with pagination)
 */
router.get('/conversations/:id/messages', authMiddleware, async (req, res) => {
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
 * POST add a message to a conversation
 */
router.post('/conversations/:id/messages', authMiddleware, async (req, res) => {
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
 * PATCH update a conversation (e.g., rename, archive)
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
 * DELETE a conversation (and its messages)
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
 * Public health check
 */
router.get('/public-info', (_req, res) => {
    res.json({ success: true, message: 'Chat service is healthy' });
});

export default router;