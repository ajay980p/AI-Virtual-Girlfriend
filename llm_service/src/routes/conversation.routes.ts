import { Router } from 'express';
import { ConversationController } from '../controllers/conversation.controller';

const router = Router();

// Get all conversations for user
router.get('/', ConversationController.getConversations);

// Get conversation statistics (must be before dynamic routes)
router.get('/stats', ConversationController.getConversationStats);

// Search conversations (must be before dynamic routes)
router.get('/search', ConversationController.searchConversations);

// Get specific conversation by ID
router.get('/:conversationId', ConversationController.getConversationById);

// Create new conversation
router.post('/', ConversationController.createConversation);

// Update conversation title
router.patch('/:conversationId/title', ConversationController.updateConversationTitle);

// Delete conversation
router.delete('/:conversationId', ConversationController.deleteConversation);

// Add message to conversation
router.post('/:conversationId/messages', ConversationController.addMessage);

export default router;
