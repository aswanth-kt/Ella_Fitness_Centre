import { useState, useEffect } from 'react';
import { 
  Shield, Users, CheckCircle, CheckCircle2, AlertTriangle, Calendar, 
  IndianRupee, Search, Edit3, Trash2, Loader, 
  RefreshCw, AlertCircle, Plus, CreditCard,
  Check, Hourglass, XCircle, Smartphone, Banknote, ThumbsUp,
} from 'lucide-react';
import axios from '../api/axios.js';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { attendence_pagination_limit, gym_first_name, invoice_pagination_limit, members_pagination_limit, reminder_pagination_limit } from '../constants/constants.js';
import Pagination from '../components/Pagination.jsx';
import { membershipPlans } from '../constants/membershipPlans.js';
import { countryCodes } from '../constants/countryCodes.js';

const AdminDashboard = () => {
  // Tabs: 'overview', 'members', 'attendance', 'payments', 'reminders'
  const [activeTab, setActiveTab] = useState('overview');

  // API Data States
  const [stats, setStats] = useState({
    cards: {
      totalMembers: 0,
      activeMembers: 0,
      expiredMembers: 0,
      todayAttendance: { morningPresent: 0, eveningPresent: 0, totalPresent: 0, totalAbsent: 0 },
      monthlyRevenue: 0,
      totalRevenue: 0,
      onlineRevenue: 0,
      cashRevenue: 0
    },
    charts: { revenueData: [], membershipData: [], attendanceData: [] }
  });
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [pendingReminders, setPendingReminders] = useState([]);
  const [dailyAttendance, setDailyAttendance] = useState([]);
  
  // Controls & Loaders
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Manual whatsapp reminder
  const [sendManualWhatsAppIds, setSendManualWhatsAppIds] = useState(new Set());

  // Filtering & Search
  const [memberSearch, setMemberSearch] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState('all');
  const [memberPlanFilter, setMemberPlanFilter] = useState('all');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [reminderSearch, setReminderSearch] = useState('');
  const [reminderStatusFilter, setReminderStatusFilter] = useState('all'); // 'all', 'soon', 'today', 'expired'

  // Edit Member Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '', email: '', countryCode: '', mobile: '', age: '', gender: 'male', address: '', emergencyContact: '',
    height: '', weight: '',
    membership: { plan: 'none', status: 'none', startDate: '', endDate: '' },
    payment: { amount: '', paymentMethod: 'Cash Transaction' }
  });

  // edit membership confirmation for Membership Validity Overrides.
  const [membershipConfirmed, setMembershipConfirmed] = useState(false);

  // Manual Add Member Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '', email: '', countryCode: '+91', mobile: '', age: '', gender: 'male', address: '', emergencyContact: '',
    height: '', weight: '', password: '',
    membership: { plan: 'none', status: 'none', startDate: '', endDate: '' },
    payment: { amount: '', paymentMethod: 'Cash Transaction' }
  });

  // Recharts colors
  const GOLD_COLORS = ['var(--color-gold-hover)', 'var(--color-gold)', 'var(--color-gold-dark)', 'var(--color-light-gray)'];

  // Paginations states
  // Memeber tasb
  const [memberPage, setMemberPage] = useState(1);
  const [membertotalPages, setMemberTotalPages] = useState(1);
  // Attendance tab
  const [attendancePage, setAttendancePage] = useState(1);
  const [attendanceTotalPage, setAttendanceTotalPage] = useState(1);
  // Invoice tab
  const [invoicePage, setInvoicePage] = useState(1);
  const [InvoiceTotalPage, setInvoiceTotalPage] = useState(1);
  // Reminder tab
  const [reminderPage, setReminderPage] = useState(1);
  const [reminderTotalPage, setReminderTotalPage] = useState(1);

  // Pending Payment Verifications (manual UPI/Cash renewals awaiting admin approval)
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verifyActionId, setVerifyActionId] = useState(''); // payment _id currently being approved/rejected
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingPayment, setRejectingPayment] = useState(null);
  const [rejectReason, setRejectReason] = useState('');


  // Load stats and database entities
  const fetchStats = async () => {
    try {
      const { data } = await axios.get('/admin/stats');
      setStats(data);
    } catch (err) {
      console.error('Error fetching admin dashboard statistics:', err);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data } = await axios.get('/admin/members', {
        params: { 
          search: memberSearch, 
          status: memberStatusFilter, 
          plan: memberPlanFilter, 
          memberPage,
        }
      });

      setMembers(data.members);
      setMemberTotalPages(data.totalPages)
      setMemberPage(data.page);

    } catch (err) {
      console.error('Error loading members directory:', err);
    }
  };

  const fetchPayments = async () => {
    try {
      const { data } = await axios.get('/admin/payments', {
        params: { 
          status: paymentStatusFilter, 
          paymentMethod: paymentMethodFilter,
          invoicePage
        }
      });

      setPayments(data.payments);
      setInvoicePage(data.page);
      setInvoiceTotalPage(data.totalPage);

    } catch (err) {
      console.error('Error loading payments:', err);
    }
  };

  const fetchPendingReminders = async () => {
    try {
      const { data } = await axios.get('/admin/reminders/pending', {
        params: { 
          search: reminderSearch, 
          statusFilter: reminderStatusFilter, 
          reminderPage
        }
      });

      setPendingReminders(data.list);
      setReminderPage(data.page);
      setReminderTotalPage(data.totalPage)
      
    } catch (err) {
      console.error('Error loading pending reminders list:', err);
    }
  };

  const fetchPendingVerifications = async () => {
    setVerificationLoading(true);
    try {
      const { data } = await axios.get('/admin/pending');
      setPendingVerifications(data);
    } catch (err) {
      console.error('Error loading pending payment verifications:', err);
    } finally {
      setVerificationLoading(false);
    }
  };

  const fetchDailyAttendance = async () => {
    try {
      const { data } = await axios.get('/attendance/daily', {
        params: { 
          date: attendanceDate,
          attendancePage,
        }
      });

      setDailyAttendance(data.report);
      setAttendanceTotalPage(data.totalPages);
      setAttendancePage(data.page)
      
    } catch (err) {
      console.error('Error loading daily attendance sheets:', err);
    }
  };

  // Load everything
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchMembers(),
        fetchPayments(),
        fetchDailyAttendance(),
        fetchPendingVerifications()
      ]);
      setLoading(false);
    };
    loadAllData();
  }, []);

  // Sync member queries
  useEffect(() => {
    if (!loading) {
      fetchMembers();
    }
  }, [memberSearch, memberStatusFilter, memberPlanFilter, memberPage]);

  // Sync attendance date
  useEffect(() => {
    if (!loading) {
      fetchDailyAttendance();
    }
  }, [attendanceDate, attendancePage]);

  // Sync payment queries
  useEffect(() => {
    if (!loading) {
      fetchPayments();
    }
  }, [paymentStatusFilter, paymentMethodFilter, invoicePage]);

  // Sync reminders tab queries
  useEffect(() => {
    if (activeTab === 'reminders') {
      fetchPendingReminders();
    }
  }, [activeTab, reminderSearch, reminderStatusFilter, reminderPage]);

  // Sync pending payment verification tab
  useEffect(() => {
    if (activeTab === 'verifications') {
      fetchPendingVerifications();
    }
  }, [activeTab]);

  // Mark manual WhatsApp renewal reminder
  const sendManualWhatsApp = async (userId) => {
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const { data } = await axios.post('/admin/reminders/send', { userId });

      if (data.success) {
        setSendManualWhatsAppIds((prev) => new Set(prev).add(userId))
      }
      setSuccessMsg(data.message);
      setTimeout(() => setSuccessMsg(''), 4000);

    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to dispatch manual alert.');
    } finally {
      setActionLoading(false);
    }
  };

  // Mark specific member attendance (Session = 'Morning' | 'Evening' | null, Status = 'Present' | 'Absent')
  const updateMemberAttendance = async (userId, session, status) => {
    try {
      const payload = {
        userId,
        date: attendanceDate,
        session,
        status
      };
      await axios.post('/attendance/mark', payload);
      // Reload daily attendance sheet and card counters
      await Promise.all([fetchDailyAttendance(), fetchStats()]);
      setSuccessMsg('Attendance marked successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg('Error marking attendance: ' + (err.response?.data?.message || err.message));
    }
  };

  // Delete User handler
  const deleteMemberHandler = async (id) => {
    if (!window.confirm('Are you sure you want to delete this member? This will wipe out their payment logs and attendance records.')) return;
    
    setActionLoading(true);
    try {
      await axios.delete(`/admin/members/${id}`);
      setSuccessMsg('Member deleted successfully.');
      await Promise.all([fetchMembers(), fetchStats(), fetchPayments(), fetchDailyAttendance()]);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error deleting member.');
    } finally {
      setActionLoading(false);
    }
  };


  // Approve a pending manual (UPI/Cash) payment and activate the membership
  const approvePendingPayment = async (paymentId) => {
    setVerifyActionId(paymentId);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const { data } = await axios.post(`/admin/${paymentId}/verify`);
      setSuccessMsg(data.message || 'Payment verified and membership activated.');
      setTimeout(() => setSuccessMsg(''), 4000);
      await Promise.all([fetchPendingVerifications(), fetchMembers(), fetchStats(), fetchPayments()]);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to verify payment.');
    } finally {
      setVerifyActionId('');
    }
  };

  // Open the rejection reason modal for a specific pending payment
  const openRejectModal = (payment) => {
    setRejectingPayment(payment);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  // Submit rejection with reason
  const submitRejectPayment = async (e) => {
    e.preventDefault();
    if (!rejectingPayment) return;

    setVerifyActionId(rejectingPayment._id);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const { data } = await axios.post(`/admin/${rejectingPayment._id}/reject`, {
        reason: rejectReason,
      });
      setSuccessMsg(data.message || 'Payment rejected.');
      setTimeout(() => setSuccessMsg(''), 4000);
      setRejectModalOpen(false);
      setRejectingPayment(null);
      setRejectReason('');
      await Promise.all([fetchPendingVerifications(), fetchPayments()]);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to reject payment.');
    } finally {
      setVerifyActionId('');
    }
  };

  // fetch last payment details for fill edit form.
  const fetchLastPayment = async (userId) => {
    try {
      const { data } = await axios.get(`/admin/payment/${userId}`);
      return data;
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error modifying member settings - fetching last payment.');
    }
  };
  
  // Open Edit Modal
  const openEditModal = async (member) => {
    const lastPayment = await fetchLastPayment(member._id)

    setEditingMember(member);
    setEditForm({
      name: member.name || '',
      email: member.email || '',
      countryCode: member.countryCode || '+91',
      mobile: member.mobile || '',
      age: member.age || '',
      gender: member.gender || 'male',
      address: member.address || '',
      emergencyContact: member.emergencyContact || '',
      height: member.height || '',
      weight: member.weight || '',
      membership: {
        plan: member.membership?.plan || 'none',
        status: member.membership?.status || 'none',
        startDate: member.membership?.startDate ? new Date(member.membership.startDate).toISOString().split('T')[0] : '',
        endDate: member.membership?.endDate ? new Date(member.membership.endDate).toISOString().split('T')[0] : ''
      },
      payment: {
        amount: lastPayment[0]?.amount || '',
        paymentMethod: lastPayment[0]?.paymentMethod || '',
      }
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg('');
    try {
      await axios.put(`/admin/members/${editingMember._id}`, {
        ...editForm,
        membershipConfirmed
      });
      setSuccessMsg('Member details modified successfully.');
      setEditModalOpen(false);
      await Promise.all([fetchMembers(), fetchStats(), fetchDailyAttendance()]);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error modifying member settings.');
    } finally {
      setActionLoading(false);
      setMembershipConfirmed(false)
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg('');
    try {
      await axios.post('/admin/members', addForm);
      setSuccessMsg('Manual gym member profile created and activated!');
      setAddModalOpen(false);
      setAddForm({
        name: '', email: '', countryCode: '', mobile: '', age: '', gender: 'male', address: '', emergencyContact: '',
        height: '', weight: '', password: '',
        membership: { plan: 'none', status: 'none', startDate: '', endDate: '' },
        payment: { amount: '', paymentMethod: 'Cash Transaction' }
      });
      await Promise.all([fetchMembers(), fetchStats(), fetchDailyAttendance(), fetchPayments()]);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to manually register gym member.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader className="h-10 w-10 text-gold animate-spin mx-auto" />
          <p className="text-gray-400 text-sm">Loading {gym_first_name} Control Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-black pt-28 pb-20 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner Alert Prompts */}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-2xl p-4 mb-6 flex items-start space-x-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-2xl p-4 mb-6 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-gold" />
              <h1 className="text-3xl font-bold tracking-tight">
                {gym_first_name} Admin Panel
              </h1>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Unified command hub for memberships, check-ins, revenues, and
              alerts.
            </p>
          </div>
          <button
            disabled={actionLoading}
            onClick={async () => {
              setLoading(true);
              await Promise.all([
                fetchStats(),
                fetchMembers(),
                fetchPayments(),
                fetchDailyAttendance(),
              ]);
              if (activeTab === "reminders") await fetchPendingReminders();
              setLoading(false);
            }}
            className="flex items-center space-x-2 border border-gold/20 hover:bg-gold/10 text-gold text-xs tracking-widest font-bold px-5 py-3 rounded-full transition-colors cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>REFRESH DATA</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gold/15 mb-10 overflow-x-auto whitespace-nowrap">
          {[
            { id: "overview", label: "OVERVIEW & ANALYTICS" },
            { id: "members", label: "MEMBER DIRECTORY" },
            { id: "attendance", label: "ATTENDANCE BOARD" },
            { id: "payments", label: "INVOICES & REVENUE" },
            { id: "reminders", label: "RENEWAL REMINDERS" },
            { id: "verifications", label: "PENDING PAYMENTS" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-6 font-bold text-xs tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "border-gold text-gold bg-gold/5"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <span>{tab.label}</span>
              {tab.id === "verifications" && pendingVerifications.length > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-extrabold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  {pendingVerifications.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        {/* T1: Overview Section (Calculations adjusted for cash/online revenue & daily attendance stats) */}
        {activeTab === "overview" && (
          <div className="space-y-10">
            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Members */}
              <div className="glass-premium rounded-xl p-5 border border-gold/15 flex justify-between items-center">
                <div>
                  <span className="text-gray-400 text-[10px] font-bold tracking-wider uppercase block">
                    Total Members
                  </span>
                  <span className="text-3xl font-extrabold text-white mt-1 block">
                    {stats.cards.totalMembers}
                  </span>
                </div>
                <div className="bg-gold/10 p-3 rounded-lg text-gold">
                  <Users className="h-5 w-5" />
                </div>
              </div>

              {/* Active Members */}
              <div className="glass-premium rounded-xl p-5 border border-gold/15 flex justify-between items-center">
                <div>
                  <span className="text-gray-400 text-[10px] font-bold tracking-wider uppercase block">
                    Active Members
                  </span>
                  <span className="text-3xl font-extrabold text-emerald-400 mt-1 block">
                    {stats.cards.activeMembers}
                  </span>
                </div>
                <div className="bg-emerald-500/10 p-3 rounded-lg text-emerald-400">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </div>

              {/* Expired Members */}
              <div className="glass-premium rounded-xl p-5 border border-gold/15 flex justify-between items-center">
                <div>
                  <span className="text-gray-400 text-[10px] font-bold tracking-wider uppercase block">
                    Expired Members
                  </span>
                  <span className="text-3xl font-extrabold text-red-400 mt-1 block">
                    {stats.cards.expiredMembers}
                  </span>
                </div>
                <div className="bg-red-500/10 p-3 rounded-lg text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>

              {/* Today's Present Count */}
              <div className="glass-premium rounded-xl p-5 border border-gold/15 flex justify-between items-center">
                <div>
                  <span className="text-gray-400 text-[10px] font-bold tracking-wider uppercase block">
                    Today Present
                  </span>
                  <span className="text-3xl font-extrabold text-emerald-400 mt-1 block">
                    {stats.cards.todayAttendance.totalPresent}
                  </span>
                </div>
                <div className="bg-emerald-500/10 p-3 rounded-lg text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>

              {/* Today's Absent Count */}
              <div className="glass-premium rounded-xl p-5 border border-gold/15 flex justify-between items-center">
                <div>
                  <span className="text-gray-400 text-[10px] font-bold tracking-wider uppercase block">
                    Today Absent
                  </span>
                  <span className="text-3xl font-extrabold text-red-400 mt-1 block">
                    {stats.cards.todayAttendance.totalAbsent}
                  </span>
                </div>
                <div className="bg-red-500/10 p-3 rounded-lg text-red-400">
                  <AlertCircle className="h-5 w-5" />
                </div>
              </div>

              {/* Morning Session Count */}
              <div className="glass-premium rounded-xl p-5 border border-gold/15 flex justify-between items-center">
                <div>
                  <span className="text-gray-400 text-[10px] font-bold tracking-wider uppercase block">
                    Morning Session
                  </span>
                  <span className="text-3xl font-extrabold text-gold mt-1 block">
                    {stats.cards.todayAttendance.morningPresent}
                  </span>
                </div>
                <div className="bg-gold/10 p-3 rounded-lg text-gold">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>

              {/* Evening Session Count */}
              <div className="glass-premium rounded-xl p-5 border border-gold/15 flex justify-between items-center">
                <div>
                  <span className="text-gray-400 text-[10px] font-bold tracking-wider uppercase block">
                    Evening Session
                  </span>
                  <span className="text-3xl font-extrabold text-gold mt-1 block">
                    {stats.cards.todayAttendance.eveningPresent}
                  </span>
                </div>
                <div className="bg-gold/10 p-3 rounded-lg text-gold">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>

              {/* Monthly Revenue */}
              <div className="glass-premium rounded-xl p-5 border border-gold/15 flex justify-between items-center">
                <div>
                  <span className="text-gray-400 text-[10px] font-bold tracking-wider uppercase block">
                    Monthly Revenue
                  </span>
                  <span className="text-2xl font-extrabold text-white mt-1.5 block">
                    ₹{stats.cards.monthlyRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="bg-white/10 p-3 rounded-lg text-white">
                  <IndianRupee className="h-5 w-5" />
                </div>
              </div>

              {/* Total Revenue */}
              <div className="glass-premium rounded-xl p-5 border border-gold/15 flex justify-between items-center">
                <div>
                  <span className="text-gray-400 text-[10px] font-bold tracking-wider uppercase block">
                    Total Revenue
                  </span>
                  <span className="text-2xl font-extrabold text-white mt-1.5 block">
                    ₹{stats.cards.totalRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="bg-white/10 p-3 rounded-lg text-white">
                  <IndianRupee className="h-5 w-5" />
                </div>
              </div>

              {/* Online Revenue */}
              <div className="glass-premium rounded-xl p-5 border border-gold/15 flex justify-between items-center">
                <div>
                  <span className="text-gray-400 text-[10px] font-bold tracking-wider uppercase block">
                    Online Revenue
                  </span>
                  <span className="text-2xl font-extrabold text-emerald-400 mt-1.5 block">
                    ₹{stats.cards.onlineRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="bg-emerald-500/10 p-3 rounded-lg text-emerald-400">
                  <CreditCard className="h-5 w-5" />
                </div>
              </div>

              {/* Cash Revenue */}
              <div className="glass-premium rounded-xl p-5 border border-gold/15 flex justify-between items-center">
                <div>
                  <span className="text-gray-400 text-[10px] font-bold tracking-wider uppercase block">
                    Cash Revenue
                  </span>
                  <span className="text-2xl font-extrabold text-gold mt-1.5 block">
                    ₹{stats.cards.cashRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="bg-gold/10 p-3 rounded-lg text-gold">
                  <IndianRupee className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Recharts Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Revenue Area Chart */}
              <div className="glass-premium rounded-2xl p-6 border border-gold/15 lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Revenue Analytics
                  </h3>
                  <p className="text-xs text-gray-400">
                    Total payments collected monthly over the past 6 months.
                  </p>
                </div>
                <div className="w-full">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                      data={stats.charts.revenueData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorRevenue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="var(--color-gold)"
                            stopOpacity={0.6}
                          />
                          <stop
                            offset="95%"
                            stopColor="var(--color-gold)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.05)"
                      />
                      <XAxis dataKey="month" stroke="#A3A3A3" fontSize={11} />
                      <YAxis stroke="#A3A3A3" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1A1A1A",
                          borderColor: "#D4AF37",
                          borderRadius: "12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--color-gold)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        name="Revenue (₹)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Members Tiers Pie Chart */}
              <div className="glass-premium rounded-2xl p-6 border border-gold/15 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Membership Distribution
                  </h3>
                  <p className="text-xs text-gray-400">
                    Division of current client bases across subscription tiers.
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <ResponsiveContainer width="100%" height={230}>
                    <PieChart>
                      <Pie
                        data={stats.charts.membershipData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.charts.membershipData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={GOLD_COLORS[index % GOLD_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1A1A1A",
                          borderColor: "#D4AF37",
                          borderRadius: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Legend Grid */}
                  <div className="grid grid-cols-2 gap-4 w-full mt-4 border-t border-white/5 pt-4 text-xs">
                    {stats.charts.membershipData.map((d, index) => (
                      <div key={d.name} className="flex items-center space-x-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{
                            backgroundColor:
                              GOLD_COLORS[index % GOLD_COLORS.length],
                          }}
                        ></span>
                        <span className="text-gray-400 truncate">
                          {d.name}:{" "}
                          <strong className="text-white">{d.value}</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Weekly Attendance Bar Chart */}
              <div className="glass-premium rounded-2xl p-6 border border-gold/15 lg:col-span-3 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Attendance Analytics (Past 7 Days)
                  </h3>
                  <p className="text-xs text-gray-400">
                    Volume of check-ins registered daily over the past week.
                  </p>
                </div>
                <div className="w-full">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={stats.charts.attendanceData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.05)"
                      />
                      <XAxis dataKey="day" stroke="#A3A3A3" fontSize={11} />
                      <YAxis
                        stroke="#A3A3A3"
                        fontSize={11}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1A1A1A",
                          borderColor: "#D4AF37",
                          borderRadius: "12px",
                        }}
                      />
                      <Bar
                        dataKey="present"
                        fill="var(--color-gold-hover)"
                        radius={[4, 4, 0, 0]}
                        name="Check-ins"
                        barSize={35}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* T2: Member Directory Section (Display manual creation triggers and height/weight attributes) */}
        {activeTab === "members" && (
          <div className="glass-premium rounded-2xl border border-gold/15 p-6 space-y-6">
            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute inset-y-0 left-0 pl-3.5 h-full w-5 text-gray-500 pointer-events-none" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search members by name, email, or mobile..."
                  className="block w-full pl-11 pr-4 py-3 bg-black/40 border border-gold/15 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              {/* Select Status */}
              <div className="flex gap-3 items-center flex-wrap">
                <select
                  value={memberStatusFilter}
                  onChange={(e) => setMemberStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Members</option>
                  <option value="expired">Expired Members</option>
                  <option value="none">No Plan Assigned</option>
                </select>
                <select
                  value={memberPlanFilter}
                  onChange={(e) => setMemberPlanFilter(e.target.value)}
                  className="px-4 py-3 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                >
                  <option value="all">All Plans</option>
                  {membershipPlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setAddModalOpen(true)}
                  className="bg-gold hover:bg-gold-hover text-deep-black font-extrabold text-xs tracking-wider px-5 py-3.5 rounded-xl flex items-center space-x-2 cursor-pointer uppercase shadow-md shadow-gold/15"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Member</span>
                </button>
              </div>
            </div>

            {/* Members Directory Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-gray-400 font-bold uppercase tracking-wider">
                    <th className="py-4">Member Info</th>
                    <th className="py-4">Mobile & Age</th>
                    <th className="py-4 text-center">Body Metrics</th>
                    <th className="py-4">Subscription Plan</th>
                    <th className="py-4">Validity Range</th>
                    <th className="py-4 text-center">Membership Status</th>
                    <th className="py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                  {members.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="py-8 text-center text-gray-500 text-xs"
                      >
                        No members matching current search criteria.
                      </td>
                    </tr>
                  ) : (
                    members.map((member) => (
                      <tr
                        key={member._id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 pr-4">
                          <div className="font-bold text-white">
                            {member.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {member.email}
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div>{member.countryCode} {member.mobile}</div>
                          <div className="text-xs text-gray-400 capitalize">
                            {member.gender}, {member.age} yrs
                          </div>
                        </td>
                        <td className="py-4 pr-4 text-center text-xs">
                          {member.height || member.weight ? (
                            <div className="space-y-0.5">
                              {member.height && (
                                <div>
                                  H:{" "}
                                  <strong className="text-white font-bold">
                                    {member.height} cm
                                  </strong>
                                </div>
                              )}
                              {member.weight && (
                                <div>
                                  W:{" "}
                                  <strong className="text-white font-bold">
                                    {member.weight} kg
                                  </strong>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500">Not recorded</span>
                          )}
                        </td>
                        <td className="py-4 pr-4 font-semibold capitalize">
                          {member.membership?.plan === "none"
                            ? "None"
                            : `${member.membership?.plan} Plan`}
                        </td>
                        <td className="py-4 pr-4 text-xs">
                          {member.membership?.startDate ? (
                            <>
                              <span>
                                {new Date(
                                  member.membership.startDate,
                                ).toLocaleDateString("en-IN")}
                              </span>
                              <span className="mx-1 text-gold text-[10px]">
                                to
                              </span>
                              <span>
                                {new Date(
                                  member.membership.endDate,
                                ).toLocaleDateString("en-IN")}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-500">
                              Not Applicable
                            </span>
                          )}
                        </td>
                        <td className="py-4 pr-4 text-center">
                          <span
                            className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                              member.membership?.status === "active"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : member.membership?.status === "expired"
                                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                  : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                            }`}
                          >
                            {member.membership?.status || "none"}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => {
                                openEditModal(member);
                              }}
                              className="p-2 border border-gold/15 hover:bg-gold hover:text-deep-black text-gold rounded-lg transition-colors cursor-pointer"
                              title="Edit Member"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              disabled={actionLoading}
                              onClick={() => deleteMemberHandler(member._id)}
                              className="p-2 border border-red-500/15 hover:bg-red-500 hover:text-white text-red-400 rounded-lg transition-colors cursor-pointer"
                              title="Delete Member"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}

                  <Pagination
                    current={memberPage}
                    total={membertotalPages}
                    totalItems={members.length}
                    item="members"
                    perPage={members_pagination_limit}
                    onPageChange={(page) => setMemberPage(page)}
                    colSpan={7}
                  />
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* T3: Session Attendance Grid Section (Morning Present, Evening Present, Absent toggling rules) */}
        {activeTab === "attendance" && (
          <div className="glass-premium rounded-2xl border border-gold/15 p-6 space-y-6">
            {/* Header controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Daily Session Check-in sheets
                </h3>
                <p className="text-xs text-gray-400">
                  Select a date to check in members. Only ONE present session
                  per member per day is allowed.
                </p>
              </div>
              <div>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="px-4 py-3 bg-black/40 border border-gold/20 rounded-xl text-gold focus:outline-none focus:border-gold font-semibold text-sm"
                />
              </div>
            </div>

            {/* Attendance Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-gray-400 font-bold uppercase tracking-wider">
                    <th className="py-4">Member Details</th>
                    <th className="py-4 text-center">
                      Mark Daily Check-in Status
                    </th>
                    <th className="py-4 text-center">Final Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                  {dailyAttendance.length === 0 ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="py-8 text-center text-gray-500 text-xs"
                      >
                        No clients registered in the database to mark
                        attendance.
                      </td>
                    </tr>
                  ) : (
                    dailyAttendance.map((rec) => {
                      return (
                        <tr
                          key={rec._id}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="py-4">
                            <div className="font-bold text-white">
                              {rec.name}
                            </div>
                            <div className="text-xs text-gray-400">
                              {rec.countryCode} {rec.mobile}
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex justify-center space-x-3">
                              {/* Morning Session Button */}
                              <button
                                disabled={
                                  rec.status === "Present" &&
                                  rec.session === "Evening"
                                }
                                onClick={() =>
                                  updateMemberAttendance(
                                    rec._id,
                                    "Morning",
                                    "Present",
                                  )
                                }
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                                  rec.status === "Present" &&
                                  rec.session === "Morning"
                                    ? "bg-emerald-500 text-deep-black font-extrabold"
                                    : rec.status === "Present" &&
                                        rec.session === "Evening"
                                      ? "border border-white/5 text-gray-600 cursor-not-allowed font-light"
                                      : "border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                                }`}
                              >
                                MORNING PRESENT
                              </button>

                              {/* Evening Session Button */}
                              <button
                                disabled={
                                  rec.status === "Present" &&
                                  rec.session === "Morning"
                                }
                                onClick={() =>
                                  updateMemberAttendance(
                                    rec._id,
                                    "Evening",
                                    "Present",
                                  )
                                }
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                                  rec.status === "Present" &&
                                  rec.session === "Evening"
                                    ? "bg-emerald-500 text-deep-black font-extrabold"
                                    : rec.status === "Present" &&
                                        rec.session === "Morning"
                                      ? "border border-white/5 text-gray-600 cursor-not-allowed font-light"
                                      : "border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                                }`}
                              >
                                EVENING PRESENT
                              </button>

                              {/* Absent Button */}
                              <button
                                onClick={() =>
                                  updateMemberAttendance(
                                    rec._id,
                                    null,
                                    "Absent",
                                  )
                                }
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                  rec.status === "Absent"
                                    ? "bg-red-500 text-white font-extrabold animate-pulse"
                                    : "border border-red-500/20 text-red-400 hover:bg-red-500/10"
                                }`}
                              >
                                ABSENT
                              </button>
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            <span
                              className={`inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                                rec.status === "Present"
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                  : "bg-red-500/15 text-red-400 border border-red-500/20"
                              }`}
                            >
                              {rec.status === "Present"
                                ? `Present (${rec.session})`
                                : "Absent"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}

                  <Pagination
                    current={attendancePage}
                    total={attendanceTotalPage}
                    totalItems={dailyAttendance.length}
                    item="members"
                    perPage={attendence_pagination_limit}
                    onPageChange={(page) => setAttendancePage(page)}
                    colSpan={3}
                  />
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* T4: Invoices & Payments Section (Supports Cash vs Online paymentMethod tracking & filtering) */}
        {activeTab === "payments" && (
          <div className="glass-premium rounded-2xl border border-gold/15 p-6 space-y-6">
            {/* Filter controls */}
            <div className="flex justify-between items-center gap-4 flex-wrap">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Payment Ledgers
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Audit log of payments initiated and finalized.
                </p>
              </div>
              <div className="flex space-x-3">
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                >
                  <option value="all">All Statuses</option>
                  <option value="paid">Paid Invoices</option>
                  <option value="pending">Pending Invoices</option>
                  <option value="failed">Failed Invoices</option>
                </select>
                <select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  className="px-4 py-3 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                >
                  <option value="all">All Methods</option>
                  <option value="Online Transaction">Online Transaction</option>
                  <option value="Cash Transaction">Cash Transaction</option>
                </select>
              </div>
            </div>

            {/* Invoices List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-gray-400 font-bold uppercase tracking-wider">
                    <th className="py-4">Invoice date</th>
                    <th className="py-4">Client info</th>
                    <th className="py-4">Membership Plan</th>
                    <th className="py-4">Payment Method</th>
                    <th className="py-4">Txn Details</th>
                    <th className="py-4">Amount</th>
                    <th className="py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                  {payments.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="py-8 text-center text-gray-500 text-xs"
                      >
                        No transaction invoices found.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr
                        key={p._id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 font-semibold text-gray-300">
                          {new Date(p.createdAt).toLocaleDateString("en-IN", { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-4">
                          {p.user ? (
                            <>
                              <div className="font-bold text-white">
                                {p.user.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {p.user.countryCode} {p.user.mobile}
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-500 font-light italic">
                              Deleted User
                            </span>
                          )}
                        </td>
                        <td className="py-4 font-semibold text-white capitalize">
                          {p.membershipPlan || "Starter"}
                        </td>
                        <td className="py-4 text-xs font-bold text-gold uppercase">
                          {p.paymentMethod || "Online Transaction"}
                        </td>
                        <td className="py-4 font-mono text-xs">
                          <div>Order: {p.razorpayOrderId}</div>
                          {p.razorpayPaymentId && (
                            <div className="text-[10px] text-gray-500 mt-0.5">
                              PayID: {p.razorpayPaymentId}
                            </div>
                          )}
                        </td>
                        <td className="py-4 font-extrabold text-white">
                          ₹{p.amount.toLocaleString()}
                        </td>
                        <td className="py-4 text-center">
                          <span
                            className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                              p.status === "paid"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : p.status === "failed"
                                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                  : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}

                  <Pagination
                    current={invoicePage}
                    total={InvoiceTotalPage}
                    totalItems={payments.length}
                    item="payments"
                    perPage={invoice_pagination_limit}
                    onPageChange={(page) => setInvoicePage(page)}
                    colSpan={7}
                  />
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* T5: WhatsApp Renewal Reminders Board (Simplified Expiring Soon/Today/Expired Manual Scans) */}
        {activeTab === "reminders" && (
          <div className="space-y-6">
            {/* Quick Filter controls */}
            <div className="glass-premium rounded-2xl border border-gold/15 p-6 flex flex-col md:flex-row gap-4 justify-between items-stretch">
              <div className="relative flex-1">
                <Search className="absolute inset-y-0 left-0 pl-3.5 h-full w-5 text-gray-500 pointer-events-none" />
                <input
                  type="text"
                  value={reminderSearch}
                  onChange={(e) => setReminderSearch(e.target.value)}
                  placeholder="Search members by name or mobile..."
                  className="block w-full pl-11 pr-4 py-3 bg-black/40 border border-gold/15 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gold transition-colors"
                />
              </div>
              <select
                value={reminderStatusFilter}
                onChange={(e) => setReminderStatusFilter(e.target.value)}
                className="px-4 py-3 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
              >
                <option value="all">All Reminders (Expiring/Expired)</option>
                <option value="soon">Expiring Soon (Within 7 Days)</option>
                <option value="today">Expiring Today</option>
                <option value="expired">Expired Memberships</option>
              </select>
            </div>

            {/* List Table */}
            <div className="glass-premium rounded-2xl border border-gold/15 p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Manual WhatsApp Expiry Reminders
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Sends manual WhatsApp notifications directly to clients
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-xs text-gray-400 font-bold uppercase tracking-wider">
                      <th className="py-4">Member Name</th>
                      <th className="py-4">Mobile Number</th>
                      <th className="py-4">Membership Plan</th>
                      <th className="py-4">Last Payment Date</th>
                      <th className="py-4">Expiry Date</th>
                      <th className="py-4 text-center">Days Remaining</th>
                      <th className="py-4 text-center">Status</th>
                      <th className="py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                    {pendingReminders.length === 0 ? (
                      <tr>
                        <td
                          colSpan="8"
                          className="py-8 text-center text-gray-500 text-xs"
                        >
                          No pending renewal reminders found.
                        </td>
                      </tr>
                    ) : (
                      pendingReminders.map((client) => (
                        <tr
                          key={client._id}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="py-4 font-bold text-white">
                            {client.name}
                          </td>
                          <td className="py-4 font-semibold text-gray-300">
                            {client.countryCode} {client.mobile}
                          </td>
                          <td className="py-4 capitalize font-semibold text-gold">
                            {client.plan} Plan
                          </td>
                          <td className="py-4 text-xs text-gray-400">
                            {client.lastPaymentDate
                              ? new Date(
                                  client.lastPaymentDate,
                                ).toLocaleDateString("en-IN")
                              : "N/A"}
                          </td>
                          <td className="py-4 text-xs font-semibold text-white">
                            {new Date(client.expiryDate).toLocaleDateString("en-IN")}
                          </td>
                          <td className="py-4 text-center font-mono font-bold text-sm">
                            {client.daysRemaining}
                          </td>
                          <td className="py-4 text-center">
                            <span
                              className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                                client.statusKey === "today"
                                  ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                                  : client.statusKey === "soon"
                                    ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                    : "bg-gray-500/20 text-gray-400 border border-white/5"
                              }`}
                            >
                              {client.membershipStatus}
                            </span>
                          </td>
                          <td className="py-4 text-center">
                            <button
                              disabled={actionLoading}
                              onClick={() => sendManualWhatsApp(client._id)}
                              className={`px-4 py-2 font-extrabold text-[10px] tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer uppercase shadow-md ${
                                sendManualWhatsAppIds.has(client._id)
                                  ? "bg-gradient-to-r from-emerald-400 to-green-600 text-white shadow-green-500/20"
                                  : "bg-gradient-to-r from-premium-yellow to-gold text-deep-black shadow-gold/15"
                              }`}
                            >
                              {sendManualWhatsAppIds.has(client._id) ? (
                                <span className="flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                  Sent
                                </span>
                              ) : (
                                "Send WhatsApp Reminder"
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}

                    <Pagination
                      current={reminderPage}
                      total={reminderTotalPage}
                      totalItems={pendingReminders.length}
                      item="reminders"
                      perPage={reminder_pagination_limit}
                      onPageChange={(page) => setReminderPage(page)}
                      colSpan={8}
                    />
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* T6: Pending Payment Verifications (Manual UPI / Cash renewals awaiting admin approval) */}
        {activeTab === "verifications" && (
          <div className="glass-premium rounded-2xl border border-gold/15 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Hourglass className="h-5 w-5 text-gold" />
                  <span>Pending Payment Verifications</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Manual UPI and Cash renewals awaiting confirmation before membership activation.
                </p>
              </div>
              <button
                onClick={fetchPendingVerifications}
                disabled={verificationLoading}
                className="flex items-center space-x-2 border border-gold/20 hover:bg-gold/10 text-gold text-[10px] tracking-widest font-bold px-4 py-2.5 rounded-full transition-colors cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${verificationLoading ? 'animate-spin' : ''}`} />
                <span>REFRESH</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-gray-400 font-bold uppercase tracking-wider">
                    <th className="py-4">Requested On</th>
                    <th className="py-4">Member Info</th>
                    <th className="py-4">Membership Plan</th>
                    <th className="py-4">Method</th>
                    <th className="py-4">Amount</th>
                    <th className="py-4 text-center">Status</th>
                    <th className="py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                  {verificationLoading ? (
                    <tr>
                      <td colSpan="7" className="py-10 text-center">
                        <Loader className="h-6 w-6 text-gold animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : pendingVerifications.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-500 text-xs">
                        No payments awaiting verification. All caught up.
                      </td>
                    </tr>
                  ) : (
                    pendingVerifications.map((p) => {
                      const isUpi = p.paymentMethod === 'UPI Transaction';
                      const isBusy = verifyActionId === p._id;
                      return (
                        <tr key={p._id} className="hover:bg-white/5 transition-colors">
                          <td className="py-4 font-semibold text-gray-300 text-xs">
                            {new Date(p.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-4">
                            {p.user ? (
                              <>
                                <div className="font-bold text-white">{p.user.name}</div>
                                <div className="text-xs text-gray-500">{p.user.countryCode} {p.user.mobile}</div>
                              </>
                            ) : (
                              <span className="text-gray-500 font-light italic">Deleted User</span>
                            )}
                          </td>
                          <td className="py-4 font-semibold text-white capitalize">
                            {p.membershipPlan || 'N/A'}
                          </td>
                          <td className="py-4">
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${
                              isUpi
                                ? 'bg-gold/10 text-gold border-gold/20'
                                : 'bg-white/10 text-white border-white/15'
                            }`}>
                              {isUpi ? <Smartphone className="h-3 w-3" /> : <Banknote className="h-3 w-3" />}
                              {isUpi ? 'UPI' : 'Cash'}
                            </span>
                          </td>
                          <td className="py-4 font-extrabold text-white">
                            ₹{p.amount?.toLocaleString()}
                          </td>
                          <td className="py-4 text-center">
                            <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full uppercase bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                              Pending Verification
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                disabled={isBusy}
                                onClick={() => approvePendingPayment(p._id)}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[10px] font-extrabold tracking-wide uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500 hover:text-deep-black transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Approve & Activate"
                              >
                                {isBusy ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <ThumbsUp className="h-3.5 w-3.5" />}
                                <span>Approve</span>
                              </button>
                              <button
                                disabled={isBusy}
                                onClick={() => openRejectModal(p)}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[10px] font-extrabold tracking-wide uppercase bg-red-500/10 text-red-400 border border-red-500/25 hover:bg-red-500 hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Reject"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                <span>Reject</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* EDIT MEMBER OVERLAY MODAL */}
      {editModalOpen && editingMember && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="glass-premium border-gold/30 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 my-6 sm:my-10 animate-fade-in-up">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gold/10 pb-4">
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
                <Edit3 className="h-5 w-5 text-gold flex-shrink-0" />
                <span>Modify Member Account Settings</span>
              </h3>
              <button
                onClick={() => {
                  setEditModalOpen(false);
                  setMembershipConfirmed(false);
                }}
                className="text-gray-400 hover:text-white font-bold text-sm p-1.5 flex-shrink-0 ml-2"
              >
                CLOSE
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-6">
              {/* Profile fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Member Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Mobile Number
                  </label>

                  <div className="flex gap-2">
                    <select
                      value={editForm.countryCode}
                      onChange={(e) =>
                        setEditForm({ ...editForm, countryCode: e.target.value })
                      }
                      className="w-24 px-2 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                    >
                      {countryCodes.map((c) => (
                        <option key={c.code} value={c.code} className="bg-black text-white">
                          {c.code} {c.country}
                        </option>
                      ))}
                    </select>

                    <input
                      type="tel"
                      required
                      value={editForm.mobile}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          mobile: e.target.value.replace(/\D/g, ""), // digits only
                        })
                      }
                      placeholder="9876543210"
                      className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                    />
                  </div>
                  
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    required
                    value={editForm.age}
                    onChange={(e) =>
                      setEditForm({ ...editForm, age: e.target.value })
                    }
                    className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Gender
                  </label>
                  <select
                    value={editForm.gender}
                    onChange={(e) =>
                      setEditForm({ ...editForm, gender: e.target.value })
                    }
                    className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.emergencyContact}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        emergencyContact: e.target.value,
                      })
                    }
                    className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={editForm.height || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, height: e.target.value })
                    }
                    className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                    placeholder="Height (cm)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={editForm.weight || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, weight: e.target.value })
                    }
                    className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                    placeholder="Weight (kg)"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm({ ...editForm, address: e.target.value })
                  }
                  className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                />
              </div>

              {/* Confirmation Checkbox */}
              <div className="p-4 bg-gold/5 border border-gold/20 rounded-xl">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={membershipConfirmed}
                      onChange={(e) => setMembershipConfirmed(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 rounded-md border-2 border-gold/40 bg-black/40 peer-checked:bg-gold peer-checked:border-gold transition-all duration-200 group-hover:border-gold/70" />
                    <svg
                      className="absolute inset-0 w-5 h-5 text-deep-black opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none p-0.5"
                      viewBox="0 0 20 20" fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-white uppercase tracking-wide">
                      Enable Membership Validity Update
                    </span>
                    <span className="text-xs text-gray-400 leading-relaxed">
                      Check to unlock and edit membership validity fields below.
                    </span>
                  </div>
                </label>
              </div>

              {/* Fields — locked/unlocked based on membershipConfirmed */}
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 transition-all duration-300 ${
                !membershipConfirmed ? 'opacity-40 pointer-events-none select-none' : 'opacity-100'
              }`}>
              </div>

              {/* Membership adjustment fields */}
              <div className="border-t border-gold/10 pt-5 space-y-4">
                <span className="block text-xs font-bold text-gold uppercase tracking-wider">
                  Membership Validity Overrides
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                      Tier Level
                    </label>
                    <select
                    disabled={!membershipConfirmed}
                      value={editForm.membership.plan}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          membership: {
                            ...editForm.membership,
                            plan: e.target.value,
                          },
                        })
                      }
                      className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                    >
                      <option value="none">None</option>
                      {membershipPlans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                      Membership Status
                    </label>
                    <select
                      disabled={!membershipConfirmed}
                      value={editForm.membership.status}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          membership: {
                            ...editForm.membership,
                            status: e.target.value,
                          },
                        })
                      }
                      className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                    >
                      <option value="none">None</option>
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                      Start Date
                    </label>
                    <input
                      disabled={!membershipConfirmed}
                      type="date"
                      value={editForm.membership.startDate}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          membership: {
                            ...editForm.membership,
                            startDate: e.target.value,
                          },
                        })
                      }
                      className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                      End Date
                    </label>
                    <input
                      disabled={!membershipConfirmed}
                      type="date"
                      value={editForm.membership.endDate}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          membership: {
                            ...editForm.membership,
                            endDate: e.target.value,
                          },
                        })
                      }
                      className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none"
                    />
                  </div>

                  {/* Amount Paid */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                      Amount Paid (₹)
                    </label>
                    <input
                      disabled={!membershipConfirmed}
                      type="number"
                      value={editForm.payment.amount}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          payment: {
                            ...editForm.payment,
                            amount: e.target.value,
                          },
                        })
                      }
                      className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                      placeholder="e.g. 1500"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                      Payment Method
                    </label>
                    <select
                      disabled={!membershipConfirmed}
                      value={editForm.payment.paymentMethod}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          payment: {
                            ...editForm.payment,
                            paymentMethod: e.target.value,
                          },
                        })
                      }
                      className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                    >
                      <option value="Cash Transaction">Cash Transaction</option>
                      <option value="Online Transaction">
                        Online Transaction
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-white/5">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3.5 bg-gradient-to-r from-premium-yellow to-gold text-deep-black font-bold text-xs tracking-wider rounded-xl hover:scale-[1.01] transition-transform cursor-pointer"
                >
                  {actionLoading ? "SAVING OVERRIDES..." : "SAVE MODIFICATIONS"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setMembershipConfirmed(false);
                  }}
                  className="sm:px-6 py-3.5 border border-gold/20 text-gold font-bold text-xs tracking-wider rounded-xl hover:bg-gold/10 transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW MEMBER OVERLAY MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="glass-premium border-gold/30 rounded-3xl max-w-2xl w-full p-8 space-y-6 my-8 animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-gold/10 pb-4">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <Users className="h-5 w-5 text-gold" />
                <span>Create Gym Member Profile</span>
              </h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-gray-400 hover:text-white font-bold text-sm p-1.5"
              >
                CLOSE
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-6">
              {/* Profile fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Member Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.name}
                    onChange={(e) =>
                      setAddForm({ ...addForm, name: e.target.value })
                    }
                    className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) =>
                      setAddForm({ ...addForm, email: e.target.value })
                    }
                    className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Mobile Number *
                  </label>

                  <div className="flex gap-2">
                    <select
                      value={addForm.countryCode}
                      onChange={(e) =>
                        setAddForm({ ...addForm, countryCode: e.target.value })
                      }
                      className="w-24 px-2 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                    >
                      {countryCodes.map((c) => (
                        <option key={c.code} value={c.code} className="bg-black text-white">
                          {c.code} {c.country}
                        </option>
                      ))}
                    </select>

                    <input
                      type="tel"
                      required
                      value={addForm.mobile}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          mobile: e.target.value.replace(/\D/g, ""), // digits only
                        })
                      }
                      placeholder="9876543210"
                      className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                    />
                  </div>

                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={addForm.password}
                    onChange={(e) =>
                      setAddForm({ ...addForm, password: e.target.value })
                    }
                    className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                    placeholder="Password (min 6 chars)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Age *
                  </label>
                  <input
                    type="number"
                    required
                    value={addForm.age}
                    onChange={(e) =>
                      setAddForm({ ...addForm, age: e.target.value })
                    }
                    className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none"
                    placeholder="Age"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Gender *
                  </label>
                  <select
                    value={addForm.gender}
                    onChange={(e) =>
                      setAddForm({ ...addForm, gender: e.target.value })
                    }
                    className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={addForm.height}
                    onChange={(e) =>
                      setAddForm({ ...addForm, height: e.target.value })
                    }
                    className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none"
                    placeholder="Height (cm)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={addForm.weight}
                    onChange={(e) =>
                      setAddForm({ ...addForm, weight: e.target.value })
                    }
                    className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none"
                    placeholder="Weight (kg)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Emergency Contact *
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.emergencyContact}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        emergencyContact: e.target.value,
                      })
                    }
                    className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none"
                    placeholder="Emergency Contact"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={addForm.address}
                    onChange={(e) =>
                      setAddForm({ ...addForm, address: e.target.value })
                    }
                    className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none font-sans"
                    placeholder="Address"
                  />
                </div>
              </div>

              {/* Membership details */}
              <div className="border-t border-gold/10 pt-5 space-y-4">
                <span className="block text-xs font-bold text-gold uppercase tracking-wider">
                  Membership Settings
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                      Membership Plan *
                    </label>
                    <select
                      value={addForm.membership.plan}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          membership: {
                            ...addForm.membership,
                            plan: e.target.value,
                          },
                        })
                      }
                      className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                    >
                      <option value="none">None</option>
                      {membershipPlans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                      Membership Status *
                    </label>
                    <select
                      value={addForm.membership.status}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          membership: {
                            ...addForm.membership,
                            status: e.target.value,
                          },
                        })
                      }
                      className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                    >
                      <option value="none">None</option>
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={addForm.membership.startDate}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          membership: {
                            ...addForm.membership,
                            startDate: e.target.value,
                          },
                        })
                      }
                      className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={addForm.membership.endDate}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          membership: {
                            ...addForm.membership,
                            endDate: e.target.value,
                          },
                        })
                      }
                      className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="border-t border-gold/10 pt-5 space-y-4">
                <span className="block text-xs font-bold text-gold uppercase tracking-wider">
                  Initial Payment Logs
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                      Amount Paid (₹)
                    </label>
                    <input
                      type="number"
                      value={addForm.payment.amount}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          payment: {
                            ...addForm.payment,
                            amount: e.target.value,
                          },
                        })
                      }
                      className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                      placeholder="e.g. 1500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                      Payment Method
                    </label>
                    <select
                      value={addForm.payment.paymentMethod}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          payment: {
                            ...addForm.payment,
                            paymentMethod: e.target.value,
                          },
                        })
                      }
                      className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                    >
                      <option value="Cash Transaction">Cash Transaction</option>
                      <option value="Online Transaction">
                        Online Transaction
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-4 pt-4 border-t border-white/5">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3.5 bg-gradient-to-r from-premium-yellow to-gold text-deep-black font-bold text-xs tracking-wider rounded-xl hover:scale-[1.01] transition-transform cursor-pointer"
                >
                  {actionLoading ? "CREATING CLIENT..." : "CREATE NEW MEMBER"}
                </button>
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-6 py-3.5 border border-gold/20 text-gold font-bold text-xs tracking-wider rounded-xl hover:bg-gold/10 transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT PAYMENT MODAL (with reason input) */}
      {rejectModalOpen && rejectingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm px-4 py-6">
          <div className="glass-premium border border-gold/30 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 animate-fade-in-up">

            {/* Header */}
            <div className="flex items-start justify-between border-b border-gold/10 pb-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-red-500/15 text-red-400 border border-red-500/20 shrink-0">
                  <XCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Reject Payment</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {rejectingPayment.user?.name || 'This member'}'s {rejectingPayment.paymentMethod === 'UPI Transaction' ? 'UPI' : 'Cash'} payment of ₹{rejectingPayment.amount?.toLocaleString()} will be marked as failed.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setRejectModalOpen(false);
                  setRejectingPayment(null);
                  setRejectReason('');
                }}
                className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer shrink-0"
                aria-label="Close"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={submitRejectPayment} className="space-y-5">
              <div>
                <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">
                  Reason for Rejection
                </label>
                <textarea
                  required
                  rows="3"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. No matching UPI transaction found, incorrect amount, etc."
                  className="block w-full px-4 py-3 bg-black/40 border border-red-500/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-400 transition-colors text-sm"
                />
                <p className="text-[10px] text-gray-500 mt-1.5">This reason is visible to the member on their dashboard.</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={verifyActionId === rejectingPayment._id}
                  className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs tracking-wider rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {verifyActionId === rejectingPayment._id ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>REJECTING...</span>
                    </>
                  ) : (
                    <span>CONFIRM REJECTION</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRejectModalOpen(false);
                    setRejectingPayment(null);
                    setRejectReason('');
                  }}
                  className="px-6 py-3.5 border border-gold/20 text-gold font-bold text-xs tracking-wider rounded-xl hover:bg-gold/10 transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;