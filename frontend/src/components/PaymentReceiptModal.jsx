import { useState, useEffect, useRef } from "react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
 
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);
 
const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);
 
const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
  </svg>
);
 
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
 
const Row = ({ label, value, highlight }) => (
  <div className="flex items-center justify-between py-3.5 border-b border-[#1F1F1F] last:border-0">
    <span className="text-sm text-[#888888] font-medium tracking-wide">{label}</span>
    <span className={`text-sm font-semibold text-right ${highlight ? "text-[#E11D48]" : "text-[#F8FAFC]"}`}>
      {value}
    </span>
  </div>
);

export default function PaymentReceiptModal({ isOpen, onClose, receiptData }) {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  const receiptRef = useRef(null);
 
  // Animate in/out
  useEffect(() => {
    if (isOpen) {
      // tiny delay so CSS transition fires
      requestAnimationFrame(() => setVisible(true));
      document.body.style.overflow = "hidden";
    } else {
      setVisible(false);
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);
 
  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 220); // wait for fade-out
  };
 
  const handleCopy = () => {
    navigator.clipboard.writeText(receiptData?.invoiceNumber || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleShareContent = async () => {
    if (!navigator.share) {
      alert("Web Share API is not supported in this browser.");
      return;
    };
    try {
      await navigator.share({
        title: 'Check this out!',
        text: '',
        url: window.location.href 
      })
    } catch (error) {
      console.error('Sharing failed or canceled:', error);
    }
  }

  const handleDownload = async () => {
    const element = receiptRef.current;
    if(!element) return;

    const canvas = await html2canvas(element, {
      backgroundColor: '#111111',
      scale: 2,                   // retina quality
      useCORS: true
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width / 2, canvas.height / 2]
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save(`Dcore-receipt-${receiptData.invoiceNumber || 'd-core-invoice'}.pdf`)
  }
 
  if (!isOpen) return null;
 
  return (
    <div
      className="fixed inset-0 z-51 flex items-center justify-center overflow-y-auto p-4 py-8"
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        transition: "background 0.22s ease",
        background: visible ? "rgba(5,5,5,0.82)" : "rgba(5,5,5,0)",
        backdropFilter: visible ? "blur(6px)" : "blur(0px)",
      }}
      onClick={handleClose}  // click backdrop → close
    >
      {/* Card wrapper — stop propagation so clicking inside won't close */}
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md relative my-auto"
        style={{
          transition: "opacity 0.22s ease, transform 0.22s ease",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.97)",
        }}
      >
        {/* Close ✕ button — top-right outside card */}
        <button
          onClick={handleClose}
          className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-150"
          style={{
            backgroundColor: "#1F1F1F",
            border: "1px solid #333333",
            color: "#888888",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = "rgba(225,29,72,0.15)";
            e.currentTarget.style.borderColor = "rgba(225,29,72,0.4)";
            e.currentTarget.style.color = "#F43F5E";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = "#1F1F1F";
            e.currentTarget.style.borderColor = "#333333";
            e.currentTarget.style.color = "#888888";
          }}
          aria-label="Close receipt"
        >
          <CloseIcon />
        </button>
 
        {/* Glow accent */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-6 w-72 h-2 rounded-full blur-2xl opacity-50 pointer-events-none"
          style={{ background: "radial-gradient(ellipse, #E11D48 0%, transparent 70%)" }}
        />
 
        {/* Card */}
        <div
          ref={receiptRef}
          className="relative rounded-2xl overflow-hidden shadow-2xl"
          style={{
            backgroundColor: "#111111",
            border: "1px solid #1F1F1F",
            boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(225,29,72,0.08)",
          }}
        >
          {/* Top gradient stripe */}
          <div
            className="h-1.5 w-full"
            style={{ background: "linear-gradient(90deg, #9F1239, #E11D48, #F43F5E, #E11D48, #9F1239)" }}
          />
 
          {/* Success badge */}
          <div className="flex flex-col items-center pt-10 pb-6 px-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
              style={{
                background: "linear-gradient(135deg, #9F1239 0%, #E11D48 100%)",
                boxShadow: "0 0 32px 6px rgba(225,29,72,0.28)",
              }}
            >
              <CheckIcon />
            </div>
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#E11D48] mb-1">
              Payment Confirmed
            </p>
            <h1 className="text-3xl font-bold text-[#F8FAFC] tracking-tight mb-1">
              {receiptData?.amount || "—"}
            </h1>
            <p className="text-sm text-[#555555]">{receiptData?.paymentDate || "—"}</p>
          </div>
 
          {/* Receipt label divider */}
          <div className="relative flex items-center px-6 mb-1">
            <div className="flex-1 h-px" style={{ background: "#1F1F1F" }} />
            <span
              className="mx-3 px-3 py-1 text-[10px] uppercase tracking-widest font-bold rounded-full"
              style={{ backgroundColor: "#1F1F1F", color: "#555555" }}
            >
              Receipt
            </span>
            <div className="flex-1 h-px" style={{ background: "#1F1F1F" }} />
          </div>
 
          {/* Details rows */}
          <div className="px-6 pt-2 pb-4">
            <Row label="Invoice Number" value={receiptData?.invoiceNumber} />
            <Row label="Name"value={receiptData?.name} />
            <Row label="Membership Plan" value={receiptData?.membershipPlan} highlight />
            <Row label="Amount" value={receiptData?.amount} highlight />
            <Row label="Start Date" value={receiptData?.startDate} />
            <Row label="End Date" value={receiptData?.endDate} />
            <Row label="Payment Method" value={receiptData?.paymentMethod}  />
            <Row label="Payment Date" value={receiptData?.paymentDate} />
          </div>
 
          {/* Invoice copy chip */}
          <div
            className="mx-6 mb-5 mt-1 flex items-center justify-between rounded-xl px-4 py-3"
            style={{ backgroundColor: "#1F1F1F" }}
          >
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#555555] font-semibold mb-0.5">Invoice ID </p>
              <p className="text-sm text-[#F8FAFC] font-mono font-semibold">{receiptData?.invoiceNumber}</p>
            </div>
            <button
              onClick={handleCopy}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all duration-150 cursor-pointer"
              style={{
                backgroundColor: copied ? "#9F1239" : "#333333",
                color: copied ? "#F8FAFC" : "#888888",
                border: "1px solid #333333",
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
 
          {/* Action buttons */}
          <div className="px-6 pb-5 flex gap-3">
            <button
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #9F1239 0%, #E11D48 100%)",
                color: "#F8FAFC",
                boxShadow: "0 4px 18px rgba(225,29,72,0.25)",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "linear-gradient(135deg, #E11D48 0%, #F43F5E 100%)")}
              onMouseLeave={e => (e.currentTarget.style.background = "linear-gradient(135deg, #9F1239 0%, #E11D48 100%)")}
              onClick={handleDownload}
            >
              <DownloadIcon />
              Download PDF
            </button>
            <button
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer"
              style={{ backgroundColor: "#1F1F1F", color: "#888888", border: "1px solid #333333" }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#333333"; e.currentTarget.style.color = "#F8FAFC"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#1F1F1F"; e.currentTarget.style.color = "#888888"; }}
              onClick={handleShareContent}
            >
              <ShareIcon />
              Share
            </button>
          </div>
 
          {/* Cancel / close strip */}
          <div
            className="border-t px-6 py-4 flex items-center justify-between"
            style={{ borderColor: "#1F1F1F" }}
          >
            <span className="text-xs text-[#333333]">
              Need help?{" "}
              <span className="text-[#E11D48] cursor-pointer hover:text-[#F43F5E] transition-colors">
                Contact support
              </span>
            </span>
            <button
              onClick={handleClose}
              className="text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-all duration-150 cursor-pointer"
              style={{
                backgroundColor: "#1F1F1F",
                color: "#888888",
                border: "1px solid #333333",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = "rgba(225,29,72,0.1)";
                e.currentTarget.style.borderColor = "rgba(225,29,72,0.3)";
                e.currentTarget.style.color = "#F43F5E";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = "#1F1F1F";
                e.currentTarget.style.borderColor = "#333333";
                e.currentTarget.style.color = "#888888";
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}