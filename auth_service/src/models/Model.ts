import mongoose, { Schema, Document } from 'mongoose';

// Define interfaces for sub-documents
export interface IEmotionalProfile {
  dominantEmotion: string;
  emotionalRange: number;
  empathyLevel: number;
  humorStyle: 'witty' | 'playful' | 'sarcastic' | 'gentle' | 'quirky';
  communication: 'direct' | 'gentle' | 'poetic' | 'casual' | 'formal';
}

export interface IAppearanceProfile {
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  skinTone: string;
  height: string;
  bodyType: string;
  style: string;
  accessories: string[];
}

export interface IVoiceProfile {
  tone: 'soft' | 'warm' | 'energetic' | 'mysterious' | 'sweet';
  accent?: string;
  pace: 'slow' | 'moderate' | 'fast';
  expressiveness: number;
}

export interface IRelationshipProfile {
  intimacyLevel: 'friend' | 'romantic' | 'companion' | 'mentor';
  loyaltyLevel: number;
  jealousyLevel: number;
  supportiveness: number;
  playfulness: number;
}

// Main Model interface
export interface IModel {
  name: string;
  age: number;
  bio: string;
  images: string[]; // URLs to uploaded images
  personality: string[];
  category: 'realistic' | 'anime' | 'custom';
  tags: string[];
  emotions: IEmotionalProfile;
  appearance: IAppearanceProfile;
  interests: string[];
  backstory: string;
  voiceStyle: IVoiceProfile;
  relationshipStyle: IRelationshipProfile;
  createdBy: mongoose.Types.ObjectId; // Reference to User
  isActive: boolean;
  isPublic: boolean; // Whether other users can see this model
  likes: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Extend the IModel interface to include Mongoose Document methods
export interface IModelDocument extends IModel, Document {
  incrementUsage(): Promise<void>;
  addLike(): Promise<void>;
  removeLike(): Promise<void>;
}

// Emotional Profile Schema
const emotionalProfileSchema = new Schema<IEmotionalProfile>({
  dominantEmotion: {
    type: String,
    required: true,
    enum: ['happy', 'calm', 'mysterious', 'playful', 'romantic', 'confident', 'shy', 'energetic'],
    default: 'happy'
  },
  emotionalRange: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 5
  },
  empathyLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 5
  },
  humorStyle: {
    type: String,
    required: true,
    enum: ['witty', 'playful', 'sarcastic', 'gentle', 'quirky'],
    default: 'gentle'
  },
  communication: {
    type: String,
    required: true,
    enum: ['direct', 'gentle', 'poetic', 'casual', 'formal'],
    default: 'casual'
  }
}, { _id: false });

// Appearance Profile Schema
const appearanceProfileSchema = new Schema<IAppearanceProfile>({
  hairColor: {
    type: String,
    default: ''
  },
  hairStyle: {
    type: String,
    default: ''
  },
  eyeColor: {
    type: String,
    default: ''
  },
  skinTone: {
    type: String,
    default: ''
  },
  height: {
    type: String,
    default: ''
  },
  bodyType: {
    type: String,
    default: ''
  },
  style: {
    type: String,
    default: ''
  },
  accessories: [{
    type: String
  }]
}, { _id: false });

// Voice Profile Schema
const voiceProfileSchema = new Schema<IVoiceProfile>({
  tone: {
    type: String,
    required: true,
    enum: ['soft', 'warm', 'energetic', 'mysterious', 'sweet'],
    default: 'warm'
  },
  accent: {
    type: String,
    default: ''
  },
  pace: {
    type: String,
    required: true,
    enum: ['slow', 'moderate', 'fast'],
    default: 'moderate'
  },
  expressiveness: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 5
  }
}, { _id: false });

// Relationship Profile Schema
const relationshipProfileSchema = new Schema<IRelationshipProfile>({
  intimacyLevel: {
    type: String,
    required: true,
    enum: ['friend', 'romantic', 'companion', 'mentor'],
    default: 'companion'
  },
  loyaltyLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 5
  },
  jealousyLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 3
  },
  supportiveness: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 8
  },
  playfulness: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 5
  }
}, { _id: false });

// Main Model Schema
const modelSchema = new Schema<IModelDocument>({
  name: {
    type: String,
    required: [true, 'Model name is required'],
    trim: true,
    maxlength: [100, 'Model name cannot exceed 100 characters'],
    minlength: [1, 'Model name must be at least 1 character']
  },
  age: {
    type: Number,
    required: [true, 'Model age is required'],
    min: [18, 'Model age must be at least 18'],
    max: [100, 'Model age cannot exceed 100']
  },
  bio: {
    type: String,
    default: '',
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  images: [{
    type: String,
    required: true
  }],
  personality: [{
    type: String,
    required: true
  }],
  category: {
    type: String,
    required: true,
    enum: ['realistic', 'anime', 'custom'],
    default: 'custom'
  },
  tags: [{
    type: String
  }],
  emotions: {
    type: emotionalProfileSchema,
    required: true
  },
  appearance: {
    type: appearanceProfileSchema,
    required: true
  },
  interests: [{
    type: String,
    required: true
  }],
  backstory: {
    type: String,
    required: [true, 'Backstory is required'],
    minlength: [10, 'Backstory must be at least 10 characters'],
    maxlength: [2000, 'Backstory cannot exceed 2000 characters']
  },
  voiceStyle: {
    type: voiceProfileSchema,
    required: true
  },
  relationshipStyle: {
    type: relationshipProfileSchema,
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc: any, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
modelSchema.index({ createdBy: 1 });
modelSchema.index({ category: 1 });
modelSchema.index({ isActive: 1 });
modelSchema.index({ isPublic: 1 });
modelSchema.index({ createdAt: -1 });
modelSchema.index({ name: 'text', bio: 'text', tags: 'text' }); // Text search index

// Instance methods
modelSchema.methods.incrementUsage = async function(): Promise<void> {
  this.usageCount = (this.usageCount || 0) + 1;
  await this.save();
};

modelSchema.methods.addLike = async function(): Promise<void> {
  this.likes = (this.likes || 0) + 1;
  await this.save();
};

modelSchema.methods.removeLike = async function(): Promise<void> {
  this.likes = Math.max((this.likes || 0) - 1, 0);
  await this.save();
};

// Static methods
modelSchema.statics.findByUser = function(userId: string) {
  return this.find({ createdBy: userId, isActive: true }).sort({ createdAt: -1 });
};

modelSchema.statics.findPublicModels = function() {
  return this.find({ isPublic: true, isActive: true }).sort({ likes: -1, createdAt: -1 });
};

modelSchema.statics.searchModels = function(query: string, userId?: string) {
  const searchCriteria: any = {
    $text: { $search: query },
    isActive: true
  };
  
  if (userId) {
    searchCriteria.$or = [
      { isPublic: true },
      { createdBy: userId }
    ];
  } else {
    searchCriteria.isPublic = true;
  }
  
  return this.find(searchCriteria).sort({ score: { $meta: 'textScore' } });
};

const Model = mongoose.model<IModelDocument>('Model', modelSchema);

export default Model;