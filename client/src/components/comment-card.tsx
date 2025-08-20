import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { LikeButton } from "@/components/like-button";
import { useTranslation } from "react-i18next";

interface CommentCardProps {
  comment: {
    id: string;
    content: string;
    likesCount: number;
    createdAt: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      profileImageUrl?: string;
    };
  };
}

export function CommentCard({ comment }: CommentCardProps) {
  const { t } = useTranslation();
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {comment.user.profileImageUrl ? (
              <img
                src={comment.user.profileImageUrl}
                alt={`${comment.user.firstName} ${comment.user.lastName}`}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-medium text-sm text-slate-900 dark:text-white">
                {comment.user.firstName} {comment.user.lastName}
              </h4>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              {comment.content}
            </p>
            
            <LikeButton
              itemType="comments"
              itemId={comment.id}
              initialLikeCount={comment.likesCount || 0}
              size="sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}