import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
  createdAt: Date;
  sender?: {
    id: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
}

interface Conversation {
  id: string;
  contact: {
    id: string;
    name: string;
    title: string;
    profileImageUrl?: string;
    isOnline: boolean;
  };
  lastMessage: {
    content: string;
    timestamp: Date;
    senderId: string;
  };
  unreadCount: number;
}

export function useChat() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize WebSocket connection
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const newSocket = io(wsUrl, {
      transports: ['websocket'],
      forceNew: true,
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
      // Authenticate the user for real-time notifications and chat
      newSocket.emit('authenticate', user.id);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    });

    // Handle incoming messages
    newSocket.on('new-message', (message: Message) => {
      // Update conversations list
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      
      // Update current conversation if it's the active one
      if (currentConversationId === message.senderId) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/messages/conversation', message.senderId] 
        });
      }
      
      // Update unread count
      queryClient.invalidateQueries({ queryKey: ['/api/messages/unread-count'] });
    });

    // Handle typing indicators
    newSocket.on('user-typing', (data: { userId: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    });

    // Handle message read confirmations
    newSocket.on('messages-read', (data: { userId: string; conversationId: string }) => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/messages/conversation', data.conversationId] 
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user?.id, currentConversationId, queryClient]);

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['/api/conversations'],
    enabled: isAuthenticated,
  });

  // Fetch messages for current conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/messages/conversation', currentConversationId],
    enabled: isAuthenticated && !!currentConversationId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ receiverId, content }: { receiverId: string; content: string }) => {
      return apiRequest('POST', `/api/messages`, { receiverId, content });
    },
    onSuccess: () => {
      // Invalidate conversations and current conversation
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      if (currentConversationId) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/messages/conversation', currentConversationId] 
        });
      }
    },
  });

  // Join conversation
  const joinConversation = useCallback((conversationId: string) => {
    if (socket && user?.id) {
      // Leave previous conversation
      if (currentConversationId) {
        socket.emit('leave-conversation', currentConversationId, user.id);
      }
      
      // Join new conversation
      socket.emit('join-conversation', conversationId, user.id);
      setCurrentConversationId(conversationId);
      
      // Mark messages as read
      socket.emit('mark-messages-read', { conversationId, userId: user.id });
      
      // Clear typing users
      setTypingUsers(new Set());
    }
  }, [socket, user?.id, currentConversationId]);

  // Leave conversation
  const leaveConversation = useCallback(() => {
    if (socket && user?.id && currentConversationId) {
      socket.emit('leave-conversation', currentConversationId, user.id);
      setCurrentConversationId(null);
      setTypingUsers(new Set());
    }
  }, [socket, user?.id, currentConversationId]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (socket && user?.id && currentConversationId) {
      socket.emit('typing', {
        conversationId: currentConversationId,
        userId: user.id,
        isTyping,
      });
      
      // Auto-stop typing after 3 seconds
      if (isTyping) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          socket.emit('typing', {
            conversationId: currentConversationId,
            userId: user.id,
            isTyping: false,
          });
        }, 3000);
      }
    }
  }, [socket, user?.id, currentConversationId]);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!currentConversationId || !content.trim()) return;
    
    try {
      await sendMessageMutation.mutateAsync({
        receiverId: currentConversationId,
        content: content.trim(),
      });
      
      // Stop typing indicator
      sendTypingIndicator(false);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }, [currentConversationId, sendMessageMutation, sendTypingIndicator]);

  return {
    conversations: conversations as Conversation[],
    messages: messages as Message[],
    currentConversationId,
    isConnected,
    typingUsers,
    conversationsLoading,
    messagesLoading,
    sendingMessage: sendMessageMutation.isPending,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTypingIndicator,
  };
}