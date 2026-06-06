import React, { useState, useEffect } from 'react';
import { Shield, Users, CheckCircle, CheckCircle2, AlertTriangle, Calendar, IndianRupee, Search, SlidersHorizontal, Edit3, Trash2, Loader, RefreshCw, Send, Eye, FileText, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

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
      monthlyRevenue: 0
    },
    charts: { revenueData: [], membershipData: [], attendanceData: [] }
  });
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [dailyAttendance, setDailyAttendance] = useState([]);
  
  // Controls & Loaders
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Filtering & Search
  const [memberSearch, setMemberSearch] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState('all');
  const [memberPlanFilter, setMemberPlanFilter] = useState('all');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');

  // Edit Member Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '', email: '', mobile: '', age: '', gender: 'male', address: '', emergencyContact: '',
    membership: { plan: 'none', status: 'none', startDate: '', endDate: '' }
  });

  // Recharts colors
  const GOLD_COLORS = ['#F5C842', '#D4AF37', '#aa841e', '#3A3A3A'];

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
        params: { search: memberSearch, status: memberStatusFilter, plan: memberPlanFilter }
      });
      setMembers(data);
    } catch (err) {
      console.error('Error loading members directory:', err);
    }
  };

  const fetchPayments = async () => {
    try {
      const { data } = await axios.get('/admin/payments', {
        params: { status: paymentStatusFilter }
      });
      setPayments(data);
    } catch (err) {
      console.error('Error loading payments:', err);
    }
  };

  const fetchReminders = async () => {
    try {
      const { data } = await axios.get('/admin/reminders');
      setReminders(data);
    } catch (err) {
      console.error('Error loading reminder logs:', err);
    }
  };

  const fetchDailyAttendance = async () => {
    try {
      const { data } = await axios.get('/attendance/daily', {
        params: { date: attendanceDate }
      });
      console.log("data:", data)
      setDailyAttendance(data);
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
        fetchReminders(),
        fetchDailyAttendance()
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
  }, [memberSearch, memberStatusFilter, memberPlanFilter]);

  // Sync attendance date
  useEffect(() => {
    if (!loading) {
      fetchDailyAttendance();
    }
  }, [attendanceDate]);

  // Sync payment queries
  useEffect(() => {
    if (!loading) {
      fetchPayments();
    }
  }, [paymentStatusFilter]);

  // Handle reminder scan & triggers
  const triggerRemindersScan = async () => {
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const { data } = await axios.post('/admin/trigger-reminders');
      setSuccessMsg(data.message);
      await Promise.all([fetchReminders(), fetchStats()]);
    } catch (err) {
      setErrorMsg('Failed to trigger scan: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  // Mark specific member attendance
  const updateMemberAttendance = async (userId, session, status) => {
    try {
      const payload = {
        userId,
        date: attendanceDate,
        [session]: status
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
      await Promise.all([fetchMembers(), fetchStats(), fetchPayments(), fetchReminders(), fetchDailyAttendance()]);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error deleting member.');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (member) => {
    setEditingMember(member);
    setEditForm({
      name: member.name || '',
      email: member.email || '',
      mobile: member.mobile || '',
      age: member.age || '',
      gender: member.gender || 'male',
      address: member.address || '',
      emergencyContact: member.emergencyContact || '',
      membership: {
        plan: member.membership?.plan || 'none',
        status: member.membership?.status || 'none',
        startDate: member.membership?.startDate ? new Date(member.membership.startDate).toISOString().split('T')[0] : '',
        endDate: member.membership?.endDate ? new Date(member.membership.endDate).toISOString().split('T')[0] : ''
      }
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg('');
    try {
      await axios.put(`/admin/members/${editingMember._id}`, editForm);
      setSuccessMsg('Member details modified successfully.');
      setEditModalOpen(false);
      await Promise.all([fetchMembers(), fetchStats(), fetchDailyAttendance()]);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error modifying member settings.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader className="h-10 w-10 text-gold animate-spin mx-auto" />
          <p className="text-gray-400 text-sm">Loading Olympus Control Center...</p>
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
              <h1 className="text-3xl font-bold tracking-tight">Olympus Admin Panel</h1>
            </div>
            <p className="text-gray-400 text-sm mt-1">Unified command hub for memberships, check-ins, revenues, and alerts.</p>
          </div>
          <button 
            disabled={actionLoading}
            onClick={async () => {
              setLoading(true);
              await Promise.all([fetchStats(), fetchMembers(), fetchPayments(), fetchReminders(), fetchDailyAttendance()]);
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
            { id: 'overview', label: 'OVERVIEW & ANALYTICS' },
            { id: 'members', label: 'MEMBER DIRECTORY' },
            { id: 'attendance', label: 'ATTENDANCE BOARD' },
            { id: 'payments', label: 'INVOICES & REVENUE' },
            { id: 'reminders', label: 'WHATSAPP REMINDERS' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-6 font-bold text-xs tracking-wider border-b-2 transition-all ${
                activeTab === tab.id 
                  ? 'border-gold text-gold bg-gold/5' 
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        {/* T1: Overview Section */}
        {activeTab === 'overview' && (
          <div className="space-y-10">
            {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Total Members */}
              <div className="glass-premium rounded-xl p-5 border border-gold/15 flex justify-between items-center">
                <div>
                  <span className="text-gray-400 text-[10px] font-bold tracking-wider uppercase block">Total Members</span>
                  <span className="text-3xl font-extrabold text-white mt-1 block">{stats.cards.totalMembers}</span>
                </div>
                <div className="bg-gold/10 p-3 rounded-lg text-gold"><Users className="h-5 w-5" /></div>
              </div>

              {/* Active Members */}
              <div className="glass-premium rounded-xl p-5 border border-gold/15 flex justify-between items-center">
                <div>
                  <span className="text-gray-400 text-[10px] font-bold tracking-wider uppercase block">Active Members</span>
                  <span className="text-3xl font-extrabold text-emerald-400 mt-1 block">{stats.cards.activeMembers}</span>
                </div>
                <div className="bg-emerald-500/10 p-3 rounded-lg text-emerald-400"><CheckCircle className="h-5 w-5" /></div>
              </div>

              {/* Expired Members */}
              <div className="glass-premium rounded-xl p-5 border border-gold/15 flex justify-between items-center">
                <div>
                  <span className="text-gray-400 text-[10px] font-bold tracking-wider uppercase block">Expired Members</span>
                  <span className="text-3xl font-extrabold text-red-400 mt-1 block">{stats.cards.expiredMembers}</span>
                </div>
                <div className="bg-red-500/10 p-3 rounded-lg text-red-400"><AlertTriangle className="h-5 w-5" /></div>
              </div>

              {/* Morning Present */}
              <div className="glass-premium rounded-xl p-5 border border-gold/15 flex justify-between items-center">
                <div>
                  <span className="text-gray-400 text-[10px] font-bold tracking-wider uppercase block">Morning Present</span>
                  <span className="text-3xl font-extrabold text-gold mt-1 block">{stats.cards.todayAttendance.morningPresent}</span>
                </div>
                <div className="bg-gold/10 p-3 rounded-lg text-gold">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>

              {/* Evening Present Card */}
              <div className="glass-premium rounded-xl p-5 border border-gold/15 flex justify-between items-center">
                <div>
                  <span className="text-gray-400 text-[10px] font-bold tracking-wider uppercase block">Evening Present</span>
                  <span className="text-3xl font-extrabold text-gold mt-1 block">{stats.cards.todayAttendance.eveningPresent}</span>
                </div>
                <div className="bg-gold/10 p-3 rounded-lg text-gold">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>

              {/* Total Present Card */}
              <div className="glass-premium rounded-xl p-5 border border-gold/15 flex justify-between items-center">
                <div>
                  <span className="text-gray-400 text-[10px] font-bold tracking-wider uppercase block">Total Present</span>
                  <span className="text-3xl font-extrabold text-gold mt-1 block">{stats.cards.todayAttendance.totalPresent}</span>
                </div>
                <div className="bg-gold/10 p-3 rounded-lg text-gold">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>

              {/* Total Absent Card */}
              <div className="glass-premium rounded-xl p-5 border border-gold/15 flex justify-between items-center">
                <div>
                  <span className="text-gray-400 text-[10px] font-bold tracking-wider uppercase block">Total Absent</span>
                  <span className="text-3xl font-extrabold text-gold mt-1 block">{stats.cards.todayAttendance.totalAbsent}</span>
                </div>
                <div className="bg-gold/10 p-3 rounded-lg text-gold">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>

              {/* Monthly Revenue */}
              <div className="glass-premium rounded-xl p-5 border border-gold/15 flex justify-between items-center">
                <div>
                  <span className="text-gray-400 text-[10px] font-bold tracking-wider uppercase block">Monthly Revenue</span>
                  <span className="text-2xl font-extrabold text-white mt-1.5 block">₹{stats.cards.monthlyRevenue.toLocaleString()}</span>
                </div>
                <div className="bg-white/10 p-3 rounded-lg text-white"><IndianRupee className="h-5 w-5" /></div>
              </div>

            </div>




{/* Recharts Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Revenue Area Chart */}
              <div className="glass-premium rounded-2xl p-6 border border-gold/15 lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Revenue Analytics</h3>
                  <p className="text-xs text-gray-400">Total payments collected monthly over the past 6 months.</p>
                </div>
                <div className="w-full">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={stats.charts.revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" stroke="#A3A3A3" fontSize={11} />
                      <YAxis stroke="#A3A3A3" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#D4AF37', borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (₹)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Members Tiers Pie Chart */}
              <div className="glass-premium rounded-2xl p-6 border border-gold/15 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Membership Distribution</h3>
                  <p className="text-xs text-gray-400">Division of current client bases across subscription tiers.</p>
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
                          <Cell key={`cell-${index}`} fill={GOLD_COLORS[index % GOLD_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#D4AF37', borderRadius: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Legend Grid */}
                  <div className="grid grid-cols-2 gap-4 w-full mt-4 border-t border-white/5 pt-4 text-xs">
                    {stats.charts.membershipData.map((d, index) => (
                      <div key={d.name} className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: GOLD_COLORS[index % GOLD_COLORS.length] }}></span>
                        <span className="text-gray-400 truncate">{d.name}: <strong className="text-white">{d.value}</strong></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Weekly Attendance Bar Chart */}
              <div className="glass-premium rounded-2xl p-6 border border-gold/15 lg:col-span-3 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Attendance Analytics (Past 7 Days)</h3>
                  <p className="text-xs text-gray-400">Volume of check-ins registered daily over the past week.</p>
                </div>
                <div className="w-full">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={stats.charts.attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="day" stroke="#A3A3A3" fontSize={11} />
                      <YAxis stroke="#A3A3A3" fontSize={11} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#D4AF37', borderRadius: '12px' }} />
                      <Bar dataKey="present" fill="#F5C842" radius={[4, 4, 0, 0]} name="Check-ins" barSize={35} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* T2: Member Directory Section */}
        {activeTab === 'members' && (
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
              <div className="flex space-x-3">
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
                  <option value="starter">Starter Plan</option>
                  <option value="standard">Standard Plan</option>
                  <option value="premium">Premium Plan</option>
                  <option value="none">No Subscription</option>
                </select>
              </div>
            </div>

            {/* Members Directory Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-gray-400 font-bold uppercase tracking-wider">
                    <th className="py-4">Member Info</th>
                    <th className="py-4">Mobile & Age</th>
                    <th className="py-4">Subscription Plan</th>
                    <th className="py-4">Validity Range</th>
                    <th className="py-4 text-center">Membership Status</th>
                    <th className="py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                  {members.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-500 text-xs">
                        No members matching current search criteria.
                      </td>
                    </tr>
                  ) : (
                    members.map((member) => (
                      <tr key={member._id} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 pr-4">
                          <div className="font-bold text-white">{member.name}</div>
                          <div className="text-xs text-gray-500">{member.email}</div>
                        </td>
                        <td className="py-4 pr-4">
                          <div>+91 {member.mobile}</div>
                          <div className="text-xs text-gray-400 capitalize">{member.gender}, {member.age} yrs</div>
                        </td>
                        <td className="py-4 pr-4 font-semibold capitalize">
                          {member.membership?.plan === 'none' ? 'None' : `${member.membership?.plan} Plan`}
                        </td>
                        <td className="py-4 pr-4 text-xs">
                          {member.membership?.startDate ? (
                            <>
                              <span>{new Date(member.membership.startDate).toLocaleDateString()}</span>
                              <span className="mx-1 text-gold">to</span>
                              <span>{new Date(member.membership.endDate).toLocaleDateString()}</span>
                            </>
                          ) : (
                            <span className="text-gray-500">Not Applicable</span>
                          )}
                        </td>
                        <td className="py-4 pr-4 text-center">
                          <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                            member.membership?.status === 'active' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : member.membership?.status === 'expired'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                          }`}>
                            {member.membership?.status || 'none'}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => openEditModal(member)}
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
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* T3: Session Attendance Grid Section */}
        {activeTab === 'attendance' && (
          <div className="glass-premium rounded-2xl border border-gold/15 p-6 space-y-6">
            
            {/* Header controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Session Check-in Sheets</h3>
                <p className="text-xs text-gray-400">Select a date to log morning and evening session attendance status.</p>
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
                    <th className="py-4 text-center">Morning Session Check-in</th>
                    <th className="py-4 text-center">Evening Session Check-in</th>
                    <th className="py-4 text-center">Combined Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                  {dailyAttendance.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-gray-500 text-xs">
                        No clients registered in the database to mark attendance.
                      </td>
                    </tr>
                  ) : (
                    dailyAttendance.map((rec) => {
                      const dayStatus = (rec.morningStatus === 'present' || rec.eveningStatus === 'present') ? 'Present' : (rec.morningStatus === 'absent' && rec.eveningStatus === 'absent') ? 'Absent' : 'None';

                      return (
                        <tr key={rec._id} className="hover:bg-white/5 transition-colors">
                          <td className="py-4">
                            <div className="font-bold text-white">{rec.name}</div>
                            <div className="text-xs text-gray-400">{rec.mobile}</div>
                          </td>
                          <td className="py-4">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => updateMemberAttendance(rec._id, 'morningStatus', 'present')}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                  rec.morningStatus === 'present'
                                    ? 'bg-emerald-500 text-deep-black'
                                    : 'border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10'
                                }`}
                              >
                                PRESENT
                              </button>
                              <button
                                onClick={() => updateMemberAttendance(rec._id, 'morningStatus', 'absent')}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                  rec.morningStatus === 'absent'
                                    ? 'bg-red-500 text-white'
                                    : 'border border-red-500/20 text-red-400 hover:bg-red-500/10'
                                }`}
                              >
                                ABSENT
                              </button>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => updateMemberAttendance(rec._id, 'eveningStatus', 'present')}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                  rec.eveningStatus === 'present'
                                    ? 'bg-emerald-500 text-deep-black'
                                    : 'border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10'
                                }`}
                              >
                                PRESENT
                              </button>
                              <button
                                onClick={() => updateMemberAttendance(rec._id, 'eveningStatus', 'absent')}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                  rec.eveningStatus === 'absent'
                                    ? 'bg-red-500 text-white'
                                    : 'border border-red-500/20 text-red-400 hover:bg-red-500/10'
                                }`}
                              >
                                ABSENT
                              </button>
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            <span className={`inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                              dayStatus === 'Present' 
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                                : dayStatus === 'Absent' 
                                  ? 'bg-red-500/15 text-red-400 border border-red-500/20' 
                                  : 'bg-gray-500/15 text-gray-400 border border-white/5'
                            }`}>
                              {dayStatus}
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
        )}

        {/* T4: Invoices & Payments Section */}
        {activeTab === 'payments' && (
          <div className="glass-premium rounded-2xl border border-gold/15 p-6 space-y-6">
            
            {/* Filter controls */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">Payment Ledgers</h3>
                <p className="text-xs text-gray-400 mt-1">Audit log of payments initiated and finalized.</p>
              </div>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="px-4 py-3 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
              >
                <option value="all">All Invoices</option>
                <option value="paid">Paid Invoices</option>
                <option value="pending">Pending Invoices</option>
                <option value="failed">Failed Invoices</option>
              </select>
            </div>

            {/* Invoices List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-gray-400 font-bold uppercase tracking-wider">
                    <th className="py-4">Invoice date</th>
                    <th className="py-4">Client info</th>
                    <th className="py-4">Razorpay Order ID</th>
                    <th className="py-4">Razorpay Payment ID</th>
                    <th className="py-4">Amount</th>
                    <th className="py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-500 text-xs">
                        No transaction invoices found.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p._id} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 font-semibold text-gray-300">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4">
                          {p.user ? (
                            <>
                              <div className="font-bold text-white">{p.user.name}</div>
                              <div className="text-xs text-gray-500">{p.user.mobile}</div>
                            </>
                          ) : (
                            <span className="text-gray-500 font-light italic">Deleted User</span>
                          )}
                        </td>
                        <td className="py-4 font-mono text-xs">{p.razorpayOrderId}</td>
                        <td className="py-4 font-mono text-xs">
                          {p.razorpayPaymentId || <span className="text-gray-500 italic">Not generated</span>}
                        </td>
                        <td className="py-4 font-extrabold text-white">₹{p.amount.toLocaleString()}</td>
                        <td className="py-4 text-center">
                          <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                            p.status === 'paid' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : p.status === 'failed' 
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* T5: WhatsApp Reminder Logs Section */}
        {activeTab === 'reminders' && (
          <div className="space-y-8">
            
            {/* Quick scanning controls */}
            <div className="glass-premium rounded-2xl border border-gold/15 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Send className="h-5 w-5 text-gold shrink-0" />
                  <span>WhatsApp Notifications Control</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Scan all client records and automatically trigger WhatsApp alerts for memberships expiring in 7 days, today, or already expired.
                </p>
              </div>
              <button
                disabled={actionLoading}
                onClick={triggerRemindersScan}
                className="bg-gradient-to-r from-premium-yellow to-gold text-deep-black font-extrabold text-xs tracking-wider px-6 py-4 rounded-full shadow-lg shadow-gold/25 hover:scale-105 transition-transform flex items-center space-x-2 cursor-pointer shrink-0"
              >
                {actionLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin text-deep-black" />
                    <span>SCANNING DIRECTORY...</span>
                  </>
                ) : (
                  <>
                    <span>RUN MANUAL EXPIRY SCAN</span>
                  </>
                )}
              </button>
            </div>

            {/* Sending Logs List */}
            <div className="glass-premium rounded-2xl border border-gold/15 p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Sent Notifications History</h3>
                <p className="text-xs text-gray-400 mt-1">Audit trail of WhatsApp notifications dispatched via webhook api templates.</p>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {reminders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-xs">
                    No notifications sent yet.
                  </div>
                ) : (
                  reminders.map((log) => (
                    <div key={log._id} className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-gold">{log.user?.name}</span>
                          <span className="text-gray-500">|</span>
                          <span className="text-gray-400">+91 {log.user?.mobile}</span>
                        </div>
                        <div className="text-gray-500 text-[11px]">
                          {new Date(log.sentAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="text-xs font-mono text-gray-300 bg-black/60 p-3 rounded-lg whitespace-pre-wrap leading-relaxed border border-white/5">
                        {log.messageContent}
                      </div>

                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-gray-500 uppercase">Trigger Event: <strong className="text-gray-300 font-semibold">{log.type}</strong></span>
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase">
                          {log.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* EDIT MEMBER OVERLAY MODAL */}
      {editModalOpen && editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="glass-premium border-gold/30 rounded-3xl max-w-2xl w-full p-8 space-y-6 my-8 animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-gold/10 pb-4">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <Edit3 className="h-5 w-5 text-gold" />
                <span>Modify Member Account Settings</span>
              </h3>
              <button 
                onClick={() => setEditModalOpen(false)}
                className="text-gray-400 hover:text-white font-bold text-sm p-1.5"
              >
                CLOSE
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-6">
              
              {/* Profile fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Member Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={editForm.mobile}
                    onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                    className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Age</label>
                  <input
                    type="number"
                    required
                    value={editForm.age}
                    onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                    className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Gender</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Emergency Contact</label>
                  <input
                    type="tel"
                    required
                    value={editForm.emergencyContact}
                    onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                    className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                />
              </div>

              {/* Membership adjustment fields */}
              <div className="border-t border-gold/10 pt-5 space-y-4">
                <span className="block text-xs font-bold text-gold uppercase tracking-wider">Membership Validity Overrides</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Tier Level</label>
                    <select
                      value={editForm.membership.plan}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        membership: { ...editForm.membership, plan: e.target.value }
                      })}
                      className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                    >
                      <option value="none">None</option>
                      <option value="starter">Starter Plan (1M)</option>
                      <option value="standard">Standard Plan (3M)</option>
                      <option value="premium">Premium Plan (6M)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Membership Status</label>
                    <select
                      value={editForm.membership.status}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        membership: { ...editForm.membership, status: e.target.value }
                      })}
                      className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none focus:border-gold"
                    >
                      <option value="none">None</option>
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Start Date</label>
                    <input
                      type="date"
                      value={editForm.membership.startDate}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        membership: { ...editForm.membership, startDate: e.target.value }
                      })}
                      className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">End Date</label>
                    <input
                      type="date"
                      value={editForm.membership.endDate}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        membership: { ...editForm.membership, endDate: e.target.value }
                      })}
                      className="block w-full px-4 py-2.5 bg-black/40 border border-gold/15 rounded-xl text-white text-sm focus:outline-none"
                    />
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
                  {actionLoading ? 'SAVING OVERRIDES...' : 'SAVE MODIFICATIONS'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-6 py-3.5 border border-gold/20 text-gold font-bold text-xs tracking-wider rounded-xl hover:bg-gold/10 transition-colors"
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
