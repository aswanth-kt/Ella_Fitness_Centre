const LegalSection = ({ id, title, children }) => (
  <section id={id} className="scroll-mt-28 rounded-2xl border border-[#333333] bg-[#1F1F1F] p-6 shadow-[0_18px_45px_-32px_rgba(0,0,0,0.9)] transition duration-300 hover:border-rose-500/35 hover:shadow-[0_20px_50px_-30px_rgba(225,29,72,0.35)] sm:p-8">
    <div className="mb-6 flex items-center gap-3"><span className="h-7 w-1 rounded-full bg-gradient-to-b from-rose-400 to-rose-800" /><h2 className="text-xl font-bold tracking-tight text-slate-50 sm:text-2xl">{title}</h2></div>
    <div className="max-w-3xl space-y-4 text-[15px] leading-7 text-slate-300 sm:text-base sm:leading-8">{children}</div>
  </section>
);

export default LegalSection;
