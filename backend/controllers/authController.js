import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'gym_jwt_secret_token_key_gold_luxury_9988', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, mobile, password, age, gender, address, emergencyContact, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Determine role (allow role assignment for easy testing in MVP)
    const userRole = role === 'admin' ? 'admin' : 'client';

    const user = await User.create({
      name,
      email,
      mobile,
      password,
      role: userRole,
      age: age ? Number(age) : undefined,
      gender,
      address,
      emergencyContact,
      membership: {
        plan: 'none',
        status: 'none',
      }
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        membership: user.membership,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        membership: user.membership,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        age: user.age,
        gender: user.gender,
        address: user.address,
        emergencyContact: user.emergencyContact,
        membership: user.membership,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.mobile = req.body.mobile || user.mobile;
      user.age = req.body.age !== undefined ? Number(req.body.age) : user.age;
      user.gender = req.body.gender || user.gender;
      user.address = req.body.address || user.address;
      user.emergencyContact = req.body.emergencyContact || user.emergencyContact;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        role: updatedUser.role,
        age: updatedUser.age,
        gender: updatedUser.gender,
        address: updatedUser.address,
        emergencyContact: updatedUser.emergencyContact,
        membership: updatedUser.membership,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mock Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user registered with this email' });
    }

    // In a production app, we would send a reset link. For MVP, we log it and mock reset password.
    const tempPassword = Math.random().toString(36).substring(2, 8).toUpperCase();
    user.password = tempPassword;
    await user.save();

    console.log(`[FORGOT PASSWORD MOCK] Reset password code for ${email} is: ${tempPassword}`);

    res.json({
      message: `Reset code generated! (MOCKED) Your password has been reset to: ${tempPassword}. Please log in and change your password in your profile.`,
      tempPassword
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
