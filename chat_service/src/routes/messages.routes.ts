import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import MessageModel from '../models/Message.model';
import ConversationModel from '../models/Conversation.model';
import mongoose from 'mongoose';

const router = Router();

/**
 * GET /messages/:conversationId
 * Get all messages for a specific conversation (latest first)
 */
router.get('/:conversationId', authMiddleware, async (req, res) => {
    const userId = req.user!.id;
    const { conversationId } = req.params;

    if (!mongoose.isValidObjectId(conversationId)) {
        return res.status(400).json({ success: false, message: 'Invalid conversation ID' });
    }

    const convo = await ConversationModel.findOne({ _id: conversationId, userId });
    if (!convo) {
        return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const messages = await MessageModel.find({ conversationId }).sort({ createdAt: 1 });

    res.json({ success: true, data: messages });
});

/**
 * POST /messages/:conversationId
 * Add a new user message to a conversation (and optionally trigger AI reply)
 */
router.post('/:conversationId', authMiddleware, async (req, res) => {
    const userId = req.user!.id;
    const { conversationId } = req.params;
    const { content, clientMessageId } = req.body;

    if (!content || typeof content !== 'string') {
        return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    if (!mongoose.isValidObjectId(conversationId)) {
        return res.status(400).json({ success: false, message: 'Invalid conversation ID' });
    }

    const convo = await ConversationModel.findOne({ _id: conversationId, userId });
    if (!convo) {
        return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // 1. Save user message
    const userMessage = await MessageModel.create({
        conversationId,
        userId,
        role: 'user',
        content,
        clientMessageId,
    });

    // 2. (Optional) You can now trigger LLM to generate assistant reply here
    // const assistantResponse = await generateLLMReply(...);

    // 3. Update convo preview + timestamp
    await ConversationModel.updateOne(
        { _id: conversationId },
        {
            $set: {
                lastMessageAt: new Date(),
                lastMessagePreview: content.slice(0, 100)
            }
        }
    );

    res.status(201).json({
        success: true,
        message: 'Message sent',
        data: {
            message: userMessage,
            // assistant: assistantResponse  (if implemented)
        }
    });
});

/**
 * DELETE /messages/:conversationId
 * Delete all messages in a conversation (hard delete)
 */
router.delete('/:conversationId', authMiddleware, async (req, res) => {
    const userId = req.user!.id;
    const { conversationId } = req.params;

    const convo = await ConversationModel.findOne({ _id: conversationId, userId });
    if (!convo) {
        return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    await MessageModel.deleteMany({ conversationId });

    res.json({ success: true, message: 'All messages deleted from conversation' });
});

export default router;