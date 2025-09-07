import { Schema, model, Types } from 'mongoose';

const MessageSchema = new Schema({
    conversationId: { type: Types.ObjectId, ref: 'Conversation', required: true, index: true },
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    clientMessageId: { type: String, index: true },
    tokens: { input: Number, output: Number },
    model: { type: String },
    latencyMs: { type: Number },
    error: { type: String },
    isRedacted: { type: Boolean, default: false },
    attachments: [{
        type: { type: String, enum: ['image', 'file', 'audio'] },
        url: String,
        name: String,
        size: Number,
        contentType: String,
    }]
}, { timestamps: true });

MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ userId: 1, createdAt: -1 });
MessageSchema.index({ clientMessageId: 1 }, { sparse: true, unique: true });

export default model('Message', MessageSchema);