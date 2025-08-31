"use client";

import { useChatStore } from "@/store/chat.store";
import { useUIStore } from "@/store/ui.store";

export default function MessageStream() {
  const activeThreadId = useChatStore((s) => s.activeThreadId);
  const messages = useChatStore((s) => (activeThreadId ? s.messagesByThread[activeThreadId] || [] : []));
  const reflecting = useUIStore((s) => s.reflecting);
  const typing = useUIStore((s) => s.assistantTyping);

  if (!activeThreadId) {
    return (
      <div className="flex h-full items-center justify-center text-center">
        <div className="space-y-4 animate-fade-in">
          <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center">
            <span className="text-3xl opacity-60">💬</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Choose a conversation from the sidebar or create a new one to begin chatting with Aria.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {messages.map((m, index) => (
        <div 
          key={m.id} 
          className={`flex animate-slide-up ${
            m.role === "assistant" ? "justify-start" : "justify-end"
          }`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className={`group max-w-[85%] transition-all duration-200 hover:scale-[1.02] ${
            m.role === "assistant" ? "" : ""
          }`}>
            {/* Message Bubble */}
            <div
              className={`relative rounded-3xl px-6 py-4 shadow-sm transition-all duration-200 group-hover:shadow-md ${
                m.role === "assistant" 
                  ? "glass border border-border/30 bg-card/50 backdrop-blur-sm" 
                  : "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
              }`}
            >
              {/* Message Content */}
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
              
              {/* Pinned Badge */}
              {m.meta?.pinned && (
                <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/30 px-2 py-1">
                  <span className="text-xs">📌</span>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">
                    Pinned to memory
                  </span>
                </div>
              )}
              
              {/* Message Tail */}
              <div className={`absolute top-4 w-3 h-3 transform rotate-45 ${
                m.role === "assistant" 
                  ? "-left-1.5 glass border-l border-t border-border/30" 
                  : "-right-1.5 bg-gradient-to-br from-primary to-primary/90"
              }`} />
            </div>
            
            {/* Message Info */}
            <div className={`mt-1 px-2 text-[10px] text-muted-foreground/70 ${
              m.role === "assistant" ? "text-left" : "text-right"
            }`}>
              {m.role === "assistant" ? "Aria" : "You"} • just now
            </div>
          </div>
        </div>
      ))}

      {/* Typing Indicator */}
      {typing && (
        <div className="flex justify-start animate-slide-up">
          <div className="group max-w-[85%]">
            <div className="glass border border-border/30 bg-card/50 backdrop-blur-sm rounded-3xl px-6 py-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Aria is typing</span>
                <div className="flex items-center gap-1">
                  <span className="inline-flex h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                  <span className="inline-flex h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                  <span className="inline-flex h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                </div>
              </div>
            </div>
            <div className="mt-1 px-2 text-[10px] text-muted-foreground/70 text-left">
              Aria • now
            </div>
          </div>
        </div>
      )}

      {/* Reflecting Indicator */}
      {reflecting && (
        <div className="flex justify-start animate-slide-up">
          <div className="group max-w-[85%]">
            <div className="glass border border-border/30 bg-card/30 backdrop-blur-sm rounded-3xl px-6 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-gradient-to-r from-primary/60 to-secondary/60 animate-pulse" />
                <span className="text-xs text-muted-foreground font-medium">Aria is reflecting on our conversation…</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}