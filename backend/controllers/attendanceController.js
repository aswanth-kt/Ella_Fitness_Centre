import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

// Helper to normalize dates to midnight UTC for uniform comparison
const normalizeDate = (dateStr) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// @desc    Get current user's attendance summary and history (read-only client view)
// @route   GET /api/attendance/my-attendance
// @access  Private
export const getMyAttendance = async (req, res) => {
  try {
    const history = await Attendance.find({ user: req.user._id }).sort({ date: -1 });

    let presentDays = 0;
    let absentDays = 0;

    history.forEach(record => {
      const morningPresent = record.morningStatus === 'present';
      const eveningPresent = record.eveningStatus === 'present';
      
      const morningAbsent = record.morningStatus === 'absent';
      const eveningAbsent = record.eveningStatus === 'absent';

      // Rules:
      // Present: Present in at least one session on that day.
      // Absent: Absent in at least one session AND present in none.
      if (morningPresent || eveningPresent) {
        presentDays++;
      } else if (morningAbsent || eveningAbsent) {
        absentDays++;
      }
    });

    const totalDays = presentDays + absentDays;
    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    res.json({
      summary: {
        presentDays,
        absentDays,
        attendancePercentage: percentage
      },
      history
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Mark or update attendance for a member (separately for morning/evening)
// @route   POST /api/attendance/mark
// @access  Private/Admin
export const markAttendance = async (req, res) => {
  const { userId, date, morningStatus, eveningStatus } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const targetDate = normalizeDate(date);

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find existing attendance or create new (ensures no duplicate records per user per date)
    let attendance = await Attendance.findOne({ user: userId, date: targetDate });

    if (attendance) {
      if (morningStatus !== undefined) attendance.morningStatus = morningStatus;
      if (eveningStatus !== undefined) attendance.eveningStatus = eveningStatus;
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        user: userId,
        date: targetDate,
        morningStatus: morningStatus !== undefined ? morningStatus : 'none',
        eveningStatus: eveningStatus !== undefined ? eveningStatus : 'none'
      });
    }

    res.status(200).json({
      message: 'Attendance recorded successfully',
      attendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Get attendance report (Daily, Weekly, Monthly, Member-wise)
// @route   GET /api/attendance/report
// @access  Private/Admin
export const getAttendanceReport = async (req, res) => {
  const { type, date, userId } = req.query; // type = 'daily' | 'weekly' | 'monthly' | 'member'
  const targetDate = normalizeDate(date);

  try {
    let query = {};
    let startDate, endDate;

    if (type === 'daily') {
      startDate = new Date(targetDate);
      endDate = new Date(targetDate);
      query.date = targetDate;
    } else if (type === 'weekly') {
      // 7 days window leading up to targetDate
      endDate = new Date(targetDate);
      startDate = new Date(targetDate);
      startDate.setDate(startDate.getDate() - 6);
      query.date = { $gte: startDate, $lte: endDate };
    } else if (type === 'monthly') {
      // Calendar month of targetDate
      startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
      query.date = { $gte: startDate, $lte: endDate };
    } else if (type === 'member') {
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required for member-wise report' });
      }
      query.user = userId;
    } else {
      return res.status(400).json({ message: 'Invalid report type' });
    }

    // Load users
    let users = [];
    if (type === 'member') {
      users = await User.find({ _id: userId }).select('name email mobile membership');
    } else {
      users = await User.find({ role: 'client' }).select('name email mobile membership');
    }

    // Load attendance records
    const records = await Attendance.find(query).sort({ date: -1 });

    // Format output data
    let reportData = [];

    if (type === 'daily') {
      // Daily report lists all members, showing check-ins or 'none' if empty
      reportData = users.map(user => {
        const record = records.find(r => r.user.toString() === user._id.toString());
        const morning = record ? record.morningStatus : 'none';
        const evening = record ? record.eveningStatus : 'none';
        
        let dayStatus = 'Not Marked';
        if (morning === 'present' || evening === 'present') {
          dayStatus = 'Present';
        } else if (morning === 'absent' || evening === 'absent') {
          dayStatus = 'Absent';
        }

        return {
          memberName: user.name,
          membershipStatus: user.membership?.status || 'none',
          date: targetDate,
          morningSession: morning,
          eveningSession: evening,
          attendanceStatus: dayStatus,
          userId: user._id
        };
      });
    } else {
      // Weekly, Monthly, and Member-wise reports list all logs in the date range
      reportData = records.map(record => {
        const user = users.find(u => u._id.toString() === record.user.toString());
        if (!user) return null;

        const morning = record.morningStatus;
        const evening = record.eveningStatus;
        
        let dayStatus = 'Not Marked';
        if (morning === 'present' || evening === 'present') {
          dayStatus = 'Present';
        } else if (morning === 'absent' || evening === 'absent') {
          dayStatus = 'Absent';
        }

        return {
          memberName: user.name,
          membershipStatus: user.membership?.status || 'none',
          date: record.date,
          morningSession: morning,
          eveningSession: evening,
          attendanceStatus: dayStatus,
          userId: user._id,
          recordId: record._id
        };
      }).filter(Boolean);
    }

    // Calculate Summary Stats for the period
    let morningPresent = 0;
    let eveningPresent = 0;
    let totalPresent = 0;
    let totalAbsent = 0;

    reportData.forEach(item => {
      if (item.morningSession === 'present') morningPresent++;
      if (item.eveningSession === 'present') eveningPresent++;
      
      if (item.attendanceStatus === 'Present') {
        totalPresent++;
      } else if (item.attendanceStatus === 'Absent') {
        totalAbsent++;
      }
    });

    const totalMarked = totalPresent + totalAbsent;
    const percentage = totalMarked > 0 ? Math.round((totalPresent / totalMarked) * 100) : 0;

    res.json({
      summary: {
        morningPresentCount: morningPresent,
        eveningPresentCount: eveningPresent,
        totalPresentMembers: totalPresent,
        totalAbsentMembers: totalAbsent,
        overallPercentage: percentage
      },
      report: reportData
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Get attendance roster list for marking today
// @route   GET /api/attendance/daily
// @access  Private/Admin
export const getDailyAttendance = async (req, res) => {
  const targetDate = normalizeDate(req.query.date);

  try {
    const users = await User.find({ role: 'client' }).select('name email mobile membership');
    const attendanceRecords = await Attendance.find({ date: targetDate });

    // Combine users with their attendance status
    const report = users.map(user => {
      const record = attendanceRecords.find(rec => rec.user.toString() === user._id.toString());
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        membershipStatus: user.membership?.status || 'none',
        morningStatus: record ? record.morningStatus : 'none',
        eveningStatus: record ? record.eveningStatus : 'none',
        recordId: record ? record._id : null
      };
    });

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
