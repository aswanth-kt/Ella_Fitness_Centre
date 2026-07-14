import { Hourglass, X, Smartphone, Banknote } from 'lucide-react';

/**
 * PendingVerificationModal
 *
 * Shown once a renewal payment is awaiting admin confirmation —
 * either right after cash is selected, or after the member taps
 * "I Have Paid" in the UPI flow.
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - paymentMethod: 'upi' | 'cash'
 *  - planName: string    e.g. "gold"
 *  - amount: number | string
 */
const PendingVerificationModal = ({ isOpen, onClose, paymentMethod, planName, amount }) => {
  if (!isOpen) return null;

  const isCash = paymentMethod === 'cash';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-sm px-4 py-6">
      <div className="glass-premium border border-gold/30 rounded-3xl max-w-sm w-full p-6 sm:p-8 space-y-6 animate-fade-in-up text-center">

        {/* Close */}
        <div className="flex justify-end -mb-2">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Icon */}
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-gold/15 text-gold border border-gold/20 animate-pulse">
            <Hourglass className="h-8 w-8" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white">Pending Admin Verification</h3>
          <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
            {isCash
              ? "You've chosen to pay by cash. Please complete your payment at the front desk — your membership will be activated once our admin confirms it."
              : "Thanks! We've noted your UPI payment. Our admin will verify the transaction and activate your membership shortly."}
          </p>
        </div>

        {/* Summary */}
        <div className="bg-black/40 border border-gold/15 rounded-2xl p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-gray-400">
            {isCash ? <Banknote className="h-4 w-4 text-gold" /> : <Smartphone className="h-4 w-4 text-gold" />}
            <span className="capitalize">{planName ? `${planName} Plan` : 'Membership'} · {isCash ? 'Cash' : 'UPI'}</span>
          </div>
          <span className="text-white font-bold">₹{amount ?? '0'}</span>
        </div>

        <span className="inline-block text-[10px] font-bold px-3 py-1.5 rounded-full uppercase bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">
          Awaiting Confirmation
        </span>

        {/* Dismiss */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 bg-gradient-to-r from-premium-yellow to-gold text-deep-black font-bold text-xs tracking-wider rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
        >
          BACK TO DASHBOARD
        </button>
      </div>
    </div>
  );
};

export default PendingVerificationModal;