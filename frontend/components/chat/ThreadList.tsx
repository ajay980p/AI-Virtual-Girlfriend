"use client";

import { useState, useEffect } from "react";
import { useChatStore } from "@/store/chat.store";
import { Plus, MoreHorizontal, Trash2, Edit3 } from "lucide-react";
import ConversationHistory from "./ConversationHistory";

export default function ThreadList() {
  const threads = useChatStore((s) => s.threads);
  const activeId = useChatStore((s) => s.activeThreadId);
  const createThread = useChatStore((s) => s.createThread);
  const selectThread = useChatStore((s) => s.selectThread);
  const deleteThread = useChatStore((s) => s.deleteThread);
  const updateThreadTitle = useChatStore((s) => s.updateThreadTitle);
  const isLoading = useChatStore((s) => s.isLoading);
  const isLoadingHistory = useChatStore((s) => s.isLoadingHistory);

  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenuId(null);
    };

    if (contextMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenuId]);

  const handleCreateThread = async () => {
    try {
      await createThread();
    } catch (error) {
      console.error('Failed to create thread:', error);
    }
  };

  const handleDeleteThread = async (threadId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this conversation?')) {
      try {
        await deleteThread(threadId);
      } catch (error) {
        console.error('Failed to delete thread:', error);
      }
    }
    setContextMenuId(null);
  };

  const handleEditTitle = (thread: any, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingId(thread.id);
    setEditTitle(thread.title);
    setContextMenuId(null);
  };

  const handleSaveTitle = async (threadId: string) => {
    if (editTitle.trim() && editTitle !== threads.find(t => t.id === threadId)?.title) {
      try {
        await updateThreadTitle(threadId, editTitle.trim());
      } catch (error) {
        console.error('Failed to update title:', error);
      }
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, threadId: string) => {
    if (e.key === 'Enter') {
      handleSaveTitle(threadId);
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditTitle('');
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-gradient-to-r from-primary to-secondary animate-pulse" />
          <h3 className="text-sm font-bold">Conversations</h3>
          {isLoadingHistory && (
            <div className="animate-spin h-3 w-3 border border-primary border-t-transparent rounded-full"></div>
          )}
        </div>
        <button
          className="group inline-flex items-center gap-2 rounded-xl glass border border-border/50 px-3 py-2 text-xs font-medium transition-all duration-200 hover:scale-105 hover:bg-card/50 hover:shadow-md hover:border-primary/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleCreateThread}
          disabled={isLoading}
        >
          <Plus className={`h-4 w-4 transition-transform duration-200 group-hover:rotate-90 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Creating...' : 'New'}</span>
        </button>
      </div>

      {/* Thread List */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {/* Current/Active Threads */}
        {threads.length === 0 && !isLoadingHistory ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/10">
              <span className="text-xl opacity-60">💬</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground">No conversations</p>
            <p className="text-xs text-muted-foreground mt-1">Click "New" to start</p>
          </div>
        ) : (
          threads.map((t, index) => (
            <div key={t.id} className="relative">
              <div
                onClick={() => selectThread(t.id)}
                className={`group w-full rounded-2xl p-4 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] animate-slide-up relative cursor-pointer ${activeId === t.id
                  ? "glass bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 shadow-lg shadow-primary/10"
                  : "hover:bg-card/30 hover:shadow-md"
                  }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {editingId === t.id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => handleSaveTitle(t.id)}
                          onKeyPress={(e) => handleKeyPress(e, t.id)}
                          className="text-sm font-semibold bg-transparent border-b border-primary outline-none flex-1"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <p className={`text-sm font-semibold truncate transition-colors duration-200 ${activeId === t.id ? "text-primary" : "text-foreground group-hover:text-primary"
                          }`}>
                          {t.title}
                        </p>
                      )}
                      {activeId === t.id && (
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate leading-relaxed">
                      {t.lastMessagePreview || "New conversation"}
                    </p>
                  </div>

                  {/* Context Menu Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setContextMenuId(contextMenuId === t.id ? null : t.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-secondary rounded transition-all duration-200"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </button>

                  {activeId === t.id && (
                    <div className="mt-1 text-primary transition-transform duration-200 group-hover:scale-110">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    </div>
                  )}
                </div>
              </div>

              {/* Context Menu */}
              {contextMenuId === t.id && (
                <div className="absolute right-2 top-12 z-50 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[120px]">
                  <button
                    onClick={(e) => handleEditTitle(t, e)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-secondary flex items-center gap-2"
                  >
                    <Edit3 className="h-3 w-3" />
                    Rename
                  </button>
                  <button
                    onClick={(e) => handleDeleteThread(t.id, e)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-destructive/10 text-destructive flex items-center gap-2"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}

        {/* Conversation History */}
        <ConversationHistory />
      </div>
    </div>
  );
}