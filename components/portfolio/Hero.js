'use client';
import { useEffect, useRef, useState } from 'react';
import { useLang } from './LangContext';
import { motion, AnimatePresence } from 'framer-motion';

const PROFILE_LINES_EN = [
  { i: '01', text: "I don't just automate tasks — I fix the systems behind them.", hl: [] },
  { i: '02', text: 'With over 14 years of operational experience and a transition into AI-powered automation, I build workflows that actually work: n8n, Make.com, AI agents, integrations, and full-stack solutions when needed.', hl: ['14 years','AI-powered automation','n8n','Make.com','AI agents','integrations'] },
  { i: '03', text: "My advantage? I've personally experienced the operational challenges I now help businesses solve.", hl: [] },
  { i: '04', text: 'Open to freelance projects and new opportunities.', hl: [] },
];
const PROFILE_LINES_UA = [
  { i: '01', text: 'Я не просто автоматизую задачі — я виправляю системи, що стоять за ними.', hl: [] },
  { i: '02', text: 'Понад 14 років операційного досвіду та перехід у AI-автоматизацію: будую воркфлоу, які реально працюють — n8n, Make.com, AI-агенти, інтеграції та full-stack рішення там, де треба.', hl: ['14 років','AI-автоматизацію','n8n','Make.com','AI-агенти','інтеграції'] },
  { i: '03', text: 'Моя перевага? Я особисто пройшла через ті операційні виклики, які тепер допомагаю вирішувати бізнесам.', hl: [] },
  { i: '04', text: 'Відкрита до freelance-проєктів та нових можливостей.', hl: [] },
];

function highlight(text, words) {
  if (!words?.length) return text;
  const re = new RegExp('(' + words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'g');
  return text.split(re).map((s, i) => words.includes(s) ? <span key={i} className="text-[#c5ff00]">{s}</span> : <span key={i}>{s}</span>);
}

export default function Hero() {
  const { t, lang } = useLang();
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const targetTimeRef = useRef(0);
  const currentTimeRef = useRef(0);
  const lastAppliedRef = useRef(-1);
  const [progress, setProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [continueClicked, setContinueClicked] = useState(false);

  // ----- Video load -----
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const ready = () => setVideoReady(true);
    if (v.readyState >= 1) ready();
    v.addEventListener('loadedmetadata', ready);
    v.addEventListener('loadeddata', ready);
    v.addEventListener('canplay', ready);
    try { v.load(); } catch (e) {}
    (async () => { try { await v.play(); v.pause(); v.currentTime = 0.001; } catch (e) {} })();
    return () => {
      v.removeEventListener('loadedmetadata', ready);
      v.removeEventListener('loadeddata', ready);
      v.removeEventListener('canplay', ready);
    };
  }, []);

  // ----- Scroll -> target progress + target video time -----
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const p = total > 0 ? scrolled / total : 0;
      setProgress(p);
      const v = videoRef.current;
      if (v && v.duration && !isNaN(v.duration)) {
        targetTimeRef.current = v.duration * Math.max(0, Math.min(1, p));
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // ----- RAF lerp loop for buttery smooth video.currentTime -----
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const v = videoRef.current;
      if (v && v.duration) {
        currentTimeRef.current += (targetTimeRef.current - currentTimeRef.current) * 0.18;
        if (Math.abs(currentTimeRef.current - lastAppliedRef.current) > 0.012) {
          try { v.currentTime = currentTimeRef.current; lastAppliedRef.current = currentTimeRef.current; } catch (e) {}
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ----- Force scroll to top on mount + disable browser scroll restoration -----
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, []);

  // ----- Gate: lock body scroll until Continue clicked. Fires ONLY when sticky reaches its end. -----
  const [nearEnd, setNearEnd] = useState(false);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const check = () => {
      // sticky range = [0, offsetHeight - viewport]. Gate fires near upper bound (~last 8% of range)
      const sentinelEnd = el.offsetTop + el.offsetHeight - window.innerHeight;
      const stickyRange = el.offsetHeight - window.innerHeight;
      const gateStart = sentinelEnd - stickyRange * 0.08;  // last 8% of sticky range
      const gateEnd = sentinelEnd + 30;                     // small buffer past the end
      const y = window.scrollY;
      setNearEnd(y >= gateStart && y <= gateEnd);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, []);
  const atEnd = nearEnd && !continueClicked;
  useEffect(() => {
    if (!atEnd) return;
    if (typeof window !== 'undefined' && window.__lenis) window.__lenis.stop();
    document.body.style.overflow = 'hidden';
    // Pin scroll exactly at end of sticky range so video frame is the last one (with glasses)
    const el = containerRef.current;
    if (el) {
      const sentinelEnd = el.offsetTop + el.offsetHeight - window.innerHeight;
      if (Math.abs(window.scrollY - sentinelEnd) > 4) window.scrollTo(0, sentinelEnd);
    }
    return () => {
      if (typeof window !== 'undefined' && window.__lenis) window.__lenis.start();
      document.body.style.overflow = '';
    };
  }, [atEnd]);

  const handleContinue = () => {
    setContinueClicked(true);
    // Unlock + smooth scroll to About
    if (typeof window !== 'undefined' && window.__lenis) window.__lenis.start();
    document.body.style.overflow = '';
    setTimeout(() => {
      const a = document.getElementById('about');
      if (a) a.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const intro = progress < 0.1;
  const nav = progress >= 0.1 && progress < 0.78;
  const ready = progress >= 0.78;
  const lines = lang === 'ua' ? PROFILE_LINES_UA : PROFILE_LINES_EN;

  return (
    <section id="top" ref={containerRef} className="relative w-full" style={{ height: '350vh' }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0a0a0a]">
        <div className="absolute inset-0 grid-bg opacity-40" />

        {/* HIGH-QUALITY video */}
        <div className="absolute inset-0 flex">
          <div className="relative h-full w-full md:w-[58%]">
            <video
              ref={videoRef}
              src="/assets/maria-video-hq.mp4"
              muted playsInline preload="auto"
              poster="/assets/maria-no-sunglasses.jpg"
              className="absolute inset-0 w-full h-full object-cover object-left"
              style={{ opacity: videoReady ? 1 : 0, transition: 'opacity .4s' }}
            />
            <img src="/assets/maria-no-sunglasses.jpg" alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover object-left pointer-events-none"
              style={{ opacity: videoReady ? 0 : 1, transition: 'opacity .4s' }} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-[#0a0a0a]" />
          </div>
        </div>

        {/* Right content layer — intro / nav / ready states (UNCHANGED for smoothness) */}
        <div className="relative z-10 h-full w-full flex flex-col justify-between px-6 md:px-12 lg:px-20 pt-28 pb-10">
          <div />
          <div className="md:ml-auto md:w-[48%] lg:w-[44%] min-h-[320px]">
            <AnimatePresence mode="wait">
              {intro && (
                <motion.div key="intro" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
                  <div className="font-mono text-xs tracking-[0.3em] text-[#c5ff00] mb-6">/ INITIATING</div>
                  <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95] font-medium text-white">{t.hero.name}</h1>
                  <div className="mt-5 text-xl md:text-2xl text-white/80">{t.hero.role}</div>
                  <p className="mt-6 text-base md:text-lg text-white/55 max-w-md">{t.hero.tagline}</p>
                  <div className="mt-10 flex flex-wrap gap-3">
                    <a href="#cases" className="group inline-flex items-center gap-2 bg-[#c5ff00] text-black px-5 py-3 rounded-full text-sm font-medium hover:bg-white transition">
                      {t.hero.cta1} <span className="group-hover:translate-x-1 transition">→</span>
                    </a>
                    <a href="/assets/resume.pdf" download className="inline-flex items-center gap-2 border border-white/20 text-white px-5 py-3 rounded-full text-sm font-medium hover:bg-white/10 transition">
                      {t.hero.cta2}
                    </a>
                  </div>
                  <ScrollPill />
                </motion.div>
              )}
              {nav && (
                <motion.div key="nav" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                  <div className="font-mono text-xs tracking-[0.3em] text-[#c5ff00] mb-8">/ SECTIONS</div>
                  <ul className="space-y-3 text-2xl md:text-3xl lg:text-4xl font-medium">
                    {t.nav.items.map((it, i) => (
                      <motion.li key={it}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="text-white/85 hover:text-[#c5ff00] transition">
                        <a href={['#about','#skills','#cases','#workflow','#ai','#contact'][i]}>{it}</a>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
              {ready && (
                <motion.div key="ready" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
                  <div className="font-mono text-xs tracking-[0.3em] text-[#c5ff00] mb-6 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#c5ff00] animate-pulse" /> ONLINE
                  </div>
                  <h2 className="font-display text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight text-white">{t.hero.ready}</h2>
                  <p className="mt-6 text-white/55 max-w-md">{t.hero.tagline}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-end text-xs font-mono tracking-[0.25em] text-white/45">
            <div className="flex items-center gap-3">
              <span>{String(Math.round(progress * 100)).padStart(3, '0')}%</span>
              <div className="w-24 h-px bg-white/15 overflow-hidden">
                <div className="h-full bg-[#c5ff00]" style={{ transform: `scaleX(${progress})`, transformOrigin: 'left' }} />
              </div>
            </div>
          </div>
        </div>

        {/* End of sticky inner */}
      </div>

      {/* ===== GATE OVERLAY at 100% — rendered as a FIXED overlay outside sticky to always cover viewport ===== */}
      <AnimatePresence>
        {atEnd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="fixed inset-0 z-30 flex items-center justify-end px-6 md:px-12 lg:px-20 pointer-events-none"
          >
            {/* Right column content (so it lines up with hero's right column) */}
            <div className="md:w-[52%] lg:w-[48%] max-w-xl pointer-events-auto">
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, duration: 0.5 }}>
                <div className="font-mono text-xs tracking-[0.3em] text-[#c5ff00] mb-4 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#c5ff00] animate-pulse" /> ONLINE
                </div>
                <div className="rounded-md border border-[#c5ff00]/40 px-4 py-2 inline-flex items-center gap-2 font-mono text-base md:text-lg text-[#c5ff00]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c5ff00] animate-pulse" /> &gt; SYSTEM READY
                </div>
              </motion.div>

              <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25, duration: 0.5 }}
                className="mt-5 rounded-xl border border-white/10 bg-black/65 backdrop-blur-md overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-white/[0.03]">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                  <span className="ml-2 font-mono text-xs text-white/60">maria_kasycheva.sh</span>
                </div>
                <div className="px-5 py-5 font-mono text-[14.5px] md:text-[15px] leading-[1.65]">
                  {lines.map((l, idx) => (
                    <motion.p key={l.i} initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + idx * 0.18 }}
                      className="flex gap-3 mb-3 last:mb-0">
                      <span className="text-white/30 select-none">{l.i}</span>
                      <span className="text-white/90">{highlight(l.text, l.hl)}</span>
                    </motion.p>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 0.5 }}
                className="mt-6 flex items-center justify-center">
                <button onClick={handleContinue}
                  className="group inline-flex items-center gap-3 border border-[#c5ff00]/60 hover:bg-[#c5ff00] hover:text-black text-white px-8 py-3.5 rounded-full font-mono text-sm tracking-[0.2em] transition">
                  CONTINUE <motion.span animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}>↓</motion.span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ScrollPill() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
      className="mt-10">
      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        className="inline-flex items-center px-5 py-2 rounded-full border border-white/25 bg-transparent">
        <span className="font-sans text-[13px] tracking-wide text-white/85">Scroll to Activate</span>
      </motion.div>
    </motion.div>
  );
}
