'use client';
import { useState } from 'react';
import {
  ArrowUp,
  ArrowUpRight,
  CheckCircle2,
  Download,
  Linkedin,
  Loader2,
  Mail,
  MessageCircle,
  Send as SendIcon,
} from 'lucide-react';
import { useLang } from './LangContext';
import Reveal from './Reveal';

const CONTACTS = [
  {
    key: 'email',
    value: 'kasycheva00@ukr.net',
    href: 'mailto:kasycheva00@ukr.net',
    icon: Mail,
  },
  {
    key: 'linkedin',
    value: 'maria-kasycheva',
    href: 'https://www.linkedin.com/in/maria-kasycheva/',
    icon: Linkedin,
  },
  {
    key: 'telegram',
    value: '@MariiaKas1',
    href: 'https://t.me/MariiaKas1',
    icon: MessageCircle,
  },
];

export default function Contact() {
  const { t } = useLang();
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' });
  const [status, setStatus] = useState('idle');

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    if (status !== 'idle') setStatus('idle');
  };

  const submit = async (event) => {
    event.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error('Contact request failed');
      setStatus('sent');
      setForm({ name: '', email: '', message: '', website: '' });
    } catch (_error) {
      setStatus('error');
    }
  };

  const backToTop = () => {
    window.dispatchEvent(new CustomEvent('hero:navigate', { detail: { target: '#top' } }));
  };

  return (
    <footer id="contact" className="relative overflow-hidden border-t border-white/5 bg-[#080808] pt-24 sm:pt-32 lg:pt-40">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[36rem] w-[36rem] rounded-full bg-[#c5ff00]/[0.055] blur-[120px]" />
      <div className="pointer-events-none absolute -right-52 bottom-0 h-[40rem] w-[40rem] rounded-full bg-white/[0.035] blur-[140px]" />

      <div className="relative mx-auto max-w-[1600px] px-4 sm:px-6 md:px-12 lg:px-20">
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="font-mono text-xs tracking-[0.3em] text-[#c5ff00]">{t.contact.kicker}</div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c5ff00]/25 bg-[#c5ff00]/[0.06] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/65">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c5ff00] opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c5ff00]" />
              </span>
              {t.contact.availability}
            </div>
          </div>

          <h2 className="mt-8 max-w-6xl font-display text-[clamp(3.4rem,9vw,9rem)] leading-[0.82] tracking-[-0.055em] text-white">
            {t.contact.heading}
          </h2>
          <div className="mt-8 flex flex-col gap-6 border-t border-white/10 pt-7 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-xl text-base leading-relaxed text-white/55 sm:text-lg">{t.contact.sub}</p>
            <a
              href="mailto:kasycheva00@ukr.net"
              className="group inline-flex w-fit items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-white/70 transition hover:text-[#c5ff00]"
            >
              {t.contact.direct}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
            </a>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:mt-20 lg:grid-cols-[0.82fr_1.18fr] lg:gap-8 xl:gap-12">
          <Reveal className="flex flex-col gap-3" y={22}>
            {CONTACTS.map((contact, index) => {
              const Icon = contact.icon;
              return (
                <a
                  key={contact.key}
                  href={contact.href}
                  target={contact.key === 'email' ? undefined : '_blank'}
                  rel={contact.key === 'email' ? undefined : 'noreferrer'}
                  className="group relative flex min-h-[104px] items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[#c5ff00]/35 hover:bg-[#c5ff00]/[0.035] sm:p-5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/55 transition group-hover:border-[#c5ff00]/30 group-hover:text-[#c5ff00]">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[9px] uppercase tracking-[0.28em] text-white/35">
                      0{index + 1} / {t.contact[contact.key]}
                    </span>
                    <span className="mt-2 block truncate font-display text-xl text-white/85 transition group-hover:text-white sm:text-2xl">
                      {contact.value}
                    </span>
                  </span>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-white/25 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#c5ff00]" />
                </a>
              );
            })}

            <a
              href="/assets/resume.pdf"
              download="AI Automation - Kasycheva Maria.pdf"
              className="group mt-1 inline-flex items-center justify-between rounded-2xl border border-dashed border-white/15 px-5 py-4 font-mono text-xs uppercase tracking-[0.18em] text-white/50 transition hover:border-white/35 hover:text-white"
            >
              {t.contact.resume}
              <Download className="h-4 w-4 transition-transform group-hover:translate-y-1" />
            </a>
          </Reveal>

          <Reveal y={28}>
            <form
              onSubmit={submit}
              className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0d0d0d]/90 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:p-8 lg:p-10"
            >
              <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#c5ff00]/60 to-transparent" />
              <div className="mb-9 flex items-start justify-between gap-5">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#c5ff00]">{t.contact.formKicker}</div>
                  <h3 className="mt-3 font-display text-3xl leading-none text-white sm:text-4xl">{t.contact.formHeading}</h3>
                </div>
                <SendIcon className="h-6 w-6 shrink-0 text-white/20" strokeWidth={1.4} />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <label className="group block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">01 / {t.contact.name}</span>
                  <input
                    required
                    name="name"
                    autoComplete="name"
                    maxLength={80}
                    value={form.name}
                    onChange={update('name')}
                    className="mt-2 w-full border-b border-white/15 bg-transparent py-3 text-base text-white outline-none transition placeholder:text-white/20 focus:border-[#c5ff00]"
                    placeholder={t.contact.namePlaceholder}
                  />
                </label>
                <label className="group block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">02 / {t.contact.email}</span>
                  <input
                    required
                    type="email"
                    name="email"
                    autoComplete="email"
                    maxLength={160}
                    value={form.email}
                    onChange={update('email')}
                    className="mt-2 w-full border-b border-white/15 bg-transparent py-3 text-base text-white outline-none transition placeholder:text-white/20 focus:border-[#c5ff00]"
                    placeholder="you@company.com"
                  />
                </label>
              </div>

              <label className="mt-7 block">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">03 / {t.contact.msg}</span>
                <textarea
                  required
                  name="message"
                  rows={5}
                  maxLength={4000}
                  value={form.message}
                  onChange={update('message')}
                  className="mt-2 w-full resize-none border-b border-white/15 bg-transparent py-3 text-base leading-relaxed text-white outline-none transition placeholder:text-white/20 focus:border-[#c5ff00]"
                  placeholder={t.contact.messagePlaceholder}
                />
              </label>

              <label className="absolute -left-[9999px]" aria-hidden="true">
                Website
                <input name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={update('website')} />
              </label>

              <div className="mt-7 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-h-5 text-xs font-mono" aria-live="polite">
                  {status === 'sent' && (
                    <span className="inline-flex items-center gap-2 text-[#c5ff00]">
                      <CheckCircle2 className="h-4 w-4" /> {t.contact.sent}
                    </span>
                  )}
                  {status === 'error' && <span className="text-red-300/85">{t.contact.error}</span>}
                </div>
                <button
                  disabled={status === 'sending'}
                  type="submit"
                  className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#c5ff00] px-6 text-sm font-medium text-black transition hover:bg-white disabled:cursor-wait disabled:opacity-60 sm:min-w-44"
                >
                  {status === 'sending' ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> {t.contact.sending}</>
                  ) : (
                    <>{t.contact.send} <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></>
                  )}
                </button>
              </div>
            </form>
          </Reveal>
        </div>

        <div className="mt-24 border-t border-white/10 py-7 sm:mt-32 sm:py-9">
          <div className="flex flex-col gap-6 font-mono text-[10px] uppercase tracking-[0.2em] text-white/35 sm:flex-row sm:items-center sm:justify-between">
            <span>{t.footer.replace('2025', String(new Date().getFullYear()))}</span>
            <div className="flex items-center justify-between gap-8 sm:justify-end">
              <span>Oslo · Remote worldwide</span>
              <button
                type="button"
                onClick={backToTop}
                className="group inline-flex items-center gap-2 text-white/55 transition hover:text-[#c5ff00]"
              >
                {t.contact.backToTop}
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 transition group-hover:border-[#c5ff00]/40">
                  <ArrowUp className="h-3.5 w-3.5" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
