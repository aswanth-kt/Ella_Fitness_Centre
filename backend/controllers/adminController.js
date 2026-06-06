import User from '../models/User.js';
import Payment from '../models/Payment.js';
import Attendance from '../models/Attendance.js';
import Notification from '../models/Notification.js';
import { sendWhatsAppMessage } from '../services/whatsappService.js';

// Helper to normalize dates
const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// @desc    Get Admin Dashboard Stats & Chart Data
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    // 1. Core Card Stats
    const totalMembers = await User.countDocuments({ role: 'client' });
    const activeMembers = await User.countDocuments({ role: 'client', 'membership.status': 'active' });
    const expiredMembers = await User.countDocuments({ role: 'client', 'membership.status': 'expired' });

    // Today's attendance details
    const today = getStartOfDay(new Date());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayMorningPresent = await Attendance.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      morningStatus: 'present'
    });

    const todayEveningPresent = await Attendance.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      eveningStatus: 'present'
    });

    const todayTotalPresent = await Attendance.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      $or: [{ morningStatus: 'present' }, { eveningStatus: 'present' }]
    });

    const todayTotalAbsent = Math.max(0, totalMembers - todayTotalPresent);

    // Monthly revenue (current month)
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0,0,0,0);

    const paymentsThisMonth = await Payment.find({
      status: 'paid',
      paidAt: { $gte: firstDayOfMonth }
    });
    const monthlyRevenue = paymentsThisMonth.reduce((sum, p) => sum + p.amount, 0);

    // 2. Revenue Analytics (Last 6 Months)
    const revenueData = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date();
      start.setMonth(start.getMonth() - i);
      start.setDate(1);
      start.setHours(0,0,0,0);

      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);

      const payments = await Payment.find({
        status: 'paid',
        paidAt: { $gte: start, $lt: end }
      });

      const total = payments.reduce((sum, p) => sum + p.amount, 0);
      const monthLabel = start.toLocaleString('default', { month: 'short' });
      revenueData.push({ month: monthLabel, revenue: total });
    }

    // 3. Membership Distribution (Plan Types)
    const starterCount = await User.countDocuments({ role: 'client', 'membership.plan': 'starter' });
    const standardCount = await User.countDocuments({ role: 'client', 'membership.plan': 'standard' });
    const premiumCount = await User.countDocuments({ role: 'client', 'membership.plan': 'premium' });
    const noPlanCount = await User.countDocuments({ role: 'client', 'membership.plan': 'none' });

    const membershipData = [
      { name: 'Starter (1M)', value: starterCount },
      { name: 'Standard (3M)', value: standardCount },
      { name: 'Premium (6M)', value: premiumCount },
      { name: 'No Plan', value: noPlanCount }
    ];

    // 4. Attendance Analytics (Last 7 Days)
    const attendanceData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const start = getStartOfDay(date);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const presentCount = await Attendance.countDocuments({
        date: { $gte: start, $lt: end },
        $or: [{ morningStatus: 'present' }, { eveningStatus: 'present' }]
      });

      const dayLabel = start.toLocaleDateString('default', { weekday: 'short', day: 'numeric' });
      attendanceData.push({ day: dayLabel, present: presentCount });
    }

    res.json({
      cards: {
        totalMembers,
        activeMembers,
        expiredMembers,
        todayAttendance: {
          morningPresent: todayMorningPresent,
          eveningPresent: todayEveningPresent,
          totalPresent: todayTotalPresent,
          totalAbsent: todayTotalAbsent
        },
        monthlyRevenue
      },
      charts: {
        revenueData,
        membershipData,
        attendanceData
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all members with filters and search
// @route   GET /api/admin/members
// @access  Private/Admin
export const getMembers = async (req, res) => {
  const { search, status, plan } = req.query;

  let query = { role: 'client' };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { mobile: { $regex: search, $options: 'i' } }
    ];
  }

  if (status && status !== 'all') {
    query['membership.status'] = status;
  }

  if (plan && plan !== 'all') {
    query['membership.plan'] = plan;
  }

  try {
    const members = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update member details (Admin manually editing details/membership)
// @route   PUT /api/admin/members/:id
// @access  Private/Admin
export const updateMember = async (req, res) => {
  const { name, email, mobile, age, gender, address, emergencyContact, membership } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Member not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.mobile = mobile || user.mobile;
    user.age = age !== undefined ? Number(age) : user.age;
    user.gender = gender || user.gender;
    user.address = address || user.address;
    user.emergencyContact = emergencyContact || user.emergencyContact;

    if (membership) {
      user.membership.plan = membership.plan || user.membership.plan;
      user.membership.status = membership.status || user.membership.status;
      if (membership.startDate) user.membership.startDate = new Date(membership.startDate);
      if (membership.endDate) user.membership.endDate = new Date(membership.endDate);
    }

    const updatedUser = await user.save();
    res.json(updatedUser);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete member
// @route   DELETE /api/admin/members/:id
// @access  Private/Admin
export const deleteMember = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Clean up associated attendance, payments, notifications
    await Attendance.deleteMany({ user: user._id });
    await Payment.deleteMany({ user: user._id });
    await Notification.deleteMany({ user: user._id });
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'Member and all associated records deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all payments
// @route   GET /api/admin/payments
// @access  Private/Admin
export const getAllPayments = async (req, res) => {
  const { status } = req.query;
  let query = {};
  if (status && status !== 'all') {
    query.status = status;
  }

  try {
    const payments = await Payment.find(query)
      .populate('user', 'name email mobile')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get notification reminder history
// @route   GET /api/admin/reminders
// @access  Private/Admin
export const getReminderLogs = async (req, res) => {
  try {
    const reminders = await Notification.find({})
      .populate('user', 'name email mobile')
      .sort({ sentAt: -1 });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Scan members and trigger WhatsApp Expiry notifications
// @route   POST /api/admin/trigger-reminders
// @access  Private/Admin
export const triggerExpiryReminders = async (req, res) => {
  try {
    const today = getStartOfDay(new Date());
    const clients = await User.find({ role: 'client', 'membership.status': { $in: ['active', 'expired'] } });
    
    let notificationsTriggered = 0;

    for (let client of clients) {
      if (!client.membership || !client.membership.endDate) continue;

      const endDate = getStartOfDay(client.membership.endDate);
      const timeDiff = endDate.getTime() - today.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

      let templateType = '';

      if (daysLeft === 7) {
        templateType = 'expiry_warning';
      } else if (daysLeft === 0 && client.membership.status === 'active') {
        templateType = 'due_today';
      } else if (daysLeft < 0 && client.membership.status === 'active') {
        // Automatically mark status as expired
        client.membership.status = 'expired';
        await client.save();
        templateType = 'overdue';
      } else if (client.membership.status === 'expired' && daysLeft < 0 && daysLeft >= -3) {
        // Repeated overdue notice for recently expired (within 3 days)
        templateType = 'overdue';
      }

      if (templateType) {
        await sendWhatsAppMessage({
          user: client,
          type: templateType,
          templateData: {
            name: client.name,
            mobile: client.mobile,
            expiryDate: client.membership.endDate.toLocaleDateString(),
            daysLeft: String(daysLeft)
          }
        });
        notificationsTriggered++;
      }
    }

    res.json({
      message: `Checked active members. Triggered ${notificationsTriggered} reminders.`,
      count: notificationsTriggered
    });

  } catch (error) {
    console.error('Error triggering reminders:', error);
    res.status(500).json({ message: error.message });
  }
};
