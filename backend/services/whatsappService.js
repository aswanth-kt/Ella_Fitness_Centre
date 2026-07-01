import axios from 'axios';

export const sendWhatsAppMessage = async (phoneNumber, message) => {
  const url = process.env.WHATSAPP_API_URL;
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!url || !token || !phoneNumberId) {
    throw new Error('WhatsApp API configuration is missing in environment variables.');
  }

  try {
    const response = await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: { body: message }
      },
      {
        baseURL: url,
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error?.message || error.message || 'Failed to send WhatsApp message');
  }
};
