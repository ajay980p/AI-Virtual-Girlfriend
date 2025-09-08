"use client";

import { useState } from "react";
import { Smile, Mic, Send } from "lucide-react";
import { useChatStore } from "@/store/chat.store";
import { useUIStore } from "@/store/ui.store";
import EmojiPicker from "./EmojiPicker";

export default function MessageInputBar() {
    const [newMessage, setNewMessage] = useState("");
    const [open, setOpen] = useState(false);

    const activeThreadId = useChatStore((s) => s.activeThreadId);
    const sendMessage = useChatStore((s) => s.sendMessage);
    const isLoading = useChatStore((s) => s.isLoading);
    const error = useChatStore((s) => s.error);
    const clearError = useChatStore((s) => s.clearError);
    const vibe = useUIStore((s) => s.vibe);

    const onSend = async () => {
        if (!newMessage.trim() || !activeThreadId || isLoading) return;
        if (error) clearError();
        try {
            await sendMessage(activeThreadId, { content: newMessage, vibe });
            setNewMessage("");
        } catch (err) {
            // handled in store
        }
    };

    return (
        <div className="border-t border-border p-6">
            <div className="flex items-center gap-3 relative">
                {/* Emoji button */}
                <div className="relative">
                    <button
                        onClick={() => setOpen((v) => !v)}
                        className="p-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        aria-label="Open emoji picker"
                        type="button"
                    >
                        <Smile className="h-5 w-5" />
                    </button>
                    <EmojiPicker
                        open={open}
                        onClose={() => setOpen(false)}
                        onSelect={(emoji) => {
                            setNewMessage((prev) => prev + emoji);
                            setOpen(false);
                        }}
                    />
                </div>

                {/* Message input */}
                <div className="flex-1 relative">
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                onSend();
                            }
                        }}
                        placeholder="Share your thoughts with Aria..."
                        className="w-full bg-input border border-border rounded-2xl px-4 py-3 pr-12 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none min-h-[50px] max-h-32"
                        rows={1}
                    />
                </div>

                {/* Mic button - disabled with tooltip */}
                <div className="relative group">
                    <button
                        disabled
                        className="p-3 text-muted-foreground cursor-not-allowed opacity-50 transition-colors"
                        title="Coming Soon"
                        aria-label="Voice input coming soon"
                        type="button"
                    >
                        <Mic className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Coming Soon
                    </div>
                </div>

                {/* Send button */}
                <button
                    onClick={onSend}
                    disabled={!newMessage.trim() || !activeThreadId || isLoading}
                    className={`p-3 rounded-xl transition-all duration-200 cursor-pointer ${newMessage.trim() && activeThreadId && !isLoading
                            ? "bg-primary text-white hover:bg-primary/90 hover:scale-105"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                        }`}
                    aria-label="Send message"
                    type="button"
                >
                    {isLoading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                        <Send className="h-5 w-5" />
                    )}
                </button>
            </div>
        </div>
    );
}
