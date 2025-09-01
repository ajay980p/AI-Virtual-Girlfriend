import mongoose, { Schema, Document } from 'mongoose';

// Message interface for conversation
export interface IMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
  meta?: {
    pinned?: boolean;
    memoryScore?: number;
    modelId?: mongoose.Types.ObjectId; // Which AI model responded
  };
}

// Conversation interface
export interface IConversation {
  userId: mongoose.Types.ObjectId;
  modelId?: mongoose.Types.ObjectId; // Optional: which AI model is being used
  title: string;
  messages: IMessage[];
  lastMessagePreview?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Extend the interfaces to include Mongoose Document methods
export interface IConversationDocument extends IConversation, Document {
  addMessage(message: Omit<IMessage, 'id' | 'createdAt'>): Promise<void>;
  updateTitle(title: string): Promise<void>;
  getLastMessage(): IMessage | null;
  getMessageCount(): number;
}

// Message Schema
const messageSchema = new Schema<IMessage>({
  id: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'assistant', 'system']
  },
  content: {
    type: String,
    required: true,
    maxlength: [10000, 'Message content cannot exceed 10000 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  meta: {
    pinned: {
      type: Boolean,
      default: false
    },
    memoryScore: {
      type: Number,
      min: 0,
      max: 10
    },
    modelId: {
      type: Schema.Types.ObjectId,
      ref: 'Model'
    }
  }
}, { _id: false });

// Main Conversation Schema
const conversationSchema = new Schema<IConversationDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  modelId: {
    type: Schema.Types.ObjectId,
    ref: 'Model',
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Conversation title cannot exceed 200 characters'],
    default: 'New Conversation'
  },
  messages: [messageSchema],
  lastMessagePreview: {
    type: String,
    maxlength: [500, 'Last message preview cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
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
conversationSchema.index({ userId: 1, createdAt: -1 });
conversationSchema.index({ userId: 1, modelId: 1 });
conversationSchema.index({ userId: 1, isActive: 1, updatedAt: -1 });

// Instance methods
conversationSchema.methods.addMessage = async function(messageData: Omit<IMessage, 'id' | 'createdAt'>): Promise<void> {
  const messageId = new mongoose.Types.ObjectId().toString();
  const message: IMessage = {
    ...messageData,
    id: messageId,
    createdAt: new Date()
  };
  
  this.messages.push(message);
  this.lastMessagePreview = messageData.content.substring(0, 500);
  this.markModified('messages');
  await this.save();
};

conversationSchema.methods.updateTitle = async function(title: string): Promise<void> {
  this.title = title;
  await this.save();
};

conversationSchema.methods.getLastMessage = function(): IMessage | null {
  return this.messages.length > 0 ? this.messages[this.messages.length - 1] : null;
};

conversationSchema.methods.getMessageCount = function(): number {
  return this.messages.length;
};

// Static methods
conversationSchema.statics.findByUser = function(userId: string, includeInactive = false) {
  const query: any = { userId };
  if (!includeInactive) {
    query.isActive = true;
  }
  return this.find(query).sort({ updatedAt: -1 });
};

conversationSchema.statics.findByUserAndModel = function(userId: string, modelId: string) {
  return this.find({ 
    userId, 
    modelId, 
    isActive: true 
  }).sort({ updatedAt: -1 });
};

conversationSchema.statics.createWithFirstMessage = async function(
  userId: string, 
  messageContent: string, 
  modelId?: string
) {
  const conversation = new this({
    userId,
    modelId: modelId ? new mongoose.Types.ObjectId(modelId) : undefined,
    title: messageContent.substring(0, 50) + (messageContent.length > 50 ? '...' : ''),
    messages: [],
    isActive: true
  });

  await conversation.addMessage({
    role: 'user',
    content: messageContent
  });

  return conversation;
};

const Conversation = mongoose.model<IConversationDocument>('Conversation', conversationSchema);

export default Conversation;