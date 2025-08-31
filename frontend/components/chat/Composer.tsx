"use client";

import { useState } from "react";
import { useChatStore } from "@/store/chat.store";
import { useUIStore } from "@/store/ui.store";

const VIBES = ["Curious", "Supportive", "Direct"] as const;

export default function Composer() {
  const [input, setInput] = useState("");
  const activeThreadId = useChatStore((s) => s.activeThreadId);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const vibe = useUIStore((s) => s.vibe);
  const setVibe = useUIStore((s) => s.setVibe);

  const onSend = () => {
    if (!input.trim() || !activeThreadId) return;
    sendMessage(activeThreadId, { content: input, vibe });
    setInput("");
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {VIBES.map((v) => (
          <button
            key={v}
            onClick={() => setVibe(v)}
            className={`rounded-full border px-3 py-1 text-xs ${vibe === v ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="Write a message…"
          rows={2}
          className="min-h-[44px] flex-1 resize-none rounded-xl border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          className="h-[44px] rounded-xl bg-primary px-4 text-sm text-primary-foreground disabled:opacity-50"
          onClick={onSend}
          disabled={!activeThreadId}
        >
          Send
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground">Enter to send • Shift+Enter for newline</p>
    </div>
  );
}