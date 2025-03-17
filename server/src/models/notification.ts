import mongoose from 'mongoose';

export interface INotification extends mongoose.Document {
  recipient: mongoose.Types.ObjectId;
  type: 'answer' | 'mention' | 'like';
  question?: mongoose.Types.ObjectId;
  answer?: mongoose.Types.ObjectId;
  actor: mongoose.Types.ObjectId;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['answer', 'mention', 'like'],
    required: true,
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
  },
  answer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<INotification>('Notification', notificationSchema); 