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
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';

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
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

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
      
      // Trigger playful animation for new notification
      setHasNewNotification(true);
      setTimeout(() => setHasNewNotification(false), 2000);
      
      // Show toast for real-time notification
      // Don't show toast for message notifications when on Messages page
      const isOnMessagesPage = location === '/messages';
      const isMessageNotification = notification.type === 'message';
      
      if (!(isOnMessagesPage && isMessageNotification)) {
        toast({
          title: notification.title,
          description: notification.message,
        });
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [queryClient]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <motion.div
          whileHover={{ 
            scale: 1.05,
            rotate: [0, -5, 5, -5, 0],
            transition: { rotate: { duration: 0.3 } }
          }}
          whileTap={{ scale: 0.95 }}
          animate={{
            // Shake animation for new notifications
            x: hasNewNotification ? [-2, 2, -2, 2, 0] : 0,
            rotate: hasNewNotification ? [0, -10, 10, -10, 10, 0] : 0,
            // Gentle bounce for unread notifications
            y: unreadCount > 0 && !hasNewNotification ? [0, -2, 0] : 0
          }}
          transition={{
            x: { duration: 0.4, ease: "easeInOut" },
            rotate: { duration: 0.5, ease: "easeInOut" },
            y: { 
              duration: 1.5, 
              repeat: unreadCount > 0 ? Infinity : 0, 
              repeatDelay: 2,
              ease: "easeInOut"
            }
          }}
        >
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative group hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 overflow-hidden"
          >
            {/* Ripple effect on hover */}
            <motion.div
              className="absolute inset-0 rounded-md"
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{ 
                scale: [0, 1.2], 
                opacity: [0, 0.1, 0],
                transition: { duration: 0.6 }
              }}
              style={{
                background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)'
              }}
            />
            
            {/* Bell icon with subtle animations */}
            <motion.div
              animate={{
                rotate: unreadCount > 0 ? [0, 5, -5, 0] : 0
              }}
              transition={{
                duration: 2,
                repeat: unreadCount > 0 ? Infinity : 0,
                repeatDelay: 3,
                ease: "easeInOut"
              }}
            >
              <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" />
            </motion.div>
            
            {/* Animated notification badge */}
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                    rotate: [0, 10, -10, 0]
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 500, 
                    damping: 25,
                    rotate: { duration: 0.3 }
                  }}
                  className="absolute -top-1 -right-1"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        '0 0 0 0 rgba(239, 68, 68, 0.7)',
                        '0 0 0 4px rgba(239, 68, 68, 0)',
                        '0 0 0 0 rgba(239, 68, 68, 0)'
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Badge 
                      variant="destructive" 
                      className="h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-red-500 to-pink-500 border-white dark:border-gray-800 border-2 font-bold shadow-lg"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Subtle glow effect when there are notifications */}
            {unreadCount > 0 && (
              <motion.div
                className="absolute inset-0 rounded-md pointer-events-none"
                animate={{
                  opacity: [0.2, 0.4, 0.2],
                  scale: [0.95, 1.05, 0.95]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))',
                  filter: 'blur(8px)'
                }}
              />
            )}
          </Button>
        </motion.div>
      </SheetTrigger>
      
      {/* Animated sheet content */}
      <SheetContent className="w-[400px] sm:w-[540px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: isOpen ? 360 : 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <Bell className="h-5 w-5 text-blue-600" />
              </motion.div>
              <span>Notifications</span>
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                >
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount} new
                  </Badge>
                </motion.div>
              )}
            </SheetTitle>
          </SheetHeader>
          <NotificationList />
        </motion.div>
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
        {(notifications as Notification[]).map((notification: Notification, index: number) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              delay: index * 0.1, 
              duration: 0.3,
              ease: "easeOut"
            }}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            className={`p-4 rounded-lg border transition-all duration-200 ${
              notification.isRead 
                ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600' 
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700'
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
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
}