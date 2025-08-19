import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, X, Check, MessageCircle, Heart, MessageSquare, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatDistanceToNow } from 'date-fns';
import io from 'socket.io-client';

interface Notification {
  id: string;
  type: 'message' | 'like' | 'comment' | 'feedback';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedUser?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
}

export function NotificationBell() {
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<any>(null);

  // Get unread count
  const { data: unreadData } = useQuery({
    queryKey: ['/api/notifications/unread-count'],
    refetchInterval: 30000, // Refetch every 30 seconds as backup
  });

  const unreadCount = (unreadData as { count: number } | undefined)?.count || 0;

  // Setup Socket.IO connection for real-time notifications
  useEffect(() => {
    const newSocket = io({
      path: '/socket.io',
    });

    const userQuery = queryClient.getQueryData(['/api/auth/user']) as any;
    if (userQuery?.id) {
      newSocket.emit('authenticate', userQuery.id);
    }

    newSocket.on('notification', (notification: Notification) => {
      // Update unread count
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      
      // Show toast for real-time notification
      toast({
        title: notification.title,
        description: notification.message,
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [queryClient]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <NotificationList />
      </SheetContent>
    </Sheet>
  );
}

function NotificationList() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['/api/notifications'],
  }) as { data: Notification[]; isLoading: boolean };

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'feedback':
        return <Star className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <Bell className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">No notifications yet</p>
        <p className="text-sm text-gray-400 mt-1">We'll notify you when something happens</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
      <div className="space-y-4">
        {(notifications as Notification[]).map((notification: Notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border transition-colors ${
              notification.isRead 
                ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsReadMutation.mutate(notification.id)}
                      disabled={markAsReadMutation.isPending}
                      className="flex-shrink-0"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}