import { useState } from "react";

const gymRules = [
  {
    id: "01",
    title: "Water Bottles",
    description:
      "Always take your water bottle with you after your workout. Bottles must not be left anywhere inside the gym premises.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {/* Water bottle */}
        <path d="M9 3h6l1 3H8L9 3z" />
        <path d="M8 6v13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6" />
        <path d="M10 11c0 1.1.9 2 2 2s2-.9 2-2" />
        <path d="M10 6v2" />
        <path d="M14 6v2" />
      </svg>
    ),
  },
  {
    id: "02",
    title: "Personal Towel",
    description:
      "All members must bring and use a personal towel while working out. To maintain hygiene and cleanliness, members must take their towel home after each workout session and must not leave it in the facility.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {/* Horizontal rail at top, towel hanging down with fold lines */}
        <line x1="3" y1="4" x2="21" y2="4" />
        <path d="M8 4v13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4" />
        <line x1="9" y1="9" x2="15" y2="9" />
        <line x1="9" y1="13" x2="15" y2="13" />
      </svg>
    ),
  },
  {
    id: "03",
    title: "Footwear Policy",
    description:
      "Outdoor footwear is strictly prohibited inside the gym. Members who train with shoes must keep a dedicated pair exclusively for gym use.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {/* Sneaker side profile */}
        <path d="M2 17c0 0 2-1 4-1l3-6h3l1.5 3H17c1.5 0 3 1 3 2.5V17H2z" />
        <path d="M5 16l1-3" />
        <path d="M17 14.5c0 0 0 1-1 1.5" />
      </svg>
    ),
  },
  {
    id: "04",
    title: "Equipment & Weight Management",
    description:
      "After using any weights, plates, dumbbells, or machine attachments, return them to their designated storage areas. Do not leave equipment scattered on the floor.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {/* Dumbbell — outer caps, inner plates, connecting bar */}
        <rect x="1" y="9.5" width="2.5" height="5" rx="0.5" />
        <rect x="3.5" y="7.5" width="2.5" height="9" rx="0.5" />
        <line x1="6" y1="12" x2="18" y2="12" />
        <rect x="18" y="7.5" width="2.5" height="9" rx="0.5" />
        <rect x="20.5" y="9.5" width="2.5" height="5" rx="0.5" />
      </svg>
    ),
  },
  {
    id: "05",
    title: "Respect the Facility",
    description:
      "Use all gym equipment responsibly and help maintain a clean, organized, and respectful training environment for every member.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {/* Handshake — two hands clasping in the center */}
        <path d="M2 12l4-4h3l2 2h2l2-2h3l4 4" />
        <path d="M6 8l-1 5 5 3 5-3-1-5" />
        <path d="M11 10l1 1 1-1" />
      </svg>
    ),
  },
];

function RuleCard({ rule }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        flex items-start gap-4 p-4 sm:p-5
        bg-[#1F1F1F] rounded-xl border transition-all duration-200 cursor-default
        ${hovered ? "border-rose-700/50" : "border-[#2a2a2a]"}
      `}
    >
      <div
        className={`
          flex-shrink-0 w-11 h-11 rounded-[10px] flex items-center justify-center
          bg-rose-950/40 border transition-colors duration-200
          ${hovered ? "border-rose-700/40 text-rose-500" : "border-rose-900/30 text-[#E11D48]"}
        `}
      >
        {rule.icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#E11D48] mb-1">
          Rule {rule.id}
        </p>
        <h3 className="text-[#F8FAFC] text-sm font-semibold mb-1.5">{rule.title}</h3>
        <p className="text-[#666] text-[13px] leading-relaxed">{rule.description}</p>
      </div>
    </div>
  );
}

export default function GymTermsConditions() {
  return (
    <div className="w-full mx-auto bg-[#111111] rounded-2xl border border-[#2a2a2a] overflow-hidden">

      {/* Header */}
      <div className="relative bg-[#1F1F1F] border-b border-[#2a2a2a] px-6 sm:px-8 py-6 sm:py-7">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#E11D48]" />

        <div className="inline-flex items-center gap-1.5 bg-rose-950/40 border border-rose-800/30 text-rose-400 text-[10px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-3">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Member Guidelines
        </div>

        <h2 className="text-[#F8FAFC] text-xl sm:text-2xl font-semibold mb-1.5 leading-snug">
          Terms &amp; Conditions
        </h2>
        <p className="text-[#555] text-sm leading-relaxed">
          Please read and follow these rules to ensure a safe, clean, and respectful environment for all members.
        </p>
      </div>

      {/* Rules */}
      <div className="px-5 sm:px-8 py-5 sm:py-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {gymRules.map((rule) => (
          <RuleCard key={rule.id} rule={rule} />
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-[#222] mx-5 sm:mx-8 mb-5 sm:mb-6" />

      {/* Footer */}
      <div className="mx-5 sm:mx-8 mb-6 sm:mb-7 flex items-start gap-3 bg-rose-950/20 border border-rose-900/25 rounded-xl px-4 sm:px-5 py-4">
        <div className="flex-shrink-0 mt-0.5 text-[#E11D48]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <p className="text-[#777] text-[13px] leading-relaxed">
          <span className="text-[#F8FAFC] font-semibold">Thank you for your cooperation.</span>{" "}
          By using our facilities, you agree to abide by these terms and help create a better gym experience for everyone.
        </p>
      </div>

    </div>
  );
}