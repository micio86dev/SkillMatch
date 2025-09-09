import { storage } from './storage';

// Create some test notifications for a user (useful for development/testing)
export async function createTestNotifications(userId: string) {
  try {
    // Create a message notification
    await storage.createNotification({
      userId,
      type: 'MESSAGE',
      title: 'New Message',
      message: 'John Doe sent you a message about the React project',
      relatedUserId: userId, // In real scenario, this would be the sender's ID
    });

    // Create a like notification
    await storage.createNotification({
      userId,
      type: 'LIKE',
      title: 'Post Liked',
      message: 'Sarah Wilson liked your post about TypeScript best practices',
      relatedUserId: userId,
    });

    // Create a comment notification
    await storage.createNotification({
      userId,
      type: 'COMMENT',
      title: 'New Comment',
      message: 'Mike Johnson commented on your post about project management',
      relatedUserId: userId,
    });

    // Create a feedback notification
    await storage.createNotification({
      userId,
      type: 'FEEDBACK',
      title: 'New Feedback',
      message: 'Emma Davis left you a 5-star feedback: "Excellent work on the project!"',
      relatedUserId: userId,
    });

    console.log('Test notifications created for user:', userId);
  } catch (error) {
    console.error('Error creating test notifications:', error);
  }
}

// Simple scheduling function (in production, use a proper cron job)
export function startWeeklyDigestScheduler() {
  // Run every Monday at 9 AM
  const now = new Date();
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + (8 - now.getDay()) % 7);
  nextMonday.setHours(9, 0, 0, 0);
  
  const timeUntilNextMonday = nextMonday.getTime() - now.getTime();
  
  setTimeout(async () => {
    // In a real implementation, this would send digests to all users
    console.log('Weekly digest scheduler would run here');
    
    // Schedule the next run
    setInterval(async () => {
      // In a real implementation, this would send digests to all users
      console.log('Weekly digest scheduler running...');
    }, 7 * 24 * 60 * 60 * 1000); // Run every week
  }, timeUntilNextMonday);
}