import { useEffect, useRef, useState } from 'react';
import type { DomainBucket } from '../lib/types';
import { ThresholdPills } from '../components/ThresholdPills';
import {
  ALL_THRESHOLD_PRESETS,
  PRESET_TO_MS,
  msToPreset,
} from '../lib/presets';
import { formatThresholdCard, formatThresholdMs } from '../lib/format';

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const MIN_AGE = HOUR;
const MAX_AGE = 2 * 365 * DAY;
const VW = 1000;
const VH = 170;

function ageToX(ageMs: number, width = VW): number {
  const clamped = Math.max(MIN_AGE, Math.min(MAX_AGE, ageMs));
  const t =
    (Math.log(clamped) - Math.log(MIN_AGE)) /
    (Math.log(MAX_AGE) - Math.log(MIN_AGE));
  return width * (1 - t);
}

function xToAge(x: number, width = VW): number {
  const rel = 1 - Math.max(0, Math.min(width, x)) / width;
  const logMs =
    Math.log(MIN_AGE) + rel * (Math.log(MAX_AGE) - Math.log(MIN_AGE));
  return Math.exp(logMs);
}

const TICKS: { ms: number; label: string }[] = [
  { ms: 730 * DAY, label: '2yr' },
  { ms: 365 * DAY, label: '1yr' },
  { ms: 180 * DAY, label: '6mo' },
  { ms: 90 * DAY, label: '3mo' },
  { ms: 60 * DAY, label: '2mo' },
  { ms: 30 * DAY, label: '1mo' },
  { ms: 14 * DAY, label: '2w' },
  { ms: 7 * DAY, label: '1w' },
  { ms: 0, label: 'today' },
];

function snapToPreset(ms: number, tolerance = 0.08): number {
  let best: number = ms;
  let bestDist = Infinity;
  for (const v of Object.values(PRESET_TO_MS)) {
    const dist = Math.abs(Math.log(ms) - Math.log(v));
    if (dist < bestDist) {
      bestDist = dist;
      best = v;
    }
  }
  return bestDist < tolerance ? best : ms;
}

const fmt = (n: number) => n.toLocaleString('en-US');

interface TimelinePanelProps {
  thresholdMs: number;
  pendingCount: number;
  keptCount: number;
  buckets: DomainBucket[];
  onChange: (ms: number) => void;
}

export function TimelinePanel({
  thresholdMs,
  pendingCount,
  keptCount,
  buckets,
  onChange,
}: TimelinePanelProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);

  const thresholdX = ageToX(thresholdMs);
  const thresholdPct = (thresholdX / VW) * 100;
  const maxCount = Math.max(1, ...buckets.map((b) => b.domainCount));

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const rel = (e.clientX - rect.left) / rect.width;
      const x = Math.max(0, Math.min(VW, rel * VW));
      onChange(snapToPreset(xToAge(x)));
    };
    const onUp = () => setDragging(false);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [dragging, onChange]);

  const currentPreset = msToPreset(thresholdMs);

  const beginDrag = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDragging(true);
  };

  return (
    <section className="timeline-wrap">
      <div className="tl-header">
        <div className="tl-title">timeline · drag to set threshold</div>
        <div className="tl-stats">
          <div className="tl-stat">
            <span className="k">threshold</span>
            <span className="v">
              <em>{formatThresholdMs(thresholdMs)}</em>
            </span>
          </div>
          <div className="tl-stat">
            <span className="k">pending</span>
            <span className="v">
              <em>{fmt(pendingCount)}</em>
            </span>
          </div>
          <div className="tl-stat">
            <span className="k">kept</span>
            <span className="v lime">
              <em>{fmt(keptCount)}</em>
            </span>
          </div>
        </div>
      </div>

      <div className="tl">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VW} ${VH}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="prunedG" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" style={{ stopColor: 'var(--ink)' }} stopOpacity="0.04" />
              <stop offset="100%" style={{ stopColor: 'var(--ink)' }} stopOpacity="0.14" />
            </linearGradient>
            <linearGradient id="keptG" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" style={{ stopColor: 'var(--lime)' }} stopOpacity="0.28" />
              <stop offset="100%" style={{ stopColor: 'var(--lime)' }} stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <rect
            x={0}
            y={60}
            width={thresholdX}
            height={40}
            fill="url(#prunedG)"
          />
          <rect
            x={thresholdX}
            y={60}
            width={VW - thresholdX}
            height={40}
            fill="url(#keptG)"
          />
          <line
            x1={0}
            y1={100}
            x2={VW}
            y2={100}
            style={{ stroke: 'var(--ink)' }}
            strokeOpacity={0.5}
            strokeWidth={1}
          />

          <g style={{ stroke: 'var(--ink)' }} strokeOpacity={0.4} strokeWidth={1}>
            {TICKS.slice(0, -1).map((t) => {
              const x = ageToX(t.ms);
              return <line key={t.label} x1={x} y1={100} x2={x} y2={106} />;
            })}
            <line
              x1={VW}
              y1={100}
              x2={VW}
              y2={114}
              strokeOpacity={1}
              strokeWidth={2}
            />
          </g>

          <g style={{ fill: 'var(--ink)' }}>
            {buckets.map((b, i) => {
              const x = ageToX(b.lastVisitAgoMs);
              const r = 1.5 + (b.domainCount / maxCount) * 2;
              return <circle key={i} cx={x} cy={128} r={r} />;
            })}
          </g>

          <line
            x1={thresholdX}
            y1={36}
            x2={thresholdX}
            y2={150}
            style={{ stroke: 'var(--ink)' }}
            strokeWidth={1.5}
            strokeDasharray="4,3"
          />
          <circle
            cx={thresholdX}
            cy={100}
            r={8}
            style={{ fill: 'var(--lime)', stroke: 'var(--ink)', cursor: 'ew-resize' }}
            strokeWidth={2}
            onPointerDown={beginDrag}
          />

          <circle cx={VW} cy={100} r={6} style={{ fill: 'var(--ink)' }} />
          <circle
            cx={VW}
            cy={100}
            r={11}
            fill="none"
            style={{ stroke: 'var(--ink)' }}
            strokeOpacity={0.25}
            strokeWidth={1.5}
          />
        </svg>

        <div
          className="threshold-card"
          style={{ left: `${thresholdPct}%`, cursor: 'ew-resize' }}
          onPointerDown={beginDrag}
        >
          ◄ {formatThresholdCard(thresholdMs)} ►
        </div>

        <div className="region-labels">
          <span className="pruned">pruned · {fmt(pendingCount)}</span>
          <span className="kept">kept · {fmt(keptCount)}</span>
        </div>

        <div className="axis-labels">
          {TICKS.map((t) => (
            <span key={t.label} className={t.label === 'today' ? 'now' : ''}>
              {t.label}
            </span>
          ))}
        </div>
      </div>

      <div className="hint">
        drag the <kbd>◆</kbd> to set the threshold, or pick a preset
      </div>

      <ThresholdPills
        variant="preset"
        value={currentPreset}
        options={ALL_THRESHOLD_PRESETS}
        onChange={(p) => onChange(PRESET_TO_MS[p])}
      />
    </section>
  );
}
