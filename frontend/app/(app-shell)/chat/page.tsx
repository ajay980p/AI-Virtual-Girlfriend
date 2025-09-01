"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Smile, Mic } from "lucide-react";
import { useChatStore } from "@/store/chat.store";
import { useUIStore } from "@/store/ui.store";
import { useChatHistory } from "@/hooks/useChatHistory";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'aria';
  timestamp: Date;
}

const EMOJIS = [
  '😊', '😂', '😍', '😘', '😉', '😎', '🤔', '🙄',
  '😮', '😢', '😭', '😱', '😡', '😌', '😴', '😷',
  '👍', '👎', '👌', '✌️', '👊', '❤️', '💔', '👏',
  '🚀', '✨', '🎉', '🎆', '🌈', '🌸', '🌺', '🎁'
];

export default function ChatPage() {
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  
  // Load chat history automatically when user logs in
  const { isLoadingHistory } = useChatHistory();
  
  // Use the chat store for proper backend integration
  const activeThreadId = useChatStore((s) => s.activeThreadId);
  const messages = useChatStore((s) => activeThreadId ? s.messagesByThread[activeThreadId] || [] : []);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const isLoading = useChatStore((s) => s.isLoading);
  const error = useChatStore((s) => s.error);
  const clearError = useChatStore((s) => s.clearError);
  const vibe = useUIStore((s) => s.vibe);
  const typing = useUIStore((s) => s.assistantTyping);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSendMessage = async () => {
    // Validation: Check if message is not empty and activeThreadId exists
    if (!newMessage.trim() || !activeThreadId || isLoading) {
      return;
    }
    
    // Clear any previous errors
    if (error) {
      clearError();
    }
    
    try {
      // Send message through the chat store (which handles backend integration)
      await sendMessage(activeThreadId, { content: newMessage, vibe });
      // Clear the input after successful send
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
      // Error handling is already managed by the chat store
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-background">
      {/* Loading History Indicator */}
      {isLoadingHistory && (
        <div className="mx-6 mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Loading your chat history...
            </p>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-start gap-2">
            <span className="text-red-500">⚠️</span>
            <div className="flex-1">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              <button
                onClick={clearError}
                className="mt-1 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Connection Status */}
      {!activeThreadId && (
        <div className="mx-6 mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            No active chat thread. Please create a new conversation.
          </p>
        </div>
      )}
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            {message.role === 'assistant' && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-xs text-white">♥️</span>
                </div>
                <span className="text-muted-foreground text-sm">Aria</span>
              </div>
            )}
            
            <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-sm lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl ${
                message.role === 'user' 
                  ? 'bg-primary text-white' 
                  : 'bg-card text-card-foreground'
              }`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
            
            <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <span className="text-xs text-muted-foreground">
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
      
      {/* Message Input Area */}
      <div className="border-t border-border p-6">
        <div className="flex items-center gap-3 relative">
          {/* Emoji button */}
          <div className="relative" ref={emojiPickerRef}>
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <Smile className="h-5 w-5" />
            </button>
            
            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2 bg-card border border-border rounded-lg p-4 shadow-lg z-10 w-80">
                <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
                  {EMOJIS.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => addEmoji(emoji)}
                      className="p-2 text-lg hover:bg-secondary rounded cursor-pointer transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Message input */}
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
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
            >
              <Mic className="h-5 w-5" />
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Coming Soon
            </div>
          </div>
          
          {/* Send button */}
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !activeThreadId || isLoading}
            className={`p-3 rounded-xl transition-all duration-200 cursor-pointer ${
              newMessage.trim() && activeThreadId && !isLoading
                ? 'bg-primary text-white hover:bg-primary/90 hover:scale-105'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}