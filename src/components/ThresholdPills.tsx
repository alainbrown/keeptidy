import type { ThresholdPreset } from '../lib/types';

interface ThresholdPillsProps {
  value: ThresholdPreset | 'custom';
  options: ThresholdPreset[];
  onChange: (p: ThresholdPreset) => void;
  variant?: 'pill' | 'preset';
}

const LABELS: Record<'pill' | 'preset', Record<ThresholdPreset, string>> = {
  pill: {
    '1d': '1d',
    '1w': '1w',
    '2w': '2w',
    '1mo': '1mo',
    '2mo': '2mo',
    '6mo': '6mo',
    '1yr': '1yr',
  },
  preset: {
    '1d': '1 day',
    '1w': '1 week',
    '2w': '2 weeks',
    '1mo': '1 month',
    '2mo': '2 months',
    '6mo': '6 months',
    '1yr': '1 year',
  },
};

export function ThresholdPills({
  value,
  options,
  onChange,
  variant = 'pill',
}: ThresholdPillsProps) {
  const groupClass = variant === 'pill' ? 'pills' : 'presets';
  const itemClass = variant === 'pill' ? 'pill' : 'preset';
  return (
    <div className={groupClass}>
      {options.map((p) => (
        <button
          key={p}
          className={`${itemClass}${p === value ? ' on' : ''}`}
          onClick={() => onChange(p)}
        >
          {LABELS[variant][p]}
        </button>
      ))}
    </div>
  );
}
