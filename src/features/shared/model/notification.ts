import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'subscription' | 'referral' | 'reward' | 'enquiry' | 'system';
  status: 'unread' | 'read';
  actionUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  type: { 
    type: String, 
    enum: ['subscription', 'referral', 'reward', 'enquiry', 'system'], 
    default: 'system',
    required: true 
  },
  status: { 
    type: String, 
    enum: ['unread', 'read'], 
    default: 'unread',
    required: true 
  },
  actionUrl: { type: String, trim: true }
}, {
  timestamps: true
});

// Clear model on hot reload to avoid Mongoose OverwriteModelError
if (mongoose.models && mongoose.models.Notification) {
  delete mongoose.models.Notification;
}

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
