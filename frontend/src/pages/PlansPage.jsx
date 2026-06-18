import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle2, Loader, AlertCircle } from 'lucide-react';
import axios from '../api/axios.js';
import { membershipPlans } from '../constants/membershipPlans.js';
import { gym_full_name } from '../constants/constants.js';
import gymImage from '../assets/banner/bannerImage.png';

const PlansPage = () => {
  const { user, refreshUser } = useContext(AuthContext);
  const [loadingPlan, setLoadingPlan] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

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

      // Load SDK
      await loadRazorpayScript();

      // Real checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: {gym_full_name},
        description: `Activation of ${planId.toUpperCase()} membership plan`,
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-stretch">
          {membershipPlans.map((p) => {
            const isActivePlan = user?.membership?.plan === p.id && user?.membership?.status === 'active';

            return (
              <div
                key={p.id}
                className={`relative rounded-2xl flex flex-col justify-between overflow-hidden p-6 lg:p-7 ${
                  isActivePlan 
                    ? 'border-2 border-emerald-500 bg-emerald-950/15 shadow-xl'
                    : p.isPopular 
                      ? 'border-2 border-gold bg-gradient-to-b from-dark-gray to-deep-black shadow-xl shadow-gold/10' 
                      : 'border border-gold/15 bg-dark-gray/30 hover:border-gold/30 hover-gold-shadow'
                } transition-all duration-300`}
              >
                {isActivePlan ? (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-deep-black font-extrabold text-[10px] tracking-wider uppercase px-4 py-1.5 rounded-bl-xl">
                    CURRENTLY ACTIVE
                  </div>
                ) : p.isPopular ? (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-premium-yellow to-gold text-deep-black font-extrabold text-[10px] tracking-wider uppercase px-4 py-1.5 rounded-bl-xl">
                    POPULAR CHOICE
                  </div>
                ) : p.badge ? (
                  <div className="absolute top-0 right-0 border border-gold/60 text-gold bg-deep-black/90 font-extrabold text-[10px] tracking-wider uppercase px-4 py-1.5 rounded-bl-xl">
                    {p.badge}
                  </div>
                ) : null}

                <div>
                  <span className="text-gray-400 text-sm tracking-wider font-semibold uppercase">{p.name}</span>

                  <div className="flex items-baseline mt-4 mb-1 gap-2 flex-wrap">
                    <div className="flex items-baseline">
                      <span className="text-white text-3xl font-extrabold">₹</span>
                      <span className="text-white text-5xl font-extrabold tracking-tight">{p.price}</span>
                      {p.priceSuffix && (
                        <span className="text-gray-400 text-sm font-semibold ml-1">{p.priceSuffix}</span>
                      )}
                    </div>
                    {p.originalPrice && (
                      <span className="text-gray-500 text-lg line-through font-medium">₹{p.originalPrice}</span>
                    )}
                  </div>

                  <span className="text-gold text-sm font-semibold tracking-wide uppercase block mb-1">
                    {p.duration}
                  </span>

                  {p.admissionFee && (
                    <span className="text-gray-400 text-xs font-medium tracking-wide block">
                      {p.admissionFee}
                    </span>
                  )}
                  {p.note && (
                    <span className="text-gray-500 text-xs italic block mt-1">{p.note}</span>
                  )}

                  <div className="border-t border-gold/10 pt-6 mt-5">
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
    </div>
  );
};

export default PlansPage;
