import cron from 'node-cron';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendWhatsAppMessage } from '../services/whatsappService.js';
import { gym_first_name } from '../../frontend/src/constants/constants.js';

// Schedule: '0 8 * * *' (every day at 8:00 AM)
cron.schedule('0 8 * * *', async () => {
  console.log('Cron started: membership reminder check');
  try {
    const users = await User.find({
      'membership.status': 'active',
      'membership.endDate': { $exists: true, $ne: null }
    });

    for (const user of users) {
      if (!user.mobile) {
        console.log(`Skipped ${user.name}: no mobile number`);
        continue;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end = new Date(user.membership.endDate);
      end.setHours(0, 0, 0, 0);

      const daysRemaining = Math.round((end - today) / (1000 * 60 * 60 * 24));

      if (![-2, 0, 5].includes(daysRemaining)) {
        continue;
      }

      let reminderType;
      if (daysRemaining === 5) reminderType = 'expiry_warning';
      else if (daysRemaining === 0) reminderType = 'due_today';
      else if (daysRemaining === -2) reminderType = 'overdue';

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const exists = await Notification.findOne({
        user: user._id,
        type: reminderType,
        status: 'sent',
        sentAt: { $gte: startOfToday, $lte: endOfToday }
      });

      if (exists) {
        console.log(`Skipped ${user.name}: already sent today`);
        continue;
      }

      const formattedDate = new Date(user.membership.endDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });

      let message = '';

      if (daysRemaining === 5) {
        message = `Hi ${user.name},\n\nThis is a friendly reminder that your gym membership will expire in 5 days, on ${formattedDate}.\n\nTo avoid any interruption to your workouts, please renew your membership before the expiry date.\n\nIf you have already completed the payment, please disregard this message.\n\nThank you for being a valued member.\n\nTeam ${gym_first_name}`;
      } else if (daysRemaining === 0) {
        message = `Hi ${user.name},\n\nYour gym membership expires today, ${formattedDate}.\n\nPlease renew your membership as soon as possible to continue enjoying uninterrupted access to the gym.\n\nIf you have already completed the payment, please disregard this message.\n\nThank you for being a valued member.\n\nTeam ${gym_first_name}`;
      } else if (daysRemaining === -2) {
        message = `Hi ${user.name},\n\nYour gym membership expired on ${formattedDate}, and gym access is currently suspended.\n\nPlease renew your membership at your earliest convenience to resume your workouts.\n\nIf you have already completed the payment, please disregard this message.\n\nThank you for being a valued member.\n\nTeam ${gym_first_name}`;
      }

      try {
        await sendWhatsAppMessage(user.mobile, message);
        await Notification.create({
          user: user._id,
          type: reminderType,
          status: 'sent',
          messageContent: message,
          sentAt: new Date()
        });
        console.log(`Reminder sent to ${user.name} (${reminderType})`);
      } catch (error) {
        await Notification.create({
          user: user._id,
          type: reminderType,
          status: 'failed',
          messageContent: message,
          sentAt: new Date()
        });
        console.error(`Failed to send to ${user.name}: ${error.message}`);
      }
    }
  } catch (error) {
    console.error(`Error in membership reminder cron: ${error.message}`);
  }
  console.log('Cron completed');
});
