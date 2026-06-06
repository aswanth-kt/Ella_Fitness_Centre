import crypto from 'crypto';
import razorpayInstance from '../config/razorpay.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';

// Plan configurations
const PLANS = {
  starter: { name: 'Starter Plan', durationMonths: 1, priceInINR: 1500 },
  standard: { name: 'Standard Plan', durationMonths: 3, priceInINR: 4000 },
  premium: { name: 'Premium Plan', durationMonths: 6, priceInINR: 7000 }
};

// @desc    Create Razorpay Order
// @route   POST /api/payments/order
// @access  Private
export const createOrder = async (req, res) => {
  const { planName } = req.body; // 'starter', 'standard', 'premium'

  const selectedPlan = PLANS[planName.toLowerCase()];
  if (!selectedPlan) {
    return res.status(400).json({ message: 'Invalid plan selected' });
  }

  const amountInPaise = selectedPlan.priceInINR * 100;

  try {
    // If Razorpay instance is not initialized, run in mock mode
    if (!razorpayInstance) {
      const mockOrderId = `order_mock_${Math.random().toString(36).substring(2, 12)}`;
      
      // Save pending payment record
      const payment = await Payment.create({
        user: req.user._id,
        amount: selectedPlan.priceInINR,
        razorpayOrderId: mockOrderId,
        status: 'pending'
      });

      return res.status(201).json({
        id: mockOrderId,
        amount: amountInPaise,
        currency: 'INR',
        isMock: true,
        plan: planName.toLowerCase(),
        key: 'mock_key'
      });
    }

    // Real Razorpay integration
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_order_${Math.random().toString(36).substring(2, 10)}`,
    };

    const order = await razorpayInstance.orders.create(options);

    // Save pending payment record
    await Payment.create({
      user: req.user._id,
      amount: selectedPlan.priceInINR,
      razorpayOrderId: order.id,
      status: 'pending'
    });

    res.status(201).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      isMock: false,
      plan: planName.toLowerCase(),
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error initiating payment process' });
  }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, planName, isMock } = req.body;

  try {
    const selectedPlan = PLANS[planName.toLowerCase()];
    if (!selectedPlan) {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    let verificationSuccess = false;

    if (isMock || !razorpayInstance) {
      // Mock payment verification success
      verificationSuccess = true;
      console.log(`[MOCK PAYMENT SUCCESS] Order: ${razorpayOrderId}, Payment: ${razorpayPaymentId}`);
    } else {
      // Real Razorpay payment verification
      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature === razorpaySignature) {
        verificationSuccess = true;
      }
    }

    if (!verificationSuccess) {
      // Update payment to failed
      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { status: 'failed' }
      );
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Update payment record to paid
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        status: 'paid',
        razorpayPaymentId: razorpayPaymentId || `pay_mock_${Math.random().toString(36).substring(2, 12)}`,
        paidAt: new Date()
      },
      { new: true }
    );

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + (selectedPlan.durationMonths * 30));

    // Update User Membership
    const user = await User.findById(req.user._id);
    user.membership = {
      plan: planName.toLowerCase(),
      startDate,
      endDate,
      status: 'active'
    };

    await user.save();

    res.json({
      message: 'Payment verified and membership activated!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        membership: user.membership
      },
      payment
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Error processing verification' });
  }
};

// @desc    Get current user's payment history
// @route   GET /api/payments/my-payments
// @access  Private
export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
