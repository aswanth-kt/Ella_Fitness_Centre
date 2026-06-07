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

    // Drop all indexes to prevent conflicts, then recreate them
    try {
      await Attendance.collection.dropIndexes();
      console.log('Dropped old Attendance indexes.');
    } catch (e) {
      console.log('No old Attendance indexes to drop.');
    }

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
      name: 'Gym Admin',
      email: 'admin@gym.com',
      mobile: '9876543210',
      password: adminPassword,
      role: 'admin',
      age: 30,
      gender: 'male',
      address: 'Gym Arena, Main Street',
      emergencyContact: '9876543210'
    });

    const activeClient = await User.create({
      name: 'Aakash Gupta',
      email: 'client@gym.com',
      mobile: '9876543211',
      password: clientPassword,
      role: 'client',
      age: 26,
      gender: 'male',
      address: 'A-45 Sector 15',
      emergencyContact: '9988776655',
      height: 175,
      weight: 72,
      membership: {
        plan: 'standard',
        status: 'active',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)   // 60 days from now
      }
    });

    const expiredClient = await User.create({
      name: 'Riya Sen',
      email: 'expired@gym.com',
      mobile: '9876543212',
      password: expiredPassword,
      role: 'client',
      age: 23,
      gender: 'female',
      address: 'B-12 Sector 62',
      emergencyContact: '9988776654',
      height: 162,
      weight: 55,
      membership: {
        plan: 'starter',
        status: 'expired',
        startDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), // 40 days ago
        endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)   // 10 days ago (expired)
      }
    });

    const expiringClient = await User.create({
      name: 'Vikram Nair',
      email: 'expiring@gym.com',
      mobile: '9876543213',
      password: await bcrypt.hash('client123', salt),
      role: 'client',
      age: 29,
      gender: 'male',
      address: 'C-8 Sector 18',
      emergencyContact: '9988776653',
      height: 180,
      weight: 80,
      membership: {
        plan: 'premium',
        status: 'active',
        startDate: new Date(Date.now() - 173 * 24 * 60 * 60 * 1000), // ~6 months ago
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)     // 5 days from now (expiring soon)
      }
    });

    console.log('Seeded Users:');
    console.log('  Admin: admin@gym.com / admin123');
    console.log('  Active Client: client@gym.com / client123');
    console.log('  Expired Client: expired@gym.com / client123');
    console.log('  Expiring Client: expiring@gym.com / client123');

    // 2. Seed Payments (using new schema with paymentMethod and membershipPlan)
    await Payment.create({
      user: activeClient._id,
      amount: 4000,
      razorpayOrderId: 'order_standard_seeded1',
      razorpayPaymentId: 'pay_standard_seeded1',
      status: 'paid',
      paymentMethod: 'Online Transaction',
      membershipPlan: 'standard',
      paidAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    });

    await Payment.create({
      user: expiredClient._id,
      amount: 1500,
      razorpayOrderId: 'order_starter_seeded2',
      razorpayPaymentId: 'pay_starter_seeded2',
      status: 'paid',
      paymentMethod: 'Cash Transaction',
      membershipPlan: 'starter',
      paidAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
    });

    await Payment.create({
      user: expiringClient._id,
      amount: 7000,
      razorpayOrderId: 'order_premium_seeded3',
      razorpayPaymentId: 'pay_premium_seeded3',
      status: 'paid',
      paymentMethod: 'Cash Transaction',
      membershipPlan: 'premium',
      paidAt: new Date(Date.now() - 173 * 24 * 60 * 60 * 1000)
    });

    // Mock failed payment
    await Payment.create({
      user: activeClient._id,
      amount: 4000,
      razorpayOrderId: 'order_failed_seeded4',
      status: 'failed',
      paymentMethod: 'Online Transaction',
      membershipPlan: 'standard'
    });

    console.log('Seeded Payments History.');

    // 3. Seed Attendance for activeClient - using new schema (userId, session, status)
    // Single session per day: one record per user per date
    const attendanceRecords = [];
    const sessions = ['Morning', 'Evening'];

    for (let i = 0; i < 10; i++) {
      const date = normalizeDate(new Date(Date.now() - i * 24 * 60 * 60 * 1000));

      let session = null;
      let status = 'Absent';

      if (i === 0) {
        // Today - Morning Present
        session = 'Morning';
        status = 'Present';
      } else if (i === 1) {
        // Yesterday - Evening Present
        session = 'Evening';
        status = 'Present';
      } else if (i % 3 === 0) {
        // Every 3rd day - Absent
        session = null;
        status = 'Absent';
      } else {
        // Alternate Morning/Evening
        session = sessions[i % 2];
        status = 'Present';
      }

      attendanceRecords.push({
        userId: activeClient._id,
        date,
        session,
        status,
        markedBy: adminUser._id
      });
    }

    // Also add some for expiring client
    for (let i = 0; i < 5; i++) {
      const date = normalizeDate(new Date(Date.now() - i * 24 * 60 * 60 * 1000));
      attendanceRecords.push({
        userId: expiringClient._id,
        date,
        session: i % 2 === 0 ? 'Morning' : 'Evening',
        status: 'Present',
        markedBy: adminUser._id
      });
    }

    await Attendance.insertMany(attendanceRecords);
    console.log('Seeded attendance records for active and expiring clients.');

    console.log('\n✅ Database Seeding Completed Successfully!');
    console.log('------------------------------------------');
    console.log('Login Credentials:');
    console.log('  Admin:    admin@gym.com     / admin123');
    console.log('  Client:   client@gym.com    / client123');
    console.log('  Expired:  expired@gym.com   / client123');
    console.log('  Expiring: expiring@gym.com  / client123');
    console.log('------------------------------------------');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding database failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seedData();
