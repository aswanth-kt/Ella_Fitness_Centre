import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendWhatsAppMessage } from '../services/whatsappService.js';

export const sendManualReminder = async (req, res) => {
  try {
    const { memberId } = req.params;
    const user = await User.findById(memberId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!user.mobile) {
      return res.status(400).json({ message: 'Phone number not found' });
    }
    if (user.membership?.status !== 'active') {
      return res.status(400).json({ message: 'No active membership found' });
    }
    if (!user.membership?.endDate) {
      return res.status(400).json({ message: 'Membership end date missing' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(user.membership.endDate);
    end.setHours(0, 0, 0, 0);

    const daysRemaining = Math.round((end - today) / (1000 * 60 * 60 * 24));

    let type;
    if (daysRemaining <= 0) type = 'due_today';
    else if (daysRemaining <= 3) type = 'expiry_warning';
    else if (daysRemaining <= 7) type = 'expiry_warning';
    else type = 'expiry_warning';

    const formattedDate = new Date(user.membership.endDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    let message = '';
    if (daysRemaining <= 0) {
      message = `Hello ${user.name},\n\nYour gym membership expires today.\n\nTo continue your workouts without interruption,\nplease renew your membership.\n\nThank you.`;
    } else if (daysRemaining <= 3) {
      message = `Hello ${user.name},\n\nYour gym membership will expire in only 3 days on ${formattedDate}.\n\nPlease renew it as soon as possible.\n\nThank you.`;
    } else if (daysRemaining <= 7) {
      message = `Hello ${user.name},\n\nYour gym membership will expire in 7 days on ${formattedDate}.\n\nPlease renew your membership before the expiry date to continue\nenjoying uninterrupted access.\n\nThank you.`;
    } else {
      message = `Hello ${user.name},\n\nYour gym membership is expiring on ${formattedDate}.\n\nPlease renew your membership soon to avoid interruption.\n\nThank you.`;
    }

    try {
      await sendWhatsAppMessage(user.mobile, message);
      await Notification.create({
        user: user._id,
        type,
        status: 'sent',
        messageContent: message,
        sentAt: new Date()
      });
      return res.status(200).json({ success: true, message: 'Reminder sent successfully' });
    } catch (error) {
      await Notification.create({
        user: user._id,
        type,
        status: 'failed',
        messageContent: message,
        sentAt: new Date()
      });
      return res.status(500).json({ success: false, message: error.message });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unexpected server error' });
  }
};
