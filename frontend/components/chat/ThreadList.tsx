"use client";

import { useChatStore } from "@/store/chat.store";
import { Plus } from "lucide-react";

export default function ThreadList() {
  const threads = useChatStore((s) => s.threads);
  const activeId = useChatStore((s) => s.activeThreadId);
  const createThread = useChatStore((s) => s.createThread);
  const selectThread = useChatStore((s) => s.selectThread);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-2">
        <h3 className="text-sm font-semibold">Conversations</h3>
        <button
          className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs hover:bg-muted"
          onClick={() => createThread()}
        >
          <Plus className="h-3.5 w-3.5" /> New
        </button>
      </div>
      <div className="mt-2 space-y-1 overflow-y-auto">
        {threads.map((t) => (
          <button
            key={t.id}
            onClick={() => selectThread(t.id)}
            className={`w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-muted ${
              activeId === t.id ? "bg-primary/10 text-primary" : ""
            }`}
          >
            <p className="font-medium">{t.title}</p>
            <p className="line-clamp-1 text-xs text-muted-foreground">{t.lastMessagePreview || "New thread"}</p>
          </button>
        ))}
      </div>
    </div>
  );
}