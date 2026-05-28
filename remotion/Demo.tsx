import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Options } from '../src/options/Options';
import { Popup } from '../src/popup/Popup';
import { POPUP_THRESHOLD_PRESETS, msToPreset } from '../src/lib/presets';
import type { Settings } from '../src/lib/types';
import { Backdrop } from './components/Backdrop';
import { BrandLockup } from './components/BrandLockup';
import { Caption } from './components/Caption';
import { Cursor } from './components/Cursor';
import { PopupFrame } from './components/PopupFrame';
import { SweepDots } from './components/SweepDots';
import { MOCK_BUCKETS, MOCK_RUNS } from './mockData';
import '../src/styles/tokens.css';
import '../src/styles/reset.css';
import '../src/components/shared.css';
import '../src/popup/popup.css';
import '../src/options/options.css';

const DAY = 24 * 60 * 60 * 1000;

// Frame timings (30fps · 600 frames total = 20s)
const T = {
  // Intro card
  introIn: 0,
  introOut: 50,

  // Popup scene
  popupIn: 38,
  popupCursorEnter: 100,
  popupCursorOnTidy: 150,
  popupClick: 158,
  popupCountDropStart: 165,
  popupCountDropEnd: 210,
  popupOut: 245,

  // Settings scene — starts before popupOut to create a real crossfade
  // (settings light bg fades up while popup dark bg fades down).
  settingsIn: 225,
  settingsCursorEnter: 295,
  settingsCursorOnThreshold: 335,
  settingsThresholdDragStart: 345,
  settingsThresholdDragEnd: 410,
  settingsCursorOnCategory: 440,
  settingsCategoryClick: 455,
  settingsOut: 510,

  // End card
  endIn: 495,
  endOut: 600,
};

const CANVAS_W = 1280;
const CANVAS_H = 720;

// Popup is placed in the left half of the canvas; caption sits on the right.
const POPUP_W = 380;
const POPUP_X = 200;
const POPUP_Y = 100;
// Tidy button is roughly 320px down from the popup's top edge.
const POPUP_TIDY_BTN = { x: POPUP_X + 200, y: POPUP_Y + 332 };

// Approximate canvas coords for the threshold marker and a category checkbox
// in the rendered Options page (the timeline panel and categories strip
// sit at known offsets inside .wrap, which is centered with max-width 1120px).
// Calibrated from rendered frames; the SVG timeline maps viewBox 0-1000 to
// the .wrap inner width minus padding (~984px), centered, so the 2mo marker
// lands around x≈400 and 6mo lands around x≈290.
const SETTINGS_THRESHOLD_MARKER = { x: 400, y: 400 };
const SETTINGS_THRESHOLD_MARKER_AT_6MO = { x: 290, y: 400 };
const SETTINGS_COOKIES_CHECKBOX = { x: 478, y: 465 };

const baseSettings = (
  thresholdMs: number,
  cookiesOn: boolean,
): Settings => ({
  thresholdMs,
  frequency: '6h',
  exemptDomains: ['github.com', '*.notion.so', 'mail.google.com', 'localhost'],
  autoTidy: true,
  categories: {
    history: true,
    downloads: true,
    cookies: cookiesOn,
    siteData: true,
  },
});

const easeInOut = (t: number) => t * t * (3 - 2 * t);

export const Demo = () => {
  const frame = useCurrentFrame();

  // -------- Scene opacities --------
  const introOpacity = interpolate(
    frame,
    [T.introIn, T.introIn + 12, T.introOut - 12, T.introOut],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const popupSceneOpacity = interpolate(
    frame,
    [T.popupIn, T.popupIn + 14, T.popupOut - 18, T.popupOut],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const settingsSceneOpacity = interpolate(
    frame,
    [T.settingsIn, T.settingsIn + 18, T.settingsOut - 22, T.settingsOut],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const endOpacity = interpolate(
    frame,
    [T.endIn, T.endIn + 18, T.endOut - 18, T.endOut],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // -------- Popup scene state --------
  const pendingCount =
    frame < T.popupCountDropStart
      ? 1247
      : frame >= T.popupCountDropEnd
        ? 0
        : Math.round(
            interpolate(
              frame,
              [T.popupCountDropStart, T.popupCountDropEnd],
              [1247, 0],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
            ),
          );
  const popupTidying =
    frame >= T.popupClick && frame < T.popupCountDropEnd + 4;

  // Popup cursor: enters from off-screen right, lands on Tidy button.
  const popupCursorPos = (() => {
    if (frame < T.popupCursorEnter)
      return { x: CANVAS_W + 60, y: CANVAS_H - 40 };
    if (frame >= T.popupCursorOnTidy) return POPUP_TIDY_BTN;
    const t = easeInOut(
      interpolate(
        frame,
        [T.popupCursorEnter, T.popupCursorOnTidy],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
      ),
    );
    return {
      x: CANVAS_W + 60 + (POPUP_TIDY_BTN.x - (CANVAS_W + 60)) * t,
      y: CANVAS_H - 40 + (POPUP_TIDY_BTN.y - (CANVAS_H - 40)) * t,
    };
  })();

  // -------- Settings scene state --------
  const settingsThresholdMs = (() => {
    if (frame < T.settingsThresholdDragStart) return 60 * DAY;
    if (frame >= T.settingsThresholdDragEnd) return 180 * DAY;
    const t = interpolate(
      frame,
      [T.settingsThresholdDragStart, T.settingsThresholdDragEnd],
      [60 * DAY, 180 * DAY],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
    );
    return t;
  })();
  const settingsCookiesOn = frame < T.settingsCategoryClick;

  // Settings cursor path: enter → threshold marker → drag → category checkbox.
  const settingsCursorPos = (() => {
    if (frame < T.settingsCursorEnter)
      return { x: CANVAS_W + 60, y: CANVAS_H - 40 };
    if (frame < T.settingsCursorOnThreshold) {
      const t = easeInOut(
        interpolate(
          frame,
          [T.settingsCursorEnter, T.settingsCursorOnThreshold],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
        ),
      );
      return {
        x: CANVAS_W + 60 + (SETTINGS_THRESHOLD_MARKER.x - (CANVAS_W + 60)) * t,
        y: CANVAS_H - 40 + (SETTINGS_THRESHOLD_MARKER.y - (CANVAS_H - 40)) * t,
      };
    }
    if (frame < T.settingsThresholdDragEnd) {
      const t = interpolate(
        frame,
        [T.settingsThresholdDragStart, T.settingsThresholdDragEnd],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
      );
      return {
        x:
          SETTINGS_THRESHOLD_MARKER.x +
          (SETTINGS_THRESHOLD_MARKER_AT_6MO.x - SETTINGS_THRESHOLD_MARKER.x) *
            t,
        y: SETTINGS_THRESHOLD_MARKER.y,
      };
    }
    if (frame < T.settingsCursorOnCategory) {
      const t = easeInOut(
        interpolate(
          frame,
          [T.settingsThresholdDragEnd, T.settingsCursorOnCategory],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
        ),
      );
      return {
        x:
          SETTINGS_THRESHOLD_MARKER_AT_6MO.x +
          (SETTINGS_COOKIES_CHECKBOX.x - SETTINGS_THRESHOLD_MARKER_AT_6MO.x) *
            t,
        y:
          SETTINGS_THRESHOLD_MARKER.y +
          (SETTINGS_COOKIES_CHECKBOX.y - SETTINGS_THRESHOLD_MARKER.y) * t,
      };
    }
    return SETTINGS_COOKIES_CHECKBOX;
  })();

  // -------- Which cursor click moment, if any --------
  const popupClickAt = T.popupClick;
  const settingsClickAt = T.settingsCategoryClick;

  // -------- Which cursor to render (the one for the active scene) --------
  const showPopupCursor =
    frame >= T.popupCursorEnter && frame < T.popupOut - 5;
  const showSettingsCursor =
    frame >= T.settingsCursorEnter && frame < T.settingsOut - 5;

  return (
    <>
      {/* === Intro (dark backdrop, brand) === */}
      {introOpacity > 0 && (
        <AbsoluteFill style={{ opacity: introOpacity }}>
          <Backdrop>
            <AbsoluteFill
              style={{ alignItems: 'center', justifyContent: 'center' }}
            >
              <BrandLockup
                size={108}
                subtitle="browser data, tidied"
                style={{ alignItems: 'center' }}
              />
              <div style={{ position: 'absolute', bottom: 110 }}>
                <SweepDots frame={frame} width={260} count={20} />
              </div>
            </AbsoluteFill>
          </Backdrop>
        </AbsoluteFill>
      )}

      {/* === Popup scene (dark backdrop, popup left, caption right) === */}
      {popupSceneOpacity > 0 && (
        <AbsoluteFill style={{ opacity: popupSceneOpacity }}>
          <Backdrop>
            {/* Popup */}
            <div
              style={{
                position: 'absolute',
                left: POPUP_X,
                top: POPUP_Y,
                width: POPUP_W,
              }}
            >
              <PopupFrame>
                <div style={{ width: POPUP_W }}>
                  <Popup
                    pendingCount={pendingCount}
                    threshold={{ ms: 60 * DAY, label: '2 months' }}
                    frequency={{ label: 'every 6 hours' }}
                    autoTidy={true}
                    tidying={popupTidying}
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
            </div>

            {/* Right-side caption + sweep motif */}
            <div
              style={{
                position: 'absolute',
                left: 720,
                top: 220,
                width: 480,
              }}
            >
              <div style={{ marginBottom: 22 }}>
                <SweepDots frame={frame} width={180} count={14} />
              </div>
              <Caption
                frame={frame}
                enterAt={T.popupIn + 22}
                exitAt={T.popupClick - 2}
                eyebrow="01"
                title="Sites you stop visiting leave data behind."
                subtitle="keeptidy quietly sweeps the dormant ones."
                align="left"
              />
              <div style={{ position: 'absolute', top: 0 }}>
                <Caption
                  frame={frame}
                  enterAt={T.popupClick + 4}
                  exitAt={T.popupOut - 12}
                  eyebrow="02"
                  title="One click."
                  subtitle="Or schedule it — every hour, 6h, daily."
                  align="left"
                />
              </div>
            </div>
          </Backdrop>
        </AbsoluteFill>
      )}

      {/* === Settings scene (light bg, full Options page) === */}
      {settingsSceneOpacity > 0 && (
        <AbsoluteFill
          style={{
            background:
              'linear-gradient(180deg, var(--bg-1) 0%, var(--bg-2) 100%)',
            opacity: settingsSceneOpacity,
            overflow: 'hidden',
          }}
        >
          <Options
            settings={baseSettings(settingsThresholdMs, settingsCookiesOn)}
            vm={{
              pendingCount: 1247,
              keptCount: 20530,
              domainBuckets: MOCK_BUCKETS,
              runs: MOCK_RUNS,
              tidying: false,
              nextInLabel: 'in 47m',
              today: '2026·05·28',
              saved: true,
              build: 'build 0.1.0',
            }}
            onSettingChange={() => {}}
            onAddExempt={() => {}}
            onRemoveExempt={() => {}}
            onTidyNow={() => {}}
            onEraseAll={() => {}}
          />

          {/* Subtitle-style overlay at the bottom of the canvas. The
              settings page underneath is busy, so the caption sits on a
              dark pill that's readable on any background. z-index: 10
              because options.css gives .wrap z-index:1 — without this
              override the page content would render on top of the pill. */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 36,
              transform: 'translateX(-50%)',
              padding: '22px 36px',
              background: 'rgba(20, 20, 26, 0.92)',
              borderRadius: 8,
              color: '#f6f6f3',
              minWidth: 480,
              maxWidth: 760,
              textAlign: 'center',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.4)',
              zIndex: 10,
            }}
          >
            <Caption
              frame={frame}
              enterAt={T.settingsIn + 24}
              exitAt={T.settingsCursorOnCategory - 5}
              eyebrow="03"
              title="Drag to set the threshold."
              subtitle="Old gets cleaned. Recent stays."
              align="center"
            />
            <div
              style={{
                position: 'absolute',
                top: 22,
                left: 36,
                right: 36,
              }}
            >
              <Caption
                frame={frame}
                enterAt={T.settingsCursorOnCategory - 5}
                exitAt={T.settingsOut - 14}
                eyebrow="04"
                title="Choose what gets cleaned."
                subtitle="Bookmarks and passwords are always kept."
                align="center"
              />
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* === End card === */}
      {endOpacity > 0 && (
        <AbsoluteFill style={{ opacity: endOpacity }}>
          <Backdrop>
            <AbsoluteFill
              style={{ alignItems: 'center', justifyContent: 'center' }}
            >
              <BrandLockup
                size={112}
                subtitle="browser data, tidied"
                style={{ alignItems: 'center' }}
              />
              <div style={{ position: 'absolute', bottom: 110 }}>
                <SweepDots frame={frame} width={300} count={22} />
              </div>
            </AbsoluteFill>
          </Backdrop>
        </AbsoluteFill>
      )}

      {/* === Cursors (above everything). z-index because options.css
           gives .wrap z-index:1 — without the wrapper override, the
           settings page would render above the cursor. */}
      {(showPopupCursor || showSettingsCursor) && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            pointerEvents: 'none',
          }}
        >
          {showPopupCursor && (
            <Cursor
              x={popupCursorPos.x}
              y={popupCursorPos.y}
              clickAt={popupClickAt}
              frame={frame}
              size={34}
            />
          )}
          {showSettingsCursor && (
            <Cursor
              x={settingsCursorPos.x}
              y={settingsCursorPos.y}
              clickAt={settingsClickAt}
              frame={frame}
              size={34}
            />
          )}
        </div>
      )}
    </>
  );
};

// Avoid an unused-import warning if msToPreset is needed later.
void msToPreset;
