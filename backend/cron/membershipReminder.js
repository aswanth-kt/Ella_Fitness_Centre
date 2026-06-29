import cron from 'node-cron';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendWhatsAppMessage } from '../services/whatsappService.js';

// Schedule: '0 8 * * *' (every day at 8:00 AM)
cron.schedule('* * * * *', async () => {
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

      if (![0, 3, 7].includes(daysRemaining)) {
        continue;
      }

      let reminderType;
      if (daysRemaining === 7) reminderType = 'expiry_warning';
      else if (daysRemaining === 3) reminderType = 'expiry_warning';
      else if (daysRemaining === 0) reminderType = 'due_today';

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
      if (daysRemaining === 7) {
        message = `Hello ${user.name},\n\nYour gym membership will expire in 7 days on ${formattedDate}.\n\nPlease renew your membership before the expiry date to continue\nenjoying uninterrupted access.\n\nThank you.`;
      } else if (daysRemaining === 3) {
        message = `Hello ${user.name},\n\nYour gym membership will expire in only 3 days on ${formattedDate}.\n\nPlease renew it as soon as possible.\n\nThank you.`;
      } else if (daysRemaining === 0) {
        message = `Hello ${user.name},\n\nYour gym membership expires today.\n\nTo continue your workouts without interruption,\nplease renew your membership.\n\nThank you.`;
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
