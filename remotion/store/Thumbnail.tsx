import { AbsoluteFill } from 'remotion';
import { Popup } from '../../src/popup/Popup';
import { POPUP_THRESHOLD_PRESETS } from '../../src/lib/presets';
import { Backdrop } from '../components/Backdrop';
import { BrandLockup } from '../components/BrandLockup';
import { PopupFrame } from '../components/PopupFrame';
import { MOCK_BUCKETS } from '../mockData';
import '../../src/styles/tokens.css';
import '../../src/styles/reset.css';
import '../../src/components/shared.css';
import '../../src/popup/popup.css';

const DAY = 24 * 60 * 60 * 1000;

/**
 * YouTube thumbnail · 1280 × 720 PNG.
 *
 * Same hero language as the Marquee (wordmark + live popup), but retuned
 * for thumbnail legibility: the headline is the dominant element so it
 * survives being shrunk to a 246px grid cell, and the popup is pushed up
 * in scale to read as the product shot at a glance.
 */
export const Thumbnail = () => (
  <Backdrop>
    <AbsoluteFill
      style={{
        padding: '0 88px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 64,
      }}
    >
      {/* Left: brand + big hook */}
      <div style={{ flex: 1, maxWidth: 640 }}>
        <div
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 16,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: '#c8ff00',
            marginBottom: 28,
          }}
        >
          Chrome Extension
        </div>

        <BrandLockup size={96} />

        <h1
          style={{
            fontFamily: '"Funnel Display", sans-serif',
            fontSize: 62,
            fontWeight: 300,
            letterSpacing: '-0.035em',
            color: '#f6f6f3',
            margin: '34px 0 0',
            lineHeight: 1.04,
          }}
        >
          Auto-clean the{' '}
          <em style={{ fontStyle: 'normal', fontWeight: 700, color: '#c8ff00' }}>
            sites you forgot
          </em>
          .
        </h1>

        <div
          style={{
            fontFamily: '"Funnel Sans", sans-serif',
            fontSize: 22,
            color: 'rgba(246,246,243,0.62)',
            marginTop: 24,
            lineHeight: 1.45,
            maxWidth: 520,
          }}
        >
          History, cookies &amp; site data — swept on a schedule. Bookmarks and
          passwords stay untouched.
        </div>
      </div>

      {/* Right: live popup, pushed up in scale as the product shot */}
      <PopupFrame scale={1.18}>
        <div style={{ width: 380 }}>
          <Popup
            pendingCount={1247}
            threshold={{ ms: 60 * DAY, label: '2 months' }}
            frequency={{ label: 'every 6 hours' }}
            autoTidy={true}
            tidying={false}
            lastSweep={{ agoLabel: '3d ago', count: 874 }}
            domainBuckets={MOCK_BUCKETS}
            thresholdPresetValue="2mo"
            popupPresets={POPUP_THRESHOLD_PRESETS}
            onTidyNow={() => {}}
            onChangeThreshold={() => {}}
            onToggleAutoTidy={() => {}}
            onOpenSettings={() => {}}
          />
        </div>
      </PopupFrame>
    </AbsoluteFill>
  </Backdrop>
);
