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
      {/* Header */}
      <div className="flex items-center justify-between p-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-gradient-to-r from-primary to-secondary animate-pulse" />
          <h3 className="text-sm font-bold">Conversations</h3>
        </div>
        <button
          className="group inline-flex items-center gap-2 rounded-xl glass border border-border/50 px-3 py-2 text-xs font-medium transition-all duration-200 hover:scale-105 hover:bg-card/50 hover:shadow-md hover:border-primary/30 active:scale-95"
          onClick={() => createThread()}
        >
          <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" /> 
          <span>New</span>
        </button>
      </div>
      
      {/* Thread List */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/10">
              <span className="text-xl opacity-60">💬</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground">No conversations</p>
            <p className="text-xs text-muted-foreground mt-1">Click "New" to start</p>
          </div>
        ) : (
          threads.map((t, index) => (
            <button
              key={t.id}
              onClick={() => selectThread(t.id)}
              className={`group w-full rounded-2xl p-4 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] animate-slide-up ${
                activeId === t.id 
                  ? "glass bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 shadow-lg shadow-primary/10" 
                  : "hover:bg-card/30 hover:shadow-md"
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-sm font-semibold truncate transition-colors duration-200 ${
                      activeId === t.id ? "text-primary" : "text-foreground group-hover:text-primary"
                    }`}>
                      {t.title}
                    </p>
                    {activeId === t.id && (
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate leading-relaxed">
                    {t.lastMessagePreview || "New conversation"}
                  </p>
                </div>
                {activeId === t.id && (
                  <div className="mt-1 text-primary transition-transform duration-200 group-hover:scale-110">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}