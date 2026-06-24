import { useState, useEffect, useContext } from 'react';
import { data, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  CreditCard, 
  CheckCircle, AlertTriangle, AlertCircle, Edit3, Loader, CheckSquare,
  Receipt,
} from 'lucide-react';
import axios from '../api/axios.js';
import { attendence_pagination_limit, gym_first_name, gym_full_name } from '../constants/constants';
import gymImage from '../assets/banner/bannerImage.png'
import { membershipPlans } from '../constants/membershipPlans.js';
import { healthIssuesList } from '../constants/healthIssues.js';
import GymTermsConditions from '../components/GymTermsConditions.jsx';
import PaymentReceiptModal from '../components/PaymentReceiptModal.jsx';
import Pagination from '../components/Pagination.jsx';

const ClientDashboard = () => {
  const { user, updateProfile, refreshUser } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Data states
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState({ summary: { presentDays: 0, absentDays: 0, attendancePercentage: 0 }, history: [] });
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  // Pagination
  const [attendancePage, setattendancePage] = useState(1);
  const [attendanceTotalPage, setAttendanceTotalPage] = useState(1);

  // Editing profile states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    mobile: '',
    age: '',
    gender: 'male',
    address: '',
    emergencyContact: '',
    password: '',
    height: '',
    weight: '',
    healthIssues: '',
    healthDescription: '',
  });  
  const [hasHealthIssue, setHasHealthIssue] = useState(user?.healthIssues !== '' ? true : false);

  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Membership Renewal states
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState('');
  const [renewalError, setRenewalError] = useState('');

  // Receipt states
  const [showReceipt, setShowReceipt] = useState(false);

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
        password: '',
        height: user.height || '',
        weight: user.weight || '',
        healthIssues: user.healthIssues || '',
        healthDescription: user.healthDescription || '',
      });
    }
  }, [user, isEditing]);

  // Handle payment success banner
  useEffect(() => {
    if (location.state?.paymentSuccess) {
      setSuccessMsg(`Membership activated successfully! Welcome to the ${gym_first_name} family.`);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Fetch payments and attendance logs
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [payRes, attRes] = await Promise.all([
        axios.get('/payments/my-payments'),
        axios.get('/attendance/my-attendance', {
          params: {
            attendancePage
          }
        })
      ]);

      setPayments(payRes.data);
      setAttendance(attRes.data);
      setattendancePage(attRes.data.page)
      setAttendanceTotalPage(attRes.data.totalAttendancePage)

    } catch (err) {
      console.error('Error fetching dashboard info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, attendancePage]);

  // Dynamically load Razorpay SDK script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRenewalPurchase = async (planId) => { 
    setLoadingPlan(planId);
    setRenewalError('');

    try {
      // Create order in backend
      const { data: orderData } = await axios.post('/payments/order', { planName: planId });

      // Load Razorpay SDK
      await loadRazorpayScript();

      // Launch Razorpay checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: `${gym_full_name}`,
        description: `Renewal activation of ${planId.toUpperCase()} membership plan`,
        image: {gymImage},
        order_id: orderData.id,
        handler: async (response) => {
          try {
            const verifyPayload = {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              planName: planId,
            };

            await axios.post('/payments/verify', verifyPayload);
            await refreshUser();
            setShowRenewalModal(false);
            setSuccessMsg('Membership renewed and extended successfully!');
            fetchDashboardData();

          } catch (err) {
            setRenewalError(err.response?.data?.message || 'Payment verification failed.');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.mobile
        },
        theme: {
          color: 'var(--color-gold)'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error(err);
      setRenewalError(err.response?.data?.message || 'Error processing renewal.');
    } finally {
      setLoadingPlan('');
    }
  };

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
            {user && (user.height || user.weight) && (
              <div className="flex space-x-6 mt-3 text-xs bg-gold/10 text-gold px-4 py-2 rounded-xl border border-gold/15 w-fit">
                {user.height && <span>Height: <strong className="text-white font-bold">{user.height} cm</strong></span>}
                {user.weight && <span>Weight: <strong className="text-white font-bold">{user.weight} kg</strong></span>}
              </div>
            )}
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
              
              {/* Membership Summary Card (Includes Expiry, Plan, Renewal Trigger, Renewal Status) */}
              <div className="glass-premium rounded-2xl p-6 border border-gold/15 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-xl"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">CURRENT PLAN</span>
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
                
                <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block uppercase">EXPIRY DATE</span>
                    <span className="text-white font-semibold mt-0.5 block">
                      {user?.membership?.endDate ? new Date(user.membership.endDate).toLocaleDateString('en-IN') : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block uppercase">RENEWAL STATUS</span>
                    <span className={`font-bold mt-0.5 block ${
                      user?.membership?.status === 'active' 
                        ? remainingDays <= 7 ? 'text-yellow-400 animate-pulse' : 'text-emerald-400'
                        : 'text-red-400'
                    }`}>
                      {user?.membership?.status === 'active' 
                        ? remainingDays <= 7 ? 'Needs Renewal' : 'Active'
                        : 'Expired'
                      }
                    </span>
                  </div>
                </div>

                <div className="mt-4 border-t border-white/5 pt-4 flex justify-between items-center">
                  <div>
                    <span className="text-[20px] font-black text-gold">{remainingDays}</span>
                    <span className="text-[10px] text-gray-400 ml-1.5 uppercase">Days Left</span>
                  </div>
                  <button
                    onClick={() => setShowRenewalModal(true)}
                    className="bg-gold hover:bg-gold-hover text-deep-black font-extrabold text-[10px] tracking-wider px-4 py-2 rounded-full cursor-pointer uppercase shadow-md shadow-gold/15"
                  >
                    Renew Membership
                  </button>
                </div>
              </div>

              {/* Attendance Card */}
              <div className="glass-premium rounded-2xl p-6 border border-gold/15 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
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
              <div className="glass-premium rounded-2xl p-6 border border-gold/15 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
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
                          {new Date(lastPayment.paidAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold uppercase">
                          PAID
                        </span>
                        <button
                          onClick={() => setShowReceipt(true)}
                          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border transition-all duration-150 cursor-pointer"
                          style={{
                            backgroundColor: 'rgba(225,29,72,0.12)',
                            borderColor: 'rgba(225,29,72,0.25)',
                            color: '#F43F5E',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = 'rgba(225,29,72,0.22)';
                            e.currentTarget.style.borderColor = 'rgba(225,29,72,0.45)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = 'rgba(225,29,72,0.12)';
                            e.currentTarget.style.borderColor = 'rgba(225,29,72,0.25)';
                          }}
                        >
                          <Receipt className="h-3 w-3" />
                          Receipt
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">No payment records found.</span>
                  )}
                </div>
              </div>

            </div>

            {/* Show the last receipt */}
            {showReceipt && (
              <PaymentReceiptModal
                isOpen={showReceipt}
                onClose={() => setShowReceipt(false)}
                receiptData={{
                  invoiceNumber: lastPayment?.invoiceNo,
                  name: user?.name,
                  membershipPlan: user?.membership?.plan,
                  amount: `₹${lastPayment?.amount}`,
                  startDate: new Date(user?.membership?.startDate).toLocaleDateString('en-IN'),
                  endDate: new Date(user?.membership?.endDate).toLocaleDateString('en-IN'),
                  paymentMethod: lastPayment?.paymentMethod,
                  paymentDate: new Date(lastPayment?.paidAt).toLocaleDateString('en-IN'),
                }}
              />
            )}

            {/* Attendance & Payment Logs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Attendance Log Table */}
              <div className="glass-premium rounded-2xl border border-gold/15 p-6 lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Attendance Logs</h3>
                  <p className="text-xs text-gray-400 mt-1">Logs representing your daily check-in sessions.</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-xs text-gray-400 font-bold uppercase tracking-wider">
                        <th className="py-4">Date</th>
                        <th className="py-4">Session Attended</th>
                        <th className="py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                      {attendance.history.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="py-6 text-center text-gray-500 text-xs">
                            No attendance records logged yet. Contact admin to mark attendance.
                          </td>
                        </tr>
                      ) : (
                        attendance.history.map((record) => (
                          <tr key={record._id} className="hover:bg-white/5 transition-colors">
                            <td className="py-4 font-medium">
                              {new Date(record.date).toLocaleDateString('en-IN')}
                            </td>
                            <td className="py-4 capitalize font-semibold text-white">
                              {record.session}
                            </td>
                            <td className="py-4">
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                                record.status === 'Present' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                              }`}>
                                {record.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}

                      <Pagination 
                        current={attendancePage}
                        total={attendanceTotalPage}
                        totalItems={attendance.history.length}
                        item="attendence"
                        perPage={attendence_pagination_limit}
                        onPageChange={(page) => setattendancePage(page)}
                        colSpan={3}
                      />

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

                <div className="space-y-4 max-h-[350px] md:max-h-[500px] overflow-y-auto pr-2">
                  {payments.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 text-xs">
                      No invoices recorded.
                    </div>
                  ) : (
                    payments.map((p) => (
                      <div key={p._id} className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400 font-semibold">{new Date(p.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
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
                            {p.paymentMethod && <span className="text-[9px] text-gold/80 block uppercase mt-0.5">{p.paymentMethod}</span>}
                          </div>
                          <span className="text-white font-extrabold text-sm">₹{p.amount}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
            {/* Gym terms & conditions */}
            <GymTermsConditions />
          </div>
        ) : (
          /* PROFILE EDIT VIEW (Includes Height & Weight Fields) */
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
                {/* Height */}
                <div>
                  <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">Height (cm)</label>
                  <input
                    type="number"
                    value={editForm.height}
                    onChange={(e) => setEditForm({ ...editForm, height: e.target.value })}
                    placeholder="e.g. 175"
                    className="block w-full px-4 py-3 bg-black/40 border border-gold/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors text-sm"
                  />
                </div>
                {/* Weight */}
                <div>
                  <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    value={editForm.weight}
                    onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                    placeholder="e.g. 70"
                    className="block w-full px-4 py-3 bg-black/40 border border-gold/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors text-sm"
                  />
                </div>
                {/* Health Issue */}
                <div>
                  <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">
                    Any Health Issues?
                  </label>

                  {/* Yes / No toggle */}
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setHasHealthIssue (true) }
                      className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-colors ${
                        hasHealthIssue
                          ? 'bg-gold/20 border-gold text-gold'
                          : 'bg-black/40 border-gold/15 text-gray-400'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditForm({
                          ...editForm,
                          healthIssues: '',
                          healthDescription: '',
                        });

                        setHasHealthIssue(false);
                      }}
                      className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-colors ${
                        !hasHealthIssue
                          ? 'bg-gold/20 border-gold text-gold'
                          : 'bg-black/40 border-gold/15 text-gray-400'
                      }`}
                    >
                      No
                    </button>
                  </div>

                  {/* Dropdown - shown only if "Yes" */}
                  {hasHealthIssue && (
                    <select
                      value={editForm.healthIssues}
                      onChange={(e) => setEditForm({ 
                        ...editForm, 
                        healthIssues: e.target.value,
                        healthDescription: e.target.value !== 'other' ? '' : editForm.healthDescription
                      })}
                      className="block w-full mt-3 px-4 py-3 bg-black/40 border border-gold/15 rounded-xl text-white focus:outline-none focus:border-gold transition-colors text-sm"
                    >
                      <option value="" className="bg-deep-black">Select an issue</option>
                      {healthIssuesList.map(({ value, label }) => (
                        <option key={value} value={value} className="bg-deep-black">
                          {label}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Description box - shown only if "Other" is selected */}
                  {hasHealthIssue && editForm.healthIssues === 'other' && (
                    <div className="mt-3">
                      <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">
                        Please describe your health issue
                      </label>
                      <textarea
                        rows="3"
                        value={editForm.healthDescription}
                        onChange={(e) => setEditForm({ ...editForm, healthDescription: e.target.value })}
                        className="block w-full px-4 py-3 bg-black/40 border border-gold/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors text-sm"
                        placeholder="Describe your specific health condition or concern..."
                      />
                    </div>
                  )}
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

      {/* RENEW MEMBERSHIP PLAN SELECTOR MODAL */}
      {showRenewalModal && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/85 backdrop-blur-sm overflow-y-auto px-4 py-6 sm:py-10">
          <div className="glass-premium border-gold/30 rounded-3xl max-w-5xl w-full p-5 sm:p-8 space-y-6 my-auto animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gold/10 pb-4">
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-gold shrink-0" />
                <span>Extend & Renew Membership Subscription</span>
              </h3>
              <button 
                onClick={() => setShowRenewalModal(false)}
                className="self-end sm:self-auto text-gray-400 hover:text-white font-bold text-sm p-1.5 shrink-0"
              >
                CLOSE
              </button>
            </div>

            {renewalError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{renewalError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {membershipPlans.map((plan) => (
                <div key={plan.id} className="border border-gold/15 bg-dark-gray/30 p-5 sm:p-6 rounded-2xl flex flex-col justify-between hover:border-gold/30 transition-all">
                  <div>
                    <h4 className="text-lg font-bold text-white capitalize">{plan.name}</h4>
                    <span className="text-xs text-gold uppercase tracking-wider block mt-1">{plan.duration}</span>
                    <div className="text-2xl font-extrabold text-white my-4">₹{plan.price}</div>
                    
                    <ul className="space-y-2 text-xs text-gray-400 border-t border-white/5 pt-4">
                      {plan.benefits.map((b, idx) => (
                        <li key={idx} className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 bg-gold rounded-full shrink-0"></span>
                          <span className="truncate flex-1 min-w-0">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    disabled={loadingPlan !== ''}
                    onClick={() => handleRenewalPurchase(plan.id)}
                    className="w-full mt-6 py-2.5 bg-gradient-to-r from-premium-yellow to-gold text-deep-black font-bold text-xs tracking-wider rounded-xl hover:scale-[1.02] transition-transform cursor-pointer"
                  >
                    {loadingPlan === plan.id ? 'PROCESSING...' : 'ACTIVATE'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClientDashboard;
