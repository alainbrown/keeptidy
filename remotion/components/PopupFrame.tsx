import type { ReactNode } from 'react';

interface PopupFrameProps {
  children: ReactNode;
  /** Optional scale (e.g. 1.1 for bigger demo presence). */
  scale?: number;
}

/** Wraps a Popup in a soft drop shadow + rounded mask so it reads as floating. */
export const PopupFrame = ({ children, scale = 1 }: PopupFrameProps) => {
  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        borderRadius: 6,
        overflow: 'hidden',
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.6) inset, 0 30px 60px -18px rgba(0,0,0,0.65), 0 18px 30px -10px rgba(0,0,0,0.45)',
      }}
    >
      {children}
    </div>
  );
};
