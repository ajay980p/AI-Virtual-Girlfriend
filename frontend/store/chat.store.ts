"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import type { Thread } from "@/types/thread";
import type { Message } from "@/types/message";
import { useUIStore } from "./ui.store";
import { useAuthStore } from "./auth.store";
import { chatAPI, conversationAPI, BackendAPIError } from "@/lib/api";
import type { Conversation, ConversationMessage } from "@/lib/api";

type MessagesByThread = Record<string, Message[]>;

type SendOptions = { content: string; vibe?: string };

type ChatState = {
  threads: Thread[];
  messagesByThread: MessagesByThread;
  activeThreadId: string | null;
  userId: string;
  isLoading: boolean;
  isLoadingHistory: boolean;
  error: string | null;
  createThread: (modelId?: string) => Promise<void>;
  selectThread: (id: string) => void;
  sendMessage: (threadId: string, opts: SendOptions) => Promise<void>;
  togglePin: (threadId: string, messageId: string) => void;
  clearError: () => void;
  loadUserConversations: () => Promise<void>;
  loadConversationById: (conversationId: string) => Promise<void>;
  deleteThread: (threadId: string) => Promise<void>;
  updateThreadTitle: (threadId: string, title: string) => Promise<void>;
};

// Helper function to convert backend conversation to frontend thread format
const convertConversationToThread = (conversation: Conversation): Thread => ({
  id: conversation.id,
  title: conversation.title,
  createdAt: new Date(conversation.createdAt).getTime(),
  updatedAt: new Date(conversation.updatedAt).getTime(),
  lastMessagePreview: conversation.lastMessagePreview,
});

// Helper function to convert backend message to frontend message format
const convertBackendMessage = (message: ConversationMessage): Message => ({
  id: message.id,
  role: message.role,
  content: message.content,
  createdAt: new Date(message.createdAt).getTime(),
  meta: message.meta,
});

const seedThread: Thread = {
  id: nanoid(),
  title: "Welcome chat",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  lastMessagePreview: "Ask me anything to get started.",
};

const seedMessages: Message[] = [
  { id: nanoid(), role: "assistant", content: "Hey! I'm Aria. What shall we explore today?", createdAt: Date.now() },
];

export const useChatStore = create<ChatState>((set, get) => ({
  threads: [seedThread],
  messagesByThread: { [seedThread.id]: seedMessages },
  activeThreadId: seedThread.id,
  userId: '', // Will be set from auth store
  isLoading: false,
  isLoadingHistory: false,
  error: null,

  loadUserConversations: async () => {
    const authState = useAuthStore.getState();
    console.log('loadUserConversations: Starting', {
      isAuthenticated: authState.isAuthenticated,
      userId: authState.user?._id,
      userEmail: authState.user?.email
    });
    
    if (!authState.user?._id) {
      console.log('User not authenticated, skipping conversation load');
      return;
    }

    set({ isLoadingHistory: true, error: null });
    
    try {
      console.log('loadUserConversations: Making API call to conversationAPI.getConversations');
      const response = await conversationAPI.getConversations({ limit: 50 });
      console.log('loadUserConversations: API response', response);
      
      if (response.success && response.data.conversations.length > 0) {
        const threads = response.data.conversations.map(convertConversationToThread);
        const messagesByThread: MessagesByThread = {};
        
        // Convert conversations to threads and messages
        response.data.conversations.forEach(conversation => {
          const messages = conversation.messages.map(convertBackendMessage);
          messagesByThread[conversation.id] = messages;
        });
        
        console.log('loadUserConversations: Converted data', {
          threadCount: threads.length,
          messageThreadKeys: Object.keys(messagesByThread)
        });
        
        // Keep seed thread if no conversations exist
        const allThreads = threads.length > 0 ? threads : [seedThread];
        const allMessagesByThread = threads.length > 0 ? messagesByThread : { [seedThread.id]: seedMessages };
        
        set({
          threads: allThreads,
          messagesByThread: allMessagesByThread,
          activeThreadId: allThreads[0].id,
          userId: authState.user._id
        });
        
        console.log('loadUserConversations: State updated successfully');
      } else {
        console.log('loadUserConversations: No conversations found, keeping seed data');
        // No conversations found, keep seed data
        set({ userId: authState.user._id });
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      set({ 
        error: error instanceof BackendAPIError ? error.detail : 'Failed to load chat history'
      });
      // Keep seed data on error
      set({ userId: authState.user._id });
    } finally {
      set({ isLoadingHistory: false });
    }
  },

  loadConversationById: async (conversationId: string) => {
    const authState = useAuthStore.getState();
    if (!authState.user?._id) return;

    set({ isLoading: true, error: null });
    
    try {
      const response = await conversationAPI.getConversationById(conversationId);
      
      if (response.success) {
        const conversation = response.data.conversation;
        const thread = convertConversationToThread(conversation);
        const messages = conversation.messages.map(convertBackendMessage);
        
        set(state => ({
          threads: state.threads.some(t => t.id === thread.id) 
            ? state.threads.map(t => t.id === thread.id ? thread : t)
            : [thread, ...state.threads],
          messagesByThread: {
            ...state.messagesByThread,
            [conversationId]: messages
          },
          activeThreadId: conversationId
        }));
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      set({ 
        error: error instanceof BackendAPIError ? error.detail : 'Failed to load conversation'
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createThread: async (modelId?: string) => {
    const authState = useAuthStore.getState();
    
    if (!authState.user?._id) {
      // For unauthenticated users, create local thread
      const id = nanoid();
      const t: Thread = {
        id,
        title: "New chat",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      set((s) => ({
        threads: [t, ...s.threads],
        messagesByThread: { ...s.messagesByThread, [id]: [] },
        activeThreadId: id,
      }));
      return;
    }

    set({ isLoading: true, error: null });
    
    try {
      const response = await conversationAPI.createConversation({
        title: "New chat",
        modelId,
      });
      
      if (response.success) {
        const conversation = response.data.conversation;
        const thread = convertConversationToThread(conversation);
        const messages = conversation.messages.map(convertBackendMessage);
        
        set((s) => ({
          threads: [thread, ...s.threads],
          messagesByThread: { ...s.messagesByThread, [thread.id]: messages },
          activeThreadId: thread.id,
        }));
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
      set({ 
        error: error instanceof BackendAPIError ? error.detail : 'Failed to create new conversation'
      });
      
      // Fallback to local thread creation
      const id = nanoid();
      const t: Thread = {
        id,
        title: "New chat",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      set((s) => ({
        threads: [t, ...s.threads],
        messagesByThread: { ...s.messagesByThread, [id]: [] },
        activeThreadId: id,
      }));
    } finally {
      set({ isLoading: false });
    }
  },

  selectThread: (id) => set({ activeThreadId: id }),

  sendMessage: async (threadId, { content, vibe }) => {
    const authState = useAuthStore.getState();
    const userId = authState.user?._id || 'anonymous';
    const ui = useUIStore.getState();
    
    // Update userId in chat store if authenticated
    if (authState.user?._id && get().userId !== authState.user._id) {
      set({ userId: authState.user._id });
    }
    
    // Clear any previous errors
    set({ error: null });
    
    // Add user message immediately
    const userMsg: Message = { id: nanoid(), role: "user", content, createdAt: Date.now() };
    set((s) => {
      const msgs = (s.messagesByThread[threadId] || []).concat(userMsg);
      const threads = s.threads.map((t) =>
        t.id === threadId ? { ...t, lastMessagePreview: content, updatedAt: Date.now() } : t
      );
      return { messagesByThread: { ...s.messagesByThread, [threadId]: msgs }, threads };
    });

    // Set loading and typing states
    set({ isLoading: true });
    ui.setTyping(true);

    try {
      // Get auth token if available
      const authToken = authState?.token;
      
      // Call backend AI API with auth token and conversation ID
      const response = await chatAPI.sendMessage(userId, content, threadId, authToken);
      
      // Add assistant response
      const assistantMsg: Message = { 
        id: nanoid(), 
        role: "assistant", 
        content: response.response, 
        createdAt: Date.now() 
      };
      
      set((s) => {
        const msgs = (s.messagesByThread[threadId] || []).concat(assistantMsg);
        const threads = s.threads.map((t) =>
          t.id === threadId ? { ...t, lastMessagePreview: response.response, updatedAt: Date.now() } : t
        );
        return { messagesByThread: { ...s.messagesByThread, [threadId]: msgs }, threads };
      });
      
      // If we got a conversation_id back from the backend, update the thread
      if (response.conversation_id && response.conversation_id !== threadId) {
        // Update the thread ID to match the backend conversation ID
        set((s) => {
          const oldThread = s.threads.find(t => t.id === threadId);
          if (oldThread) {
            const newThreads = s.threads.map(t => 
              t.id === threadId ? { ...t, id: response.conversation_id! } : t
            );
            const newMessagesByThread = { ...s.messagesByThread };
            newMessagesByThread[response.conversation_id!] = newMessagesByThread[threadId];
            delete newMessagesByThread[threadId];
            
            return {
              threads: newThreads,
              messagesByThread: newMessagesByThread,
              activeThreadId: response.conversation_id!
            };
          }
          return s;
        });
      }
      
    } catch (error) {
      console.error('Failed to send message:', error);
      
      let errorMessage = 'Failed to send message. Please try again.';
      if (error instanceof BackendAPIError) {
        if (error.status === 0) {
          errorMessage = 'Cannot connect to server. Please check if the backend is running.';
        } else {
          errorMessage = error.detail || error.message;
        }
      }
      
      // Add error message
      const errorMsg: Message = {
        id: nanoid(),
        role: "assistant",
        content: `Sorry, I encountered an error: ${errorMessage}`,
        createdAt: Date.now()
      };
      
      set((s) => {
        const msgs = (s.messagesByThread[threadId] || []).concat(errorMsg);
        return { 
          messagesByThread: { ...s.messagesByThread, [threadId]: msgs },
          error: errorMessage
        };
      });
    } finally {
      set({ isLoading: false });
      ui.setTyping(false);
    }
  },

  deleteThread: async (threadId: string) => {
    const authState = useAuthStore.getState();
    
    if (authState.user?._id) {
      try {
        await conversationAPI.deleteConversation(threadId);
      } catch (error) {
        console.error('Failed to delete conversation from backend:', error);
        // Continue with local deletion even if backend fails
      }
    }
    
    set((s) => {
      const newThreads = s.threads.filter(t => t.id !== threadId);
      const newMessagesByThread = { ...s.messagesByThread };
      delete newMessagesByThread[threadId];
      
      // If we deleted the active thread, select the first available thread
      const newActiveThreadId = s.activeThreadId === threadId 
        ? (newThreads.length > 0 ? newThreads[0].id : null)
        : s.activeThreadId;
      
      return {
        threads: newThreads,
        messagesByThread: newMessagesByThread,
        activeThreadId: newActiveThreadId
      };
    });
  },

  updateThreadTitle: async (threadId: string, title: string) => {
    const authState = useAuthStore.getState();
    
    // Update locally first
    set((s) => ({
      threads: s.threads.map(t => 
        t.id === threadId ? { ...t, title, updatedAt: Date.now() } : t
      )
    }));
    
    // Update in backend if authenticated
    if (authState.user?._id) {
      try {
        await conversationAPI.updateTitle(threadId, title);
      } catch (error) {
        console.error('Failed to update conversation title:', error);
        set({ error: 'Failed to update conversation title' });
      }
    }
  },

  togglePin: (threadId, messageId) => {
    const ui = useUIStore.getState();
    set((s) => {
      const msgs = (s.messagesByThread[threadId] || []).map((m) =>
        m.id === messageId ? { ...m, meta: { ...m.meta, pinned: !m.meta?.pinned } } : m
      );
      return { messagesByThread: { ...s.messagesByThread, [threadId]: msgs } };
    });
    // Reflecting shimmer for UX
    ui.setReflecting(true);
    setTimeout(() => ui.setReflecting(false), 1200);
  },

  clearError: () => set({ error: null }),
}));