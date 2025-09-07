import { Schema, model, Types } from 'mongoose';

const ConversationSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'User', index: true, required: true },
    title: { type: String, default: 'Chat with Aria' },
    isArchived: { type: Boolean, default: false },
    lastMessageAt: { type: Date, index: true },
    lastMessagePreview: { type: String },
    agent: { type: String, default: 'aria' },
}, { timestamps: true });

ConversationSchema.index({ userId: 1, agent: 1 }, { unique: true });

export default model('Conversation', ConversationSchema);