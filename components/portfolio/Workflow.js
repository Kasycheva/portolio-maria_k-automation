'use client';
import { useState } from 'react';
import { useLang } from './LangContext';
import { motion, AnimatePresence } from 'framer-motion';
import Reveal from './Reveal';

// The shared shape of almost every automation, explained in plain language.
const STAGES = [
  {
    id: 'trigger',
    label: { en: 'Trigger', ua: 'Тригер' },
    desc: {
      en: 'Something kicks it off — a form is submitted, a new email arrives, a schedule fires or another app sends a webhook.',
      ua: 'Щось запускає процес — надсилається форма, надходить новий лист, спрацьовує розклад або інший застосунок шле вебхук.',
    },
    tools: ['Webhook', 'Form', 'Schedule'],
  },
  {
    id: 'enrich',
    label: { en: 'Enrich', ua: 'Збагачення' },
    desc: {
      en: 'The raw input gets the context it needs — lookups, files and data pulled from your other tools.',
      ua: 'Сирий вхід отримує потрібний контекст — довідки, файли та дані з інших ваших інструментів.',
    },
    tools: ['Airtable', 'REST APIs', 'Google Drive'],
  },
  {
    id: 'decide',
    label: { en: 'AI decision', ua: 'AI-рішення' },
    desc: {
      en: 'An AI step reads the content, understands what it is and decides what should happen next.',
      ua: 'AI-крок читає вміст, розуміє, що це, і вирішує, що має статися далі.',
    },
    tools: ['OpenAI', 'Claude', 'Gemini'],
  },
  {
    id: 'route',
    label: { en: 'Route', ua: 'Маршрутизація' },
    desc: {
      en: 'Rules send each case down the right path — by type, priority or value.',
      ua: 'Правила направляють кожен випадок потрібним шляхом — за типом, пріоритетом чи цінністю.',
    },
    tools: ['n8n', 'Make.com'],
  },
  {
    id: 'act',
    label: { en: 'Act', ua: 'Дія' },
    desc: {
      en: 'The system does the actual work — sends replies, creates records, drafts documents — and asks a person only for the tricky calls.',
      ua: 'Система виконує саму роботу — надсилає відповіді, створює записи, готує документи — і звертається до людини лише у складних випадках.',
    },
    tools: ['Gmail', 'Slack', 'Telegram'],
  },
  {
    id: 'sync',
    label: { en: 'Sync', ua: 'Синхронізація' },
    desc: {
      en: 'Results are written back into your tools, so everything stays in one source of truth.',
      ua: 'Результати записуються назад у ваші інструменти — усе лишається в єдиному джерелі правди.',
    },
    tools: ['CRM', 'Google Sheets', 'Notion'],
  },
];

export default function Workflow() {
  const { t, lang } = useLang();
  const [sel, setSel] = useState(0);
  const L = (o) => (lang === 'ua' ? o.ua : o.en);
  const s = STAGES[sel];

  return (
    <section id="workflow" className="relative py-24 md:py-32 border-t border-white/5">
      <div className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <Reveal>
          <div className="font-mono text-xs tracking-[0.3em] text-[#c5ff00] mb-8">{t.workflow.kicker}</div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight max-w-3xl">{t.workflow.heading}</h2>
            <p className="text-white/55 max-w-md">{t.workflow.sub}</p>
          </div>
        </Reveal>

        {/* stepper — a clean numbered sequence; wraps cleanly on small screens */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {STAGES.map((st, i) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setSel(i)}
              className={`rounded-xl border p-4 text-left transition ${
                i === sel ? 'border-white/30 bg-white/[0.05]' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className={`font-mono text-xs ${i === sel ? 'text-[#c5ff00]' : 'text-white/35'}`}>{String(i + 1).padStart(2, '0')}</div>
              <div className={`mt-2 font-mono text-sm tracking-wide ${i === sel ? 'text-white' : 'text-white/70'}`}>{L(st.label)}</div>
            </button>
          ))}
        </div>

        {/* detail panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="mt-6 rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 md:p-10"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/35">{String(sel + 1).padStart(2, '0')} / {STAGES.length}</div>
            <div className="mt-2 font-serif text-3xl md:text-4xl">{L(s.label)}</div>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/70">{L(s.desc)}</p>
            <div className="mt-6 flex flex-wrap gap-1.5">
              {s.tools.map((tt) => (
                <span key={tt} className="rounded-full border border-white/15 px-2.5 py-1 font-mono text-xs text-white/75">{tt}</span>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
