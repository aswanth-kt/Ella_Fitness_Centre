import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import generateOtp from '../utils/otpGenerator.js';
import sendNodeMailer from '../utils/emailVerification.js';
import { validateCountryCode, validateEmail, validateMobileNumber, validatePassword } from '../middleware/validatorsMiddleware.js';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'gym_jwt_secret_token_key_gold_luxury_9988', {
    expiresIn: '30d',
  });
};

// Helper to set auth cookies
const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  };

  if (accessToken) {
    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000 // 15 mins
    });
  }
  
  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, countryCode, mobile, password, age, gender, address, emergencyContact, role, height, weight, healthIssues, healthDescription } = req.body;

  // fields validation
  const cc = validateCountryCode(countryCode);
  const mob = validateMobileNumber(mobile);
  const em = validateEmail(email);
  const pw = validatePassword(password);

  if (!cc.valid) return res.status(400).json({ message: cc.message });
  if (!mob.valid) return res.status(400).json({ message: mob.message });
  if (!em.valid) return res.status(400).json({ message: em.message });
  if (!pw.valid) return res.status(400).json({ message: pw.message });

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Determine role (allow role assignment for easy testing in MVP)
    // const userRole = role === 'admin' ? 'admin' : 'client';

    const user = await User.create({
      name,
      email,
      countryCode,
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
        plan: 'none',
        status: 'none',
      },
      healthIssues: healthIssues ? healthIssues : undefined,
      healthDescription: healthDescription ? healthDescription : undefined
    });

    if (user) {
      const accessToken = signAccessToken(user._id);
      const refreshToken = signRefreshToken(user._id);
      
      user.refreshToken = refreshToken;
      await user.save();
      
      setAuthCookies(res, accessToken, refreshToken);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.countryCode + user.mobile,
        role: user.role,
        membership: user.membership,
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
      const accessToken = signAccessToken(user._id);
      const refreshToken = signRefreshToken(user._id);
      
      user.refreshToken = refreshToken;
      await user.save();
      
      setAuthCookies(res, accessToken, refreshToken);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        countryCode: user.countryCode,
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
        countryCode: user.countryCode,
        mobile: user.mobile,
        role: user.role,
        age: user.age,
        gender: user.gender,
        address: user.address,
        emergencyContact: user.emergencyContact,
        height: user.height,
        weight: user.weight,
        membership: user.membership,
        healthIssues: user.healthIssues || '',
        healthDescription: user.healthDescription || '',
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
  // validation
  const cc = validateCountryCode(req.body?.countryCode);
  const mob = validateMobileNumber(req.body?.mobile);
  const em = validateEmail(req.body?.email);
  const pw = validatePassword(req.body?.password);

  if (!cc.valid) return res.status(400).json({ message: cc.message });
  if (!mob.valid) return res.status(400).json({ message: mob.message });
  if (req.body?.email && !em.valid) return res.status(400).json({ message: em.message });
  if (req.body?.password && !pw.valid) return res.status(400).json({ message: pw.message });

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.countryCode = req.body.countryCode || user.countryCode;
      user.mobile = req.body.mobile || user.mobile;
      user.age = req.body.age !== undefined ? Number(req.body.age) : user.age;
      user.gender = req.body.gender || user.gender;
      user.address = req.body.address || user.address;
      user.emergencyContact = req.body.emergencyContact || user.emergencyContact;
      user.height = req.body.height !== undefined ? Number(req.body.height) : user.height;
      user.weight = req.body.weight !== undefined ? Number(req.body.weight) : user.weight;

      if (req.body.healthIssues && req.body.healthIssues !== 'other') {
        user.healthIssues = req.body.healthIssues;
        user.healthDescription = '';
      } else {
        user.healthIssues = req.body.healthIssues
        user.healthDescription = req.body.healthDescription
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        countryCode: updatedUser.countryCode,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        role: updatedUser.role,
        age: updatedUser.age,
        gender: updatedUser.gender,
        address: updatedUser.address,
        emergencyContact: updatedUser.emergencyContact,
        height: updatedUser.height,
        weight: updatedUser.weight,
        healthIssues: updatedUser.healthIssues,
        healthDescription: updatedUser.healthDescription,
        membership: updatedUser.membership,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
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
// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'gym_refresh_token_secret_1122');
      const user = await User.findById(decoded.id);
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    } catch (error) {
      // Ignore token verification errors on logout, just clear the cookies
    }
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshUserToken = async (req, res) => {
  const presentedToken = req.cookies.refreshToken;

  if (!presentedToken) {
    return res.status(401).json({ message: 'Not authorized, no refresh token' });
  }

  try {
    const decoded = jwt.verify(presentedToken, process.env.REFRESH_TOKEN_SECRET || 'gym_refresh_token_secret_1122');
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== presentedToken) {
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return res.status(401).json({ message: 'Not authorized, token mismatch' });
    }

    const newAccessToken = signAccessToken(user._id);
    const newRefreshToken = signRefreshToken(user._id);
    
    user.refreshToken = newRefreshToken;
    await user.save();
    
    setAuthCookies(res, newAccessToken, newRefreshToken);

    res.json({ message: 'Token refreshed' });
  } catch (error) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

