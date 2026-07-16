import { useState } from 'react';
import { Smartphone, Banknote, X, ArrowRight } from 'lucide-react';

/**
 * PaymentMethodModal
 *
 * Popup shown before renewal checkout, letting the member choose
 * between UPI and Cash payment.
 *
 * Props:
 *  - isOpen: boolean, controls visibility
 *  - onClose: () => void, called when the modal is dismissed
 *  - onSelect: (method: 'upi' | 'cash') => void, called with the
 *              chosen method when the member confirms their pick
 */
const PaymentMethodModal = ({ isOpen, onClose, onSelect }) => {
  const [selected, setSelected] = useState(null);

  if (!isOpen) return null;

  const methods = [
    {
      id: 'upi',
      label: 'UPI',
      description: 'Pay instantly via GPay, PhonePe, Paytm or any UPI app.',
      icon: Smartphone,
    },
    {
      id: 'cash',
      label: 'Cash',
      description: 'Pay at the front desk during your next visit.',
      icon: Banknote,
    },
  ];

  const handleConfirm = () => {
    if (!selected) return;
    onSelect(selected);
    setSelected(null);
  };

  const handleClose = () => {
    setSelected(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm px-4 py-6">
      <div className="glass-premium border border-gold/30 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 animate-fade-in-up">

        {/* Header */}
        <div className="flex items-start justify-between border-b border-gold/10 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Choose Payment Method</h3>
            <p className="text-xs text-gray-400 mt-1">Select how you'd like to complete your renewal.</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {methods.map(({ id, label, description, icon: Icon }) => {
            const isActive = selected === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelected(id)}
                className={`text-left p-5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3 ${
                  isActive
                    ? 'bg-gold/15 border-gold shadow-md shadow-gold/10'
                    : 'bg-black/40 border-gold/15 hover:border-gold/40'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl w-fit border ${
                    isActive
                      ? 'bg-gold/20 text-gold border-gold/30'
                      : 'bg-white/5 text-gray-300 border-white/10'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <span className={`block text-sm font-bold ${isActive ? 'text-gold' : 'text-white'}`}>
                    {label}
                  </span>
                  <span className="block text-xs text-gray-400 mt-1 leading-relaxed">
                    {description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Confirm */}
        <button
          type="button"
          disabled={!selected}
          onClick={handleConfirm}
          className={`w-full py-3.5 font-bold text-xs tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all ${
            selected
              ? 'bg-gradient-to-r from-premium-yellow to-gold text-deep-black hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
              : 'bg-white/5 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span>{selected ? `CONTINUE WITH ${selected.toUpperCase()}` : 'SELECT A METHOD'}</span>
          {selected && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};

export default PaymentMethodModal;