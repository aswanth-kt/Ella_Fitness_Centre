import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Payment from './models/Payment.js';
import Attendance from './models/Attendance.js';
import Notification from './models/Notification.js';

dotenv.config();

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gym_db');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Payment.deleteMany({});
    await Attendance.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared existing collections.');

    // 1. Create Users
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const clientPassword = await bcrypt.hash('client123', salt);
    const expiredPassword = await bcrypt.hash('client123', salt);

    const adminUser = await User.create({
      name: 'Olympus Admin',
      email: 'admin@olympus.com',
      mobile: '9876543210',
      password: adminPassword,
      role: 'admin',
      age: 30,
      gender: 'male',
      address: 'Olympus Arena Noida',
      emergencyContact: '9876543210'
    });

    const activeClient = await User.create({
      name: 'Aakash Gupta',
      email: 'client@olympus.com',
      mobile: '9876543211',
      password: clientPassword,
      role: 'client',
      age: 26,
      gender: 'male',
      address: 'A-45 Sector 15 Noida',
      emergencyContact: '9988776655',
      membership: {
        plan: 'standard',
        status: 'active',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days from now (total 90 days = 3M)
      }
    });

    const expiredClient = await User.create({
      name: 'Riya Sen',
      email: 'expired@olympus.com',
      mobile: '9876543212',
      password: expiredPassword,
      role: 'client',
      age: 23,
      gender: 'female',
      address: 'B-12 Sector 62 Noida',
      emergencyContact: '9988776654',
      membership: {
        plan: 'starter',
        status: 'expired',
        startDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), // 40 days ago
        endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago (expired)
      }
    });

    console.log('Seeded Users: admin@olympus.com (admin123), client@olympus.com (client123), expired@olympus.com (client123)');

    // 2. Seed Payments
    const p1 = await Payment.create({
      user: activeClient._id,
      amount: 4000,
      razorpayOrderId: 'order_standard_seeded1',
      razorpayPaymentId: 'pay_standard_seeded1',
      status: 'paid',
      paidAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    });

    const p2 = await Payment.create({
      user: expiredClient._id,
      amount: 1500,
      razorpayOrderId: 'order_starter_seeded2',
      razorpayPaymentId: 'pay_starter_seeded2',
      status: 'paid',
      paidAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
    });

    // Mock failed payment
    await Payment.create({
      user: activeClient._id,
      amount: 4000,
      razorpayOrderId: 'order_failed_seeded3',
      status: 'failed',
      createdAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000)
    });

    console.log('Seeded Payments History.');

    // 3. Seed Attendance for activeClient for past 10 days
    const attendanceRecords = [];
    const statusOptions = ['present', 'absent', 'none'];

    for (let i = 0; i < 10; i++) {
      const date = normalizeDate(new Date(Date.now() - i * 24 * 60 * 60 * 1000));
      
      // Seed present/absent mix
      let morning = 'none';
      let evening = 'none';

      if (i === 0) {
        morning = 'present';
        evening = 'none';
      } else if (i % 3 === 0) {
        morning = 'absent';
        evening = 'absent';
      } else {
        morning = 'present';
        evening = i % 2 === 0 ? 'present' : 'none';
      }

      attendanceRecords.push({
        user: activeClient._id,
        date,
        morningStatus: morning,
        eveningStatus: evening
      });
    }

    await Attendance.insertMany(attendanceRecords);
    console.log('Seeded 10 days of check-in records for active client.');

    // 4. Seed Expiry Notifications
    await Notification.create({
      user: expiredClient._id,
      type: 'overdue',
      status: 'sent',
      messageContent: `Hello Riya Sen,\n\nYour gym membership expired on ${expiredClient.membership.endDate.toLocaleDateString()}.\n\nAccess is currently restricted. Please renew to resume your training sessions.\n\nThank you.`,
      sentAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
    });

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Seeding database failed:', error.message);
    process.exit(1);
  }
};

seedData();
