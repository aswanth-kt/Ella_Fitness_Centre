import crypto from 'crypto';
import razorpayInstance from '../config/razorpay.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import { MEMBERSHIP_PLANS } from '../const/membershipPlans.js';

// @desc    Create Razorpay Order
// @route   POST /api/payments/order
// @access  Private
export const createOrder = async (req, res) => {
  const { planName } = req.body; // '1month', '3month', '6month', '1year', 'student'

  const selectedPlan = MEMBERSHIP_PLANS[planName.toLowerCase()];
  if (!selectedPlan) {
    return res.status(400).json({ message: 'Invalid plan selected' });
  }

  const amountInPaise = selectedPlan.priceInINR * 100;

  try {
    // Razorpay integration
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
      status: 'pending',
      paymentMethod: 'Online Transaction',
      membershipPlan: planName.toLowerCase()
    });

    res.status(201).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
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
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, planName } = req.body;

  try {
    const selectedPlan = MEMBERSHIP_PLANS[planName.toLowerCase()];
    if (!selectedPlan) {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    let verificationSuccess = false;

    // Razorpay payment verification
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpaySignature) {
      verificationSuccess = true;
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
        razorpayPaymentId: razorpayPaymentId,
        paidAt: new Date()
      },
      { new: true }
    );

    // Calculate dates
    const user = await User.findById(req.user._id);
    let startDate = new Date();

    // Extend membership if current plan is active and endDate is in the future
    if (user.membership && user.membership.status === 'active' && user.membership.endDate && new Date(user.membership.endDate) > new Date()) {
      startDate = new Date(user.membership.endDate);
    }

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (selectedPlan.durationMonths * 30));

    // Update User Membership
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
    return res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
