import { User, Video } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VideoCallButton } from '@/components/video-call-button';

interface Conversation {
  id: string;
  contact: {
    id: string;
    name: string;
    profileImageUrl?: string;
    title?: string;
    isOnline?: boolean;
  };
  lastMessage: {
    content: string;
    timestamp: Date;
    senderId: string;
  };
  unreadCount: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  currentUserId: string;
}

export function ConversationList({ 
  conversations, 
  selectedConversationId, 
  onSelectConversation, 
  currentUserId 
}: ConversationListProps) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Messages</h2>
      </div>
      
      <div className="space-y-1 p-2">
        {conversations.length > 0 ? (
          conversations.map((conversation) => (
            <Card
              key={conversation.id}
              className={`p-3 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                selectedConversationId === conversation.id 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                  : 'border-slate-200 dark:border-slate-700'
              }`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="relative flex-shrink-0">
                    {conversation.contact.profileImageUrl ? (
                      <img 
                        src={conversation.contact.profileImageUrl} 
                        alt={conversation.contact.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                      </div>
                    )}
                    {conversation.contact.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {conversation.contact.name}
                      </h3>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 ml-2">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    {conversation.contact.title && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                        {conversation.contact.title}
                      </p>
                    )}
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate mt-1">
                      {conversation.lastMessage.senderId === currentUserId ? 'You: ' : ''}
                      {conversation.lastMessage.content}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 ml-2">
                  <div onClick={(e) => e.stopPropagation()}>
                    <VideoCallButton 
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              No conversations yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Start networking with professionals to begin messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
}