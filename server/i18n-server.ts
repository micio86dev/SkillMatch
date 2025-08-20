// Server-side translation helper for notifications
const translations: Record<string, string> = {
  // Notification messages
  'notifications.newMessage': 'New Message',
  'notifications.postLiked': 'Post Liked', 
  'notifications.commentLiked': 'Comment Liked',
  'notifications.projectLiked': 'Project Liked',
  'notifications.newComment': 'New Comment',
  'notifications.newFeedbackReceived': 'New Feedback Received',
  'notifications.messageSent': '{{name}} sent you a message: "{{preview}}"',
  'notifications.postLikedBy': '{{name}} liked your post',
  'notifications.commentLikedBy': '{{name}} liked your comment', 
  'notifications.projectLikedBy': '{{name}} liked your project',
  'notifications.commentedOnPost': '{{name}} commented on your post: "{{preview}}"',
  'notifications.feedbackReceived': '{{name}} left you {{rating}}-star feedback{{comment}}',
  'notifications.someone': 'Someone',
  'notifications.weeklyDigest': 'Your Weekly VibeSync Digest',
};

export function t(key: string, params?: Record<string, any>): string {
  let message = translations[key] || key;
  
  if (params) {
    Object.keys(params).forEach(param => {
      const regex = new RegExp(`{{${param}}}`, 'g');
      message = message.replace(regex, String(params[param]));
    });
  }
  
  return message;
}