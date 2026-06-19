import Notification from '../models/Notification.js';

class NotificationService {
  async createNotification({ recipientId, senderId, type, hiveId, message }) {
    try {
      const notification = await Notification.create({
        recipientId,
        senderId,
        type,
        hiveId,
        message,
      });
      return notification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  async notifyFollowers(userId, hiveId, hiveTitle) {
    try {
      const User = (await import('../models/User.js')).default;
      const user = await User.findById(userId);
      
      if (user && user.followers.length > 0) {
        const notifications = user.followers.map(followerId => ({
          recipientId: followerId,
          senderId: userId,
          type: 'hive_started',
          hiveId,
          message: `${user.username} started a new hive: ${hiveTitle}`
        }));
        
        await Notification.insertMany(notifications);
      }
    } catch (error) {
      console.error('Failed to notify followers:', error);
    }
  }

  async notifyScheduledHiveReminder(hive) {
    try {
      const User = (await import('../models/User.js')).default;
      const creator = await User.findById(hive.creatorId);
      
      if (creator && creator.followers.length > 0) {
        const notifications = creator.followers.map(followerId => ({
          recipientId: followerId,
          senderId: hive.creatorId,
          type: 'hive_reminder',
          hiveId: hive._id,
          message: `${creator.username}'s hive "${hive.title}" is starting soon!`
        }));
        
        await Notification.insertMany(notifications);
      }
    } catch (error) {
      console.error('Failed to send hive reminders:', error);
    }
  }

  async getUserNotifications(userId) {
    try {
      return await Notification.find({ recipientId: userId })
        .populate('senderId', 'fullname username avatar')
        .populate('hiveId', 'title status')
        .sort({ createdAt: -1 })
        .limit(50);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  }

  async getUnreadCount(userId) {
    try {
      return await Notification.countDocuments({
        recipientId: userId,
        isRead: false
      });
    } catch (error) {
      console.error('Failed to get unread count:', error);
      throw error;
    }
  }

  async markAsRead(notificationId) {
    try {
      return await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(userId) {
    try {
      return await Notification.updateMany(
        { recipientId: userId, isRead: false },
        { isRead: true }
      );
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      throw error;
    }
  }
}

export default new NotificationService();