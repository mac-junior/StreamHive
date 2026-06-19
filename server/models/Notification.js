import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'follow',
      'hive_reminder',
      'question_answered',
      'bookmark_live',
      'hive_started'
    ]
  },
  hiveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hive',
    default: null
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);