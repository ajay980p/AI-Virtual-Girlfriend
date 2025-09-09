"use client";

import { useState, useEffect } from "react";
import { conversationAPI } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { MessageCircle, Calendar, MoreHorizontal, Trash2, Edit3 } from "lucide-react";
import { useChatStore } from "@/store/chat.store";

interface ConversationItem {
    id: string;
    title: string;
    lastMessageAt: string;
    lastMessagePreview: string;
    messageCount: number;
    isArchived: boolean;
}

export default function ConversationHistory() {
    const [contextMenuId, setContextMenuId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');

    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const threads = useChatStore((s) => s.threads);
    const activeThreadId = useChatStore((s) => s.activeThreadId);
    const isLoadingHistory = useChatStore((s) => s.isLoadingHistory);
    const error = useChatStore((s) => s.error);

    // Convert threads to conversation items for display, excluding the seed thread
    const conversations: ConversationItem[] = threads
        .filter(thread => thread.title !== "Welcome chat") // Exclude seed thread
        .map(thread => ({
            id: thread.id,
            title: thread.title,
            lastMessageAt: new Date(thread.updatedAt || thread.createdAt).toISOString(),
            lastMessagePreview: thread.lastMessagePreview || '',
            messageCount: 0, // We could calculate this from messagesByThread if needed
            isArchived: false
        }));

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

    const loadConversationById = useChatStore((s) => s.loadConversationById);
    const deleteThread = useChatStore((s) => s.deleteThread);
    const updateThreadTitle = useChatStore((s) => s.updateThreadTitle);

    const handleSelectConversation = async (conversationId: string) => {
        try {
            console.log('ConversationHistory: Selecting conversation', conversationId);
            // Load the full conversation with messages from the backend
            await loadConversationById(conversationId);
            console.log('ConversationHistory: Conversation loaded successfully');
        } catch (error) {
            console.error('Failed to load conversation:', error);
        }
    };

    const handleDeleteConversation = async (conversationId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        if (confirm('Are you sure you want to delete this conversation?')) {
            try {
                await deleteThread(conversationId);
            } catch (error) {
                console.error('Failed to delete conversation:', error);
            }
        }
        setContextMenuId(null);
    };

    const handleEditTitle = (conversation: ConversationItem, event: React.MouseEvent) => {
        event.stopPropagation();
        setEditingId(conversation.id);
        setEditTitle(conversation.title);
        setContextMenuId(null);
    };

    const handleSaveTitle = async (conversationId: string) => {
        if (editTitle.trim() && editTitle !== conversations.find(c => c.id === conversationId)?.title) {
            try {
                await updateThreadTitle(conversationId, editTitle.trim());
            } catch (error) {
                console.error('Failed to update title:', error);
            }
        }
        setEditingId(null);
        setEditTitle('');
    };

    const handleKeyPress = (e: React.KeyboardEvent, conversationId: string) => {
        if (e.key === 'Enter') {
            handleSaveTitle(conversationId);
        } else if (e.key === 'Escape') {
            setEditingId(null);
            setEditTitle('');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        return date.toLocaleDateString();
    };

    if (!isAuthenticated) {
        return null;
    }

    if (isLoadingHistory) {
        return (
            <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>Loading conversation history...</span>
                </div>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                        <div className="h-16 bg-secondary rounded-lg mb-2"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>Conversation History</span>
                </div>
                <p className="text-xs text-red-400">{error}</p>
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>Conversation History</span>
                </div>
                <div className="text-center py-4">
                    <p className="text-xs text-muted-foreground">No conversation history yet</p>
                </div>
            </div>
        );
    }

    return (
        <div className="border-t border-border mt-4 pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 px-3">
                <Calendar className="h-4 w-4" />
                <span>Conversation History</span>
                <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                    {conversations.length}
                </span>
            </div>

            <div className="space-y-2">
                {conversations.map((conversation, index) => (
                    <div key={conversation.id} className="relative">
                        <div
                            onClick={() => handleSelectConversation(conversation.id)}
                            className={`group w-full rounded-lg p-3 text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] animate-slide-up relative cursor-pointer ${activeThreadId === conversation.id
                                ? "bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/20 shadow-sm"
                                : "hover:bg-card/20 hover:shadow-sm"
                                }`}
                            style={{ animationDelay: `${index * 0.03}s` }}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <MessageCircle className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                        {editingId === conversation.id ? (
                                            <input
                                                type="text"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                onBlur={() => handleSaveTitle(conversation.id)}
                                                onKeyPress={(e) => handleKeyPress(e, conversation.id)}
                                                className="text-sm font-medium bg-transparent border-b border-primary outline-none flex-1"
                                                autoFocus
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        ) : (
                                            <p className={`text-sm font-medium truncate transition-colors duration-200 ${activeThreadId === conversation.id ? "text-primary" : "text-foreground group-hover:text-primary"
                                                }`}>
                                                {conversation.title}
                                            </p>
                                        )}
                                        {activeThreadId === conversation.id && (
                                            <div className="h-1 w-1 rounded-full bg-primary animate-pulse flex-shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate mb-1">
                                        {conversation.lastMessagePreview || "No messages yet"}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{formatDate(conversation.lastMessageAt)}</span>
                                        <span>•</span>
                                        <span>{conversation.messageCount} messages</span>
                                    </div>
                                </div>

                                {/* Context Menu Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setContextMenuId(contextMenuId === conversation.id ? null : conversation.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-secondary rounded transition-all duration-200"
                                >
                                    <MoreHorizontal className="h-3 w-3" />
                                </button>
                            </div>
                        </div>

                        {/* Context Menu */}
                        {contextMenuId === conversation.id && (
                            <div className="absolute right-2 top-12 z-50 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[120px]">
                                <button
                                    onClick={(e) => handleEditTitle(conversation, e)}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-secondary flex items-center gap-2"
                                >
                                    <Edit3 className="h-3 w-3" />
                                    Rename
                                </button>
                                <button
                                    onClick={(e) => handleDeleteConversation(conversation.id, e)}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-destructive/10 text-destructive flex items-center gap-2"
                                >
                                    <Trash2 className="h-3 w-3" />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
