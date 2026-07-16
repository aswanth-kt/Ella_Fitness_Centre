import { Smartphone, QrCode, X, CheckCircle2 } from 'lucide-react';

/**
 * UpiPaymentModal
 *
 * Shown after the member picks UPI as their payment method.
 * Lets them (re)open their UPI app, then confirms once they say
 * they've completed the payment.
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - onConfirmPaid: () => void   fired when "I Have Paid" is clicked
 *  - onOpenUpiApp: () => void    optional, re-triggers the UPI deep link
 *  - amount: number | string     e.g. 1999
 *  - planName: string            e.g. "gold"
 */
const UpiPaymentModal = ({ isOpen, onClose, onConfirmPaid, onOpenUpiApp, amount, planName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-sm px-4 py-6">
      <div className="glass-premium border border-gold/30 rounded-3xl max-w-sm w-full p-6 sm:p-8 space-y-6 animate-fade-in-up">

        {/* Header */}
        <div className="flex items-start justify-between border-b border-gold/10 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Complete Your Payment</h3>
            <p className="text-xs text-gray-400 mt-1 capitalize">{planName ? `${planName} Plan Renewal` : 'Membership Renewal'}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Amount */}
        <div className="flex flex-col items-center justify-center gap-2 py-4 bg-black/40 border border-gold/15 rounded-2xl">
          <div className="p-3 rounded-full bg-gold/15 text-gold border border-gold/20">
            <QrCode className="h-6 w-6" />
          </div>
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">Amount to Pay</span>
          <span className="text-3xl font-extrabold text-white">₹{amount ?? '0'}</span>
        </div>

        {/* Steps */}
        <div className="space-y-3 text-xs text-gray-400">
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-5 h-5 rounded-full bg-gold/15 text-gold text-[10px] font-bold flex items-center justify-center border border-gold/20">1</span>
            <span className="leading-relaxed pt-0.5">Open your UPI app (GPay, PhonePe, Paytm) and complete the payment.</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-5 h-5 rounded-full bg-gold/15 text-gold text-[10px] font-bold flex items-center justify-center border border-gold/20">2</span>
            <span className="leading-relaxed pt-0.5">Once done, tap "I Have Paid" below to notify us.</span>
          </div>
        </div>

        {/* Reopen UPI app */}
        {onOpenUpiApp && (
          <button
            type="button"
            onClick={onOpenUpiApp}
            className="w-full py-3 border border-gold/25 text-gold font-bold text-xs tracking-wider rounded-xl hover:bg-gold/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Smartphone className="h-4 w-4" />
            <span>OPEN UPI APP AGAIN</span>
          </button>
        )}

        {/* Confirm paid */}
        <button
          type="button"
          onClick={onConfirmPaid}
          className="w-full py-3.5 bg-gradient-to-r from-premium-yellow to-gold text-deep-black font-bold text-xs tracking-wider rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>I HAVE PAID</span>
        </button>
      </div>
    </div>
  );
};

export default UpiPaymentModal;