import type { FrequencyPreset } from '../lib/types';

interface FrequencyPanelProps {
  value: FrequencyPreset;
  onChange: (f: FrequencyPreset) => void;
}

const ROWS: { value: FrequencyPreset; name: string; time: string }[] = [
  { value: 'manual', name: 'Manual only', time: 'on demand' },
  { value: 'hourly', name: 'Hourly', time: 'every 60 min' },
  { value: '6h', name: 'Every 6 hours', time: 'every 360 min' },
  { value: '24h', name: 'Every 24 hours', time: 'daily' },
];

const BADGE: Record<FrequencyPreset, string> = {
  manual: 'manual',
  hourly: 'every hour',
  '6h': 'every 6 hours',
  '24h': 'every 24 hours',
};

export function FrequencyPanel({ value, onChange }: FrequencyPanelProps) {
  return (
    <div className="panel">
      <h2>
        frequency <span className="badge">{BADGE[value]}</span>
      </h2>
      <div className="sched">
        {ROWS.map((r) => (
          <div
            key={r.value}
            className={`sched-row${r.value === value ? ' on' : ''}`}
            onClick={() => onChange(r.value)}
            role="radio"
            aria-checked={r.value === value}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onChange(r.value);
              }
            }}
          >
            <span className="dot" />
            <span className="name">{r.name}</span>
            <span className="time">{r.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
