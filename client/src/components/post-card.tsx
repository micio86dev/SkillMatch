import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Share, MoreHorizontal, User, Send } from "lucide-react";
import { Post, User as UserType } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { LikeButton } from "@/components/like-button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface PostCardProps {
  post: Post & { user: UserType };
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: UserType;
  likesCount: number;
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
            <p className="text-sm text-slate-700 dark:text-slate-300">
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
        {showComments && <CommentSection postId={post.id} />}
      </CardContent>
    </Card>
  );
}

function CommentSection({ postId }: { postId: string }) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");

  // Fetch comments for this post
  const { data: comments = [], isLoading } = useQuery({
    queryKey: [`/api/posts/${postId}/comments`],
    refetchOnWindowFocus: false,
  }) as { data: Comment[]; isLoading: boolean };

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", `/api/posts/${postId}/comments`, { content });
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Success",
        description: "Comment added successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    createCommentMutation.mutate(newComment.trim());
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
      {/* Comment form */}
      <div className="flex space-x-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          {currentUser?.profileImageUrl ? (
            <img 
              src={currentUser.profileImageUrl} 
              alt="Your avatar" 
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <User className="w-4 h-4 text-primary" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[60px] resize-none text-sm"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || createCommentMutation.isPending}
              size="sm"
            >
              <Send className="mr-2 h-3 w-3" />
              {createCommentMutation.isPending ? "Posting..." : "Comment"}
            </Button>
          </div>
        </div>
      </div>

      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="w-24 h-3 bg-slate-300 dark:bg-slate-700 rounded"></div>
                  <div className="w-full h-4 bg-slate-300 dark:bg-slate-700 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                {comment.user.profileImageUrl ? (
                  <img 
                    src={comment.user.profileImageUrl} 
                    alt={`${comment.user.firstName} ${comment.user.lastName}`}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="font-medium text-sm text-slate-900 dark:text-white">
                    {comment.user.firstName} {comment.user.lastName}
                  </h5>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDistanceToNow(new Date(comment.createdAt))} ago
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
          No comments yet. Be the first to comment!
        </p>
      )}
    </div>
  );
}