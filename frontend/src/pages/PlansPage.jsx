import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Dumbbell, CheckCircle2, Loader, CreditCard, ShieldCheck, AlertCircle } from 'lucide-react';
import axios from '../api/axios.js';

const PlansPage = () => {
  const { user, refreshUser } = useContext(AuthContext);
  const [loadingPlan, setLoadingPlan] = useState('');
  const [error, setError] = useState('');
  
  // Simulator modal states
  const [showSimulator, setShowSimulator] = useState(false);
  const [simData, setSimData] = useState(null);

  const navigate = useNavigate();

  const plans = [
    { id: 'starter', name: 'Starter Plan', duration: '1 Month', price: 1500, benefits: ['Full gym access during hours', 'Locker & steam room access', '1 Complementary physical assessment', 'Standard workout tracking'] },
    { id: 'standard', name: 'Standard Plan', duration: '3 Months', price: 4000, isPopular: true, benefits: ['All Starter plan perks', '2 Personal training guidance sessions', 'Custom nutrition guidance manual', 'Body composition tracking'] },
    { id: 'premium', name: 'Premium Plan', duration: '6 Months', price: 7000, benefits: ['All Standard plan perks', 'Priority personal training booking', 'Weekly nutrition audits', 'Access to VIP recovery lounge'] }
  ];

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

  const handlePurchase = async (planId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoadingPlan(planId);
    setError('');

    try {
      // Create order in backend
      const { data: orderData } = await axios.post('/payments/order', { planName: planId });

      if (orderData.isMock) {
        // Trigger Simulator Modal
        setSimData(orderData);
        setShowSimulator(true);
        setLoadingPlan('');
        return;
      }

      // Load SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        // Fallback to simulator if script cannot load (ad blockers etc)
        console.log('Razorpay Script failed to load. Falling back to sandbox simulator.');
        setSimData(orderData);
        setShowSimulator(true);
        setLoadingPlan('');
        return;
      }

      // Real checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Olympus Gym Noida',
        description: `Activation of ${planId.toUpperCase()} membership plan`,
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=150',
        order_id: orderData.id,
        handler: async (response) => {
          try {
            const verifyPayload = {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              planName: planId,
              isMock: false
            };

            const { data } = await axios.post('/payments/verify', verifyPayload);
            await refreshUser();
            navigate('/dashboard', { state: { paymentSuccess: true } });
          } catch (err) {
            setError(err.response?.data?.message || 'Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.mobile
        },
        theme: {
          color: '#D4AF37'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error processing your membership order.');
    } finally {
      setLoadingPlan('');
    }
  };

  const executeSimulatedPayment = async (status) => {
    if (status === 'fail') {
      setShowSimulator(false);
      setError('Payment cancelled/failed by simulated user.');
      return;
    }

    setLoadingPlan(simData.plan);
    setShowSimulator(false);

    try {
      const verifyPayload = {
        razorpayOrderId: simData.id,
        razorpayPaymentId: `pay_sim_${Math.random().toString(36).substring(2, 10)}`,
        planName: simData.plan,
        isMock: true
      };

      const { data } = await axios.post('/payments/verify', verifyPayload);
      await refreshUser();
      navigate('/dashboard', { state: { paymentSuccess: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Verification of simulated payment failed.');
    } finally {
      setLoadingPlan('');
    }
  };

  return (
    <div className="min-h-screen bg-deep-black pt-32 pb-24 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-premium-yellow/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-gold font-bold tracking-widest text-sm uppercase">MEMBERSHIPS</span>
          <h2 className="font-serif text-4xl md:text-5xl font-extrabold text-white mt-2">
            CHOOSE YOUR <span className="text-gold-gradient">PLAN</span>
          </h2>
          <p className="text-gray-400 text-sm mt-4 font-light leading-relaxed">
            All subscriptions include high-speed WiFi, modern steam showers, dynamic locker cards, and access to all weight machinery.
          </p>
        </div>

        {error && (
          <div className="max-w-3xl mx-auto bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-2xl p-4 mb-10 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {plans.map((p) => {
            const isActivePlan = user?.membership?.plan === p.id && user?.membership?.status === 'active';

            return (
              <div
                key={p.id}
                className={`relative rounded-2xl flex flex-col justify-between overflow-hidden p-8 ${
                  isActivePlan 
                    ? 'border-2 border-emerald-500 bg-emerald-950/15 shadow-xl'
                    : p.isPopular 
                      ? 'border-2 border-gold bg-gradient-to-b from-dark-gray to-deep-black shadow-xl shadow-gold/10' 
                      : 'border border-gold/15 bg-dark-gray/30 hover:border-gold/30 hover-gold-shadow'
                } transition-all duration-300`}
              >
                {isActivePlan && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-deep-black font-extrabold text-[10px] tracking-wider uppercase px-4 py-1.5 rounded-bl-xl">
                    CURRENTLY ACTIVE
                  </div>
                )}
                {!isActivePlan && p.isPopular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-premium-yellow to-gold text-deep-black font-extrabold text-[10px] tracking-wider uppercase px-4 py-1.5 rounded-bl-xl">
                    POPULAR CHOICE
                  </div>
                )}

                <div>
                  <span className="text-gray-400 text-sm tracking-wider font-semibold uppercase">{p.name}</span>
                  <div className="flex items-baseline mt-4 mb-2">
                    <span className="text-white text-3xl font-extrabold">₹</span>
                    <span className="text-white text-5xl font-extrabold tracking-tight">{p.price}</span>
                  </div>
                  <span className="text-gold text-sm font-semibold tracking-wide uppercase block mb-6">{p.duration} Duration</span>
                  
                  <div className="border-t border-gold/10 pt-6 mt-2">
                    <ul className="space-y-4">
                      {p.benefits.map((b, bIdx) => (
                        <li key={bIdx} className="flex items-start space-x-3 text-sm text-gray-300">
                          <CheckCircle2 className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <button 
                    disabled={isActivePlan || loadingPlan !== ''}
                    onClick={() => handlePurchase(p.id)}
                    className={`w-full py-4 rounded-full font-bold text-xs tracking-wider transition-all duration-300 flex justify-center items-center space-x-2 ${
                      isActivePlan
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-not-allowed'
                        : loadingPlan === p.id 
                          ? 'bg-gold/30 text-gold cursor-wait'
                          : p.isPopular 
                            ? 'bg-gradient-to-r from-premium-yellow to-gold text-deep-black shadow-lg shadow-gold/25 hover:scale-[1.03] cursor-pointer' 
                            : 'border border-gold text-gold hover:bg-gold hover:text-deep-black cursor-pointer'
                    }`}
                  >
                    {loadingPlan === p.id ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin text-inherit" />
                        <span>PROCESSING...</span>
                      </>
                    ) : isActivePlan ? (
                      <span>PLAN ACTIVE</span>
                    ) : (
                      <span>ACTIVATE MEMBERSHIP</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simulator Modal */}
      {showSimulator && simData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="glass-premium border-gold/30 rounded-3xl max-w-md w-full p-8 space-y-6 text-center animate-fade-in-up">
            <div className="mx-auto bg-gold/10 text-gold w-fit p-4 rounded-full">
              <CreditCard className="h-10 w-10" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-white">Razorpay Sandbox</h3>
              <p className="text-sm text-gray-400 mt-2">
                Simulating payments checkout for {simData.plan.toUpperCase()} Membership.
              </p>
            </div>

            <div className="bg-black/50 border border-gold/15 p-4 rounded-xl text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Order ID:</span>
                <span className="text-white font-mono">{simData.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Amount:</span>
                <span className="text-gold font-bold">₹{simData.amount / 100} INR</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">User Prefill:</span>
                <span className="text-white">{user?.name}</span>
              </div>
            </div>

            <div className="bg-gold/5 border border-gold/15 rounded-xl p-3 text-xs text-gray-300 text-left flex items-start space-x-2">
              <ShieldCheck className="h-4 w-4 text-gold shrink-0 mt-0.5" />
              <span>We detected mock key modes. Complete testing checkout by selecting a state below.</span>
            </div>

            <div className="flex flex-col space-y-3 pt-2">
              <button
                onClick={() => executeSimulatedPayment('success')}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs tracking-wider rounded-xl hover:scale-[1.02] transition-transform cursor-pointer"
              >
                SIMULATE PAYMENT SUCCESS
              </button>
              <button
                onClick={() => executeSimulatedPayment('fail')}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                SIMULATE PAYMENT FAILURE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansPage;
