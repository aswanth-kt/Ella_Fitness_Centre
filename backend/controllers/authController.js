import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import generateOtp from '../utils/otpGenerator.js';
import sendNodeMailer from '../utils/emailVerification.js';

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
  const { name, email, mobile, password, age, gender, address, emergencyContact, role, height, weight } = req.body;

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
      height: height ? Number(height) : undefined,
      weight: weight ? Number(weight) : undefined,
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
        height: user.height,
        weight: user.weight,
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
      user.height = req.body.height !== undefined ? Number(req.body.height) : user.height;
      user.weight = req.body.weight !== undefined ? Number(req.body.weight) : user.weight;

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
        height: updatedUser.height,
        weight: updatedUser.weight,
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


// @desc    Sending OTP to memeber email
// @route   POST /api/auth/send-otp
// @access  
export const sendOTP = async (req, res) => {
  try {

    const { email } = req.body;

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'No user registered with this email' });
    };

    const otp = generateOtp()

    const emailSent = await sendNodeMailer(email, otp)

    if (!emailSent) {
      return res.status(400)
      .json({message: "Failed to send email. Please try again later"})
    };

    // store otp, email in session for veryfy user typed otp
    req.session.resetData = {
      email,
      otp,
      expiredAt: Date.now() + 5 * 60 * 1000
    };
    await req.session.save();

    // console.log("Session ID:", req.sessionID);
    // console.log("Session:", req.session);

    res.json({message: "OTP send"})
    
  } catch (error) {
    console.log("Nodemailer Error logged:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    reset password and save to DB
// @route   POST /api/auth/reset-password
// @access  
export const resetPassword = async (req, res) => {
  try {

    const {email, otp, password} = req.body
    if (!email || !otp || !password) {
      return res.status(400)
      .json({message: "All fields are required"})
    };

    const resetData = req.session.resetData;

    // console.log("Session ID:", req.sessionID);
    // console.log("Session:", req.session);
    // console.log("Reset Data:", req.session.resetData);

    if (!resetData) {
      return res.status(400).json({
        message: "OTP not found"
      });
    }

    // checking otp is expire
    if (Date.now() > resetData.expiredAt) {
      return res.status(400).json({
        message: "OTP expired"
      });
    }

    if (
      resetData.email !== email ||
      String(resetData.otp) !== String(otp)
    ) {
      return res.status(400)
      .json({message: "Invalid OTP"})
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404)
      .json({message: "If an account exists, OTP has been sent"})
    };

    user.password = password;
    await user.save();

    // session cleared after success
    delete req.session.resetData;
    await req.session.save();

    res.json({message: "Password reset complete"})
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};