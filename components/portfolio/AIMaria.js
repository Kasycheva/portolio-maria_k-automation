'use client';
import { useEffect, useRef, useState } from 'react';
import { useLang } from './LangContext';
import Reveal from './Reveal';

const RESPONSES = {
  'who are you': 'I am Maria Kasycheva — an AI Automation Specialist. I design workflows that connect operations, data, and AI to remove manual work.',
  'skills': 'n8n, Make.com, Zapier, JavaScript, TypeScript, React, Next.js, Node.js, OpenAI, Claude, Claude Code, AI Agents, RAG, Airtable, Google Workspace, Telegram, REST APIs, Webhooks, CRM, BPA.',
  'projects': '10 case studies live above — AI HR, Sales Radar, Support Triage, Content Engine, Invoice OCR, Retail Replenishment, Meeting Memory, RAG Knowledge, Telegram Ops, AI Email Router.',
  'experience': 'Operations Management & Retail Operations background, now building production AI automations for HR, sales, marketing, support and finance.',
  'contact': 'Email: kasycheva00@ukr.net · LinkedIn & Telegram available in the contacts section.',
  'download resume': 'Starting resume download… (see the Download Resume button in the contacts section).',
  'help': 'Available commands: who are you, skills, projects, experience, contact, download resume, clear.',
};

export default function AIMaria() {
  const { t } = useLang();
  const [history, setHistory] = useState([
    { kind: 'sys', text: 'ai-maria v1.0 — type "help" for commands.' },
  ]);
  const [value, setValue] = useState('');
  const endRef = useRef(null);
  const shouldAutoScrollRef = useRef(false);

  useEffect(() => {
    if (!shouldAutoScrollRef.current) return;
    shouldAutoScrollRef.current = false;
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [history]);

  const submit = (e) => {
    e.preventDefault();
    const cmd = value.trim().toLowerCase();
    if (!cmd) return;
    shouldAutoScrollRef.current = true;
    if (cmd === 'clear') { setHistory([{ kind: 'sys', text: 'console cleared.' }]); setValue(''); return; }
    const out = RESPONSES[cmd] || `Unknown command — try: ${Object.keys(RESPONSES).join(', ')}`;
    setHistory((h) => [...h, { kind: 'in', text: cmd }, { kind: 'out', text: out }]);
    setValue('');
  };

  return (
    <section id="ai" className="relative py-32 md:py-40 border-t border-white/5">
      <div className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <Reveal>
          <div className="font-mono text-xs tracking-[0.3em] text-[#c5ff00] mb-8">{t.ai.kicker}</div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight">{t.ai.heading}</h2>
            <p className="text-white/55 max-w-md">{t.ai.sub}</p>
          </div>
        </Reveal>
        <div className="mt-12 rounded-2xl bg-black border border-white/10 overflow-hidden shadow-2xl">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
            <span className="ml-3 font-mono text-xs text-white/45">~/ai-maria</span>
          </div>
          <div className="h-72 md:h-96 overflow-y-auto p-5 font-mono text-sm leading-relaxed scrollbar-hide">
            {history.map((h, i) => (
              <div key={i} className="whitespace-pre-wrap">
                {h.kind === 'in' && (<><span className="text-[#c5ff00]">➜</span> <span className="text-white/90">{h.text}</span></>)}
                {h.kind === 'out' && (<span className="text-white/65">{h.text}</span>)}
                {h.kind === 'sys' && (<span className="text-white/40 italic">{h.text}</span>)}
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form onSubmit={submit} className="flex items-center gap-2 px-5 py-3 border-t border-white/10 bg-white/[0.02]">
            <span className="text-[#c5ff00] font-mono">➜</span>
            <input value={value} onChange={(e) => setValue(e.target.value)} placeholder={t.ai.placeholder}
              className="flex-1 bg-transparent outline-none font-mono text-sm text-white placeholder:text-white/30" />
            <button type="submit" className="font-mono text-xs text-white/45 hover:text-[#c5ff00]">enter ↵</button>
          </form>
        </div>
      </div>
    </section>
  );
}
