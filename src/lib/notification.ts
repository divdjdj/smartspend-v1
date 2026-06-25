import connectDB from './mongodb';
import Notification from '@/features/shared/model/notification';
import mongoose from 'mongoose';

interface CreateNotificationParams {
  recipientId: string | mongoose.Types.ObjectId;
  title: string;
  message: string;
  type?: 'subscription' | 'referral' | 'reward' | 'enquiry' | 'system';
  actionUrl?: string;
}

export async function createNotification({
  recipientId,
  title,
  message,
  type = 'system',
  actionUrl
}: CreateNotificationParams) {
  try {
    // Connect to database
    await connectDB();

    // Create the notification document
    const notification = new Notification({
      recipientId: typeof recipientId === 'string' ? new mongoose.Types.ObjectId(recipientId) : recipientId,
      title,
      message,
      type,
      actionUrl
    });

    // Save to database
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating in-app notification:', error);
    return null;
  }
}
