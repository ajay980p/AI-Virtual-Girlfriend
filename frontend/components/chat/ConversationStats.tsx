"use client";

import { useState, useEffect } from "react";
import { BarChart3, MessageCircle, Calendar, Heart, TrendingUp, Download } from "lucide-react";
import { conversationAPI } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

interface ConversationStats {
    totalConversations: number;
    totalMessages: number;
    averageMessagesPerConversation: number;
    mostActiveDay: string;
    favoriteTopics: string[];
}

export default function ConversationStats() {
    const [stats, setStats] = useState<ConversationStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    useEffect(() => {
        if (!isAuthenticated) return;

        const loadStats = async () => {
            try {
                setLoading(true);
                const data = await conversationAPI.getStats();
                setStats(data);
            } catch (err) {
                console.error('Error loading conversation stats:', err);
                setError(err instanceof Error ? err.message : 'Failed to load stats');
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className="p-6 text-center">
                <p className="text-muted-foreground">Please log in to view your conversation statistics.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Your Chat Statistics</h3>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-4 bg-secondary rounded mb-2"></div>
                            <div className="h-3 bg-secondary rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Your Chat Statistics</h3>
                </div>
                <p className="text-muted-foreground text-sm">Unable to load statistics: {error}</p>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Your Chat Statistics</h3>
                </div>
                <p className="text-muted-foreground text-sm">No statistics available yet. Start chatting to see your stats!</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Your Chat Statistics</h3>
                </div>
                {stats && (
                    <button
                        onClick={() => {
                            const statsText = `AI Virtual Girlfriend - Chat Statistics

Total Conversations: ${stats.totalConversations}
Total Messages: ${stats.totalMessages}
Average Messages per Conversation: ${stats.averageMessagesPerConversation}
Most Active Day: ${stats.mostActiveDay}
Favorite Topics: ${stats.favoriteTopics.join(', ')}

Generated on: ${new Date().toLocaleDateString()}`;

                            const blob = new Blob([statsText], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'chat-statistics.txt';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                        }}
                        className="p-2 rounded-lg hover:bg-secondary transition-colors"
                        title="Export statistics"
                    >
                        <Download className="h-4 w-4 text-muted-foreground" />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                {/* Total Conversations */}
                <div className="bg-card rounded-lg p-3 border border-border">
                    <div className="flex items-center gap-2 mb-1">
                        <MessageCircle className="h-4 w-4 text-primary" />
                        <span className="text-xs text-muted-foreground">Conversations</span>
                    </div>
                    <div className="text-lg font-semibold text-foreground">{stats.totalConversations}</div>
                </div>

                {/* Total Messages */}
                <div className="bg-card rounded-lg p-3 border border-border">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-muted-foreground">Messages</span>
                    </div>
                    <div className="text-lg font-semibold text-foreground">{stats.totalMessages}</div>
                </div>

                {/* Average Messages */}
                <div className="bg-card rounded-lg p-3 border border-border">
                    <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-xs text-muted-foreground">Avg/Chat</span>
                    </div>
                    <div className="text-lg font-semibold text-foreground">{stats.averageMessagesPerConversation}</div>
                </div>

                {/* Most Active Day */}
                <div className="bg-card rounded-lg p-3 border border-border">
                    <div className="flex items-center gap-2 mb-1">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-muted-foreground">Active Day</span>
                    </div>
                    <div className="text-sm font-semibold text-foreground truncate">{stats.mostActiveDay}</div>
                </div>
            </div>

            {/* Favorite Topics */}
            {stats.favoriteTopics.length > 0 && (
                <div className="bg-card rounded-lg p-3 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                        <Heart className="h-4 w-4 text-pink-500" />
                        <span className="text-sm text-muted-foreground">Favorite Topics</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {stats.favoriteTopics.slice(0, 5).map((topic, index) => (
                            <span
                                key={topic}
                                className={`text-xs px-2 py-1 rounded-full ${index === 0
                                        ? 'bg-primary text-white'
                                        : 'bg-secondary text-muted-foreground'
                                    }`}
                            >
                                {topic}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
