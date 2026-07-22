import { ChevronDown, List } from 'lucide-react';
import { useEffect, useState } from 'react';

const TableOfContents = ({ items }) => {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '');
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const entry = entries.filter((item) => item.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (entry) setActiveId(entry.target.id);
    }, { rootMargin: '-22% 0px -68% 0px' });
    const sections = items.map(({ id }) => document.getElementById(id)).filter(Boolean);
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);
  const navigate = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); setIsOpen(false); };
  return <aside className="lg:sticky lg:top-28 lg:self-start"><div className="overflow-hidden rounded-2xl border border-[#333333] bg-[#111111] shadow-xl shadow-black/20"><button type="button" onClick={() => setIsOpen((open) => !open)} className="flex w-full items-center justify-between p-5 text-left lg:pointer-events-none"><span className="flex items-center gap-2 text-sm font-semibold text-slate-100"><List className="h-4 w-4 text-rose-400" />On this page</span><ChevronDown className={`h-4 w-4 text-slate-400 transition-transform lg:hidden ${isOpen ? 'rotate-180' : ''}`} /></button><nav className={`${isOpen ? 'block' : 'hidden'} border-t border-white/5 p-3 lg:block lg:border-0`} aria-label="Table of contents">{items.map((item, index) => <button key={item.id} type="button" onClick={() => navigate(item.id)} className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${activeId === item.id ? 'bg-rose-500/10 font-medium text-rose-300' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}`}><span className="mr-2 text-xs text-slate-600">{String(index + 1).padStart(2, '0')}</span>{item.title}</button>)}</nav></div></aside>;
};

export default TableOfContents;
