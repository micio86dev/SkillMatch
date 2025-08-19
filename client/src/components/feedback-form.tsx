import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, MessageSquare, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FeedbackFormProps {
  professionalId: string;
  professionalName: string;
  professionalImage?: string;
  projectId?: string;
  onSuccess?: () => void;
}

interface Project {
  id: string;
  title: string;
}

export function FeedbackForm({ 
  professionalId, 
  professionalName, 
  professionalImage,
  projectId,
  onSuccess 
}: FeedbackFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || "");
  
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Only show to company users
  if (user?.userType !== 'company') {
    return null;
  }

  const createFeedbackMutation = useMutation({
    mutationFn: async (data: { toUserId: string; rating: number; comment: string; projectId?: string }) => {
      return apiRequest("/api/feedback", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted",
        description: "Your feedback has been submitted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/feedback/${professionalId}`] });
      setIsOpen(false);
      setRating(0);
      setComment("");
      setSelectedProjectId("");
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
      console.error("Feedback submission error:", error);
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    createFeedbackMutation.mutate({
      toUserId: professionalId,
      rating,
      comment: comment.trim(),
      projectId: selectedProjectId || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center space-x-2">
          <MessageSquare className="h-4 w-4" />
          <span>Leave Feedback</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              {professionalImage ? (
                <AvatarImage src={professionalImage} alt={professionalName} />
              ) : (
                <AvatarFallback>
                  <User className="w-5 h-5" />
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <span>Feedback for {professionalName}</span>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-normal">
                Share your experience working with this professional
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Rating Section */}
          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star 
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-current' 
                        : 'text-slate-300 dark:text-slate-600'
                    }`} 
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {rating === 0 && "Click to rate"}
              {rating === 1 && "Poor - Unsatisfactory work"}
              {rating === 2 && "Fair - Below expectations"}
              {rating === 3 && "Good - Meets expectations"}
              {rating === 4 && "Very Good - Exceeds expectations"}
              {rating === 5 && "Excellent - Outstanding work"}
            </p>
          </div>

          {/* Project Selection */}
          <div className="space-y-2">
            <Label>Project (Optional)</Label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project this feedback relates to" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No specific project</SelectItem>
                {/* Note: In a real implementation, you'd fetch user's projects here */}
                <SelectItem value="general">General collaboration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Comment Section */}
          <div className="space-y-2">
            <Label>Comments (Optional)</Label>
            <Textarea
              placeholder="Share details about your experience working with this professional. What did they do well? How was their communication and work quality?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 text-right">
              {comment.length}/500 characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={createFeedbackMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={rating === 0 || createFeedbackMutation.isPending}
          >
            {createFeedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Simpler version for quick feedback
export function QuickFeedbackButton({ professionalId, className = "" }: { 
  professionalId: string; 
  className?: string;
}) {
  const { user } = useAuth();
  
  // Only show to company users
  if (user?.userType !== 'company') {
    return null;
  }

  return (
    <FeedbackForm
      professionalId={professionalId}
      professionalName="this professional"
      professionalImage=""
    />
  );
}