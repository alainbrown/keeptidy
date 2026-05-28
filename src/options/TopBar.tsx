import { Wordmark } from '../components/Wordmark';

interface TopBarProps {
  autoTidy: boolean;
  nextInLabel: string | null;
  today: string;
}

export function TopBar({ autoTidy, nextInLabel, today }: TopBarProps) {
  return (
    <header className="top">
      <Wordmark size="lg" subtitle="settings · graphite" />
      <div className="top-right">
        <span className={autoTidy ? 'live' : ''}>
          {autoTidy ? 'auto-tidy on' : 'auto-tidy off'}
        </span>
        {autoTidy && nextInLabel && <span>next {nextInLabel}</span>}
        <span>{today}</span>
      </div>
    </header>
  );
}
