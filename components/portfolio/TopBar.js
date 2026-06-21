'use client';
import { useEffect, useState } from 'react';
import { useLang } from './LangContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopBar({ showSectionNav }) {
  const { lang, setLang, t } = useLang();
  const [active, setActive] = useState('about');
  const ids = ['about', 'skills', 'cases', 'workflow', 'ai', 'contact'];

  useEffect(() => {
    if (!showSectionNav) return;
    const onScroll = () => {
      const y = window.scrollY + 140;
      let cur = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= y) cur = id;
      }
      setActive(cur);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [showSectionNav]);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 md:px-10 py-5 flex items-center justify-between mix-blend-difference text-white">
      <a href="#top" className="font-display text-sm tracking-[0.2em] uppercase">M.K — <span className="opacity-60">AI Automation</span></a>

      <AnimatePresence>
        {showSectionNav && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}
            className="hidden md:flex items-center gap-5 lg:gap-7 font-mono text-[11px] tracking-[0.18em] uppercase">
            {t.nav.items.map((it, i) => (
              <a key={it} href={`#${ids[i]}`} className={`transition ${active === ids[i] ? 'opacity-100' : 'opacity-55 hover:opacity-100'}`}>
                {it}
              </a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-1 font-mono text-xs">
        <button onClick={() => setLang('ua')} className={`px-2 py-1 transition ${lang==='ua' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}>UA</button>
        <span className="opacity-40">|</span>
        <button onClick={() => setLang('en')} className={`px-2 py-1 transition ${lang==='en' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}>EN</button>
      </div>
    </motion.header>
  );
}
