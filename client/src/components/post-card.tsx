import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Share, MoreHorizontal, User } from "lucide-react";
import { Post, User as UserType } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { LikeButton } from "@/components/like-button";

interface PostCardProps {
  post: Post & { user: UserType };
}

export function PostCard({ post }: PostCardProps) {
  const { user } = post;
  const [showComments, setShowComments] = useState(false);

  return (
    <Card>
      <CardContent className="p-6">
        {/* Post header */}
        <div className="flex items-center space-x-3 mb-4">
          {user.profileImageUrl ? (
            <img 
              src={user.profileImageUrl} 
              alt={`${user.firstName} ${user.lastName}`}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
          )}
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900 dark:text-white">
              {user.firstName} {user.lastName}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {formatDistanceToNow(new Date(post.createdAt || ''))} ago
            </p>
          </div>
          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="More options">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Post content */}
        <div className="mb-4">
          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
            {post.content}
          </p>
        </div>

        {/* Post actions */}
        <div className="flex items-center space-x-6 text-sm text-slate-600 dark:text-slate-400">
          <LikeButton
            itemType="posts"
            itemId={post.id}
            initialLikeCount={post.likesCount || 0}
          />

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare className="h-4 w-4" />
            <span>{post.commentsCount || 0} comments</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium"
          >
            <Share className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Comments feature coming soon...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
