import express from 'express';
import {
  getDashboardStats,
  getMembers,
  updateMember,
  deleteMember,
  getAllPayments,
  getReminderLogs,
  triggerExpiryReminders
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(admin);

router.get('/stats', getDashboardStats);
router.get('/members', getMembers);
router.route('/members/:id')
  .put(updateMember)
  .delete(deleteMember);
router.get('/payments', getAllPayments);
router.get('/reminders', getReminderLogs);
router.post('/trigger-reminders', triggerExpiryReminders);

export default router;
