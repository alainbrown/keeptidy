import type { CSSProperties } from 'react';

interface SweepDotsProps {
  frame: number;
  width?: number;
  height?: number;
  count?: number;
  /** Frames per full sweep cycle. */
  period?: number;
  style?: CSSProperties;
}

/**
 * Concept motif: a horizontal row of dots with a lime "pulse" that
 * sweeps left → right on a loop. Read as: data flowing past, dim
 * (old) on the left, bright (recent) on the right. Used as a small
 * accent next to captions and as the transition strip between scenes.
 */
export const SweepDots = ({
  frame,
  width = 220,
  height = 12,
  count = 18,
  period = 70,
  style,
}: SweepDotsProps) => {
  const cy = height / 2;
  // Pulse position, in [0, width].
  const pulseX = ((frame % period) / period) * width;
  // How far each dot is from the pulse (in px) drives its glow.
  const glowRadius = width / 8;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block', overflow: 'visible', ...style }}
    >
      {Array.from({ length: count }, (_, i) => {
        const x = (i / (count - 1)) * width;
        const dist = Math.abs(x - pulseX);
        const glow = Math.max(0, 1 - dist / glowRadius);
        // Dimmer on the left, brighter on the right; pulse adds glow.
        const ramp = 0.25 + (i / (count - 1)) * 0.45;
        const opacity = Math.min(1, ramp + glow * 0.6);
        const r = 1.4 + (i / (count - 1)) * 0.8 + glow * 1.4;
        const isLime = glow > 0.35 || i / (count - 1) > 0.78;
        return (
          <circle
            key={i}
            cx={x}
            cy={cy}
            r={r}
            style={{
              fill: isLime ? 'var(--lime)' : 'var(--ink-3)',
              opacity,
            }}
          />
        );
      })}
    </svg>
  );
};
