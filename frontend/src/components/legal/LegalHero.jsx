const LegalHero = ({ title, description, label }) => (
  <section className="relative overflow-hidden border-b border-white/10 bg-[#111111] pb-16 pt-32 sm:pb-20 sm:pt-40">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(225,29,72,0.22),transparent_42%),radial-gradient(circle_at_15%_80%,rgba(159,18,57,0.18),transparent_38%)]" />
    <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
      <p className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-rose-400">DCore Fitness Zone · {label}</p>
      <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl lg:text-6xl">{title}</h1>
      <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">{description}</p>
      <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-rose-400/25 bg-black/25 px-4 py-2 text-sm text-slate-300">
        <span className="h-2 w-2 rounded-full bg-rose-500" /> Last updated: July 22, 2026
      </div>
    </div>
  </section>
);

export default LegalHero;
