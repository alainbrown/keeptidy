import { Wordmark } from '../components/Wordmark';

interface TopBarProps {
  autoTidy: boolean;
  nextInLabel: string | null;
  today: string;
  tidying: boolean;
}

export function TopBar({ autoTidy, nextInLabel, today, tidying }: TopBarProps) {
  return (
    <header className="top">
      <Wordmark size="lg" subtitle="settings · graphite" />
      <div className="top-right">
        {tidying ? (
          <span className="tidying">tidying now</span>
        ) : (
          <>
            <span className={autoTidy ? 'live' : ''}>
              {autoTidy ? 'auto-tidy on' : 'auto-tidy off'}
            </span>
            {autoTidy && nextInLabel && <span>next {nextInLabel}</span>}
          </>
        )}
        <span>{today}</span>
      </div>
    </header>
  );
}
