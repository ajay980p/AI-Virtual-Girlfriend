"use client";

import { useChatStore } from "@/store/chat.store";
import { useChatHistory } from "@/hooks/useChatHistory";
import ChatMessages from "@/components/chat/ChatMessages";
import MessageInputBar from "@/components/chat/MessageInputBar";
import ErrorAlert from "@/components/chat/ErrorAlert";
import LoadingHistoryBanner from "@/components/chat/LoadingHistoryBanner";
import NoActiveThreadNotice from "@/components/chat/NoActiveThreadNotice";

export default function ChatPage() {
  // Load chat history automatically when user logs in
  const { isLoadingHistory } = useChatHistory();
  const activeThreadId = useChatStore((s) => s.activeThreadId);
  const error = useChatStore((s) => s.error);
  const clearError = useChatStore((s) => s.clearError);

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-background">
      {isLoadingHistory && <LoadingHistoryBanner />}
      {error && <ErrorAlert message={error} onDismiss={clearError} />}
      {!activeThreadId && <NoActiveThreadNotice />}

      <ChatMessages />
      <MessageInputBar />
    </div>
  );
}