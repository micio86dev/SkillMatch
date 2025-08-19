import { Server as SocketIOServer } from 'socket.io';
import { storage } from './storage';
import { sendEmail } from './email';
import type { InsertNotification, NotificationPreferences, User } from '@shared/schema';

export interface NotificationService {
  createNotification(notification: InsertNotification): Promise<void>;
  sendRealTimeNotification(userId: string, notification: any): void;
  sendEmailNotification(userId: string, notification: any): Promise<void>;
  sendPushNotification(userId: string, notification: any): Promise<void>;
  sendWeeklyDigest(userId: string): Promise<void>;
}

class NotificationServiceImpl implements NotificationService {
  private io: SocketIOServer | null = null;

  setSocketIO(io: SocketIOServer) {
    this.io = io;
  }

  async createNotification(notification: InsertNotification): Promise<void> {
    try {
      // Store notification in database
      await storage.createNotification(notification);
      
      // Get user preferences
      const preferences = await storage.getNotificationPreferences(notification.userId);
      
      // Send real-time notification if enabled
      if (this.shouldSendInApp(notification.type, preferences)) {
        const fullNotification = await storage.getNotification(notification.userId, notification.title);
        this.sendRealTimeNotification(notification.userId, fullNotification);
      }
      
      // Send email notification if enabled
      if (this.shouldSendEmail(notification.type, preferences)) {
        await this.sendEmailNotification(notification.userId, notification);
      }
      
      // Send push notification if enabled
      if (this.shouldSendPush(notification.type, preferences)) {
        await this.sendPushNotification(notification.userId, notification);
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  sendRealTimeNotification(userId: string, notification: any): void {
    if (this.io) {
      this.io.to(`user-${userId}`).emit('notification', notification);
    }
  }

  async sendEmailNotification(userId: string, notification: InsertNotification): Promise<void> {
    try {
      const user = await storage.getUser(userId);
      if (!user || !user.email) return;

      const subject = notification.title;
      const html = this.generateEmailTemplate(notification, user);
      
      await sendEmail(user.email, subject, html);
      
      // Mark email as sent
      await storage.markNotificationEmailSent(notification.userId, notification.title);
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  async sendPushNotification(userId: string, notification: InsertNotification): Promise<void> {
    try {
      // Browser push notifications would be implemented here
      // For now, we'll just mark it as sent
      await storage.markNotificationPushSent(notification.userId, notification.title);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  async sendWeeklyDigest(userId: string): Promise<void> {
    try {
      const user = await storage.getUser(userId);
      const preferences = await storage.getNotificationPreferences(userId);
      
      if (!user || !user.email || !preferences?.weeklyDigest) return;

      // Get last week's activity
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const notifications = await storage.getNotificationsSince(userId, weekAgo);
      
      if (notifications.length === 0) return;

      const subject = `Your Weekly VibeSync Digest`;
      const html = this.generateWeeklyDigestTemplate(notifications, user);
      
      await sendEmail(user.email, subject, html);
    } catch (error) {
      console.error('Error sending weekly digest:', error);
    }
  }

  private shouldSendInApp(type: string, preferences: NotificationPreferences | null): boolean {
    if (!preferences) return true; // Default to enabled
    switch (type) {
      case 'message': return preferences.messageInApp ?? true;
      case 'like': return preferences.likeInApp ?? true;
      case 'comment': return preferences.commentInApp ?? true;
      case 'feedback': return preferences.feedbackInApp ?? true;
      default: return true;
    }
  }

  private shouldSendEmail(type: string, preferences: NotificationPreferences | null): boolean {
    if (!preferences) return false; // Default to disabled
    switch (type) {
      case 'message': return preferences.messageEmail ?? false;
      case 'like': return preferences.likeEmail ?? false;
      case 'comment': return preferences.commentEmail ?? false;
      case 'feedback': return preferences.feedbackEmail ?? false;
      default: return false;
    }
  }

  private shouldSendPush(type: string, preferences: NotificationPreferences | null): boolean {
    if (!preferences) return false; // Default to disabled
    switch (type) {
      case 'message': return preferences.messagePush ?? false;
      case 'like': return preferences.likePush ?? false;
      case 'comment': return preferences.commentPush ?? false;
      case 'feedback': return preferences.feedbackPush ?? false;
      default: return false;
    }
  }

  private generateEmailTemplate(notification: InsertNotification, user: User): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${notification.title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 40px 20px; text-align: center; }
          .content { padding: 40px 20px; }
          .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
          .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; margin: 20px 0; }
          .notification-content { background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 0 6px 6px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>VibeSync</h1>
            <p>Stay connected with your professional network</p>
          </div>
          <div class="content">
            <h2>Hi ${user.firstName || 'there'}!</h2>
            <div class="notification-content">
              <h3>${notification.title}</h3>
              <p>${notification.message}</p>
            </div>
            <a href="${process.env.REPLIT_DOMAINS?.split(',')[0] || 'http://localhost:5000'}" class="button">View on VibeSync</a>
          </div>
          <div class="footer">
            <p>You're receiving this because you have email notifications enabled.</p>
            <p>You can change your notification preferences in your profile settings.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateWeeklyDigestTemplate(notifications: any[], user: User): string {
    const messageCount = notifications.filter(n => n.type === 'message').length;
    const likeCount = notifications.filter(n => n.type === 'like').length;
    const commentCount = notifications.filter(n => n.type === 'comment').length;
    const feedbackCount = notifications.filter(n => n.type === 'feedback').length;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Weekly VibeSync Digest</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 40px 20px; text-align: center; }
          .content { padding: 40px 20px; }
          .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
          .stats { display: flex; flex-wrap: wrap; gap: 20px; margin: 30px 0; }
          .stat-card { flex: 1; min-width: 120px; background-color: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #3b82f6; }
          .stat-number { font-size: 32px; font-weight: bold; color: #1e293b; margin-bottom: 8px; }
          .stat-label { color: #64748b; font-size: 14px; }
          .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>VibeSync</h1>
            <p>Your Weekly Activity Summary</p>
          </div>
          <div class="content">
            <h2>Hi ${user.firstName || 'there'}!</h2>
            <p>Here's what happened in your network this week:</p>
            
            <div class="stats">
              <div class="stat-card">
                <div class="stat-number">${messageCount}</div>
                <div class="stat-label">New Messages</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${likeCount}</div>
                <div class="stat-label">Post Likes</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${commentCount}</div>
                <div class="stat-label">Comments</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${feedbackCount}</div>
                <div class="stat-label">Feedback</div>
              </div>
            </div>
            
            <p>Stay engaged with your professional network and discover new opportunities!</p>
            <a href="${process.env.REPLIT_DOMAINS?.split(',')[0] || 'http://localhost:5000'}" class="button">Open VibeSync</a>
          </div>
          <div class="footer">
            <p>You're receiving this weekly digest because you have it enabled in your preferences.</p>
            <p>You can change your notification preferences in your profile settings.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const notificationService = new NotificationServiceImpl();

// Helper functions for creating specific notification types
export async function createMessageNotification(receiverId: string, senderId: string, messageContent: string) {
  const sender = await storage.getUser(senderId);
  await notificationService.createNotification({
    userId: receiverId,
    type: 'message',
    title: 'New Message',
    message: `${sender?.firstName || 'Someone'} sent you a message: "${messageContent.substring(0, 100)}${messageContent.length > 100 ? '...' : ''}"`,
    relatedId: senderId,
    relatedUserId: senderId,
  });
}

export async function createLikeNotification(postOwnerId: string, likerId: string, postId: string) {
  const liker = await storage.getUser(likerId);
  await notificationService.createNotification({
    userId: postOwnerId,
    type: 'like',
    title: 'Post Liked',
    message: `${liker?.firstName || 'Someone'} liked your post`,
    relatedId: postId,
    relatedUserId: likerId,
  });
}

export async function createCommentNotification(postOwnerId: string, commenterId: string, postId: string, commentContent: string) {
  const commenter = await storage.getUser(commenterId);
  await notificationService.createNotification({
    userId: postOwnerId,
    type: 'comment',
    title: 'New Comment',
    message: `${commenter?.firstName || 'Someone'} commented on your post: "${commentContent.substring(0, 100)}${commentContent.length > 100 ? '...' : ''}"`,
    relatedId: postId,
    relatedUserId: commenterId,
  });
}

export async function createFeedbackNotification(userId: string, feedbackGiverId: string, rating: number, comment?: string) {
  const feedbackGiver = await storage.getUser(feedbackGiverId);
  await notificationService.createNotification({
    userId: userId,
    type: 'feedback',
    title: 'New Feedback Received',
    message: `${feedbackGiver?.firstName || 'Someone'} left you ${rating}-star feedback${comment ? `: "${comment.substring(0, 100)}${comment.length > 100 ? '...' : ''}"` : ''}`,
    relatedId: feedbackGiverId,
    relatedUserId: feedbackGiverId,
  });
}