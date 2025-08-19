import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Video } from "lucide-react";
import { ConversationList } from "@/components/conversation-list";
import { ConversationHeader } from "@/components/conversation-header";
import { MessageItem } from "@/components/message-item";
import { VideoCallButton } from "@/components/video-call-button";

export default function Messages() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  
  // Mock data for demonstration - in real app this would come from API
  const [conversations] = useState([
    {
      id: '1',
      contact: {
        id: 'user1',
        name: 'Sarah Chen',
        title: 'Senior Frontend Developer',
        profileImageUrl: undefined,
        isOnline: true
      },
      lastMessage: {
        content: 'Thanks for reviewing my portfolio. When can we schedule a call?',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        senderId: 'user1'
      },
      unreadCount: 2
    },
    {
      id: '2', 
      contact: {
        id: 'company1',
        name: 'TechStart Inc.',
        title: 'Hiring Manager',
        profileImageUrl: undefined,
        isOnline: false
      },
      lastMessage: {
        content: 'We\'d love to discuss the React position with you',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        senderId: 'company1'
      },
      unreadCount: 0
    }
  ]);
  
  const [messages] = useState([
    {
      id: '1',
      content: 'Hi! I saw your profile and I\'m interested in discussing potential collaboration.',
      senderId: 'user1',
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
      isRead: true
    },
    {
      id: '2',
      content: 'That sounds great! I\'d love to hear more about your project.',
      senderId: user?.id || 'current',
      createdAt: new Date(Date.now() - 1000 * 60 * 25),
      isRead: true
    },
    {
      id: '3',
      content: 'Thanks for reviewing my portfolio. When can we schedule a call?',
      senderId: 'user1',
      createdAt: new Date(Date.now() - 1000 * 60 * 15),
      isRead: false
    }
  ]);
  
  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const conversationMessages = selectedConversationId ? messages : [];

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || (!isAuthenticated && !isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversationId) return;
    
    // In a real app, this would send the message via API
    toast({
      title: "Message sent!",
      description: "Your message has been delivered.",
    });
    
    setNewMessage("");
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Sidebar - Conversation List */}
        <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <ConversationList 
            conversations={conversations}
            selectedConversationId={selectedConversationId || undefined}
            onSelectConversation={setSelectedConversationId}
            currentUserId={user?.id || 'current'}
          />
        </div>
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900">
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <ConversationHeader 
                contact={selectedConversation.contact}
              />
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {conversationMessages.map((message) => {
                  const isOwn = message.senderId === (user?.id || 'current');
                  const sender = isOwn 
                    ? { name: user?.firstName || 'You', profileImageUrl: user?.profileImageUrl || undefined }
                    : { name: selectedConversation.contact.name, profileImageUrl: selectedConversation.contact.profileImageUrl };
                  
                  return (
                    <MessageItem 
                      key={message.id}
                      message={message}
                      sender={sender}
                      isOwn={isOwn}
                      currentUserId={user?.id || 'current'}
                    />
                  );
                })}
              </div>
              
              {/* Message Input */}
              <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-1 flex items-center space-x-2">
                    <Input 
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <VideoCallButton 
                    recipientId={selectedConversation.contact.id}
                    recipientName={selectedConversation.contact.name}
                    recipientImageUrl={selectedConversation.contact.profileImageUrl}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Select a conversation
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Choose a conversation from the sidebar to start messaging
                </p>
                <VideoCallButton 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}