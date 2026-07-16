import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, Loader, AlertCircle } from 'lucide-react';
import axios from '../api/axios.js';
import { gym_first_name } from '../constants/constants.js';

const LoginPage = () => {
  const { user, login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

const [forgotSuccessMessage, setForgotSuccessMessage] = useState('');
const [forgotError, setForgotError] = useState('');
const [forgotLoading, setForgotLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // If user is already logged in, redirect them
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      // Navigate to intended page or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } else {
      setError(result.message);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!forgotEmail) {
      setForgotError('Please enter your email address');
      return;
    }

    setForgotError('');
    setForgotSuccessMessage('');
    setForgotLoading(true);

    try {
      const { data } = await axios.post('/auth/send-otp', {
        email: forgotEmail,
      });

      setForgotSuccessMessage(data.message);
      setForgotStep(2);
    } catch (err) {
      setForgotError(
        err.response?.data?.message || 'Failed to send OTP'
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otp || !newPassword || !confirmPassword) {
      return setForgotError('Please fill all fields');
    }

    if (newPassword !== confirmPassword) {
      return setForgotError('Passwords do not match');
    }

    setForgotError('');
    setForgotSuccessMessage('');
    setForgotLoading(true);

    try {
      const { data } = await axios.patch('/auth/reset-password', {
        email: forgotEmail,
        otp,
        password: newPassword,
      });

      setForgotSuccessMessage(data.message);

      setTimeout(() => {
        setForgotMode(false);
        setForgotStep(1);

        setForgotEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');

        setForgotError('');
        setForgotSuccessMessage('');
      }, 2000);
    } catch (err) {
      setForgotError(
        err.response?.data?.message || 'Failed to reset password'
      );
    } finally {
      setForgotLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-deep-black flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-premium-yellow/5 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full z-10">
        {/* Branding header */}
        <div className="text-center mb-8">
          {/* <Link to="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="bg-gradient-to-br from-premium-yellow to-gold p-2 rounded-lg text-deep-black">
              <Dumbbell className="h-6 w-6" />
            </div>
            <span className="font-serif text-2xl font-bold tracking-wider text-gold-gradient">
              {gym_first_name}<span className="text-white font-sans text-sm font-normal tracking-widest ml-1 uppercase">{gym_second_name}</span>
            </span>
          </Link> */}
          
          <h2 className="text-3xl font-extrabold text-white">
            {forgotMode ? 'Recover Password' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {forgotMode 
              ? 'Enter your email to reset your credentials' 
              : 'Log in to access your workout metrics and plan details'}
          </p>
        </div>

        {/* Form Container */}
        <div className="glass-premium rounded-2xl p-8 border border-gold/15">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl p-4 mb-6 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!forgotMode ? (
            /* Login Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-black/40 border border-gold/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotMode(true);
                      setError('');
                      setForgotError('');
                      setForgotSuccessMessage('');
                    }}
                    className="text-xs text-gold hover:text-gold-hover font-medium focus:outline-none"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-black/40 border border-gold/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-premium-yellow to-gold text-deep-black font-extrabold text-xs tracking-wider rounded-xl shadow-lg shadow-gold/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center space-x-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin text-deep-black" />
                    <span>VERIFYING...</span>
                  </>
                ) : (
                  <span>LOG IN</span>
                )}
              </button>
            </form>
          ) : (
            /* Forgot Password Form */
            <form
              onSubmit={
                forgotStep === 1
                  ? handleSendOTP
                  : handleResetPassword
              }
              className="space-y-6"
            >
              {forgotError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl p-4 mb-2 flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccessMessage && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-xl p-4 mb-2">
                  {forgotSuccessMessage}
                </div>
              )}

              {forgotStep === 1 ? (
                <>
                  <div>
                    <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">
                      Registered Email Address
                    </label>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                        <Mail className="h-5 w-5" />
                      </div>

                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3.5 bg-black/40 border border-gold/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-4 bg-gradient-to-r from-premium-yellow to-gold text-deep-black font-extrabold text-xs tracking-wider rounded-xl shadow-lg shadow-gold/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center space-x-2 cursor-pointer"
                  >
                    {forgotLoading ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin text-deep-black" />
                        <span>SENDING OTP...</span>
                      </>
                    ) : (
                      <span>SEND OTP</span>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">
                      OTP Code
                    </label>

                    <input
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="block w-full px-4 py-3.5 bg-black/40 border border-gold/15 rounded-xl text-white focus:outline-none focus:border-gold"
                      placeholder="Enter OTP"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">
                      New Password
                    </label>

                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full px-4 py-3.5 bg-black/40 border border-gold/15 rounded-xl text-white focus:outline-none focus:border-gold"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">
                      Confirm Password
                    </label>

                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full px-4 py-3.5 bg-black/40 border border-gold/15 rounded-xl text-white focus:outline-none focus:border-gold"
                      placeholder="Confirm password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-4 bg-gradient-to-r from-premium-yellow to-gold text-deep-black font-extrabold text-xs tracking-wider rounded-xl shadow-lg shadow-gold/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center space-x-2 cursor-pointer"
                  >
                    {forgotLoading ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin text-deep-black" />
                        <span>RESETTING...</span>
                      </>
                    ) : (
                      <span>RESET PASSWORD</span>
                    )}
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => {
                  setForgotMode(false);
                  setForgotStep(1);

                  setForgotEmail('');
                  setOtp('');
                  setNewPassword('');
                  setConfirmPassword('');

                  setForgotError('');
                  setForgotSuccessMessage('');
                }}
                className="w-full py-3 border border-gold/25 text-gold font-bold text-xs tracking-wider rounded-xl hover:bg-gold/10 transition-colors"
              >
                BACK TO LOGIN
              </button>
            </form>
          )}
        </div>

        {/* Redirect sign up */}
        {!forgotMode && (
          <p className="mt-8 text-center text-sm text-gray-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-gold hover:text-gold-hover transition-colors">
              Join {gym_first_name} now
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
