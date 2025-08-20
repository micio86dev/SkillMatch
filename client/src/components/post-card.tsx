import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, MoreHorizontal, User, Send, Edit, Trash2, Link, Copy } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Post, User as UserType } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { LikeButton } from "@/components/like-button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { SocialShare } from "@/components/social-share";
import { useTranslation } from "react-i18next";

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
  const { user: currentUser } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isOwnPost = currentUser?.id === post.userId;

  // Edit post mutation
  const editPostMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("PUT", `/api/posts/${post.id}`, { content });
    },
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Success",
        description: "Post updated successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/posts/${post.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Success",
        description: "Post deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveEdit = () => {
    if (!editContent.trim()) return;
    editPostMutation.mutate(editContent.trim());
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(post.content);
  };

  const handleDeletePost = () => {
    deletePostMutation.mutate();
    setShowDeleteDialog(false);
  };

  const getPostUrl = () => `${window.location.origin}/?post=${post.id}`;
  const getPostTitle = () => `${user.firstName} ${user.lastName} shared on DevConnect`;
  const getPostHashtags = () => ['DevConnect', 'Networking', 'ITJobs', 'TechCommunity'];

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
          {isOwnPost && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="More options">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Post content */}
        <div className="mb-4">
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[100px] resize-none"
                placeholder="What's on your mind?"
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={editPostMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={!editContent.trim() || editPostMutation.isPending}
                >
                  {editPostMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
              {post.content}
            </p>
          )}
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

          <SocialShare
            title={getPostTitle()}
            content={post.content}
            url={getPostUrl()}
            hashtags={getPostHashtags()}
            author={`${user.firstName} ${user.lastName}`}
          />
        </div>

        {/* Comments section */}
        {showComments && <CommentSection postId={post.id} />}
      </CardContent>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              className="bg-red-600 hover:bg-red-700"
              disabled={deletePostMutation.isPending}
            >
              {deletePostMutation.isPending ? t('projects.deleting') : t('projects.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

function CommentSection({ postId }: { postId: string }) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);

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

  // Edit comment mutation
  const editCommentMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      await apiRequest("PUT", `/api/comments/${commentId}`, { content });
    },
    onSuccess: () => {
      setEditingCommentId(null);
      setEditContent("");
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      toast({
        title: "Success",
        description: "Comment updated successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      await apiRequest("DELETE", `/api/comments/${commentId}`);
    },
    onSuccess: () => {
      setDeleteCommentId(null);
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Success",
        description: "Comment deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    createCommentMutation.mutate(newComment.trim());
  };

  const handleEditComment = (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditContent(content);
  };

  const handleSaveEdit = (commentId: string) => {
    if (!editContent.trim()) return;
    editCommentMutation.mutate({ commentId, content: editContent.trim() });
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  const handleDeleteComment = (commentId: string) => {
    deleteCommentMutation.mutate(commentId);
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
          {comments.map((comment) => {
            const isOwnComment = currentUser?.id === comment.user.id;
            const isEditing = editingCommentId === comment.id;
            
            return (
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
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDistanceToNow(new Date(comment.createdAt))} ago
                      </span>
                      {isOwnComment && !isEditing && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditComment(comment.id, comment.content)}>
                              <Edit className="h-3 w-3 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeleteCommentId(comment.id)}
                              className="text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="h-3 w-3 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[60px] resize-none text-sm"
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                          disabled={editCommentMutation.isPending}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(comment.id)}
                          disabled={!editContent.trim() || editCommentMutation.isPending}
                        >
                          {editCommentMutation.isPending ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">
                      {comment.content}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
          No comments yet. Be the first to comment!
        </p>
      )}

      {/* Delete comment confirmation dialog */}
      <AlertDialog open={!!deleteCommentId} onOpenChange={() => setDeleteCommentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCommentId && handleDeleteComment(deleteCommentId)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteCommentMutation.isPending}
            >
              {deleteCommentMutation.isPending ? t('projects.deleting') : t('projects.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}