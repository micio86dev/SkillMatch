import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { toast } from './use-toast';
import { io, Socket } from 'socket.io-client';

export function useRealtimeNotifications() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Initialize Socket.IO connection
    const socket = io('/', {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to notification service');
      // Authenticate with user ID for notifications
      socket.emit('authenticate', user.id);
    });

    // Listen for real-time notifications
    socket.on('notification', (notification: any) => {
      console.log('Received notification:', notification);
      
      // Show toast notification
      toast({
        title: notification.title,
        description: notification.message,
        duration: 5000,
      });

      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      
      // Update notification counts
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
      
      // Refresh content based on notification type
      if (notification.type === 'like') {
        queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
        queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      } else if (notification.type === 'comment') {
        queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      } else if (notification.type === 'message') {
        queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from notification service');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user, queryClient]);

  return {
    isConnected: socketRef.current?.connected || false,
  };
}