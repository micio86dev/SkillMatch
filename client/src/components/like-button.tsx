import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface LikeButtonProps {
  itemType: 'posts' | 'comments' | 'projects';
  itemId: string;
  initialLikeCount: number;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export function LikeButton({ itemType, itemId, initialLikeCount, className = '', size = 'sm' }: LikeButtonProps) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [optimisticLikeCount, setOptimisticLikeCount] = useState(initialLikeCount);

  // Check if item is liked by current user
  const { data: likeStatus } = useQuery({
    queryKey: [`/api/${itemType}/${itemId}/like-status`],
    enabled: isAuthenticated,
  });

  const isLiked = (likeStatus as { isLiked: boolean } | undefined)?.isLiked || false;

  const likeMutation = useMutation({
    mutationFn: async () => {
      const method = isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/${itemType}/${itemId}/like`, {
        method,
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to toggle like');
      return response.json();
    },
    onMutate: () => {
      // Optimistic update
      setOptimisticLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: [`/api/${itemType}/${itemId}/like-status`] });
      queryClient.invalidateQueries({ queryKey: [`/api/${itemType}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    },
    onError: (error) => {
      // Revert optimistic update
      setOptimisticLikeCount(prev => isLiked ? prev + 1 : prev - 1);
      console.error('Like error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update like. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleLike = () => {
    if (!isAuthenticated) {
      window.location.href = '/api/login';
      return;
    }
    likeMutation.mutate();
  };

  return (
    <Button
      variant="ghost"
      size={size}
      className={`flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium ${className}`}
      onClick={handleLike}
      disabled={likeMutation.isPending}
    >
      <Heart 
        className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} 
      />
      <span>{optimisticLikeCount || 0} likes</span>
    </Button>
  );
}