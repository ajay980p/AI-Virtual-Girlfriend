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
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Start a conversation to see messages here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((m) => (
        <div key={m.id} className={`flex ${m.role === "assistant" ? "justify-start" : "justify-end"}`}>
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
              m.role === "assistant" ? "bg-muted" : "bg-primary text-primary-foreground"
            }`}
          >
            <p className="whitespace-pre-wrap">{m.content}</p>
            {m.meta?.pinned && (
              <p className="mt-1 text-[10px] uppercase tracking-wide opacity-70">Pinned to memory</p>
            )}
          </div>
        </div>
      ))}

      {typing && (
        <div className="flex justify-start">
          <div className="rounded-2xl bg-muted px-4 py-2 text-sm">
            <span className="inline-flex items-center gap-1 opacity-70">
              <span className="inline-flex h-1.5 w-1.5 animate-bounce rounded-full bg-foreground [animation-delay:-0.2s]" />
              <span className="inline-flex h-1.5 w-1.5 animate-bounce rounded-full bg-foreground" />
              <span className="inline-flex h-1.5 w-1.5 animate-bounce rounded-full bg-foreground [animation-delay:0.2s]" />
            </span>
          </div>
        </div>
      )}

      {reflecting && (
        <div className="flex justify-start">
          <div className="rounded-2xl bg-muted px-4 py-2 text-xs text-muted-foreground">
            Aria is reflecting…
          </div>
        </div>
      )}
    </div>
  );
}