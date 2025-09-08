import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import AgentModel from '../models/Agent.model';
import mongoose from 'mongoose';

const router = Router();

/**
 * GET /agents
 * Get all public agents + custom agents created by the logged-in user
 */
router.get('/', authMiddleware, async (req, res) => {
    const userId = req.user!.id;

    const agents = await AgentModel.find({
        $or: [
            { isPublic: true },
            { createdBy: userId }
        ],
        isArchived: false
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: agents });
});




/**
 * GET /agents/:id
 * Get details of a specific agent (must be public or created by user)
 */
router.get('/:id', authMiddleware, async (req, res) => {
    const userId = req.user!.id;
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ success: false, message: 'Invalid agent ID' });
    }

    const agent = await AgentModel.findOne({
        _id: id,
        $or: [
            { isPublic: true },
            { createdBy: userId }
        ],
        isArchived: false
    });

    if (!agent) {
        return res.status(404).json({ success: false, message: 'Agent not found' });
    }

    res.json({ success: true, data: agent });
});

/**
 * POST /agents
 * Create a custom agent (user-defined AI)
 */
router.post('/', authMiddleware, async (req, res) => {
    const userId = req.user!.id;
    const {
        name,
        avatarUrl,
        personality,
        systemPrompt,
        temperature,
        maxTokens,
        memoryLimit,
        isPublic
    } = req.body;

    if (!name || !systemPrompt) {
        return res.status(400).json({ success: false, message: 'Name and systemPrompt are required' });
    }

    const exists = await AgentModel.findOne({ name, createdBy: userId });
    if (exists) {
        return res.status(409).json({ success: false, message: 'You already have an agent with this name' });
    }

    const agent = await AgentModel.create({
        name,
        avatarUrl,
        personality,
        systemPrompt,
        temperature: temperature ?? 0.7,
        maxTokens: maxTokens ?? 1024,
        memoryLimit: memoryLimit ?? 100,
        isPublic: !!isPublic,
        createdBy: userId
    });

    res.status(201).json({ success: true, data: agent });
});

/**
 * PATCH /agents/:id
 * Update your custom agent (only if createdBy === user)
 */
router.patch('/:id', authMiddleware, async (req, res) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const agent = await AgentModel.findOneAndUpdate(
        { _id: id, createdBy: userId },
        { $set: req.body },
        { new: true }
    );

    if (!agent) {
        return res.status(404).json({ success: false, message: 'Agent not found or not owned by you' });
    }

    res.json({ success: true, data: agent });
});

/**
 * DELETE /agents/:id
 * Soft-delete your custom agent (set isArchived = true)
 */
router.delete('/:id', authMiddleware, async (req, res) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const agent = await AgentModel.findOneAndUpdate(
        { _id: id, createdBy: userId },
        { $set: { isArchived: true } },
        { new: true }
    );

    if (!agent) {
        return res.status(404).json({ success: false, message: 'Agent not found or not owned by you' });
    }

    res.json({ success: true, message: 'Agent archived successfully' });
});

export default router;