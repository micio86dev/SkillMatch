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
    <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-3 md:p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            {contact.profileImageUrl ? (
              <img 
                src={contact.profileImageUrl} 
                alt={`${contact.name}'s profile picture`}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
              </div>
            )}
            {contact.isOnline && (
              <div className="absolute bottom-0 right-0 w-2 h-2 md:w-3 md:h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full" aria-label="Online"></div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate text-sm md:text-base">{contact.name}</h3>
            {contact.title && (
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 truncate">{contact.title}</p>
            )}
            {contact.isOnline && (
              <p className="text-xs text-green-600 dark:text-green-400">Online</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
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
            aria-label="Start voice call"
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="More options"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}