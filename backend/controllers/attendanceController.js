import { attendence_pagination_limit } from '../const/constants.js';
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
  const { attendancePage } = req.query;
  try {
    const page = Number(attendancePage);
    const limit = attendence_pagination_limit;
    const skip = (page - 1) * limit;

    const attendanceHistory = await Attendance.find({ userId: req.user._id })
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

    const totalAttendance = await Attendance.countDocuments({ userId: req.user._id });
    const totalAttendancePage = Math.ceil(totalAttendance/limit);

    const history = await Attendance.find({ userId: req.user._id }).sort({ date: -1 });

    let presentDays = 0;
    let absentDays = 0;

    history.forEach(record => {
      if (record.status === 'Present') {
        presentDays++;
      } else if (record.status === 'Absent') {
        absentDays++;
      }
    });

    const totalDays = presentDays + absentDays;
    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    // Map history to match expectations: Date | Session Attended | Status
    const formattedHistory = attendanceHistory.map(record => ({
      _id: record._id,
      date: record.date,
      session: record.status === 'Present' ? record.session : 'Absent',
      status: record.status
    }));

    res.json({
      summary: {
        presentDays,
        absentDays,
        attendancePercentage: percentage
      },
      history: formattedHistory,
      page,
      totalAttendancePage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Mark or update attendance for a member (single session per day)
// @route   POST /api/attendance/mark
// @access  Private/Admin
export const markAttendance = async (req, res) => {
  const { userId, date, session, status } = req.body; // session = 'Morning' | 'Evening' | null, status = 'Present' | 'Absent'

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const targetDate = normalizeDate(date);

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find existing attendance or create new
    let attendance = await Attendance.findOne({ userId, date: targetDate });

    // Validate that if status is Present, a valid session is selected
    const finalSession = status === 'Present' ? session : null;

    if (attendance) {
      attendance.session = finalSession;
      attendance.status = status;
      attendance.markedBy = req.user._id;
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        userId,
        date: targetDate,
        session: finalSession,
        status,
        markedBy: req.user._id
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
      endDate = new Date(targetDate);
      startDate = new Date(targetDate);
      startDate.setDate(startDate.getDate() - 6);
      query.date = { $gte: startDate, $lte: endDate };
    } else if (type === 'monthly') {
      startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
      query.date = { $gte: startDate, $lte: endDate };
    } else if (type === 'member') {
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required for member-wise report' });
      }
      query.userId = userId;
    } else {
      return res.status(400).json({ message: 'Invalid report type' });
    }

    let users = [];
    if (type === 'member') {
      users = await User.find({ _id: userId }).select('name email mobile membership');
    } else {
      users = await User.find({ role: 'client' }).select('name email mobile membership');
    }

    const records = await Attendance.find(query).sort({ date: -1 });

    let reportData = [];

    if (type === 'daily') {
      reportData = users.map(user => {
        const record = records.find(r => r.userId.toString() === user._id.toString());
        return {
          memberName: user.name,
          membershipStatus: user.membership?.status || 'none',
          date: targetDate,
          session: record ? record.session : null,
          attendanceStatus: record ? record.status : 'Absent',
          userId: user._id
        };
      });
    } else {
      reportData = records.map(record => {
        const user = users.find(u => u._id.toString() === record.userId.toString());
        if (!user) return null;

        return {
          memberName: user.name,
          membershipStatus: user.membership?.status || 'none',
          date: record.date,
          session: record.session,
          attendanceStatus: record.status,
          userId: user._id,
          recordId: record._id
        };
      }).filter(Boolean);
    }

    let morningCount = 0;
    let eveningCount = 0;
    let totalPresent = 0;
    let totalAbsent = 0;

    reportData.forEach(item => {
      if (item.attendanceStatus === 'Present') {
        totalPresent++;
        if (item.session === 'Morning') morningCount++;
        if (item.session === 'Evening') eveningCount++;
      } else {
        totalAbsent++;
      }
    });

    const totalMarked = totalPresent + totalAbsent;
    const percentage = totalMarked > 0 ? Math.round((totalPresent / totalMarked) * 100) : 0;

    res.json({
      summary: {
        morningSessionCount: morningCount,
        eveningSessionCount: eveningCount,
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
    const page = Number(req.query.attendancePage);
    const limit = attendence_pagination_limit;
    const skip = (page - 1) * limit;

    const users = await User.find({ 
      role: 'client',
      'membership.status': 'active'
    }).select('name email mobile membership')
    .sort({createdAt: -1})
    .skip(skip)
    .limit(limit);

    const totalUsers = await User.countDocuments({ 
      role: 'client',
      'membership.status': 'active'
    })
    const totalPages = Math.ceil(totalUsers / limit)
    
    const attendanceRecords = await Attendance.find({ date: targetDate })

    // Combine users with their attendance status
    const report = users.map(user => {
      const record = attendanceRecords.find(rec => rec.userId.toString() === user._id.toString());

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        membershipStatus: user.membership?.status || 'none',
        session: record ? record.session : null,
        status: record ? record.status : 'Absent',
        recordId: record ? record._id : null,
      };
    });

    res.json({
      report,
      page,
      totalPages
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
