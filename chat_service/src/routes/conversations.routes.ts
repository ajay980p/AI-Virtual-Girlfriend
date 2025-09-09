import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import ConversationModel from '../models/Conversation.model';
import AgentModel from '../models/Agent.model';
import MessageModel from '../models/Message.model';
import mongoose from 'mongoose';

const router = Router();

/**
 * GET /conversations
 * Get all conversations for the logged-in user
 */
router.get('/', authMiddleware, async (req, res) => {
    const userId = req.user!.id;

    const conversations = await ConversationModel.find({ userId, isArchived: false })
        .sort({ updatedAt: -1 })
        .populate('agentId', 'name avatarUrl');

    res.json({ success: true, data: conversations });
});

/**
 * GET /conversations/:id
 * Get a single conversation by ID (with agent details)
 */
router.get('/:id', authMiddleware, async (req, res) => {
    const userId = req.user!.id;
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ success: false, message: 'Invalid conversation ID' });
    }

    const convo = await ConversationModel.findOne({ _id: id, userId })
        .populate('agentId', 'name avatarUrl personality');

    if (!convo) {
        return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    res.json({ success: true, data: convo });
});

/**
 * POST /conversations
 * Create a new conversation with an agent
 */
router.post('/', authMiddleware, async (req, res) => {
    const userId = req.user!.id;
    const { agentId, title } = req.body;

    if (!agentId || !mongoose.isValidObjectId(agentId)) {
        return res.status(400).json({ success: false, message: 'agentId is required and must be valid' });
    }

    const agent = await AgentModel.findOne({
        _id: agentId,
        $or: [{ isPublic: true }, { createdBy: userId }]
    });

    if (!agent) {
        return res.status(403).json({ success: false, message: 'Agent not accessible' });
    }

    const convo = await ConversationModel.create({
        userId,
        agentId,
        title: title || `Chat with ${agent.name}`
    });

    res.status(201).json({ success: true, data: convo });
});

/**
 * POST /conversations/dm
 * Get or create a 1-on-1 DM with a specific agent (default Aria)
 */
router.post('/dm', authMiddleware, async (req, res) => {
    const userId = req.user!.id;
    const { agentId } = req.body;

    const agent = await AgentModel.findOne({
        _id: agentId,
        $or: [{ isPublic: true }, { createdBy: userId }]
    });

    if (!agent) {
        return res.status(403).json({ success: false, message: 'Agent not accessible' });
    }

    let convo = await ConversationModel.findOne({ userId, agentId });
    if (!convo) {
        convo = await ConversationModel.create({
            userId,
            agentId,
            title: `Chat with ${agent.name}`
        });
    }

    res.json({ success: true, data: convo });
});

/**
 * PATCH /conversations/:id
 * Update a conversation (e.g., rename, archive)
 */
router.patch('/:id', authMiddleware, async (req, res) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const { title, isArchived } = req.body;

    const convo = await ConversationModel.findOneAndUpdate(
        { _id: id, userId },
        {
            $set: {
                ...(title !== undefined && { title }),
                ...(isArchived !== undefined && { isArchived })
            }
        },
        { new: true }
    );

    if (!convo) {
        return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    res.json({ success: true, data: convo });
});

/**
 * DELETE /conversations/:id
 * Delete a conversation and all its messages
 */
router.delete('/:id', authMiddleware, async (req, res) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const convo = await ConversationModel.findOneAndDelete({ _id: id, userId });
    if (!convo) {
        return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    await MessageModel.deleteMany({ conversationId: id, userId });

    res.json({ success: true, message: 'Conversation and messages deleted' });
});

export default router;