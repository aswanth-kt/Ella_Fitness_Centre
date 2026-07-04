import User from '../models/User.js';
import Payment from '../models/Payment.js';
import Attendance from '../models/Attendance.js';
import Notification from '../models/Notification.js';
import { validateCountryCode, validateEmail, validateMobileNumber } from '../middleware/validatorsMiddleware.js';
import { sendWhatsAppMessage } from '../services/whatsappService.js';
import { gym_first_name, gym_full_name } from '../../frontend/src/constants/constants.js';
import { invoice_pagination_limit, members_pagination_limit, reminder_pagination_limit } from '../const/constants.js';
import { generateInvoiceNumber } from '../utils/invoiceGenerator.js';

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

    // Today's attendance details (Single daily check-in model)
    const today = getStartOfDay(new Date());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayMorningPresent = await Attendance.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      session: 'Morning',
      status: 'Present'
    });

    const todayEveningPresent = await Attendance.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      session: 'Evening',
      status: 'Present'
    });

    const todayTotalPresent = await Attendance.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      status: 'Present'
    });

    const todayTotalAbsent = Math.max(0, totalMembers - todayTotalPresent);

    // Monthly revenue (current month)
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const paymentsThisMonth = await Payment.find({
      status: 'paid',
      paidAt: { $gte: firstDayOfMonth }
    });
    const monthlyRevenue = paymentsThisMonth.reduce((sum, p) => sum + p.amount, 0);

    // Online & Cash Revenue splits (All-time or monthly? Let's provide both all-time and current-month if needed. Let's do all-time for total revenue card, and splits for total all-time revenue).
    const allPaidPayments = await Payment.find({ status: 'paid' });
    const totalRevenue = allPaidPayments.reduce((sum, p) => sum + p.amount, 0);
    const onlineRevenue = allPaidPayments
      .filter(p => p.paymentMethod === 'Online Transaction' || !p.paymentMethod)
      .reduce((sum, p) => sum + p.amount, 0);
    const cashRevenue = allPaidPayments
      .filter(p => p.paymentMethod === 'Cash Transaction')
      .reduce((sum, p) => sum + p.amount, 0);

    // 2. Revenue Analytics (Last 6 Months)
    const revenueData = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date();
      start.setMonth(start.getMonth() - i);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);

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
        status: 'Present'
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
        monthlyRevenue,
        totalRevenue,
        onlineRevenue,
        cashRevenue
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
  const { search, status, plan, memberPage } = req.query;

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

    const page = Number(memberPage);
    const limit = members_pagination_limit;
    const skip = (page - 1) * limit;

    const members = await User.find(query).select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const totalMembers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalMembers / limit);
    
    res.json({
      members,
      page,
      totalPages
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update member details (Admin manually editing details/membership)
// @route   PUT /api/admin/members/:id
// @access  Private/Admin
export const updateMember = async (req, res) => {
  const { 
    name, email, countryCode, mobile, age, gender, address, emergencyContact, height, weight,
    membership, // { plan, startDate, endDate, status }
    payment, // { amount, paymentMethod }
    membershipConfirmed // if true create payment
  } = req.body;

  // validation
  const cc = validateCountryCode(countryCode);
  const mob = validateMobileNumber(mobile);
  const em = validateEmail(email);

  if (!cc.valid) return res.status(400).json({ message: cc.message });
  if (!mob.valid) return res.status(400).json({ message: mob.message });
  if (!em.valid) return res.status(400).json({ message: em.message });

   try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Before saving, check no other user has the same email/mobile
    if (email && email !== user.email) {
      const exists = await User.findOne({ email, _id: { $ne: user._id } });
      if (exists) return res.status(400).json({ message: 'Email already in use' });
    }

    // validate date
    if (membership?.startDate && membership?.endDate) {
      if (new Date(membership.startDate) >= new Date(membership.endDate)) {
        return res.status(400).json({ message: 'Start date must be before end date' });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.countryCode = countryCode || user.countryCode,
    user.mobile = mobile || user.mobile;
    user.age = age !== undefined ? Number(age) : user.age;
    user.gender = gender || user.gender;
    user.address = address || user.address;
    user.emergencyContact = emergencyContact || user.emergencyContact;
    user.height = height !== undefined ? Number(height) : user.height;
    user.weight = weight !== undefined ? Number(weight) : user.weight;

    if (
      payment && 
      payment.amount && 
      membership && 
      membershipConfirmed
    ) {
      const invoiceNo = await generateInvoiceNumber();
      
      await Payment.create({
        user: user._id,
        amount: Number(payment.amount),
        paymentMethod: payment.paymentMethod,
        membershipPlan: membership?.plan,
        razorpayOrderId: `manual_${Math.random().toString(36).substring(2, 12)}`,
        razorpayPaymentId: `pay_manual_${Math.random().toString(36).substring(2, 12)}`,
        status: "paid",
        invoiceNo,
        paidAt: new Date()
      });

      // after renuwal start & end date, membership plan, membership status change
      user.membership.plan = membership.plan !== 'none' ? membership.plan : user.membership.plan;
      user.membership.status = 'active';
      user.membership.startDate = new Date(membership.startDate);
      user.membership.endDate = new Date(membership.endDate);

    };

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
    await Attendance.deleteMany({ userId: user._id });
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
  const { status, paymentMethod, invoicePage } = req.query;
  let query = {};

  if (status && status !== 'all') {
    query.status = status;
  }
  if (paymentMethod && paymentMethod !== 'all') {
    query.paymentMethod = paymentMethod;
  }

  try {
    const page = Number(invoicePage);
    const limit = invoice_pagination_limit;
    const skip = (page - 1) * limit;

    const payments = await Payment.find(query)
      .populate('user', 'name email countryCode mobile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const toalPayments = await Payment.countDocuments(query);

    const totalPage = Math.ceil(toalPayments / limit);

    res.json({
      payments,
      page,
      totalPage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get last payment details
// @route   GET /api/admin/payment
// @access  Private/Admin
export const getLastPayment = async (req, res) => {
  try {
    const user = await User.findById(req.params?.userId);
    if (!user) {
      return res.status(400)
      .json({message: "User not find"})
    };

    const lastPayment = await Payment.find({
      user: req.params.userId
    })
    .sort({ createdAt: -1 })
    .limit(1)

    res.json(lastPayment)

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


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

// @desc    Admin: Create new gym member manually
// @route   POST /api/admin/members
// @access  Private/Admin
export const createMember = async (req, res) => {
  const {
    name, email, mobile, password, age, gender, address, emergencyContact,
    height, weight,
    membership, // { plan, startDate, endDate, status }
    payment // { amount, paymentMethod }
  } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const newUser = await User.create({
      name,
      email,
      mobile,
      password,
      role: 'client',
      age: age ? Number(age) : undefined,
      gender,
      address,
      emergencyContact,
      height: height ? Number(height) : undefined,
      weight: weight ? Number(weight) : undefined,
      membership: {
        plan: membership?.plan || 'none',
        startDate: membership?.startDate ? new Date(membership.startDate) : undefined,
        endDate: membership?.endDate ? new Date(membership.endDate) : undefined,
        status: membership?.status || 'none'
      }
    });

    // Generate paid payment record immediately
    if (payment && payment.amount) {
      await Payment.create({
        user: newUser._id,
        amount: Number(payment.amount),
        paymentMethod: payment.paymentMethod || 'Cash Transaction',
        membershipPlan: membership?.plan || 'none',
        razorpayOrderId: `manual_${Math.random().toString(36).substring(2, 12)}`,
        razorpayPaymentId: `pay_manual_${Math.random().toString(36).substring(2, 12)}`,
        status: 'paid',
        paidAt: new Date()
      });
    }

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: List members expiring soon, expiring today, or expired for manual reminders
// @route   GET /api/admin/reminders/pending
// @access  Private/Admin
export const getPendingRemindersList = async (req, res) => {
  const { search, statusFilter, reminderPage } = req.query; // statusFilter = 'soon' | 'today' | 'expired' | 'all'

  try {
    const today = getStartOfDay(new Date());

    const clients = await User.find({ role: 'client', 'membership.plan': { $ne: 'none' } })
    // .skip(skip)
    // .limit(limit);
    console.log("clients:", clients)

    const list = [];

    for (let client of clients) {
      if (!client.membership || !client.membership.endDate) continue; // If a client doesn't have a membership or end date, that client is ignored

      const endDate = getStartOfDay(client.membership.endDate);
      const timeDiff = endDate.getTime() - today.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

      let reminderStatus = ''; // 'soon' | 'today' | 'expired'
      let statusLabel = '';

      if (daysLeft > 0 && daysLeft <= 7 && client.membership.status === 'active') {
        reminderStatus = 'soon';
        statusLabel = 'Expiring Soon';
      } else if (daysLeft === 0 && client.membership.status === 'active') {
        reminderStatus = 'today';
        statusLabel = 'Expiring Today';
      } else if (client.membership.status === 'expired' || daysLeft < 0) {
        reminderStatus = 'expired';
        statusLabel = 'Expired';
      }

      if (!reminderStatus) continue; // Not expiring within 7 days, today, or expired

      // Apply search filters
      if (search) {
        const query = search.toLowerCase();
        const nameMatch = client.name.toLowerCase().includes(query);
        const mobileMatch = client.mobile.includes(query);
        if (!nameMatch && !mobileMatch) continue;
      }

      // Apply status filter
      if (statusFilter && statusFilter !== 'all' && statusFilter !== reminderStatus) {
        continue;
      }

      list.push({
        _id: client._id,
        name: client.name,
        countryCode: client.countryCode,
        mobile: client.mobile,
        plan: client.membership.plan,
        expiryDate: client.membership.endDate,
        daysRemaining: daysLeft,
        membershipStatus: statusLabel,
        statusKey: reminderStatus
      });
    }

    // Sort by days remaining (ascending, expired/urgent first)
    list.sort((a, b) => a.daysRemaining - b.daysRemaining);

    const page = Number(reminderPage) || 1;
    const limit = reminder_pagination_limit;

    const totalRemindingClients = list.length;
    const totalPage = Math.ceil(totalRemindingClients / limit) || 1;

    // Apply pagination AFTER filtering/sorting
    const skip = (page - 1) * limit;
    const paginatedList = list.slice(skip, skip + limit)

    // Fetch last payment only for the clients on this page
    const clientIds = paginatedList.map(c => c._id);
    const payments = await Payment.aggregate([
      { $match: { user: { $in: clientIds }, status: 'paid' } },
      { $sort: { paidAt: -1 } },
      {
        $group: {
          _id: '$user',
          paidAt: { $first: '$paidAt' }
        }
      }
    ]);
    const paymentMap = new Map(payments.map(p => [String(p._id), p.paidAt]));

    const finalList = paginatedList.map(c => ({
      ...c,
      lastPaymentDate: paymentMap.get(String(c._id)) || null
    }));

    res.json({
      list: finalList,
      page,
      totalPage,
      totalRemindingClients
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Send manual WhatsApp reminder to member
// @route   POST /api/admin/reminders/send
// @access  Private/Admin
export const sendManualReminder = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'Client ID not found' });
  }

  try {
    const client = await User.findById(userId);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    const today = getStartOfDay(new Date());
    const endDate = getStartOfDay(client.membership.endDate);
    const timeDiff = endDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // const message = `Hello ${client.name},\n\nYour ${gym_full_name} membership (${client.membership.plan.toUpperCase()}) ${
    //   daysLeft < 0 ? 'expired on' : daysLeft === 0 ? 'expires today' : 'will expire on'
    // } ${client.membership.endDate.toLocaleDateString()}.\n\nPlease renew to continue your training sessions.\n\nThank you,\n${gym_first_name} Team`;

    const message = `Hello ${client.name},\n\nYour ${gym_full_name} membership (${client.membership.plan.toUpperCase()}) ${
      daysLeft < 0 ? 'expired on' : daysLeft === 0 ? 'expires today,' : 'will expire on'
    } ${client.membership.endDate.toLocaleDateString()}.\n\nPlease renew at your earliest convenience to continue your training sessions without interruption.\n\nIf you have already completed the payment, please disregard this message.\n\nThank you,\nTeam ${gym_first_name}`;

    await sendWhatsAppMessage(client.mobile, message);
    console.log(`Manual WhatsApp renewal reminder sent successfully to ${client.name}!`)

    res.json({ 
      success: true,
      message: `Manual WhatsApp renewal reminder sent successfully to ${client.name}!`
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
