"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import type { Thread } from "@/types/thread";
import type { Message } from "@/types/message";
import { useUIStore } from "./ui.store";
import { useAuthStore } from "./auth.store";
import { chatAPI, BackendAPIError } from "@/lib/api";

type MessagesByThread = Record<string, Message[]>;

type SendOptions = { content: string; vibe?: string };

type ChatState = {
  threads: Thread[];
  messagesByThread: MessagesByThread;
  activeThreadId: string | null;
  userId: string;
  isLoading: boolean;
  error: string | null;
  createThread: () => void;
  selectThread: (id: string) => void;
  sendMessage: (threadId: string, opts: SendOptions) => Promise<void>;
  togglePin: (threadId: string, messageId: string) => void;
  clearError: () => void;
};

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
  error: null,

  createThread: () => {
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
      // Call backend API
      const response = await chatAPI.sendMessage(userId, content);
      
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