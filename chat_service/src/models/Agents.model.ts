// src/models/Agent.model.ts
import { Schema, model, Types } from 'mongoose';

const AgentSchema = new Schema({
    name: { type: String, required: true },
    avatarUrl: { type: String },
    personality: { type: String },
    systemPrompt: { type: String },

    // Who created it
    createdBy: { type: Types.ObjectId, ref: 'User', default: null, index: true }, // null = system agent

    // Visibility
    isPublic: { type: Boolean, default: false },    // true = shown to all users
    isArchived: { type: Boolean, default: false },  // hide from UI without deleting

    // Optional advanced config
    temperature: { type: Number, default: 0.7 },
    maxTokens: { type: Number, default: 1024 },
    memoryLimit: { type: Number, default: 100 },

}, { timestamps: true });

// Unique agent name per user OR per system (public)
AgentSchema.index({ createdBy: 1, name: 1 }, { unique: true });

export default model('Agent', AgentSchema);