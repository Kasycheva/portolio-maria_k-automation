'use client';
import { useEffect, useState } from 'react';
import { useLang } from './LangContext';
import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

export default function About() {
  const { t } = useLang();
  // About is always reached through the Hero spiral overlay, so a plain
  // whileInView fires while the block is still hidden behind it. Instead we
  // reveal on the `hero:reveal` signal the transition emits once it clears —
  // that way the entrance animation actually plays on a visible screen.
  const [revealed, setRevealed] = useState(false);
  const lastIndex = t.about.body.length - 1;

  useEffect(() => {
    const reveal = () => setRevealed(true);
    // Re-arm on every Continue press so the entrance replays each time the
    // visitor returns to the Hero and crosses the gate again. The reset is
    // hidden behind the transition overlay, so it is never seen as a flicker.
    const rearm = () => setRevealed(false);
    window.addEventListener('hero:reveal', reveal);
    window.addEventListener('hero:navigate', rearm);
    return () => {
      window.removeEventListener('hero:reveal', reveal);
      window.removeEventListener('hero:navigate', rearm);
    };
  }, []);

  const show = (props) => (revealed ? props.to : props.from);

  return (
    <section id="about" className="relative py-28 sm:py-32 md:py-44 px-6 md:px-12 lg:px-20 overflow-hidden">
      {/* Very faint accent glow for a hint of depth (kept subtle on purpose) */}
      <div className="pointer-events-none absolute -top-16 left-1/4 h-[320px] w-[320px] rounded-full bg-[#c5ff00]/[0.05] blur-[150px]" />

      <div className="relative max-w-7xl mx-auto grid md:grid-cols-12 gap-10 md:gap-16 items-start">
        {/* Left — kicker and serif title */}
        <div className="md:col-span-5 md:sticky md:top-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={show({ from: { opacity: 0, y: 20 }, to: { opacity: 1, y: 0 } })}
            transition={{ duration: 0.6, ease: EASE }}
            className="font-mono text-xs tracking-[0.3em] text-[#c5ff00] mb-5 sm:mb-6"
          >
            {t.about.kicker}
          </motion.div>

          {/* Word-by-word mask reveal: each word slides up from behind a clip */}
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[5.25rem] leading-[0.95] tracking-tight">
            {t.about.heading.split(' ').map((word, i, arr) => (
              <span
                key={`${word}-${i}`}
                className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom"
                style={{ marginRight: i < arr.length - 1 ? '0.22em' : 0 }}
              >
                <motion.span
                  className="inline-block"
                  initial={{ y: '110%' }}
                  animate={show({ from: { y: '110%' }, to: { y: '0%' } })}
                  transition={{ duration: 0.8, delay: 0.15 + i * 0.12, ease: EASE }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h2>
        </div>

        {/* Right — lead, body, closing and tags */}
        <div className="md:col-span-7 md:pt-2">
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={show({ from: { opacity: 0, y: 24 }, to: { opacity: 1, y: 0 } })}
            transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
            className="text-xl sm:text-2xl md:text-3xl leading-snug text-white font-light"
          >
            {t.about.lead}
          </motion.p>

          <div className="mt-7 sm:mt-8 space-y-5 text-base sm:text-lg leading-relaxed max-w-2xl">
            {t.about.body.map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={show({ from: { opacity: 0, y: 20 }, to: { opacity: 1, y: 0 } })}
                transition={{ duration: 0.6, delay: 0.5 + i * 0.12, ease: EASE }}
                className={i === lastIndex ? 'text-white font-normal text-lg sm:text-xl' : 'text-white/55'}
              >
                {p}
              </motion.p>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={show({ from: { opacity: 0 }, to: { opacity: 1 } })}
            transition={{ duration: 0.7, delay: 0.5 + t.about.body.length * 0.12, ease: EASE }}
            className="mt-8 font-mono text-xs sm:text-sm tracking-[0.06em] text-white/45"
          >
            {t.about.closing}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={show({ from: { opacity: 0, y: 20 }, to: { opacity: 1, y: 0 } })}
            transition={{ duration: 0.6, delay: 0.6 + t.about.body.length * 0.12, ease: EASE }}
            className="mt-10 flex flex-wrap gap-2"
          >
            {t.about.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] sm:text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-full border border-white/15 text-white/70"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
