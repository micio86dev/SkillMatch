import { storage } from './storage';
import { notificationService } from './notifications';

export async function sendWeeklyDigests() {
  try {
    console.log('Starting weekly digest process...');
    
    // For now, we'll skip getting all users since we don't have a getUsers method
    // In production, you'd implement storage.getUsers() or iterate through user IDs
    console.log('Weekly digest would be sent to all users with enabled preferences');
    
    // In production, iterate through users here
    // for (const user of users) {
    //   const preferences = await storage.getNotificationPreferences(user.id);
    //   if (preferences?.weeklyDigest) {
    //     await notificationService.sendWeeklyDigest(user.id);
    //     console.log(`Weekly digest sent to user: ${user.email}`);
    //   }
    // }
    
    console.log('Weekly digest process completed');
  } catch (error) {
    console.error('Error sending weekly digests:', error);
  }
}

// Function to create test notifications for demonstration
export async function createTestNotifications(userId: string) {
  try {
    // Create test notifications
    await storage.createNotification({
      userId,
      type: 'message',
      title: 'New Message',
      message: 'John Doe sent you a message about the React project',
      relatedUserId: userId, // In real scenario, this would be the sender's ID
    });

    await storage.createNotification({
      userId,
      type: 'like',
      title: 'Post Liked',
      message: 'Sarah Wilson liked your post about TypeScript best practices',
      relatedUserId: userId,
    });

    await storage.createNotification({
      userId,
      type: 'comment',
      title: 'New Comment',
      message: 'Mike Johnson commented on your post: "Great insights on React hooks!"',
      relatedUserId: userId,
    });

    await storage.createNotification({
      userId,
      type: 'feedback',
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
  // Run weekly digest every Sunday at 9:00 AM
  const interval = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  
  setInterval(() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const hour = now.getHours();
    
    // Run on Sunday at 9 AM
    if (dayOfWeek === 0 && hour === 9) {
      sendWeeklyDigests();
    }
  }, 60 * 60 * 1000); // Check every hour
  
  console.log('Weekly digest scheduler started');
}