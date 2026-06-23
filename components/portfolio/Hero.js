'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLang } from './LangContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Hero() {
  const { t } = useLang();
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const targetTimeRef = useRef(0);
  const currentTimeRef = useRef(0);
  const lastAppliedRef = useRef(-1);
  const lastSeekTsRef = useRef(0);
  const snapGuardRef = useRef(0);
  const unlockedRef = useRef(false);
  const passedHeroRef = useRef(false);
  const touchStartYRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  // Always begin the Hero from frame zero, including reloads and bfcache restores.
  useLayoutEffect(() => {
    const resetToStart = () => {
      unlockedRef.current = false;
      passedHeroRef.current = false;
      targetTimeRef.current = 0;
      currentTimeRef.current = 0;
      lastAppliedRef.current = -1;
      setUnlocked(false);
      setProgress(0);
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    };

    window.history.scrollRestoration = 'manual';
    resetToStart();
    const postHydrationReset = window.setTimeout(resetToStart, 150);
    window.addEventListener('pageshow', resetToStart);
    return () => {
      window.clearTimeout(postHydrationReset);
      window.removeEventListener('pageshow', resetToStart);
    };
  }, []);

  // Robust video loading + unlock seeking
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

  // Keep the final Hero frame as a real gate. Reverse scrolling always remains available.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const getGateY = () => el.offsetTop + el.offsetHeight - window.innerHeight;
    const syncGateState = () => {
      document.documentElement.dataset.heroGateY = String(getGateY());
      document.documentElement.dataset.heroGateLocked = String(!unlockedRef.current);
    };
    const isAtGate = () => window.scrollY >= getGateY() - 2;
    const blockForward = (event) => {
      if (!unlockedRef.current && isAtGate()) event.preventDefault();
    };
    const onWheel = (event) => {
      if (event.deltaY > 0) blockForward(event);
    };
    const onKeyDown = (event) => {
      if (event.key === ' ' && event.target.closest?.('button')) return;
      if (['ArrowDown', 'PageDown', 'End', ' '].includes(event.key)) blockForward(event);
    };
    const onTouchStart = (event) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (event) => {
      const currentY = event.touches[0]?.clientY;
      if (touchStartYRef.current !== null && currentY < touchStartYRef.current) blockForward(event);
    };
    const onAnchorClick = (event) => {
      const anchor = event.target.closest?.('a[href^="#"]');
      const target = anchor?.dataset.heroNavigate;
      if (!unlockedRef.current && target) {
        event.preventDefault();
        unlockedRef.current = true;
        passedHeroRef.current = false;
        setUnlocked(true);
        document.documentElement.dataset.heroGateLocked = 'false';
        window.dispatchEvent(new CustomEvent('hero:navigate', { detail: { target } }));
        return;
      }
      if (!unlockedRef.current && anchor?.getAttribute('href') !== '#top') event.preventDefault();
    };
    const onScrollGate = () => {
      const gateY = getGateY();
      // Snap back to the gate while locked — but THROTTLE it. On phones/tablets
      // native touch momentum keeps firing scroll events past the gate; snapping
      // on every one (~60/s) fought the momentum and made the page jitter where
      // CONTINUE appears. Snap once, then stay quiet ~300ms so the inertia dies.
      if (!unlockedRef.current && window.scrollY > gateY + 2) {
        const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        if (now - snapGuardRef.current > 300) {
          snapGuardRef.current = now;
          window.dispatchEvent(new Event('hero:snap-to-gate'));
        }
      }
      if (unlockedRef.current && window.scrollY > gateY + 24) {
        passedHeroRef.current = true;
      }
      if (unlockedRef.current && passedHeroRef.current && window.scrollY < gateY - 24) {
        unlockedRef.current = false;
        passedHeroRef.current = false;
        setUnlocked(false);
        syncGateState();
      }
    };

    syncGateState();
    window.addEventListener('wheel', onWheel, { passive: false, capture: true });
    window.addEventListener('keydown', onKeyDown, { capture: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
    el.addEventListener('click', onAnchorClick, { capture: true });
    window.addEventListener('scroll', onScrollGate, { passive: true });
    window.addEventListener('resize', syncGateState);
    return () => {
      window.removeEventListener('wheel', onWheel, { capture: true });
      window.removeEventListener('keydown', onKeyDown, { capture: true });
      window.removeEventListener('touchstart', onTouchStart, { capture: true });
      window.removeEventListener('touchmove', onTouchMove, { capture: true });
      el.removeEventListener('click', onAnchorClick, { capture: true });
      window.removeEventListener('scroll', onScrollGate);
      window.removeEventListener('resize', syncGateState);
      delete document.documentElement.dataset.heroGateY;
      delete document.documentElement.dataset.heroGateLocked;
    };
  }, []);

  // Scroll -> set TARGET progress + target video time. (Updates on every scroll event)
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
        // Map 0..1 -> 0..duration with a tiny ease-out at the end so it lands cleanly on last frame
        const vp = Math.max(0, Math.min(1, p));
        targetTimeRef.current = v.duration * vp;
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

  // RAF loop: smoothly LERP video.currentTime toward target. Decoupled from scroll = buttery smooth.
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const v = videoRef.current;
      if (v && v.duration) {
        // Smooth interpolation factor; lower = silkier (with more lag), higher = snappier
        currentTimeRef.current += (targetTimeRef.current - currentTimeRef.current) * 0.18;
        // Only push to video if delta worth a paint
        if (Math.abs(currentTimeRef.current - lastAppliedRef.current) > 0.012) {
          // Don't stack a new seek while the decoder is still resolving the
          // previous one — on weak browsers (smart TVs) seek pile-up blanks the
          // video mid-scroll. A 200ms fallback still forces progress if
          // `seeking` ever gets stuck, so capable devices are unaffected.
          const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
          if (!v.seeking || now - lastSeekTsRef.current > 200) {
            try {
              v.currentTime = currentTimeRef.current;
              lastAppliedRef.current = currentTimeRef.current;
              lastSeekTsRef.current = now;
            } catch (e) {}
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const navigatePastHero = useCallback((target) => {
    unlockedRef.current = true;
    passedHeroRef.current = false;
    setUnlocked(true);
    document.documentElement.dataset.heroGateLocked = 'false';
    window.dispatchEvent(new CustomEvent('hero:navigate', { detail: { target } }));
  }, []);

  const continueToSite = useCallback(() => navigatePastHero('#about'), [navigatePastHero]);

  const intro = progress < 0.1;
  const nav = progress >= 0.1 && progress < 0.985;
  const ready = progress >= 0.985;

  return (
    <section id="top" ref={containerRef} className="relative w-full" style={{ height: '350vh' }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0a0a0a]">
        <div className="absolute inset-0 grid-bg opacity-40" />

        {/* ONE video element — its last frame already shows sunglasses, no image crossfade jumps */}
        <div className="absolute inset-0 flex">
          <div className="hero-media relative h-full w-full md:w-[58%]">
            <video
              ref={videoRef}
              src="/assets/maria-video-opt-hq.mp4"
              muted playsInline preload="auto"
              poster="/assets/maria-no-sunglasses-hq.jpg"
              className="hero-vid absolute inset-0 w-full h-full object-cover object-left"
              style={{ opacity: videoReady ? 1 : 0, transition: 'opacity .4s' }}
            />
            {/* Subtle fallback while metadata loads */}
            <img src="/assets/maria-no-sunglasses-hq.jpg" alt=""
              aria-hidden
              className="hero-vid absolute inset-0 w-full h-full object-cover object-left pointer-events-none"
              style={{ opacity: videoReady ? 0 : 1, transition: 'opacity .4s' }} />
            <div className="hero-grad absolute inset-0" />
          </div>
        </div>

        {/* Right content layer */}
        <div className="hero-layout relative z-10 flex h-full w-full flex-col justify-between px-4 pb-5 pt-20 sm:px-6 sm:pb-8 sm:pt-24 md:px-12 md:pb-10 md:pt-28 lg:px-20 min-[2200px]:px-28">
          <div />
          <div className="hero-content min-h-[280px] sm:min-h-[320px] md:ml-auto md:w-[48%] lg:w-[44%] min-[2200px]:max-w-[960px]">
            <AnimatePresence mode="wait">
              {intro && (
                <motion.div key="intro" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
                  <div className="mb-4 font-mono text-[10px] tracking-[0.3em] text-[#c5ff00] sm:mb-6 sm:text-xs">/ INITIATING</div>
                  <h1 className="font-display text-4xl font-medium leading-[0.95] text-white sm:text-5xl md:text-6xl lg:text-7xl min-[2200px]:text-8xl">{t.hero.name}</h1>
                  <div className="mt-4 text-lg text-white/80 sm:mt-5 sm:text-xl md:text-2xl">{t.hero.role}</div>
                  <p className="mt-4 max-w-md text-sm text-white/55 sm:mt-6 sm:text-base md:text-lg">{t.hero.tagline}</p>
                  <div className="mt-6 max-w-md sm:mt-10">
                    <div className="flex flex-wrap gap-3">
                      <a href="#cases" data-hero-navigate="#cases" className="group inline-flex items-center gap-2 rounded-full bg-[#c5ff00] px-4 py-2.5 text-sm font-medium text-black transition hover:bg-white sm:px-5 sm:py-3">
                        {t.hero.cta1} <span className="group-hover:translate-x-1 transition">→</span>
                      </a>
                      <a href="/assets/resume.pdf" download="AI Automation - Kasycheva Maria.pdf" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 sm:px-5 sm:py-3">
                        {t.hero.cta2}
                      </a>
                    </div>
                    <ScrollPill label={t.hero.hint} />
                  </div>
                </motion.div>
              )}
              {nav && (
                <motion.div key="nav" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                  <div className="font-mono text-xs tracking-[0.3em] text-[#c5ff00] mb-8">/ SECTIONS</div>
                  <ul className="space-y-2 text-xl font-medium sm:space-y-3 sm:text-2xl md:text-3xl lg:text-4xl">
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
                <motion.div key="ready" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="md:-ml-8 md:w-[calc(100%+2rem)] lg:-ml-12 lg:w-[calc(100%+3rem)]">
                  <div className="mb-3 flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-[#c5ff00] sm:mb-6 sm:text-xs">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#c5ff00] animate-pulse" /> {t.hero.online}
                  </div>
                  <div className="mb-3 border border-white/10 bg-white/[0.025] px-4 py-3 font-mono text-sm tracking-[0.14em] text-[#c5ff00] sm:mb-4 sm:px-5 sm:py-4 sm:text-base sm:tracking-[0.18em]">
                    <span className="mr-3 inline-block h-2.5 w-2.5 rounded-full bg-[#c5ff00] shadow-[0_0_12px_#c5ff00]" />
                    &gt; {t.hero.ready}
                  </div>
                  <div className="border border-white/10 bg-black/35 shadow-2xl shadow-black/40 backdrop-blur-sm">
                    <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2 font-mono text-[10px] text-white/45 sm:px-4 sm:py-3 sm:text-[11px]">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#ed6a5e]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#f4bf4f]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#c5ff00]" />
                      <span className="ml-3">maria_kasycheva.sh</span>
                    </div>
                    <div className="space-y-2 px-3 py-3 font-mono text-[9px] leading-[1.45] tracking-[0.01em] text-white/65 min-[360px]:text-[10px] sm:space-y-4 sm:px-4 sm:py-5 sm:text-[11px] sm:leading-relaxed md:text-[13px] md:leading-[1.65]">
                      {t.hero.profile.map((line, index) => (
                        <div key={line} className="grid grid-cols-[1.5rem_1fr] gap-2">
                          <span className="text-white/20">{String(index + 1).padStart(2, '0')}</span>
                          <p>{highlightProfile(line)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {!unlocked && (
                    <motion.button
                      type="button"
                      onClick={continueToSite}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="mx-auto mt-3 flex items-center gap-3 rounded-full border border-white/25 px-6 py-2.5 font-mono text-[10px] tracking-[0.22em] text-white transition hover:border-[#c5ff00] hover:text-[#c5ff00] sm:mt-6 sm:px-7 sm:py-3 sm:text-xs"
                    >
                      {t.hero.continue} <span aria-hidden>↓</span>
                    </motion.button>
                  )}
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
      </div>
    </section>
  );
}

// Centered activation hint with a small moving green slider.
function ScrollPill({ label }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
      className="mt-5 flex justify-center">
      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/45 px-4 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.22)] backdrop-blur-sm">
        <span className="relative h-4 w-1 overflow-hidden rounded-full bg-white/10" aria-hidden>
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="absolute left-0 top-0 h-2 w-1 rounded-full bg-[#c5ff00] shadow-[0_0_8px_#c5ff00]"
          />
        </span>
        <span className="h-3 w-px bg-white/15" aria-hidden />
        <span className="font-mono text-[10px] tracking-[0.24em] text-white/65">{label}</span>
      </motion.div>
    </motion.div>
  );
}

function highlightProfile(text) {
  const splitTerms = /(14 years|AI-powered automation|n8n|Make\.com|AI agents|integrations|14 років|AI-автоматизац(?:ію|ії)|AI-агентів|інтеграції)/gi;
  const exactTerm = /^(14 years|AI-powered automation|n8n|Make\.com|AI agents|integrations|14 років|AI-автоматизац(?:ію|ії)|AI-агентів|інтеграції)$/i;
  return text.split(splitTerms).map((part, index) =>
    exactTerm.test(part)
      ? <span key={`${part}-${index}`} className="text-[#c5ff00]">{part}</span>
      : part
  );
}
