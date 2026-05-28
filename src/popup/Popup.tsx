import type { DomainBucket, ThresholdPreset } from '../lib/types';
import { StatusPill } from '../components/StatusPill';
import { Switch } from '../components/Switch';
import { ThresholdPills } from '../components/ThresholdPills';
import { Wordmark } from '../components/Wordmark';
import { MiniTimeline } from './MiniTimeline';

export interface PopupProps {
  pendingCount: number;
  threshold: { ms: number; label: string };
  frequency: { label: string };
  autoTidy: boolean;
  lastSweep: { agoLabel: string; count: number } | null;
  domainBuckets: DomainBucket[];
  thresholdPresetValue: ThresholdPreset | 'custom';
  popupPresets: ThresholdPreset[];
  onTidyNow: () => void;
  onChangeThreshold: (p: ThresholdPreset) => void;
  onToggleAutoTidy: (next: boolean) => void;
  onOpenSettings: () => void;
}

const fmt = (n: number) => n.toLocaleString('en-US');

export function Popup(props: PopupProps) {
  const {
    pendingCount,
    threshold,
    frequency,
    autoTidy,
    lastSweep,
    domainBuckets,
    thresholdPresetValue,
    popupPresets,
    onTidyNow,
    onChangeThreshold,
    onToggleAutoTidy,
    onOpenSettings,
  } = props;

  return (
    <div className="popup">
      <header className="head">
        <Wordmark size="sm" version="0.1" />
        <StatusPill on={autoTidy} label={autoTidy ? 'auto on' : 'auto off'} />
      </header>

      <section className="hero">
        <div className="left">
          <div className="eyebrow">pending removal</div>
          <div className="count">
            <em>{fmt(pendingCount)}</em>
          </div>
        </div>
        <div className="right">
          <span className="k">threshold</span>
          <span className="v">{threshold.label}</span>
        </div>
      </section>

      <MiniTimeline
        thresholdMs={threshold.ms}
        buckets={domainBuckets}
        lastSweep={lastSweep}
      />

      <button className="primary" onClick={onTidyNow}>
        <span>Tidy now</span>
        <span className="pcount">
          {fmt(pendingCount)} <span className="arrow">→</span>
        </span>
      </button>

      <div className="pill-label">threshold</div>
      <ThresholdPills
        variant="pill"
        value={thresholdPresetValue}
        options={popupPresets}
        onChange={onChangeThreshold}
      />

      <div className="row">
        <div className="label-stack">
          <span className="label">Auto-tidy</span>
          <span className="sub">{frequency.label}</span>
        </div>
        <Switch on={autoTidy} onChange={onToggleAutoTidy} />
      </div>

      <footer className="foot">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onOpenSettings();
          }}
        >
          Open settings
        </a>
        <span className="ver">build 0.1.0</span>
      </footer>
    </div>
  );
}
