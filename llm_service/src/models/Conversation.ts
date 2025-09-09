import { Schema, model, Types } from 'mongoose';

const ConversationSchema = new Schema({
    userId: {
        type: Types.ObjectId,
        ref: 'User',
        index: true,
        required: true
    },

    agentId: {
        type: Types.ObjectId,
        ref: 'Agent',
        required: true
    },

    title: {
        type: String,
        default: 'Chat'
    },

    isArchived: {
        type: Boolean,
        default: false
    },

    lastMessageAt: {
        type: Date,
        index: true
    },

    lastMessagePreview: {
        type: String
    }

}, { timestamps: true });

ConversationSchema.index({ userId: 1, agentId: 1 });

export default model('Conversation', ConversationSchema);
