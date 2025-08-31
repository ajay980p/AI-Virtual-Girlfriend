"use client";

import { useChatStore } from "@/store/chat.store";
import Link from "next/link";

export default function RecentChats() {
  const threads = useChatStore((s) => s.threads).slice(0, 3);
  const selectThread = useChatStore((s) => s.selectThread);

  if (threads.length === 0) {
    return (
      <div className="glass-strong rounded-3xl p-8 text-center border border-border/20 relative overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/5 blur-2xl group-hover:scale-125 transition-transform duration-700" />
        <div className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-gradient-to-tr from-accent/8 to-primary/5 blur-xl group-hover:scale-110 transition-transform duration-500" />
        
        <div className="relative z-10">
          <div className="mb-6">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/5 mb-4 group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl animate-bounce-subtle">💬</span>
            </div>
          </div>
          <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">No conversations yet</h3>
          <p className="text-base text-muted-foreground leading-relaxed mb-6">
            Your conversation history will appear here once you start chatting with your AI companion.
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-primary font-medium">
            <span>✨</span>
            <span>Start your first conversation</span>
            <span>→</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-3xl border border-border/20 overflow-hidden relative group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
      <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/5 blur-2xl group-hover:scale-125 transition-transform duration-700" />
      <div className="absolute -bottom-16 -right-16 h-32 w-32 rounded-full bg-gradient-to-tl from-accent/8 via-secondary/5 to-primary/5 blur-xl group-hover:scale-110 transition-transform duration-500" />
      
      <div className="relative z-10">
        <div className="p-6 border-b border-border/20 bg-gradient-to-r from-surface-1/50 to-surface-2/30">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-3 w-3 rounded-full bg-gradient-to-r from-primary via-secondary to-accent animate-pulse" />
              <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 animate-ping" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">Recent Conversations</h3>
            <span className="text-lg animate-float">🧠</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2 font-medium">Continue where you left off</p>
        </div>
        
        <div className="divide-y divide-border/20">
          {threads.map((t, index) => (
            <div 
              key={t.id} 
              className="group/item relative overflow-hidden transition-all duration-300 hover:bg-gradient-to-r hover:from-card/40 hover:to-card/20 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10 flex items-center justify-between p-6">
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-2 w-2 rounded-full bg-gradient-to-r from-primary to-secondary animate-pulse flex-shrink-0" />
                    <h4 className="text-base font-semibold text-foreground truncate group-hover/item:text-primary transition-colors duration-200">{t.title}</h4>
                    <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full font-medium flex-shrink-0">
                      {index === 0 ? 'Latest' : `${index + 1} ago`}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 group-hover/item:text-foreground/80 transition-colors duration-200">
                    {t.lastMessagePreview || "New conversation ready to explore together"}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span>💬</span>
                      <span>{Math.floor(Math.random() * 15) + 3} messages</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span>⏱️</span>
                      <span>{Math.floor(Math.random() * 30) + 5}min</span>
                    </span>
                  </div>
                </div>
                
                <Link
                  href="/chat"
                  className="relative inline-flex items-center gap-2 rounded-xl glass border border-border/50 px-6 py-3 text-sm font-medium transition-all duration-300 hover:scale-105 hover:bg-card/60 hover:shadow-lg hover:border-primary/40 active:scale-95 group-hover/item:border-primary/50 group-hover/item:shadow-primary/10 surface-glow"
                  onClick={() => selectThread(t.id)}
                >
                  <span>Continue</span>
                  <div className="transition-transform duration-300 group-hover/item:translate-x-1">→</div>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 -z-10" />
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        {/* View all conversations footer */}
        <div className="p-6 border-t border-border/20 bg-gradient-to-r from-surface-1/30 to-surface-2/20">
          <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl glass border border-border/50 px-6 py-3 text-sm font-medium transition-all duration-300 hover:scale-105 hover:bg-card/60 hover:shadow-lg hover:border-primary/30 active:scale-95 group">
            <span>📚</span>
            <span>View all conversations</span>
            <div className="transition-transform duration-300 group-hover:translate-x-1">→</div>
          </button>
        </div>
      </div>
    </div>
  );
}