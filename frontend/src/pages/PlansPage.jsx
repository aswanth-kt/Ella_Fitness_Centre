import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import axios from '../api/axios.js';
import { membershipPlans } from '../constants/membershipPlans.js';
import PaymentMethodModal from '../components/paymentConfirmation/PaymentMethodModal.jsx';
import UpiPaymentModal from '../components/paymentConfirmation/UpiPaymentModal.jsx';
import PendingVerificationModal from '../components/paymentConfirmation/PendingVerificationModal.jsx';

const PlansPage = () => {
  const { user } = useContext(AuthContext);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Purchase flow states
  const [selectedPlan, setSelectedPlan] = useState(null); // the plan object the member picked
  const [paymentMethod, setPaymentMethod] = useState(null); // 'upi' | 'cash'
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [showUpiPaymentModal, setShowUpiPaymentModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);

  // Kicks off the manual payment flow for a plan: choose UPI or Cash first
  const openPurchaseFlow = (plan) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setError('');
    setSelectedPlan(plan);
    setShowPaymentMethodModal(true);
  };

  // Builds the UPI deep link for the currently selected plan
  const buildUpiUrl = () => {
    const txNote = encodeURIComponent(`Membership Plan ${selectedPlan?.id}`);
    return `upi://pay?pa=aswanth@okhdfcbank&pn=Aswanth&cu=INR&tn=${txNote}`;
  };

  // Creates the pending-verification payment record on the backend
  const initiateManualPayment = async (method) => {
    await axios.post('/payments/initiate-manual', {
      planName: selectedPlan.id,
      method, // 'upi' | 'cash'
    });
  };

  const resetPurchaseFlow = () => {
    setSelectedPlan(null);
    setPaymentMethod(null);
    setShowPaymentMethodModal(false);
    setShowUpiPaymentModal(false);
    setShowPendingModal(false);
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
                    disabled={isActivePlan}
                    onClick={() => openPurchaseFlow(p)}
                    className={`w-full py-4 rounded-full font-bold text-xs tracking-wider transition-all duration-300 flex justify-center items-center space-x-2 ${
                      isActivePlan
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-not-allowed'
                        : p.isPopular 
                          ? 'bg-gradient-to-r from-premium-yellow to-gold text-deep-black shadow-lg shadow-gold/25 hover:scale-[1.03] cursor-pointer' 
                          : 'border border-gold text-gold hover:bg-gold hover:text-deep-black cursor-pointer'
                    }`}
                  >
                    {isActivePlan ? (
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

      {/* Select payment method */}
      <PaymentMethodModal
        isOpen={showPaymentMethodModal}
        onClose={() => setShowPaymentMethodModal(false)}
        onSelect={async (method) => {
          setPaymentMethod(method);
          setShowPaymentMethodModal(false);

          if (method === 'upi') {
            // kick off the UPI deep link, then wait for confirmation
            window.location.href = buildUpiUrl();
            setShowUpiPaymentModal(true);
          } else {
            // cash goes straight to pending verification
            try {
              await initiateManualPayment('cash');
              setShowPendingModal(true);
            } catch (err) {
              setError(err.response?.data?.message || 'Failed to start payment. Please try again.');
            }
          }
        }}
      />

      <UpiPaymentModal
        isOpen={showUpiPaymentModal}
        onClose={() => setShowUpiPaymentModal(false)}
        amount={selectedPlan?.price}
        planName={selectedPlan?.name}
        onOpenUpiApp={() => {
          window.location.href = buildUpiUrl();
        }}
        onConfirmPaid={async () => {
          try {
            await initiateManualPayment('upi');
            setShowUpiPaymentModal(false);
            setShowPendingModal(true);
          } catch (err) {
            setError(err.response?.data?.message || 'Failed to confirm payment. Please try again.');
          }
        }}
      />

      <PendingVerificationModal
        isOpen={showPendingModal}
        onClose={() => {
          resetPurchaseFlow();
          navigate('/dashboard');
        }}
        paymentMethod={paymentMethod}
        planName={selectedPlan?.name}
        amount={selectedPlan?.price}
      />
    </div>
  );
};

export default PlansPage;