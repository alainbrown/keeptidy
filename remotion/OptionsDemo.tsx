import { AbsoluteFill } from 'remotion';
import { Options } from '../src/options/Options';
import { MOCK_BUCKETS, MOCK_RUNS } from './mockData';
import type { Settings } from '../src/lib/types';
import '../src/styles/tokens.css';
import '../src/styles/reset.css';
import '../src/components/shared.css';
import '../src/options/options.css';

const DAY = 24 * 60 * 60 * 1000;

const SETTINGS: Settings = {
  thresholdMs: 60 * DAY,
  frequency: '6h',
  exemptDomains: ['github.com', '*.notion.so', 'mail.google.com', 'localhost'],
  autoTidy: true,
};

export const OptionsDemo = () => {
  return (
    <AbsoluteFill style={{ background: '#f6f6f3' }}>
      <Options
        settings={SETTINGS}
        vm={{
          pendingCount: 1247,
          keptCount: 20530,
          domainBuckets: MOCK_BUCKETS,
          runs: MOCK_RUNS,
          tidying: false,
          nextInLabel: 'in 47m',
          today: '2026·05·27',
          saved: true,
          build: 'graphite · 4d',
        }}
        onSettingChange={() => {}}
        onAddExempt={() => {}}
        onRemoveExempt={() => {}}
        onTidyNow={() => {}}
        onEraseAll={() => {}}
      />
    </AbsoluteFill>
  );
};
