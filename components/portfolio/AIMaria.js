'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLang } from './LangContext';
import Reveal from './Reveal';

// Typing speeds (ms). Command types like a person; the answer streams fast but
// stays comfortable to read.
const CMD_CHAR_MS = 45;
const CMD_TO_ANSWER_PAUSE = 350;
const ANSWER_STEP_MS = 14;
const ANSWER_CHARS_PER_STEP = 2;

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

// Parse a paragraph with **highlight** markers into styled segments and build
// the plain (marker-free) version used to drive the typewriter.
function buildAnswer(paragraphs) {
  let offset = 0;
  const paras = paragraphs.map((raw, pi) => {
    const parts = raw.split('**');
    const segs = [];
    parts.forEach((text, idx) => {
      if (!text) return;
      const start = offset;
      offset += text.length;
      segs.push({ text, hl: idx % 2 === 1, start, end: offset });
    });
    if (pi < paragraphs.length - 1) offset += 2; // accounts for the '\n\n' join
    return segs;
  });
  return { paras, plainLen: offset };
}

export default function AIMaria() {
  const { t, lang } = useLang();
  const topics = t.ai.topics;

  // What is currently shown in the terminal body.
  const [activeId, setActiveId] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle | cmd | answer | done
  const [typedCmd, setTypedCmd] = useState(''); // command being typed into the input line
  const [committedCmd, setCommittedCmd] = useState(''); // command echoed in the body
  const [answer, setAnswer] = useState({ paras: [], plainLen: 0 });
  const [shown, setShown] = useState(0); // plain chars of the answer revealed
  const [manual, setManual] = useState(''); // free user input
  const [error, setError] = useState('');

  const runRef = useRef(0); // bumped on every new run / unmount to cancel timers
  const bodyRef = useRef(null);
  const scrollTrackRef = useRef(null);
  const terminalRef = useRef(null);

  const animating = phase === 'cmd' || phase === 'answer';

  // ScrollTrigger is already updated from the Lenis instance in SmoothScroll.
  // Keeping the transform on this dedicated wrapper means React re-renders from
  // the typewriter can never overwrite the scroll animation.
  useLayoutEffect(() => {
    const track = scrollTrackRef.current;
    const terminal = terminalRef.current;
    if (!track || !terminal) return undefined;

    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    const addAnimation = (from) => {
      gsap.fromTo(
        terminal,
        {
          autoAlpha: from.opacity,
          rotateX: from.rotateX,
          rotateZ: from.rotateZ,
          scale: from.scale,
          y: from.y,
          transformOrigin: '50% 100%',
          transformPerspective: 900,
        },
        {
          autoAlpha: 1,
          rotateX: 0,
          rotateZ: 0,
          scale: 1,
          y: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: track,
            start: 'top 58%',
            end: 'top -42%',
            scrub: 0.25,
            invalidateOnRefresh: true,
          },
        },
      );
    };

    media.add('(max-width: 767px)', () => {
      addAnimation({ opacity: 0.35, rotateX: 34, rotateZ: -1.4, scale: 0.58, y: 150 });
    });
    media.add('(min-width: 768px)', () => {
      addAnimation({ opacity: 0.28, rotateX: 38, rotateZ: -1.2, scale: 0.68, y: 190 });
    });

    // Fonts and the sections above can settle after the first layout pass.
    // A refresh keeps the start/end positions exact without polling the page.
    const refreshId = window.requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      window.cancelAnimationFrame(refreshId);
      media.revert();
    };
  }, []);

  // Keep the body scrolled to the freshest line while typing.
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [shown, committedCmd, phase]);

  const runTopic = useCallback((topic) => {
    const myRun = ++runRef.current;
    setError('');
    setActiveId(topic.id);
    setCommittedCmd('');
    setTypedCmd('');
    setShown(0);
    const built = buildAnswer(topic.answer);
    setAnswer(built);
    setPhase('cmd');

    const cmd = topic.cmd;

    const typeAnswer = () => {
      let j = 0;
      const step = () => {
        if (runRef.current !== myRun) return;
        j = Math.min(built.plainLen, j + ANSWER_CHARS_PER_STEP);
        setShown(j);
        if (j < built.plainLen) setTimeout(step, ANSWER_STEP_MS);
        else setPhase('done');
      };
      step();
    };

    const startAnswer = () => {
      if (runRef.current !== myRun) return;
      setCommittedCmd(cmd);
      setTypedCmd('');
      setPhase('answer');
      typeAnswer();
    };

    let i = 0;
    const typeCmd = () => {
      if (runRef.current !== myRun) return;
      i += 1;
      setTypedCmd(cmd.slice(0, i));
      if (i < cmd.length) setTimeout(typeCmd, CMD_CHAR_MS);
      else setTimeout(startAnswer, CMD_TO_ANSWER_PAUSE);
    };
    typeCmd();
  }, []);

  // Re-run the active topic when the language changes so the answer shows in the
  // freshly selected language.
  useEffect(() => {
    if (!activeId) return;
    const topic = topics.find((tp) => tp.id === activeId);
    if (topic) runTopic(topic);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Cancel any pending timers on unmount.
  useEffect(() => () => { runRef.current += 1; }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    if (animating) return;
    const v = manual.trim().toLowerCase();
    if (!v) return;
    const token = v.replace(/^maria\s*--?/, '').replace(/\s+/g, '-');
    const topic = topics.find(
      (tp) => tp.cmd.toLowerCase() === v || tp.id === token || tp.id.includes(token) || tp.label.toLowerCase() === v,
    );
    setManual('');
    if (topic) runTopic(topic);
    else { setError(t.ai.unknown); setActiveId(null); setCommittedCmd(''); setShown(0); setPhase('idle'); }
  };

  const showAnswer = phase === 'answer' || phase === 'done';
  // The paragraph that currently holds the typing cursor.
  const cursorPara = showAnswer && phase === 'answer'
    ? answer.paras.findIndex((segs) => segs.length && shown <= segs[segs.length - 1].end)
    : -1;

  return (
    <section id="ai" className="relative py-24 sm:py-32 md:py-40 border-t border-white/5 bg-[radial-gradient(ellipse_at_center,rgba(197,255,0,0.035),transparent_58%)]">
      <div className="px-4 sm:px-6 md:px-12 lg:px-20 max-w-[1600px] mx-auto">
        <Reveal>
          <div className="font-mono text-xs tracking-[0.3em] text-[#c5ff00] mb-8">{t.ai.kicker}</div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight">{t.ai.heading}</h2>
            <p className="text-white/55 max-w-md">{t.ai.sub}</p>
          </div>
        </Reveal>

        <div
          ref={scrollTrackRef}
          className="relative mt-8 h-[145svh] sm:mt-12 sm:h-[155svh] lg:h-[175svh] 2xl:h-[185svh]"
        >
          <div className="sticky top-0 flex min-h-svh items-center py-4 sm:py-8 [perspective:900px]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 h-[55%] w-[92vw] max-w-[1500px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[#c5ff00]/[0.085] blur-[90px] sm:h-[68%] sm:bg-[#c5ff00]/[0.075]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-[58%] h-[55vh] w-[115vw] max-w-none origin-center opacity-25"
              style={{
                backgroundImage: 'linear-gradient(rgba(197,255,0,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(197,255,0,0.2) 1px, transparent 1px)',
                backgroundSize: '54px 54px',
                maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 68%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 68%)',
                transform: 'translate(-50%, -50%) rotateX(68deg)',
              }}
            />
            <div
              ref={terminalRef}
              className="relative w-full will-change-transform [transform-style:preserve-3d]"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-[4%] -bottom-12 h-32 rounded-[50%] bg-[#c5ff00]/25 blur-[55px]"
              />
              <div className="relative rounded-xl sm:rounded-2xl bg-[#050505] border border-[#c5ff00]/35 overflow-hidden shadow-[0_35px_90px_rgba(0,0,0,0.8),0_0_45px_rgba(197,255,0,0.13),inset_0_1px_0_rgba(255,255,255,0.12)]">
            <div aria-hidden="true" className="absolute inset-x-10 top-0 z-10 h-px bg-gradient-to-r from-transparent via-[#c5ff00]/80 to-transparent" />
            {/* title bar */}
            <div className="flex items-center gap-2 px-3 sm:px-4 py-3 border-b border-white/10 bg-white/[0.02]">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
              <span className="ml-3 font-mono text-xs text-white/45">~/ai-maria</span>
            </div>

            {/* body */}
            <div
              ref={bodyRef}
              className="h-[clamp(11rem,38svh,16rem)] sm:h-72 md:h-96 overflow-y-auto p-4 sm:p-5 font-mono text-xs sm:text-sm leading-relaxed scrollbar-hide"
            >
              <div className="text-white/40 italic">{t.ai.boot}</div>

              {!activeId && !error && <div className="mt-3 text-white/35">{t.ai.hint}</div>}
              {error && <div className="mt-3 text-red-300/80">{error}</div>}

              {committedCmd && (
                <div className="mt-4 whitespace-pre-wrap">
                  <span className="text-[#c5ff00]">➜</span> <span className="text-white/90">{committedCmd}</span>
                </div>
              )}

              {showAnswer && (
                <div className="mt-2 space-y-3">
                  {answer.paras.map((segs, pi) => {
                    const visible = segs.some((s) => shown > s.start);
                    const paragraphText = segs.map((s) => s.text).join('');
                    const isMetaLine = /^(Location|Status|Локація|Статус):/.test(paragraphText);
                    if (!visible) return null;
                    return (
                      <p
                        key={pi}
                        className={isMetaLine
                          ? 'w-fit rounded-md border border-white/15 bg-white/[0.055] py-1.5 pl-4 pr-3 text-white/75 shadow-[inset_3px_0_0_rgba(148,163,184,0.6)] whitespace-pre-wrap'
                          : 'text-white/70 whitespace-pre-wrap'}
                      >
                        {segs.map((s, si) => {
                          const count = clamp(shown - s.start, 0, s.text.length);
                          if (count <= 0) return null;
                          return (
                            <span key={si} className={s.hl ? 'text-[#c5ff00] font-medium' : undefined}>
                              {s.text.slice(0, count)}
                            </span>
                          );
                        })}
                        {pi === cursorPara && (
                          <span className="inline-block w-[7px] h-[1.05em] -mb-[2px] ml-0.5 bg-[#c5ff00] animate-pulse align-middle" />
                        )}
                      </p>
                    );
                  })}
                </div>
              )}
            </div>

            {/* input line */}
            <form onSubmit={onSubmit} className="flex items-center gap-2 px-4 sm:px-5 py-3 border-t border-white/10 bg-white/[0.02]">
              <span className="text-[#c5ff00] font-mono">➜</span>
              <input
                value={animating ? typedCmd : manual}
                onChange={(e) => setManual(e.target.value)}
                disabled={animating}
                placeholder={t.ai.placeholder}
                aria-label={t.ai.placeholder}
                className="flex-1 bg-transparent outline-none font-mono text-sm text-white placeholder:text-white/30 disabled:opacity-100"
              />
              <button type="submit" disabled={animating} className="font-mono text-xs text-white/45 hover:text-[#c5ff00] disabled:opacity-40">
                enter ↵
              </button>
            </form>
              </div>

              {/* command chips stay with the terminal so every command remains
                  usable while its answer is visible on screen */}
              <div className="relative z-20 mt-5 sm:mt-6">
                <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/30 mb-3">{t.ai.chipsLabel}</div>
                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {topics.map((tp) => {
                    const active = tp.id === activeId;
                    return (
                      <button
                        key={tp.id}
                        type="button"
                        onClick={() => runTopic(tp)}
                        aria-pressed={active}
                        className={[
                          'group rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 font-mono text-[11px] sm:text-sm transition-colors duration-200',
                          active
                            ? 'border-[#c5ff00]/60 bg-[#c5ff00]/10 text-[#c5ff00]'
                            : 'border-white/15 text-white/65 hover:border-[#c5ff00]/40 hover:text-[#c5ff00]',
                        ].join(' ')}
                      >
                        <span className="text-white/30 group-hover:text-[#c5ff00]/60 mr-1.5">/</span>
                        {tp.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
