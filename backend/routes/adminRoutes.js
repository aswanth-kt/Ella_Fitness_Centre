import express from 'express';
import {
  getDashboardStats,
  getMembers,
  updateMember,
  deleteMember,
  getAllPayments,
  getReminderLogs,
  triggerExpiryReminders,
  createMember,
  getPendingRemindersList,
  sendManualReminder,
  getLastPayment,
  getPendingVerifications,
  verifyManualPayment,
  rejectManualPayment
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(admin);

router.get('/stats', getDashboardStats);
router.get('/members', getMembers);
router.post('/members', createMember);
router.route('/members/:id')
  .put(updateMember)
  .delete(deleteMember);
router.get('/payments', getAllPayments);
router.get('/payment/:userId', getLastPayment);
router.get('/reminders', getReminderLogs);
router.get('/reminders/pending', getPendingRemindersList);
router.post('/reminders/send', sendManualReminder);
router.post('/trigger-reminders', triggerExpiryReminders);
router.get('/pending', getPendingVerifications);
router.post('/:id/verify', verifyManualPayment);
router.post('/:id/reject', rejectManualPayment);

export default router;
