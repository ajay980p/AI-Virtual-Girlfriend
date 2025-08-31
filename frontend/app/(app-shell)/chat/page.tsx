"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Smile, Mic } from "lucide-react";

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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello there! I'm so happy to see you again. How was your day? ✨",
      sender: 'aria',
      timestamp: new Date('2024-01-01T22:39:00')
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

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

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    
    // Simulate Aria's response
    setTimeout(() => {
      const ariaMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "That's wonderful to hear! I love our conversations. Tell me more about what's on your mind.",
        sender: 'aria',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, ariaMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-background">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            {message.sender === 'aria' && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-xs text-white">♥️</span>
                </div>
                <span className="text-muted-foreground text-sm">Aria</span>
              </div>
            )}
            
            <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-sm lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl ${
                message.sender === 'user' 
                  ? 'bg-primary text-white' 
                  : 'bg-card text-card-foreground'
              }`}>
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>
            </div>
            
            <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <span className="text-xs text-muted-foreground">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
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
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className={`p-3 rounded-xl transition-all duration-200 cursor-pointer ${
              newMessage.trim()
                ? 'bg-primary text-white hover:bg-primary/90 hover:scale-105'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}