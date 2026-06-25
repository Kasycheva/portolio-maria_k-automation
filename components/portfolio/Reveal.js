'use client';
import { useEffect, useRef, useState } from 'react';

// Smooth scroll-in reveal. IntersectionObserver misreports below-fold elements
// in this layout (tall sticky hero + Lenis), so we read the real position with
// getBoundingClientRect on scroll. Re-triggers every time the element enters
// the viewport — scroll away and back and it plays again.
export default function Reveal({ children, className = '', y = 28 }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      setInView(r.top < vh * 0.85 && r.bottom > vh * 0.1);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'none' : `translateY(${y}px)`,
        transition: 'opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)',
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
