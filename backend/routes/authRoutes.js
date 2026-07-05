import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  sendOTP,
  resetPassword,
  logoutUser,
  refreshUserToken
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { otpLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.post('/send-otp', otpLimiter, sendOTP);
router.patch('/reset-password', otpLimiter, resetPassword);

router.post('/logout', logoutUser);
router.post('/refresh', refreshUserToken);

export default router;
