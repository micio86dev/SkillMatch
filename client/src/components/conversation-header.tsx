import { Button } from '@/components/ui/button';
import { Video, Phone, MoreVertical, User } from 'lucide-react';
import { VideoCallButton } from '@/components/video-call-button';

interface ConversationHeaderProps {
  contact: {
    id: string;
    name: string;
    profileImageUrl?: string;
    title?: string;
    isOnline?: boolean;
  };
  onStartCall?: () => void;
}

export function ConversationHeader({ contact, onStartCall }: ConversationHeaderProps) {
  return (
    <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            {contact.profileImageUrl ? (
              <img 
                src={contact.profileImageUrl} 
                alt={contact.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            )}
            {contact.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{contact.name}</h3>
            {contact.title && (
              <p className="text-sm text-slate-600 dark:text-slate-400">{contact.title}</p>
            )}
            {contact.isOnline && (
              <p className="text-xs text-green-600 dark:text-green-400">Online</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <VideoCallButton 
            recipientId={contact.id}
            recipientName={contact.name}
            recipientImageUrl={contact.profileImageUrl}
            size="sm"
            variant="outline"
            className="text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-600"
          />
          <Button 
            variant="outline" 
            size="sm"
            className="text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}