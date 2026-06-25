'use client';
import { useEffect, useRef, useState } from 'react';
import { useLang } from './LangContext';
import { skillsRowA, skillsRowB } from '@/lib/i18n';
import Reveal from './Reveal';

function Ribbon({ items, reverse = false, play }) {
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden py-4 border-y border-white/10 bg-white/[0.02]">
      <div
        className={`marquee gap-2 px-3 ${reverse ? 'marquee-reverse' : ''} ${play ? '' : 'marquee-paused'}`}
      >
        {row.map((s, i) => (
          <span
            key={i}
            className="shrink-0 font-display text-xl md:text-2xl px-4 py-1.5 text-white/85 whitespace-nowrap inline-flex items-center"
          >
            {s}
            <span className="mx-3 text-[#c5ff00]/60 text-[0.5em] translate-y-[-0.1em]" aria-hidden>●</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Skills() {
  const { t } = useLang();
  const ref = useRef(null);
  // Keep the marquees parked at their first item until the block scrolls into
  // view, then start them from the beginning so the main tools (n8n, Make.com…)
  // lead instead of whatever the infinite loop happened to land on.
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { setPlay(true); return; }
    const io = new IntersectionObserver(
      (entries) => { if (entries.some((e) => e.isIntersecting)) { setPlay(true); io.disconnect(); } },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="skills" ref={ref} className="relative py-20 md:py-28 border-t border-white/5">
      <div className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <Reveal>
          <div className="font-mono text-xs tracking-[0.3em] text-[#c5ff00] mb-6">{t.skills.kicker}</div>
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight">{t.skills.heading}</h2>
        </Reveal>
      </div>

      {/* Two ribbons running in opposite directions */}
      <div className="mt-10 md:mt-12 flex flex-col gap-3">
        <Ribbon items={skillsRowA} play={play} />
        <Ribbon items={skillsRowB} reverse play={play} />
      </div>
    </section>
  );
}
