import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, User, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface FeedbackItem {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  fromUser: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    userType: string;
  };
  projectId?: string;
}

interface FeedbackDisplayProps {
  userId: string;
  showAll?: boolean;
  limit?: number;
}

export function FeedbackDisplay({ userId, showAll = false, limit = 3 }: FeedbackDisplayProps) {
  const [showAllFeedback, setShowAllFeedback] = useState(showAll);

  const { data: feedbackList = [], isLoading } = useQuery<FeedbackItem[]>({
    queryKey: [`/api/feedback/${userId}`],
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-full mb-2"></div>
                    <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!Array.isArray(feedbackList) || feedbackList.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No feedback yet
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            This professional hasn't received any feedback from clients yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const displayedFeedback = showAllFeedback ? feedbackList : feedbackList.slice(0, limit);
  const averageRating = Array.isArray(feedbackList) && feedbackList.length > 0 
    ? feedbackList.reduce((sum: number, item: FeedbackItem) => sum + item.rating, 0) / feedbackList.length 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span>Client Feedback</span>
            <div className="flex items-center space-x-2">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-4 w-4 ${star <= Math.round(averageRating) ? 'fill-current' : ''}`} 
                  />
                ))}
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {averageRating.toFixed(1)} ({Array.isArray(feedbackList) ? feedbackList.length : 0} review{Array.isArray(feedbackList) && feedbackList.length !== 1 ? 's' : ''})
              </span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayedFeedback.map((item: FeedbackItem) => (
          <FeedbackCard key={item.id} feedback={item} />
        ))}
        
        {!showAllFeedback && Array.isArray(feedbackList) && feedbackList.length > limit && (
          <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button 
              variant="outline" 
              onClick={() => setShowAllFeedback(true)}
            >
              View All {feedbackList.length} Reviews
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FeedbackCard({ feedback }: { feedback: FeedbackItem }) {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
            {feedback.fromUser.profileImageUrl ? (
              <img 
                src={feedback.fromUser.profileImageUrl} 
                alt={feedback.fromUser.firstName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-slate-500" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-slate-900 dark:text-white">
                {feedback.fromUser.firstName} {feedback.fromUser.lastName}
              </span>
              <Badge variant="outline" className="text-xs">
                {feedback.fromUser.userType === 'company' ? 'Company' : 'Professional'}
              </Badge>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex text-yellow-400">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star} 
              className={`h-4 w-4 ${star <= feedback.rating ? 'fill-current' : ''}`} 
            />
          ))}
        </div>
      </div>
      
      {feedback.comment && (
        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
          "{feedback.comment}"
        </p>
      )}
    </div>
  );
}

// Compact version for professional cards
interface CompactRatingProps {
  userId: string;
  className?: string;
}

export function CompactRating({ userId, className = "" }: CompactRatingProps) {
  const { data: feedbackList = [] } = useQuery<FeedbackItem[]>({
    queryKey: [`/api/feedback/${userId}`],
    enabled: !!userId,
  });

  if (!Array.isArray(feedbackList) || feedbackList.length === 0) {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        <div className="flex text-slate-300 dark:text-slate-600">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="h-3 w-3" />
          ))}
        </div>
        <span className="text-sm text-slate-500 dark:text-slate-400">No reviews</span>
      </div>
    );
  }

  const averageRating = feedbackList.reduce((sum: number, item: FeedbackItem) => sum + item.rating, 0) / feedbackList.length;

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="flex text-yellow-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`h-3 w-3 ${star <= Math.round(averageRating) ? 'fill-current' : ''}`} 
          />
        ))}
      </div>
      <span className="text-sm text-slate-700 dark:text-slate-300">
        {averageRating.toFixed(1)} ({feedbackList.length})
      </span>
    </div>
  );
}