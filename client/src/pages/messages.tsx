import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
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
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Messages() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  
  const {
    conversations,
    messages,
    currentConversationId,
    isConnected,
    typingUsers,
    conversationsLoading,
    messagesLoading,
    sendingMessage,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTypingIndicator,
  } = useChat();
  
  const selectedConversation = conversations.find(c => c.id === currentConversationId);
  const conversationMessages = messages || [];

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Handle starting a conversation from the professionals page
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    
    const startConversationData = sessionStorage.getItem('startConversation');
    if (startConversationData) {
      try {
        const conversationInfo = JSON.parse(startConversationData);
        sessionStorage.removeItem('startConversation'); // Clean up
        
        // Join the conversation with the professional
        if (conversationInfo.userId && conversationInfo.userId !== user.id) {
          joinConversation(conversationInfo.userId);
          toast({
            title: "Chat Started",
            description: `You can now chat with ${conversationInfo.name || 'this professional'}`,
          });
        }
      } catch (error) {
        console.error('Error parsing conversation data:', error);
        sessionStorage.removeItem('startConversation'); // Clean up on error
      }
    }
  }, [isAuthenticated, user?.id, joinConversation, toast]);

  if (isLoading || (!isAuthenticated && !isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentConversationId) return;
    
    try {
      await sendMessage(newMessage);
      setNewMessage("");
    } catch (error) {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    sendTypingIndicator(true);
  };
  
  // Handle conversation selection
  const handleSelectConversation = (conversationId: string) => {
    joinConversation(conversationId);
  };

  // Start a new conversation with a user
  const handleStartNewConversation = (userId: string) => {
    if (userId && userId !== user?.id) {
      joinConversation(userId);
    }
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row">
        {/* Sidebar - Conversation List */}
        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 md:max-h-full">
          {conversationsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ConversationList 
              conversations={conversations}
              selectedConversationId={currentConversationId || undefined}
              onSelectConversation={handleSelectConversation}
              currentUserId={user?.id || 'current'}
            />
          )}
        </div>
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 min-h-0">
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <ConversationHeader 
                contact={selectedConversation.contact}
              />
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 md:space-y-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <>
                    {conversationMessages.map((message) => {
                      const isOwn = message.senderId === (user?.id || 'current');
                      const sender = isOwn 
                        ? { name: user?.firstName || 'You', profileImageUrl: user?.profileImageUrl || undefined }
                        : { name: selectedConversation?.contact.name || 'User', profileImageUrl: selectedConversation?.contact.profileImageUrl };
                      
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
                    
                    {/* Typing indicators */}
                    {Array.from(typingUsers).map(userId => (
                      userId !== user?.id && (
                        <div key={userId} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                          <span>{selectedConversation?.contact.name || 'User'} is typing...</span>
                        </div>
                      )
                    ))}
                  </>
                )}
              </div>
              
              {/* Message Input */}
              <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-2 md:p-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="flex-1 flex items-center gap-2">
                    <Input 
                      placeholder={!isConnected ? "Connecting..." : "Type your message..."}
                      value={newMessage}
                      onChange={handleInputChange}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      className="flex-1"
                      aria-label="Message input"
                      disabled={!isConnected || sendingMessage}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || !isConnected || sendingMessage}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3"
                      aria-label="Send message"
                    >
                      <Send className="h-4 w-4 md:mr-1" />
                      <span className="hidden md:inline">{sendingMessage ? 'Sending...' : 'Send'}</span>
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