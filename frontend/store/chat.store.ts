"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import type { Thread } from "@/types/thread";
import type { Message } from "@/types/message";
import { useUIStore } from "./ui.store";

type MessagesByThread = Record<string, Message[]>;

type SendOptions = { content: string; vibe?: string };

type ChatState = {
  threads: Thread[];
  messagesByThread: MessagesByThread;
  activeThreadId: string | null;
  createThread: () => void;
  selectThread: (id: string) => void;
  sendMessage: (threadId: string, opts: SendOptions) => void;
  togglePin: (threadId: string, messageId: string) => void;
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

  sendMessage: (threadId, { content, vibe }) => {
    const ui = useUIStore.getState();
    const userMsg: Message = { id: nanoid(), role: "user", content, createdAt: Date.now() };
    set((s) => {
      const msgs = (s.messagesByThread[threadId] || []).concat(userMsg);
      const threads = s.threads.map((t) =>
        t.id === threadId ? { ...t, lastMessagePreview: content, updatedAt: Date.now() } : t
      );
      return { messagesByThread: { ...s.messagesByThread, [threadId]: msgs }, threads };
    });

    // Simulate assistant typing and reply
    ui.setTyping(true);
    const reply = setTimeout(() => {
      const assistantText = `(${vibe || "Neutral"}) Got it! You said: "${content}".`;
      const asstMsg: Message = { id: nanoid(), role: "assistant", content: assistantText, createdAt: Date.now() };
      set((s) => {
        const msgs = (s.messagesByThread[threadId] || []).concat(asstMsg);
        const threads = s.threads.map((t) =>
          t.id === threadId ? { ...t, lastMessagePreview: assistantText, updatedAt: Date.now() } : t
        );
        return { messagesByThread: { ...s.messagesByThread, [threadId]: msgs }, threads };
      });
      ui.setTyping(false);
    }, 700);

    return () => clearTimeout(reply);
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
}));