import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Popup } from '../src/popup/Popup';
import { POPUP_THRESHOLD_PRESETS } from '../src/lib/presets';
import { Backdrop } from './components/Backdrop';
import { BrandLockup } from './components/BrandLockup';
import { Caption } from './components/Caption';
import { Cursor } from './components/Cursor';
import { PopupFrame } from './components/PopupFrame';
import { MOCK_BUCKETS } from './mockData';
import '../src/styles/tokens.css';
import '../src/styles/reset.css';
import '../src/components/shared.css';
import '../src/popup/popup.css';

const DAY = 24 * 60 * 60 * 1000;

// Frame timings (30fps · 330 frames total = 11s).
const T = {
  titleIn: 0,
  titleOut: 30,
  popupIn: 24,
  cursorEnter: 78,
  hoverStart: 108,
  hoverEnd: 138,
  clickAt: 144,
  tidyStart: 150,
  countDropStart: 156,
  countDropEnd: 216,
  doneStart: 240,
  cursorExit: 250,
  fadeOutStart: 300,
  end: 330,
};

const POPUP_WIDTH = 380;
const CANVAS = 720;
const POPUP_X = (CANVAS - POPUP_WIDTH) / 2;
const POPUP_Y = 60;
const CAPTION_BOTTOM = 36;

// Cursor enters from bottom-right, lands on Tidy button.
const TIDY_BUTTON_X = POPUP_X + 240;
const TIDY_BUTTON_Y = POPUP_Y + 320;

export const Demo = () => {
  const frame = useCurrentFrame();

  // Title card fade
  const titleOpacity = interpolate(
    frame,
    [T.titleIn, T.titleIn + 6, T.titleOut - 10, T.titleOut],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' },
  );

  // Popup fade in
  const popupOpacity = interpolate(
    frame,
    [T.popupIn, T.popupIn + 15],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const popupY = interpolate(frame, [T.popupIn, T.popupIn + 20], [POPUP_Y + 16, POPUP_Y], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Tidy state and animated count
  const tidying = frame >= T.tidyStart && frame < T.doneStart;
  const pendingCount = (() => {
    if (frame < T.countDropStart) return 1247;
    if (frame >= T.countDropEnd) return 0;
    return Math.round(
      interpolate(frame, [T.countDropStart, T.countDropEnd], [1247, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }),
    );
  })();

  // Cursor path (off-screen → hover Tidy → off-screen)
  const cursorX = (() => {
    if (frame < T.cursorEnter) return CANVAS + 40;
    if (frame > T.cursorExit) {
      return interpolate(frame, [T.cursorExit, T.cursorExit + 30], [TIDY_BUTTON_X, CANVAS + 40], {
        extrapolateRight: 'clamp',
      });
    }
    return interpolate(frame, [T.cursorEnter, T.hoverStart], [CANVAS + 20, TIDY_BUTTON_X], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  })();
  const cursorY = (() => {
    if (frame < T.cursorEnter) return CANVAS + 40;
    if (frame > T.cursorExit) {
      return interpolate(frame, [T.cursorExit, T.cursorExit + 30], [TIDY_BUTTON_Y, CANVAS + 40], {
        extrapolateRight: 'clamp',
      });
    }
    return interpolate(frame, [T.cursorEnter, T.hoverStart], [CANVAS + 20, TIDY_BUTTON_Y], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  })();

  // Final fade
  const finalOpacity = interpolate(frame, [T.fadeOutStart, T.end], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <Backdrop>
      <AbsoluteFill style={{ opacity: finalOpacity }}>
        {/* Title card */}
        {frame < T.titleOut + 4 && (
          <AbsoluteFill
            style={{
              opacity: titleOpacity,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BrandLockup
              size={104}
              subtitle="browser data, tidied"
              style={{ alignItems: 'center' }}
            />
          </AbsoluteFill>
        )}

        {/* Popup */}
        {frame >= T.popupIn && (
          <div
            style={{
              position: 'absolute',
              left: POPUP_X,
              top: popupY,
              width: POPUP_WIDTH,
              opacity: popupOpacity,
            }}
          >
            <PopupFrame>
              <div style={{ width: POPUP_WIDTH }}>
                <Popup
                  pendingCount={pendingCount}
                  threshold={{ ms: 60 * DAY, label: '2 months' }}
                  frequency={{ label: 'every 6 hours' }}
                  autoTidy={true}
                  tidying={tidying}
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
        )}

        {/* Captions below the popup. Anchored to the bottom of the canvas
            so they sit on the dark backdrop, not on the light popup surface. */}
        <div
          style={{
            position: 'absolute',
            bottom: CAPTION_BOTTOM,
            left: 0,
            right: 0,
            padding: '0 60px',
          }}
        >
          <Caption
            frame={frame}
            enterAt={T.popupIn + 6}
            exitAt={T.tidyStart - 4}
            eyebrow="01"
            title="Sites you stop visiting leave data behind."
          />
          <div style={{ position: 'absolute', top: 0, left: 60, right: 60 }}>
            <Caption
              frame={frame}
              enterAt={T.tidyStart}
              exitAt={T.doneStart - 4}
              eyebrow="02"
              title="One click."
              subtitle="…or let it run on its own."
            />
          </div>
          <div style={{ position: 'absolute', top: 0, left: 60, right: 60 }}>
            <Caption
              frame={frame}
              enterAt={T.doneStart}
              exitAt={T.fadeOutStart}
              eyebrow="03"
              title="Dormant data, gone."
              subtitle="Bookmarks and passwords untouched."
            />
          </div>
        </div>

        {/* Cursor on top of everything */}
        {frame >= T.cursorEnter && (
          <Cursor
            x={cursorX}
            y={cursorY}
            clickAt={T.clickAt}
            frame={frame}
            size={32}
          />
        )}
      </AbsoluteFill>
    </Backdrop>
  );
};
