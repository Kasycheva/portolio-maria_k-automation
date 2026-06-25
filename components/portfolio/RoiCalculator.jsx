'use client';
import { useEffect, useMemo, useState } from 'react';

// Honest estimate: the viewer enters three numbers they already know about
// their own work, we do the arithmetic. How much of the manual work the
// automation takes off their plate is a fixed, stated assumption per case
// (roi.coverage) — not a confusing slider.
const fmt = (n) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(n));

function Slider({ label, hint, value, setValue, min, max, step, suffix }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-white/70">{label}</span>
        <span className="font-mono text-sm text-white tabular-nums">{fmt(value)}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="mt-2 w-full cursor-pointer accent-white/80"
      />
      {hint && <p className="mt-1 text-xs text-white/35">{hint}</p>}
    </label>
  );
}

export default function RoiCalculator({ roi, unit, labels }) {
  const [volume, setVolume] = useState(roi.volume);
  const [minutes, setMinutes] = useState(roi.minutes);
  const [rate, setRate] = useState(roi.rate);

  useEffect(() => { setVolume(roi.volume); setMinutes(roi.minutes); setRate(roi.rate); }, [roi]);

  const { hours, month, year } = useMemo(() => {
    const h = (volume * minutes * roi.coverage) / 60;
    const m = h * rate;
    return { hours: h, month: m, year: m * 12 };
  }, [volume, minutes, rate, roi]);

  const note = labels.roiCoverageNote.replace('{p}', Math.round(roi.coverage * 100));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
      <p className="mb-6 max-w-2xl text-sm text-white/55">{labels.roiLead}</p>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <Slider label={`${labels.roiVolume} (${unit})`} value={volume} setValue={setVolume} min={10} max={5000} step={10} />
          <Slider label={labels.roiMinutes} hint={labels.roiMinutesHint} value={minutes} setValue={setMinutes} min={1} max={180} step={1} suffix=" min" />
          <Slider label={labels.roiRate} value={rate} setValue={setRate} min={5} max={200} step={1} suffix=" €" />
        </div>
        <div className="flex flex-col justify-center rounded-xl border border-white/10 bg-[#0c0c0c] p-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-white/40">{labels.roiHours}</div>
            <div className="font-display text-5xl text-white tabular-nums">{fmt(hours)}</div>
          </div>
          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="text-xs uppercase tracking-widest text-white/40">{labels.roiMoney}</div>
            <div className="font-display text-5xl tabular-nums text-[#c5ff00]">≈ {fmt(month)} €</div>
          </div>
          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="text-xs uppercase tracking-widest text-white/40">{labels.roiYear}</div>
            <div className="font-display text-3xl tabular-nums text-white/90">≈ {fmt(year)} €</div>
          </div>
        </div>
      </div>
      <p className="mt-6 max-w-2xl text-xs leading-relaxed text-white/35">{note} {labels.roiNote}</p>
    </div>
  );
}
