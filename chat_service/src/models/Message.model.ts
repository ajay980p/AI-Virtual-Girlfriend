import { Schema, model, Types } from 'mongoose';

const MessageSchema = new Schema({
    conversationId: {
        type: Types.ObjectId,
        ref: 'Conversation',
        required: true,
        index: true
    },

    userId: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    role: {
        type: String,
        enum: ['user', 'assistant', 'system'],
        required: true
    },

    content: {
        type: String,
        required: true
    },

    clientMessageId: {
        type: String,
        index: true,
        sparse: true,
        unique: true // ✅ Enforces idempotency from frontend
    },

    tokens: {
        input: { type: Number },
        output: { type: Number }
    },

    model: {
        type: String // e.g. gpt-4o, claude-3, etc.
    },

    latencyMs: {
        type: Number
    },

    error: {
        type: String // for debugging failed LLM replies
    },

    isRedacted: {
        type: Boolean,
        default: false
    },

    attachments: [{
        type: {
            type: String,
            enum: ['image', 'file', 'audio']
        },
        url: String,
        name: String,
        size: Number,
        contentType: String
    }]

}, { timestamps: true });

// Indexes for performance
MessageSchema.index({ conversationId: 1, createdAt: -1 }); // for chat window
MessageSchema.index({ userId: 1, createdAt: -1 });         // user history
MessageSchema.index({ clientMessageId: 1 }, { sparse: true, unique: true }); // idempotency

export default model('Message', MessageSchema);