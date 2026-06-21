'use client';
import { useState } from 'react';
import { useLang } from './LangContext';
import { motion } from 'framer-motion';

export default function Contact() {
  const { t } = useLang();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      setSent(true);
      setForm({ name: '', email: '', message: '' });
    } catch (err) { setSent(true); }
    setLoading(false);
  };

  return (
    <section id="contact" className="relative py-32 md:py-44 border-t border-white/5 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto relative">
        <div className="font-mono text-xs tracking-[0.3em] text-[#c5ff00] mb-8">{t.contact.kicker}</div>
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="font-display text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight max-w-4xl">{t.contact.heading}</motion.h2>
        <p className="mt-6 text-white/55 max-w-xl text-lg">{t.contact.sub}</p>

        <div className="mt-16 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5 space-y-4">
            {[
              { l: t.contact.email, v: 'kasycheva00@ukr.net', h: 'mailto:kasycheva00@ukr.net' },
              { l: t.contact.linkedin, v: 'linkedin.com/in/mariakasycheva', h: 'https://linkedin.com' },
              { l: t.contact.telegram, v: '@maria_automates', h: 'https://t.me' },
              { l: t.contact.resume, v: 'resume.pdf ↓', h: '/assets/resume.pdf' },
            ].map((c) => (
              <a key={c.l} href={c.h} target={c.h.endsWith('.pdf') ? undefined : '_blank'} rel={c.h.endsWith('.pdf') ? undefined : 'noreferrer'} download={c.h.endsWith('.pdf') ? 'AI Automation - Kasycheva Maria.pdf' : undefined}
                className="group flex items-center justify-between border-b border-white/10 py-5 hover:border-[#c5ff00] transition">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">{c.l}</div>
                  <div className="mt-1 font-display text-2xl md:text-3xl text-white/90 group-hover:text-[#c5ff00] transition">{c.v}</div>
                </div>
                <span className="text-white/30 group-hover:text-[#c5ff00] group-hover:translate-x-1 transition">↗</span>
              </a>
            ))}
          </div>
          <form onSubmit={submit} className="md:col-span-7 rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-10 space-y-5">
            <input required placeholder={t.contact.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-transparent border-b border-white/15 focus:border-[#c5ff00] outline-none py-3 text-lg placeholder:text-white/35" />
            <input required type="email" placeholder={t.contact.email} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-transparent border-b border-white/15 focus:border-[#c5ff00] outline-none py-3 text-lg placeholder:text-white/35" />
            <textarea required rows={4} placeholder={t.contact.msg} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full bg-transparent border-b border-white/15 focus:border-[#c5ff00] outline-none py-3 text-lg placeholder:text-white/35 resize-none" />
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-mono text-white/40">{sent ? t.contact.sent : ''}</span>
              <button disabled={loading} type="submit" className="inline-flex items-center gap-2 bg-[#c5ff00] text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-white transition disabled:opacity-50">
                {loading ? '…' : t.contact.send} <span>→</span>
              </button>
            </div>
          </form>
        </div>
        <div className="mt-24 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-mono text-white/35">
          <span>{t.footer}</span>
          <span>kasycheva00@ukr.net</span>
        </div>
      </div>
    </section>
  );
}
