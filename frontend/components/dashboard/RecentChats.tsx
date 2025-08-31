"use client";

import { useChatStore } from "@/store/chat.store";
import Link from "next/link";

export default function RecentChats() {
  const threads = useChatStore((s) => s.threads).slice(0, 3);
  const selectThread = useChatStore((s) => s.selectThread);

  if (threads.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        No chats yet. Start a conversation to see it here.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-2">
      <div className="p-4">
        <h3 className="text-sm font-semibold">Recent chats</h3>
      </div>
      <ul className="divide-y">
        {threads.map((t) => (
          <li key={t.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium">{t.title}</p>
              <p className="text-xs text-muted-foreground">{t.lastMessagePreview || "New thread"}</p>
            </div>
            <Link
              href="/chat"
              className="rounded-lg border px-2 py-1 text-xs hover:bg-muted"
              onClick={() => selectThread(t.id)}
            >
              Open
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}