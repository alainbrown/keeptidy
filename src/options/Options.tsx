import type { DomainBucket, Run, Settings } from '../lib/types';
import { CategoriesPanel } from './CategoriesPanel';
import { DangerStrip } from './DangerStrip';
import { ExemptDomainsPanel } from './ExemptDomainsPanel';
import { FrequencyPanel } from './FrequencyPanel';
import { RecentRunsPanel } from './RecentRunsPanel';
import { TimelinePanel } from './TimelinePanel';
import { TopBar } from './TopBar';

export interface OptionsProps {
  settings: Settings;
  vm: {
    pendingCount: number;
    keptCount: number;
    domainBuckets: DomainBucket[];
    runs: Run[];
    tidying: boolean;
    nextInLabel: string | null;
    today: string;
    saved: boolean;
    build: string;
  };
  onSettingChange: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
  onAddExempt: (pattern: string) => void;
  onRemoveExempt: (pattern: string) => void;
  onTidyNow: () => void;
  onEraseAll: () => void;
}

export function Options(props: OptionsProps) {
  const { settings, vm, onSettingChange, onAddExempt, onRemoveExempt, onEraseAll } = props;

  return (
    <div className="wrap">
      <TopBar
        autoTidy={settings.autoTidy}
        nextInLabel={vm.nextInLabel}
        today={vm.today}
        tidying={vm.tidying}
      />

      <TimelinePanel
        thresholdMs={settings.thresholdMs}
        pendingCount={vm.pendingCount}
        keptCount={vm.keptCount}
        buckets={vm.domainBuckets}
        onChange={(ms) => onSettingChange('thresholdMs', ms)}
      />

      <CategoriesPanel
        value={settings.categories}
        onChange={(next) => onSettingChange('categories', next)}
      />

      <div className="below">
        <FrequencyPanel
          value={settings.frequency}
          onChange={(f) => onSettingChange('frequency', f)}
        />
        <ExemptDomainsPanel
          domains={settings.exemptDomains}
          onAdd={onAddExempt}
          onRemove={onRemoveExempt}
        />
        <RecentRunsPanel runs={vm.runs} />
      </div>

      <DangerStrip onErase={onEraseAll} />

      <footer>
        <span className={vm.saved ? 'saved' : ''}>
          {vm.saved ? 'all changes saved' : 'saving…'}
        </span>
        <span>{vm.build}</span>
      </footer>
    </div>
  );
}
