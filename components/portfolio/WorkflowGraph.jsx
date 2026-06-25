'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Clickable per-case workflow: a vertical chain of steps on the left, details
// of the selected step on the right. Node copy stays in tech terms; section
// labels come from i18n. Lime is used only for the active step badge.
export default function WorkflowGraph({ nodes = [], labels }) {
  const [sel, setSel] = useState(0);
  useEffect(() => { setSel(0); }, [nodes]);
  if (!nodes.length) return null;
  const n = nodes[Math.min(sel, nodes.length - 1)];

  return (
    <div className="grid gap-6 md:grid-cols-2 md:gap-8">
      <div>
        {nodes.map((node, i) => (
          <div key={node.id}>
            <button
              type="button"
              onClick={() => setSel(i)}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                i === sel ? 'border-white/30 bg-white/[0.05]' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] transition ${
                  i === sel ? 'bg-[#c5ff00] text-black' : 'bg-white/10 text-white/55'
                }`}
              >
                {i + 1}
              </span>
              <span className={`font-mono text-sm tracking-wide ${i === sel ? 'text-white' : 'text-white/65'}`}>
                {node.label}
              </span>
            </button>
            {i < nodes.length - 1 && <div className="ml-[27px] h-4 w-px bg-white/12" />}
          </div>
        ))}
      </div>

      <motion.div
        key={n.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="self-start rounded-2xl border border-white/10 bg-[#0c0c0c] p-5 md:p-6"
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">{n.label}</div>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-widest text-white/35">{labels.nIn}</dt>
            <dd className="text-white/85">{n.input}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-widest text-white/35">{labels.nOut}</dt>
            <dd className="text-white/85">{n.output}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-widest text-white/35">{labels.nLogic}</dt>
            <dd className="text-white/85">{n.logic}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-widest text-white/35">{labels.nTools}</dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {n.tools.map((tt) => (
                <span key={tt} className="rounded-full border border-white/15 px-2 py-0.5 font-mono text-[10px] text-white/75">
                  {tt}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </motion.div>
    </div>
  );
}
