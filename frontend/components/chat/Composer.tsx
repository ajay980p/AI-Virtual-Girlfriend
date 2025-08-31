"use client";

import { useState } from "react";
import { useChatStore } from "@/store/chat.store";
import { useUIStore } from "@/store/ui.store";

const VIBES = ["Curious", "Supportive", "Direct"] as const;

export default function Composer() {
  const [input, setInput] = useState("");
  const activeThreadId = useChatStore((s) => s.activeThreadId);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const isLoading = useChatStore((s) => s.isLoading);
  const error = useChatStore((s) => s.error);
  const clearError = useChatStore((s) => s.clearError);
  const vibe = useUIStore((s) => s.vibe);
  const setVibe = useUIStore((s) => s.setVibe);

  const onSend = async () => {
    if (!input.trim() || !activeThreadId || isLoading) return;
    
    // Clear any previous errors
    clearError();
    
    try {
      await sendMessage(activeThreadId, { content: input, vibe });
      setInput("");
    } catch (error) {
      // Error is already handled in the store
      console.error('Send message error:', error);
    }
  };

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-start gap-2">
            <span className="text-red-500">⚠️</span>
            <div className="flex-1">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              <button
                onClick={clearError}
                className="mt-1 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Vibe Selection */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-medium text-muted-foreground flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Conversation tone:
        </span>
        {VIBES.map((v) => (
          <button
            key={v}
            onClick={() => setVibe(v)}
            className={`group relative rounded-full border px-4 py-2 text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
              vibe === v 
                ? "glass bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30 text-primary shadow-lg shadow-primary/10" 
                : "glass border-border/50 hover:bg-card/50 hover:border-primary/20 hover:shadow-md"
            }`}
          >
            <span className="relative z-10">{v}</span>
            {vibe === v && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 animate-pulse" />
            )}
          </button>
        ))}
      </div>
      
      {/* Input Area */}
      <div className="relative group">
        <div className="flex items-end gap-3">
          {/* Text Input */}
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!isLoading) {
                    onSend();
                  }
                }
              }}
              placeholder="Share your thoughts with Aria…"
              rows={2}
              className="w-full min-h-[52px] resize-none rounded-2xl glass border border-border/50 bg-card/30 backdrop-blur-sm px-5 py-4 text-sm leading-relaxed placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all duration-200 hover:bg-card/50 hover:border-border/70"
            />
            
            {/* Character count or input status */}
            <div className="absolute bottom-2 right-3 flex items-center gap-2">
              {input.length > 0 && (
                <span className="text-[10px] text-muted-foreground/50">
                  {input.length} chars
                </span>
              )}
            </div>
          </div>
          
          {/* Send Button */}
          <button
            className={`group relative h-[52px] px-6 rounded-2xl font-semibold text-sm transition-all duration-200 overflow-hidden ${
              !activeThreadId || !input.trim() || isLoading
                ? "glass border border-border/30 text-muted-foreground cursor-not-allowed opacity-50"
                : "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 active:scale-95 border border-primary/20"
            }`}
            onClick={onSend}
            disabled={!activeThreadId || !input.trim() || isLoading}
          >
            <span className="relative z-10 flex items-center gap-2">
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send</span>
                  <div className="transition-transform duration-200 group-hover:translate-x-0.5">→</div>
                </>
              )}
            </span>
            {!(!activeThreadId || !input.trim() || isLoading) && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
            )}
          </button>
        </div>
        
        {/* Helper Text */}
        <p className="mt-2 text-[11px] text-muted-foreground/60 flex items-center gap-4">
          <span>Enter to send • Shift+Enter for newline</span>
          {activeThreadId && (
            <span className="flex items-center gap-1">
              <span className={`h-1 w-1 rounded-full animate-pulse ${
                error ? 'bg-red-500' : 'bg-emerald-500'
              }`} />
              {error ? 'Connection issues' : 'Connected to Aria'}
            </span>
          )}
          {isLoading && (
            <span className="flex items-center gap-1">
              <div className="h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
              Sending...
            </span>
          )}
        </p>
      </div>
    </div>
  );
}