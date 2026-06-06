import express from 'express';
import { 
  getMyAttendance, 
  markAttendance, 
  getDailyAttendance, 
  getAttendanceReport 
} from '../controllers/attendanceController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my-attendance', protect, getMyAttendance);
router.post('/mark', protect, admin, markAttendance);
router.get('/daily', protect, admin, getDailyAttendance);
router.get('/report', protect, admin, getAttendanceReport);

export default router;
