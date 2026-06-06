import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['expiry_warning', 'due_today', 'overdue', 'monthly_fee'],
      required: true
    },
    status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
    messageContent: { type: String },
    sentAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
