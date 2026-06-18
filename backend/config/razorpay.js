import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

let razorpayInstance = null;

try {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (keyId && keySecret) {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
    console.log('Razorpay SDK Initialized Successfully.');
  } else {
    console.log('Razorpay keys are missing.');
  }
} catch (error) {
  console.error('Error initializing Razorpay SDK:', error.message);
}

export default razorpayInstance;
