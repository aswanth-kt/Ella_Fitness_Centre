import Notification from '../models/Notification.js';

/**
 * Simulates sending a WhatsApp notification.
 * In production, this would integrate with Twilio or Meta's Cloud API.
 */
export const sendWhatsAppMessage = async ({ user, type, templateData }) => {
  const { name, mobile, expiryDate, daysLeft } = templateData;
  
  let message = '';
  
  switch (type) {
    case 'expiry_warning':
      message = `Hello ${name},\n\nYour gym membership will expire on ${expiryDate}.\nRemaining Days: ${daysLeft}\n\nPlease renew your membership to continue uninterrupted access.\n\nThank you.`;
      break;
    case 'due_today':
      message = `Hello ${name},\n\nYour gym membership is expiring TODAY (${expiryDate}).\n\nPlease renew immediately to avoid suspension of facilities.\n\nThank you.`;
      break;
    case 'overdue':
      message = `Hello ${name},\n\nYour gym membership expired on ${expiryDate}.\n\nAccess is currently restricted. Please renew to resume your training sessions.\n\nThank you.`;
      break;
    case 'monthly_fee':
      message = `Hello ${name},\n\nThis is your monthly gym fee receipt and standing confirmation. Stay fit!\n\nThank you.`;
      break;
    default:
      message = `Hello ${name},\n\nThis is a notification from your Gold Gym Team.`;
  }

  console.log('====================================================');
  console.log(`[WHATSAPP REMINDER SERVICE] Sending API Request to +91${mobile}`);
  console.log(`Type: ${type}`);
  console.log(`Message:\n${message}`);
  console.log('====================================================');

  try {
    // Save record to database
    const notification = await Notification.create({
      user: user._id,
      type,
      status: 'sent',
      messageContent: message,
      sentAt: new Date()
    });

    return { success: true, notification };
  } catch (error) {
    console.error('Error logging notification to DB:', error.message);
    return { success: false, error: error.message };
  }
};
