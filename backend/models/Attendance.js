import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true }, // Store normalized date (start of day)
    morningStatus: { type: String, enum: ['present', 'absent', 'none'], default: 'none' },
    eveningStatus: { type: String, enum: ['present', 'absent', 'none'], default: 'none' }
  },
  { timestamps: true }
);

// Ensure a user can only have one attendance record per day
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
