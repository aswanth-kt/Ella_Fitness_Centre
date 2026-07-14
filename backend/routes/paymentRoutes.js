import express from 'express';
import { getMyPayments, initiateManualPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// use for Razorpay routes in future
// router.post('/order', protect, createOrder);
// router.post('/verify', protect, verifyPayment);

router.post('/initiate-manual', protect, initiateManualPayment)
router.get('/my-payments', protect, getMyPayments);

export default router;
