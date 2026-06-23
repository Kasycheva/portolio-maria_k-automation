'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function SmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    let lenis;
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      // Let Lenis drive touch too. Without this, native momentum on phones/
      // tablets fights the gate's snap-back and the page jitters where CONTINUE
      // appears. With syncTouch the gate blocks touch as smoothly as the wheel
      // (the virtualScroll hook below already handles both). Desktop wheel is
      // unaffected — syncTouch only changes touch devices.
      syncTouch: true,
      syncTouchLerp: 0.08,
      virtualScroll: ({ deltaY, event }) => {
        const root = document.documentElement;
        const gateY = Number(root.dataset.heroGateY);
        const gateLocked = root.dataset.heroGateLocked === 'true';
        if (gateLocked && deltaY > 0 && Number.isFinite(gateY) && lenis.targetScroll + deltaY >= gateY) {
          if (event.cancelable) event.preventDefault();
          lenis.scrollTo(gateY, { duration: 0.35, force: true });
          return false;
        }
      },
    });
    const resetToHeroStart = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      lenis.scrollTo(0, { immediate: true, force: true });
    };
    resetToHeroStart();
    window.addEventListener('pageshow', resetToHeroStart);
    window.addEventListener('beforeunload', resetToHeroStart);
    const navigatePastHero = (event) => {
      lenis.scrollTo(event.detail?.target || '#about', { duration: 1.15, force: true });
    };
    const snapToHeroGate = () => {
      const gateY = Number(document.documentElement.dataset.heroGateY);
      if (Number.isFinite(gateY)) lenis.scrollTo(gateY, { immediate: true, force: true });
    };
    window.addEventListener('hero:navigate', navigatePastHero);
    window.addEventListener('hero:snap-to-gate', snapToHeroGate);
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time) => { lenis.raf(time * 1000); };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      window.removeEventListener('pageshow', resetToHeroStart);
      window.removeEventListener('beforeunload', resetToHeroStart);
      window.removeEventListener('hero:navigate', navigatePastHero);
      window.removeEventListener('hero:snap-to-gate', snapToHeroGate);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);
  return null;
}
