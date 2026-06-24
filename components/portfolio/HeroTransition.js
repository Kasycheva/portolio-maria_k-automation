'use client';
import { useEffect, useRef, useState } from 'react';
import { SpiralAnimation } from '@/components/ui/spiral-animation';

// Full-screen transition overlay played when the visitor leaves the Hero.
//
// It listens to the SAME `hero:navigate` event the Hero already dispatches on
// CONTINUE (and the "Explore Projects" CTA) — Hero and SmoothScroll are NOT
// touched. SmoothScroll's own listener smoothly scrolls to the target beneath
// this overlay; by the time the spiral fades out, the destination is in view.
const SHOW_MS = 2200; // spiral hold before fade-out begins (reaches the bloom)
const FADE_MS = 600; // fade-out duration (must match the CSS transition)

export default function HeroTransition() {
  // mounted: overlay is in the DOM (spiral running). fading: opacity → 0.
  const [mounted, setMounted] = useState(false);
  const [fading, setFading] = useState(false);
  const [reduced, setReduced] = useState(false);
  const timersRef = useRef([]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  useEffect(() => {
    const clearTimers = () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };

    const play = () => {
      clearTimers();
      setMounted(true);
      setFading(false);

      // Reduced motion: short black fade instead of the canvas spiral.
      const hold = reduced ? 350 : SHOW_MS;

      const t1 = window.setTimeout(() => setFading(true), hold);
      const t2 = window.setTimeout(() => {
        setMounted(false);
        setFading(false);
        // Tell the destination section it is now visible, so its entrance
        // animation plays on a clear screen instead of behind this overlay.
        window.dispatchEvent(new Event('hero:reveal'));
      }, hold + FADE_MS);
      timersRef.current = [t1, t2];
    };

    window.addEventListener('hero:navigate', play);
    return () => {
      window.removeEventListener('hero:navigate', play);
      clearTimers();
    };
  }, [reduced]);

  if (!mounted) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[60] bg-black"
      style={{
        opacity: fading ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease-out`,
        pointerEvents: fading ? 'none' : 'auto',
      }}
    >
      {!reduced && (
        <div className="absolute inset-0">
          <SpiralAnimation />
        </div>
      )}
    </div>
  );
}
