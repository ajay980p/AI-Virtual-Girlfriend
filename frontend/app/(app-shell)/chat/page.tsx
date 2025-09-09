"use client";

import { useChatStore } from "@/store/chat.store";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useState } from "react";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";
import ChatMessages from "@/components/chat/ChatMessages";
import MessageInputBar from "@/components/chat/MessageInputBar";
import ErrorAlert from "@/components/chat/ErrorAlert";
import LoadingHistoryBanner from "@/components/chat/LoadingHistoryBanner";
import NoActiveThreadNotice from "@/components/chat/NoActiveThreadNotice";
import ThreadList from "@/components/chat/ThreadList";
import ConversationStats from "@/components/chat/ConversationStats";

export default function ChatPage() {
  // Load chat history automatically when user logs in
  const { isLoadingHistory } = useChatHistory();
  const activeThreadId = useChatStore((s) => s.activeThreadId);
  const error = useChatStore((s) => s.error);
  const clearError = useChatStore((s) => s.clearError);
  const [conversationSidebarOpen, setConversationSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'conversations' | 'stats'>('conversations');

  return (
    <div className="h-[calc(100vh-80px)] flex bg-background">
      {/* Conversation Sidebar */}
      <div className={`${conversationSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 border-r border-border bg-card/50 backdrop-blur-sm overflow-hidden flex-shrink-0`}>
        {conversationSidebarOpen && (
          <div className="h-full flex flex-col">
            {/* Sidebar Tabs */}
            <div className="flex border-b border-border bg-background/50">
              <button
                onClick={() => setActiveTab('conversations')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'conversations'
                    ? 'text-primary border-b-2 border-primary bg-background'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Conversations
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'stats'
                    ? 'text-primary border-b-2 border-primary bg-background'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Stats
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'conversations' && (
                <div className="h-full p-4">
                  <ThreadList />
                </div>
              )}
              {activeTab === 'stats' && (
                <div className="h-full overflow-y-auto">
                  <ConversationStats />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="border-b border-border bg-background px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setConversationSidebarOpen(!conversationSidebarOpen)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              title={conversationSidebarOpen ? 'Hide conversations' : 'Show conversations'}
            >
              {conversationSidebarOpen ? (
                <PanelLeftClose className="h-5 w-5 text-muted-foreground" />
              ) : (
                <PanelLeftOpen className="h-5 w-5 text-muted-foreground" />
              )}
            </button>

            {activeThreadId && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">A</span>
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">
                    {useChatStore.getState().threads.find(t => t.id === activeThreadId)?.title || 'Chat with Aria'}
                  </h2>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Online</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Actions */}
          <div className="flex items-center gap-2">
            {/* Future: Add search, clear chat, etc. */}
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex flex-col relative">
          {isLoadingHistory && <LoadingHistoryBanner />}
          {error && <ErrorAlert message={error} onDismiss={clearError} />}
          {!activeThreadId && <NoActiveThreadNotice />}

          <ChatMessages />
          <MessageInputBar />
        </div>
      </div>
    </div>
  );
}