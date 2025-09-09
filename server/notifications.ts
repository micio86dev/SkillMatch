import { Server as SocketIOServer } from 'socket.io';
import sgMail = require('@sendgrid/mail');

import type { InsertNotification, Notification, NotificationPreferences, User } from '../shared/schema';
import { storage } from './storage';
import { sendEmail } from './email';
import { translateMessage } from './translations';

export interface NotificationService {
  createNotification(notification: InsertNotification): Promise<void>;
  sendRealTimeNotification(userId: string, notification: any): void;
  sendEmailNotification(userId: string, notification: Notification): Promise<void>;
  sendPushNotification(userId: string, notification: Notification): Promise<void>;
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
      const createdNotification = await storage.createNotification(notification);
      
      // Get user preferences
      const preferences = await storage.getNotificationPreferences(notification.userId);
      
      // Send real-time notification if enabled
      if (this.shouldSendInApp(notification.type, preferences || null)) {
        const fullNotification = await storage.getNotificationById(createdNotification.id);
        if (fullNotification) {
          this.sendRealTimeNotification(notification.userId, fullNotification);
        }
      }
      
      // Send email notification if enabled
      if (this.shouldSendEmail(notification.type, preferences || null)) {
        await this.sendEmailNotification(notification.userId, createdNotification);
      }
      
      // Send push notification if enabled
      if (this.shouldSendPush(notification.type, preferences || null)) {
        await this.sendPushNotification(notification.userId, createdNotification);
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

  async sendEmailNotification(userId: string, notification: Notification): Promise<void> {
    try {
      const user = await storage.getUser(userId);
      if (!user || !user.email) return;
      
      const subject = notification.title;
      const html = this.generateEmailTemplate(notification, user);
      
      await sendEmail(user.email, subject, html);
      
      // Mark email as sent
      await storage.markNotificationEmailSent(notification.id);
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  async sendPushNotification(userId: string, notification: Notification): Promise<void> {
    try {
      // Browser push notifications would be implemented here
      // For now, we'll just mark it as sent
      await storage.markNotificationPushSent(notification.id);
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
    if (!preferences) return true; // Default to sending if no preferences
    
    switch (type) {
      case 'MESSAGE':
        return preferences.messageInApp;
      case 'LIKE':
        return preferences.likeInApp;
      case 'COMMENT':
        return preferences.commentInApp;
      case 'FEEDBACK':
        return preferences.feedbackInApp;
      case 'CONNECTION':
        return preferences.connectionInApp;
      case 'APPLICATION_RECEIVED':
      case 'APPLICATION_ACCEPTED':
      case 'APPLICATION_REJECTED':
        return preferences.applicationInApp;
      default:
        return true;
    }
  }

  private shouldSendEmail(type: string, preferences: NotificationPreferences | null): boolean {
    if (!preferences) return false; // Default to not sending email if no preferences
    
    switch (type) {
      case 'MESSAGE':
        return preferences.messageEmail;
      case 'LIKE':
        return preferences.likeEmail;
      case 'COMMENT':
        return preferences.commentEmail;
      case 'FEEDBACK':
        return preferences.feedbackEmail;
      case 'CONNECTION':
        return preferences.connectionEmail;
      case 'APPLICATION_RECEIVED':
      case 'APPLICATION_ACCEPTED':
      case 'APPLICATION_REJECTED':
        return preferences.applicationEmail;
      default:
        return false;
    }
  }

  private shouldSendPush(type: string, preferences: NotificationPreferences | null): boolean {
    if (!preferences) return false; // Default to not sending push if no preferences
    
    switch (type) {
      case 'MESSAGE':
        return preferences.messagePush;
      case 'LIKE':
        return preferences.likePush;
      case 'COMMENT':
        return preferences.commentPush;
      case 'FEEDBACK':
        return preferences.feedbackPush;
      case 'CONNECTION':
        return preferences.connectionPush;
      case 'APPLICATION_RECEIVED':
      case 'APPLICATION_ACCEPTED':
      case 'APPLICATION_REJECTED':
        return preferences.applicationPush;
      default:
        return false;
    }
  }

  private generateEmailTemplate(notification: InsertNotification, user: User): string {
    const appUrl = process.env.APP_URL || 'http://localhost:5000';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${notification.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>VibeSync</h1>
          </div>
          <div class="content">
            <h2>${notification.title}</h2>
            <p>${notification.message}</p>
            <a href="${appUrl}" class="button">View Notification</a>
          </div>
          <div class="footer">
            <p>This email was sent to ${user.email} because you have notifications enabled.</p>
            <p>You can change your notification preferences in your account settings.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateWeeklyDigestTemplate(notifications: any[], user: User): string {
    const appUrl = process.env.APP_URL || 'http://localhost:5000';
    
    const notificationsHtml = notifications.map(notification => `
      <div style="margin-bottom: 20px; padding: 15px; border-left: 4px solid #4f46e5; background-color: #f8f9fa;">
        <h3>${notification.title}</h3>
        <p>${notification.message}</p>
      </div>
    `).join('');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Weekly VibeSync Digest</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>VibeSync</h1>
            <p>Your Weekly Digest</p>
          </div>
          <div class="content">
            <h2>Hello ${user.firstName || user.email}!</h2>
            <p>Here's what happened in your VibeSync network this week:</p>
            ${notificationsHtml}
            <a href="${appUrl}" class="button">Open VibeSync</a>
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

// Helper functions for creating specific notification types
export async function createMessageNotification(receiverId: string, senderId: string, messageContent: string) {
  const sender = await storage.getUser(senderId);
  await notificationService.createNotification({
    userId: receiverId,
    type: 'MESSAGE',
    title: 'New Message',
    message: `You have a new message from ${sender?.firstName || 'someone'}: ${messageContent.substring(0, 100)}${messageContent.length > 100 ? '...' : ''}`,
    relatedId: senderId,
    relatedUserId: senderId,
  });
}

export async function createLikeNotification(postOwnerId: string, likerId: string, postId: string) {
  const liker = await storage.getUser(likerId);
  await notificationService.createNotification({
    userId: postOwnerId,
    type: 'LIKE',
    title: 'Post Liked',
    message: `Your post was liked by ${liker?.firstName || 'someone'}`,
    relatedId: postId,
    relatedUserId: likerId,
  });
}

export async function createCommentLikeNotification(commentOwnerId: string, likerId: string, commentId: string) {
  const liker = await storage.getUser(likerId);
  await notificationService.createNotification({
    userId: commentOwnerId,
    type: 'LIKE',
    title: 'Comment Liked',
    message: `Your comment was liked by ${liker?.firstName || 'someone'}`,
    relatedId: commentId,
    relatedUserId: likerId,
  });
}

export async function createProjectLikeNotification(projectOwnerId: string, likerId: string, projectId: string) {
  const liker = await storage.getUser(likerId);
  await notificationService.createNotification({
    userId: projectOwnerId,
    type: 'LIKE',
    title: 'Project Liked',
    message: `Your project was liked by ${liker?.firstName || 'someone'}`,
    relatedId: projectId,
    relatedUserId: likerId,
  });
}

export async function createCommentNotification(postOwnerId: string, commenterId: string, postId: string, commentContent: string) {
  const commenter = await storage.getUser(commenterId);
  await notificationService.createNotification({
    userId: postOwnerId,
    type: 'COMMENT',
    title: 'New Comment',
    message: `Your post was commented on by ${commenter?.firstName || 'someone'}: ${commentContent.substring(0, 100)}${commentContent.length > 100 ? '...' : ''}`,
    relatedId: postId,
    relatedUserId: commenterId,
  });
}

export async function createFeedbackNotification(userId: string, feedbackGiverId: string, rating: number, comment?: string) {
  const feedbackGiver = await storage.getUser(feedbackGiverId);
  await notificationService.createNotification({
    userId: userId,
    type: 'FEEDBACK',
    title: 'New Feedback Received',
    message: `You received feedback from ${feedbackGiver?.firstName || 'someone'} with rating ${rating}${comment ? `: "${comment.substring(0, 100)}${comment.length > 100 ? '...' : ''}"` : ''}`,
    relatedId: feedbackGiverId,
    relatedUserId: feedbackGiverId,
  });
}

export const notificationService = new NotificationServiceImpl();