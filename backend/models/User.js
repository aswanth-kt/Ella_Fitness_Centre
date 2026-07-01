import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    countryCode: { type: String, required: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['client', 'admin'], default: 'client' },
    age: { type: Number },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    address: { type: String },
    emergencyContact: { type: String },
    height: { type: Number },
    weight: { type: Number },
    membership: {
      plan: { type: String, enum: ['1month', '3month', '6month', '1year', 'student', 'none'], default: 'none' },
      startDate: { type: Date },
      endDate: { type: Date },
      status: { type: String, enum: ['active', 'expired', 'none'], default: 'none' }
    },
    healthIssues: { type: String },
    healthDescription: { type: String },
  },
  { timestamps: true }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
