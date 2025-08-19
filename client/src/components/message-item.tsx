import { formatDistanceToNow } from 'date-fns';
import { User, Check, CheckCheck } from 'lucide-react';

interface MessageItemProps {
  message: {
    id: string;
    content: string;
    senderId: string;
    createdAt: Date;
    isRead?: boolean;
  };
  sender: {
    name: string;
    profileImageUrl?: string;
  };
  isOwn: boolean;
  currentUserId: string;
}

export function MessageItem({ message, sender, isOwn, currentUserId }: MessageItemProps) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
        {!isOwn && (
          <div className="flex-shrink-0">
            {sender.profileImageUrl ? (
              <img 
                src={sender.profileImageUrl} 
                alt={sender.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
            )}
          </div>
        )}
        
        <div className={`px-4 py-2 rounded-lg ${
          isOwn 
            ? 'bg-blue-600 text-white' 
            : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
        }`}>
          <p className="text-sm">{message.content}</p>
          <div className={`flex items-center justify-end mt-1 space-x-1 ${
            isOwn ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
          }`}>
            <span className="text-xs">
              {formatDistanceToNow(message.createdAt, { addSuffix: true })}
            </span>
            {isOwn && (
              <div className="ml-1">
                {message.isRead ? (
                  <CheckCheck className="h-3 w-3" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}