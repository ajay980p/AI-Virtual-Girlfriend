"use client";

import { useChatStore } from "@/store/chat.store";
import { useUIStore } from "@/store/ui.store";

export default function ChatMessages() {
    const activeThreadId = useChatStore((s) => s.activeThreadId);
    const messages = useChatStore((s) => (activeThreadId ? s.messagesByThread[activeThreadId] || [] : []));
    const typing = useUIStore((s) => s.assistantTyping);

    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                    {message.role === "assistant" && (
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-xs text-white">♥️</span>
                            </div>
                            <span className="text-muted-foreground text-sm">Aria</span>
                        </div>
                    )}

                    <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                            className={`max-w-sm lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl ${message.role === "user" ? "bg-primary text-white" : "bg-card text-card-foreground"
                                }`}
                        >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                    </div>

                    <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <span className="text-xs text-muted-foreground">
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                    </div>
                </div>
            ))}

            {/* Typing Indicator */}
            {typing && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">♥️</span>
                        </div>
                        <span className="text-muted-foreground text-sm">Aria</span>
                    </div>
                    <div className="flex justify-start">
                        <div className="bg-card text-card-foreground px-4 py-3 rounded-2xl">
                            <div className="flex items-center gap-1">
                                <span className="text-sm text-muted-foreground">Aria is thinking</span>
                                <div className="flex items-center gap-1 ml-2">
                                    <span className="inline-flex h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                                    <span className="inline-flex h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                                    <span className="inline-flex h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
