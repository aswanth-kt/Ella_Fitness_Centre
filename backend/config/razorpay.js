import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

let razorpayInstance = null;

try {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (keyId && keySecret && keyId !== 'rzp_test_mockKeyId12345') {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
    console.log('Razorpay SDK Initialized Successfully.');
  } else {
    console.log('Razorpay keys are mock or missing. Running in Mock Payment Mode.');
  }
} catch (error) {
  console.error('Error initializing Razorpay SDK:', error.message);
  console.log('Running in Mock Payment Mode.');
}

export default razorpayInstance;
