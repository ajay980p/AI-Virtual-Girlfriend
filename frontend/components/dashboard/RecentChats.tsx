"use client";

import { useChatStore } from "@/store/chat.store";
import Link from "next/link";

export default function RecentChats() {
  const threads = useChatStore((s) => s.threads).slice(0, 3);
  const selectThread = useChatStore((s) => s.selectThread);

  if (threads.length === 0) {
    return (
      <div className="glass rounded-3xl p-8 text-center border border-border/30 relative overflow-hidden group">
        <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-gradient-to-br from-primary/10 to-secondary/5 blur-2xl group-hover:scale-110 transition-transform duration-500" />
        
        <div className="relative z-10">
          <div className="mb-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/10 mb-4">
              <span className="text-2xl opacity-60">💬</span>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Start a conversation to see it here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl border border-border/30 overflow-hidden relative group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
      <div className="absolute -top-16 -left-16 h-32 w-32 rounded-full bg-gradient-to-br from-primary/10 to-secondary/5 blur-2xl group-hover:scale-110 transition-transform duration-500" />
      
      <div className="relative z-10">
        <div className="p-6 border-b border-border/30">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gradient-to-r from-primary to-secondary animate-pulse" />
            <h3 className="text-lg font-bold">Recent chats</h3>
          </div>
        </div>
        
        <div className="divide-y divide-border/30">
          {threads.map((t, index) => (
            <div 
              key={t.id} 
              className="group/item flex items-center justify-between p-6 hover:bg-card/30 transition-all duration-200 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-foreground truncate">{t.title}</p>
                  <div className="h-1.5 w-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground truncate leading-relaxed">
                  {t.lastMessagePreview || "New conversation waiting for you"}
                </p>
              </div>
              <Link
                href="/chat"
                className="ml-4 inline-flex items-center gap-1 rounded-xl glass border border-border/50 px-4 py-2 text-xs font-medium transition-all duration-200 hover:scale-105 hover:bg-card/50 hover:shadow-md active:scale-95 group-hover/item:border-primary/30"
                onClick={() => selectThread(t.id)}
              >
                <span>Open</span>
                <div className="transition-transform duration-200 group-hover/item:translate-x-0.5">→</div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}