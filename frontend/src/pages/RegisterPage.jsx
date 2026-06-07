import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Dumbbell, User as UserIcon, Mail, Phone, Lock, Calendar, MapPin, Heart, Shield, Loader, AlertCircle } from 'lucide-react';
import { gym_first_name, gym_second_name } from '../constants/constants';

const RegisterPage = () => {
  const { user, register } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    age: '',
    gender: 'male',
    address: '',
    emergencyContact: '',
    password: '',
    role: 'client' // 'client' or 'admin'
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, mobile, password, age } = formData;
    
    if (!name || !email || !mobile || !password || !age) {
      setError('Please fill out all required fields');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setError('');
    setLoading(true);
    
    const result = await register(formData);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-deep-black flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-premium-yellow/5 rounded-full blur-3xl"></div>

      <div className="max-w-xl w-full z-10">
        {/* Branding header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="bg-gradient-to-br from-premium-yellow to-gold p-2 rounded-lg text-deep-black">
              <Dumbbell className="h-6 w-6" />
            </div>
            <span className="font-serif text-2xl font-bold tracking-wider text-gold-gradient">
              {gym_first_name}<span className="text-white font-sans text-sm font-normal tracking-widest ml-1 uppercase">{gym_second_name}</span>
            </span>
          </Link>
          
          <h2 className="text-3xl font-extrabold text-white">
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Join the gold standard of fitness today. Fill in your details below.
          </p>
        </div>

        {/* Form Box */}
        <div className="glass-premium rounded-2xl p-8 border border-gold/15">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl p-4 mb-6 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3 bg-black/40 border border-gold/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors text-sm"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3 bg-black/40 border border-gold/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors text-sm"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">
                  Mobile Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                    <Phone className="h-5 w-5" />
                  </div>
                  <input
                    type="tel"
                    name="mobile"
                    required
                    value={formData.mobile}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3 bg-black/40 border border-gold/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors text-sm"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">
                  Age *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <input
                    type="number"
                    name="age"
                    required
                    value={formData.age}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3 bg-black/40 border border-gold/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors text-sm"
                    placeholder="25"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 bg-black/40 border border-gold/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors text-sm"
                >
                  <option value="male" className="bg-deep-black">Male</option>
                  <option value="female" className="bg-deep-black">Female</option>
                  <option value="other" className="bg-deep-black">Other</option>
                </select>
              </div>

              {/* Emergency Contact */}
              <div>
                <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">
                  Emergency Contact *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                    <Heart className="h-5 w-5" />
                  </div>
                  <input
                    type="tel"
                    name="emergencyContact"
                    required
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3 bg-black/40 border border-gold/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors text-sm"
                    placeholder="9876500000"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3 bg-black/40 border border-gold/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Testing Role - Developer Toggle */}
              <div>
                <label className="block text-xs font-bold tracking-wider text-gold uppercase mb-2 flex items-center space-x-1">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Account Type (Testing Override)</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 bg-black/40 border border-gold/40 rounded-xl text-gold focus:outline-none focus:border-gold transition-colors text-sm font-semibold"
                >
                  <option value="client" className="bg-deep-black text-white">Client (Regular Member)</option>
                  <option value="admin" className="bg-deep-black text-gold">Admin (Gym Manager)</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">
                Home Address
              </label>
              <div className="relative">
                <div className="absolute top-3.5 left-0 pl-4 pointer-events-none text-gray-500">
                  <MapPin className="h-5 w-5" />
                </div>
                <textarea
                  name="address"
                  rows="2"
                  value={formData.address}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-3 bg-black/40 border border-gold/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors text-sm"
                  placeholder="Street details, City, Pin"
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
                  <span>CREATING ACCOUNT...</span>
                </>
              ) : (
                <span>REGISTER NOW</span>
              )}
            </button>
          </form>
        </div>

        {/* Redirect log in */}
        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-gold hover:text-gold-hover transition-colors">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
