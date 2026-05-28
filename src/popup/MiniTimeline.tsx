import type { DomainBucket } from '../lib/types';

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const MIN_AGE = HOUR;
const MAX_AGE = 2 * 365 * DAY;
const VW = 340;

function ageToX(ageMs: number, width = VW): number {
  const clamped = Math.max(MIN_AGE, Math.min(MAX_AGE, ageMs));
  const t =
    (Math.log(clamped) - Math.log(MIN_AGE)) /
    (Math.log(MAX_AGE) - Math.log(MIN_AGE));
  return width * (1 - t);
}

const TICKS: { ms: number; label: string }[] = [
  { ms: 365 * DAY, label: '1yr' },
  { ms: 180 * DAY, label: '6mo' },
  { ms: 90 * DAY, label: '3mo' },
  { ms: 60 * DAY, label: '2mo' },
  { ms: 30 * DAY, label: '1mo' },
  { ms: 14 * DAY, label: '2w' },
  { ms: 7 * DAY, label: '1w' },
  { ms: 0, label: 'today' },
];

interface MiniTimelineProps {
  thresholdMs: number;
  buckets: DomainBucket[];
  lastSweep: { agoLabel: string; count: number } | null;
}

export function MiniTimeline({
  thresholdMs,
  buckets,
  lastSweep,
}: MiniTimelineProps) {
  const thresholdX = ageToX(thresholdMs);
  const maxCount = Math.max(1, ...buckets.map((b) => b.domainCount));

  return (
    <section className="mini-tl">
      <div className="label">
        <span>timeline</span>
        {lastSweep && (
          <span className="now">
            last sweep · {lastSweep.agoLabel} · {lastSweep.count}
          </span>
        )}
      </div>
      <svg
        className="mini-tl-svg"
        viewBox={`0 0 ${VW} 38`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="popPruned" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#14141a" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#14141a" stopOpacity="0.16" />
          </linearGradient>
          <linearGradient id="popKept" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#c8ff00" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#c8ff00" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        <rect
          x={0}
          y={10}
          width={thresholdX}
          height={18}
          fill="url(#popPruned)"
        />
        <rect
          x={thresholdX}
          y={10}
          width={VW - thresholdX}
          height={18}
          fill="url(#popKept)"
        />

        <line
          x1={0}
          y1={19}
          x2={VW}
          y2={19}
          stroke="#14141a"
          strokeOpacity={0.5}
          strokeWidth={0.8}
        />

        <g stroke="#14141a" strokeOpacity={0.35} strokeWidth={0.8}>
          {TICKS.slice(0, -1).map((t) => {
            const x = ageToX(t.ms);
            return <line key={t.label} x1={x} y1={19} x2={x} y2={22} />;
          })}
          <line
            x1={VW}
            y1={19}
            x2={VW}
            y2={24}
            strokeOpacity={1}
            strokeWidth={1.5}
          />
        </g>

        <g fill="#14141a" opacity={0.7}>
          {buckets.map((b, i) => {
            const x = ageToX(b.lastVisitAgoMs);
            const r = 0.8 + (b.domainCount / maxCount) * 1.4;
            return <circle key={i} cx={x} cy={31} r={r} />;
          })}
        </g>

        <line
          x1={thresholdX}
          y1={4}
          x2={thresholdX}
          y2={32}
          stroke="#14141a"
          strokeWidth={1}
          strokeDasharray="2,2"
        />
        <circle
          cx={thresholdX}
          cy={19}
          r={4.5}
          fill="#c8ff00"
          stroke="#14141a"
          strokeWidth={1.2}
        />

        <circle cx={VW} cy={19} r={3.5} fill="#14141a" />
      </svg>
      <div className="ticks">
        {TICKS.map((t) => (
          <span key={t.label} className={t.label === 'today' ? 'now' : ''}>
            {t.label}
          </span>
        ))}
      </div>
    </section>
  );
}
