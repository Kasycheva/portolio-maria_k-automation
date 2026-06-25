'use client';
import { useState } from 'react';
import { useLang } from './LangContext';
import { caseStudies } from '@/lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import WorkflowGraph from './WorkflowGraph';
import RoiCalculator from './RoiCalculator';
import Reveal from './Reveal';

function Section({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Label({ children }) {
  return <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">{children}</div>;
}

export default function CaseStudies() {
  const { t, lang } = useLang();
  const [active, setActive] = useState(null);
  const [zoom, setZoom] = useState(false);
  const L = (o) => (lang === 'ua' ? o.ua : o.en);

  return (
    <section id="cases" className="relative py-24 md:py-32 border-t border-white/5">
      <div className="px-6 md:px-12 lg:px-20 max-w-[1500px] mx-auto">
        <Reveal>
          <div className="font-mono text-xs tracking-[0.3em] text-[#c5ff00] mb-8">{t.cases.kicker}</div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight max-w-3xl">{t.cases.heading}</h2>
            <p className="text-white/55 max-w-md">{t.cases.sub}</p>
          </div>
        </Reveal>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
          {caseStudies.map((c, i) => (
            <motion.button
              key={c.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.08 }}
              onClick={() => { setActive(c); setZoom(false); }}
              className={`group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0e0e0e] text-left transition-all duration-300 hover:-translate-y-1 hover:border-white/25 ${
                i === caseStudies.length - 1 ? 'sm:col-span-2 lg:col-span-1' : ''
              }`}
            >
              {/* real workflow preview */}
              <div className="relative h-48 overflow-hidden bg-[#0a0a0a]">
                <img
                  src={c.image}
                  alt=""
                  aria-hidden
                  className="h-full w-full object-cover object-left transition duration-500 group-hover:scale-[1.04]"
                />
              </div>

              <div className="flex flex-1 flex-col p-7 md:p-8">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-white/45">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c5ff00]" />
                  {L(c.category)}
                </div>
                <h3 className="mt-3 font-serif text-2xl md:text-[1.7rem] leading-snug">{L(c.title)}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-white/55 line-clamp-2">{L(c.desc)}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {c.tech.slice(0, 4).map((tg) => (
                    <span key={tg} className="rounded-full border border-white/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-white/55">{tg}</span>
                  ))}
                </div>
                <div className="mt-auto pt-6 inline-flex items-center gap-2 text-sm text-white/80">
                  {t.cases.view} <span className="transition group-hover:translate-x-1">→</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setActive(null)} data-lenis-prevent
            className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-md md:p-10"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="relative my-6 w-full max-w-4xl rounded-3xl border border-white/10 bg-[#0c0c0c] p-6 md:my-10 md:p-12"
            >
              <button onClick={() => setActive(null)} aria-label={t.cases.close} className="absolute right-5 top-5 z-10 h-9 w-9 rounded-full border border-white/15 text-white/70 transition hover:bg-white/10">✕</button>

              <Section>
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c5ff00]" /> {L(active.category)}
                </div>
                <h3 className="mt-3 font-serif text-3xl md:text-5xl leading-[1.04]">{L(active.title)}</h3>
                <p className="mt-3 max-w-2xl text-lg text-white/60">{L(active.desc)}</p>
              </Section>

              {/* real workflow screenshot — caption sits above so it never overlaps the image */}
              <Section delay={0.06} className="mt-8">
                <div className="mb-2 flex items-center justify-between">
                  <Label>{t.cases.shot}</Label>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/35">{t.cases.zoom} ⤢</span>
                </div>
                <button
                  type="button"
                  onClick={() => setZoom(true)}
                  className="block w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] transition hover:border-white/25"
                >
                  <img src={active.image} alt={`${L(active.title)} — workflow`} className="w-full object-cover" />
                </button>
              </Section>

              <Section delay={0.1} className="mt-10 max-w-3xl">
                <Label>{t.cases.problem}</Label>
                <p className="mt-3 text-[17px] leading-relaxed text-white/75">{L(active.problem)}</p>
              </Section>

              <Section delay={0.14} className="mt-8 max-w-3xl border-t border-white/8 pt-8">
                <Label>{t.cases.solution}</Label>
                <p className="mt-3 text-[17px] leading-relaxed text-white/75">{L(active.solution)}</p>
              </Section>

              <Section delay={0.18} className="mt-10">
                <Label>{t.cases.how}</Label>
                <ol className="mt-4 max-w-3xl space-y-3">
                  {L(active.steps).map((s, i) => (
                    <li key={i} className="flex gap-3 text-[15px] text-white/75">
                      <span className="font-mono text-xs text-white/35 pt-0.5">{String(i + 1).padStart(2, '0')}</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </Section>

              <Section delay={0.22} className="mt-10">
                <Label>{t.cases.tech}</Label>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {active.tech.map((tg) => (
                    <span key={tg} className="rounded-full border border-white/15 px-2.5 py-1 font-mono text-xs text-white/80">{tg}</span>
                  ))}
                </div>
              </Section>

              <Section delay={0.26} className="mt-10">
                <Label>{t.cases.flow}</Label>
                <div className="mt-4">
                  <WorkflowGraph nodes={active.nodes} labels={{ nIn: t.cases.nIn, nOut: t.cases.nOut, nLogic: t.cases.nLogic, nTools: t.cases.nTools }} />
                </div>
              </Section>

              <Section delay={0.3} className="mt-10">
                <Label>{t.cases.roiTitle}</Label>
                <div className="mt-4">
                  <RoiCalculator roi={active.roi} unit={L(active.roi.unit)} labels={t.cases} />
                </div>
              </Section>
            </motion.div>

            {/* Lightbox for the workflow screenshot */}
            <AnimatePresence>
              {zoom && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={(e) => { e.stopPropagation(); setZoom(false); }}
                  className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 p-4 md:p-10"
                >
                  <motion.img
                    initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }}
                    src={active.image} alt={`${L(active.title)} — workflow`}
                    className="max-h-full max-w-full rounded-xl border border-white/10"
                  />
                  <button aria-label={t.cases.close} className="absolute right-5 top-5 h-10 w-10 rounded-full border border-white/20 text-white/80 hover:bg-white/10">✕</button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
