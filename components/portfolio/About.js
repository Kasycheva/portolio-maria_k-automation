'use client';
import { useLang } from './LangContext';
import { motion } from 'framer-motion';

export default function About() {
  const { t } = useLang();
  const lastIndex = t.about.body.length - 1;
  return (
    <section id="about" className="relative py-28 sm:py-32 md:py-44 px-6 md:px-12 lg:px-20 overflow-hidden">
      {/* Faint accent glow so the photo-less block keeps depth */}
      <div className="pointer-events-none absolute -top-24 left-1/4 h-[420px] w-[420px] rounded-full bg-[#c5ff00]/10 blur-[130px]" />

      <div className="relative max-w-7xl mx-auto grid md:grid-cols-12 gap-10 md:gap-16 items-start">
        {/* Left — kicker and serif title */}
        <div className="md:col-span-5 md:sticky md:top-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
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
                  whileInView={{ y: '0%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.75, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-xl sm:text-2xl md:text-3xl leading-snug text-white font-light"
          >
            {t.about.lead}
          </motion.p>

          <div className="mt-7 sm:mt-8 space-y-5 text-base sm:text-lg leading-relaxed max-w-2xl">
            {t.about.body.map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.7 }}
                className={i === lastIndex ? 'text-white font-normal text-lg sm:text-xl' : 'text-white/55'}
              >
                {p}
              </motion.p>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25, duration: 0.7 }}
            className="mt-8 font-mono text-xs sm:text-sm tracking-[0.06em] text-white/45"
          >
            {t.about.closing}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.7 }}
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
