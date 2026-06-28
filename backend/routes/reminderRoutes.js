import express from 'express';
import { sendManualReminder } from '../controllers/reminderController.js';

const router = express.Router();

router.post('/send/:memberId', sendManualReminder);

export default router;
