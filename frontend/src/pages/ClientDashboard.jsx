import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  User as UserIcon, Calendar, CreditCard, Shield, Phone, MapPin, 
  Heart, CheckCircle, AlertTriangle, AlertCircle, Edit3, Loader, CheckSquare 
} from 'lucide-react';
import axios from 'axios';

const ClientDashboard = () => {
  const { user, updateProfile, refreshUser } = useContext(AuthContext);
  const location = useLocation();

  // Data states
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState({ summary: { presentDays: 0, absentDays: 0, attendancePercentage: 0 }, history: [] });
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  // Editing profile states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    mobile: '',
    age: '',
    gender: 'male',
    address: '',
    emergencyContact: '',
    password: ''
  });
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Initialize edit form when user loads
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        mobile: user.mobile || '',
        age: user.age || '',
        gender: user.gender || 'male',
        address: user.address || '',
        emergencyContact: user.emergencyContact || '',
        password: ''
      });
    }
  }, [user, isEditing]);

  // Handle payment success banner
  useEffect(() => {
    if (location.state?.paymentSuccess) {
      setSuccessMsg('Membership activated successfully! Welcome to the Olympus family.');
      // Clean up router state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Fetch payments and attendance logs
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [payRes, attRes] = await Promise.all([
          axios.get('/payments/my-payments'),
          axios.get('/attendance/my-attendance')
        ]);
        setPayments(payRes.data);
        setAttendance(attRes.data);
      } catch (err) {
        console.error('Error fetching dashboard info:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Remaining days math helper
  const getRemainingDays = () => {
    if (!user?.membership?.endDate || user.membership.status !== 'active') return 0;
    const end = new Date(user.membership.endDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    const diff = end.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? days : 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditLoading(true);

    const result = await updateProfile(editForm);
    setEditLoading(false);

    if (result.success) {
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setEditError(result.message);
    }
  };

  const remainingDays = getRemainingDays();
  const lastPayment = payments.find(p => p.status === 'paid');

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center">
        <Loader className="h-10 w-10 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-black pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner triggers */}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-2xl p-4 mb-8 flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Dashboard Title & Overview Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Member Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Hello, {user?.name}. Monitor your training check-ins and renewals.</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-2 bg-gold text-deep-black font-bold text-xs tracking-wider px-5 py-3 rounded-full hover:scale-105 transition-transform cursor-pointer"
          >
            <Edit3 className="h-4 w-4" />
            <span>{isEditing ? 'VIEW DASHBOARD' : 'EDIT PROFILE'}</span>
          </button>
        </div>

        {!isEditing ? (
          /* DASHBOARD VIEW */
          <div className="space-y-10">
            {/* Overview Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Membership Summary Card */}
              <div className="glass-premium rounded-2xl p-6 border border-gold/15 relative overflow-hidden flex flex-col justify-between min-h-[180px]">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-xl"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">CURRENT TIERS</span>
                    <h3 className="text-2xl font-bold text-white mt-1 capitalize">
                      {user?.membership?.plan === 'none' ? 'No Active Plan' : `${user?.membership?.plan} Plan`}
                    </h3>
                  </div>
                  <div className={`p-2.5 rounded-xl ${
                    user?.membership?.status === 'active' 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-red-500/15 text-red-400 border border-red-500/20'
                  }`}>
                    {user?.membership?.status === 'active' ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                  </div>
                </div>
                
                <div className="mt-6 border-t border-white/5 pt-4">
                  {user?.membership?.status === 'active' ? (
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase">EXPIRY DATE</span>
                        <span className="text-sm font-semibold text-white mt-0.5">
                          {new Date(user.membership.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[20px] font-black text-gold">{remainingDays}</span>
                        <span className="text-[10px] text-gray-400 block uppercase">Days Left</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-red-400">
                      Access Restricted. Please purchase a membership.
                    </div>
                  )}
                </div>
              </div>

              {/* Attendance Card */}
              <div className="glass-premium rounded-2xl p-6 border border-gold/15 relative overflow-hidden flex flex-col justify-between min-h-[180px]">
                <div className="absolute top-0 right-0 w-24 h-24 bg-premium-yellow/5 rounded-full blur-xl"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">ATTENDANCE RATE</span>
                    <h3 className="text-4xl font-extrabold text-gold mt-2">{attendance.summary.attendancePercentage}%</h3>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gold/15 text-gold border border-gold/20">
                    <CheckSquare className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-white/5 pt-4 text-xs">
                  <div>
                    <span className="text-gray-400 block">DAYS PRESENT</span>
                    <span className="text-white font-bold text-sm mt-0.5">{attendance.summary.presentDays} Days</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">DAYS ABSENT</span>
                    <span className="text-white font-bold text-sm mt-0.5">{attendance.summary.absentDays} Days</span>
                  </div>
                </div>
              </div>

              {/* Last Invoiced Card */}
              <div className="glass-premium rounded-2xl p-6 border border-gold/15 relative overflow-hidden flex flex-col justify-between min-h-[180px]">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">LAST PAYMENT</span>
                    <h3 className="text-2xl font-bold text-white mt-1">
                      {lastPayment ? `₹${lastPayment.amount}` : '₹0'}
                    </h3>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/10 text-white border border-white/10">
                    <CreditCard className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4 border-t border-white/5 pt-4">
                  {lastPayment ? (
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="text-gray-400 block">PAID ON</span>
                        <span className="text-white font-semibold mt-0.5">
                          {new Date(lastPayment.paidAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold uppercase">
                          PAID
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">No payment records found.</span>
                  )}
                </div>
              </div>

            </div>

            {/* Attendance & Payment Logs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Attendance Log Table */}
              <div className="glass-premium rounded-2xl border border-gold/15 p-6 lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Attendance Logs</h3>
                  <p className="text-xs text-gray-400 mt-1">Logs representing your morning and evening session check-ins.</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-xs text-gray-400 font-bold uppercase tracking-wider">
                        <th className="py-4">Date</th>
                        <th className="py-4">Morning Session</th>
                        <th className="py-4">Evening Session</th>
                        <th className="py-4">Day Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                      {attendance.history.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-6 text-center text-gray-500 text-xs">
                            No attendance records logged yet. Contact admin to mark attendance.
                          </td>
                        </tr>
                      ) : (
                        attendance.history.map((record) => {
                          const morningPresent = record.morningStatus === 'present';
                          const eveningPresent = record.eveningStatus === 'present';
                          const dayStatus = (morningPresent || eveningPresent) ? 'Present' : 'Absent';

                          return (
                            <tr key={record._id} className="hover:bg-white/5 transition-colors">
                              <td className="py-4 font-medium">
                                {new Date(record.date).toLocaleDateString()}
                              </td>
                              <td className="py-4 capitalize">
                                <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 ${
                                  record.morningStatus === 'present' ? 'bg-emerald-500' : record.morningStatus === 'absent' ? 'bg-red-500' : 'bg-gray-500'
                                }`}></span>
                                {record.morningStatus}
                              </td>
                              <td className="py-4 capitalize">
                                <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 ${
                                  record.eveningStatus === 'present' ? 'bg-emerald-500' : record.eveningStatus === 'absent' ? 'bg-red-500' : 'bg-gray-500'
                                }`}></span>
                                {record.eveningStatus}
                              </td>
                              <td className="py-4">
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                  dayStatus === 'Present' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                }`}>
                                  {dayStatus.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payments History Box */}
              <div className="glass-premium rounded-2xl border border-gold/15 p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Payment History</h3>
                  <p className="text-xs text-gray-400 mt-1">Receipts and logs of memberships purchased.</p>
                </div>

                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                  {payments.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 text-xs">
                      No invoices recorded.
                    </div>
                  ) : (
                    payments.map((p) => (
                      <div key={p._id} className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400 font-semibold">{new Date(p.createdAt).toLocaleDateString()}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            p.status === 'paid' 
                              ? 'bg-emerald-500/15 text-emerald-400' 
                              : p.status === 'failed' 
                                ? 'bg-red-500/15 text-red-400' 
                                : 'bg-yellow-500/15 text-yellow-400'
                          }`}>
                            {p.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <span className="text-[10px] text-gray-400 block">ID: {p.razorpayOrderId}</span>
                            {p.razorpayPaymentId && <span className="text-[9px] text-gray-500 block">Txn: {p.razorpayPaymentId}</span>}
                          </div>
                          <span className="text-white font-extrabold text-sm">₹{p.amount}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* PROFILE EDIT VIEW */
          <div className="max-w-2xl mx-auto glass-premium rounded-2xl p-8 border border-gold/15">
            <h3 className="text-xl font-bold text-white mb-6">Modify Profile Settings</h3>
            
            {editError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl p-4 mb-6 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="block w-full px-4 py-3 bg-black/40 border border-gold/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors text-sm"
                  />
                </div>
                {/* Email (Disabled) */}
                <div>
                  <label className="block text-xs font-bold tracking-wider text-gray-500 uppercase mb-2">Email Address (Locked)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email}
                    className="block w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-gray-500 cursor-not-allowed text-sm"
                  />
                </div>
                {/* Mobile */}
                <div>
                  <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={editForm.mobile}
                    onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                    className="block w-full px-4 py-3 bg-black/40 border border-gold/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors text-sm"
                  />
                </div>
                {/* Age */}
                <div>
                  <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">Age</label>
                  <input
                    type="number"
                    required
                    value={editForm.age}
                    onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                    className="block w-full px-4 py-3 bg-black/40 border border-gold/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors text-sm"
                  />
                </div>
                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">Gender</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="block w-full px-4 py-3 bg-black/40 border border-gold/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors text-sm"
                  >
                    <option value="male" className="bg-deep-black">Male</option>
                    <option value="female" className="bg-deep-black">Female</option>
                    <option value="other" className="bg-deep-black">Other</option>
                  </select>
                </div>
                {/* Emergency contact */}
                <div>
                  <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">Emergency Contact</label>
                  <input
                    type="tel"
                    required
                    value={editForm.emergencyContact}
                    onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                    className="block w-full px-4 py-3 bg-black/40 border border-gold/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">Home Address</label>
                <textarea
                  rows="2"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="block w-full px-4 py-3 bg-black/40 border border-gold/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors text-sm"
                />
              </div>

              {/* Password change */}
              <div className="border-t border-gold/10 pt-6 mt-4">
                <label className="block text-xs font-bold tracking-wider text-gold uppercase mb-2">Change Password (Leave blank to keep current)</label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="New password (min 6 characters)"
                  className="block w-full px-4 py-3 bg-black/40 border border-gold/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors text-sm"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 py-4 bg-gradient-to-r from-premium-yellow to-gold text-deep-black font-bold text-xs tracking-wider rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex justify-center items-center space-x-2 cursor-pointer"
                >
                  {editLoading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin text-deep-black" />
                      <span>SAVING...</span>
                    </>
                  ) : (
                    <span>SAVE CHANGES</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-4 border border-gold/25 text-gold font-bold text-xs tracking-wider rounded-xl hover:bg-gold/10 transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
