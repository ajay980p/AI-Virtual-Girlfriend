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

    agentId: {
        type: Types.ObjectId,
        ref: 'Agent',
        required: true
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

    metadata: {
        emotion: String,
        messageType: {
            type: String,
            enum: ['question', 'sharing', 'seeking_support', 'casual', 'romantic']
        },
        urgency: {
            type: String,
            enum: ['low', 'medium', 'high']
        },
        topics: [String],
        responseTime: Number, // milliseconds taken to generate response
        tokenCount: Number,
        model: String
    },

    isEdited: {
        type: Boolean,
        default: false
    },

    editHistory: [{
        originalContent: String,
        editedAt: Date,
        reason: String
    }],

    reactions: [{
        type: {
            type: String,
            enum: ['like', 'love', 'laugh', 'surprise', 'sad', 'angry']
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],

    isDeleted: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ userId: 1, createdAt: -1 });
MessageSchema.index({ role: 1, conversationId: 1 });

export default model('Message', MessageSchema);
