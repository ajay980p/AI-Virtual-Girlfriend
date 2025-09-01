import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useChatStore } from '@/store/chat.store';

/**
 * Hook to automatically load chat history when user authentication state changes
 */
export const useChatHistory = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loadUserConversations = useChatStore((state) => state.loadUserConversations);
  const isLoadingHistory = useChatStore((state) => state.isLoadingHistory);

  useEffect(() => {
    // Only load conversations if user is authenticated
    console.log('useChatHistory: Auth state changed', {
      isAuthenticated,
      userId: user?._id,
      userEmail: user?.email
    });
    
    if (isAuthenticated && user?._id) {
      console.log('User authenticated, loading chat history...');
      loadUserConversations();
    } else {
      console.log('User not authenticated or missing _id, skipping chat history load');
    }
  }, [isAuthenticated, user?._id, loadUserConversations]);

  return {
    isLoadingHistory,
  };
};

/**
 * Hook to load a specific conversation by ID
 */
export const useConversation = (conversationId?: string) => {
  const loadConversationById = useChatStore((state) => state.loadConversationById);
  const isLoading = useChatStore((state) => state.isLoading);
  const error = useChatStore((state) => state.error);

  useEffect(() => {
    if (conversationId) {
      loadConversationById(conversationId);
    }
  }, [conversationId, loadConversationById]);

  return {
    isLoading,
    error,
  };
};