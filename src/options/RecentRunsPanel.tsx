import type { Run } from '../lib/types';
import { formatDayMonth, formatThresholdMs } from '../lib/format';

interface RecentRunsPanelProps {
  runs: Run[];
}

export function RecentRunsPanel({ runs }: RecentRunsPanelProps) {
  const shown = runs.slice(0, 5);

  return (
    <div className="panel">
      <h2>
        recent runs <span className="badge">last {shown.length || 0}</span>
      </h2>
      <div className="runs">
        {shown.length === 0 && (
          <div className="run">
            <span className="when">—</span>
            <span className="what">no runs yet</span>
            <span className="n zero">—</span>
          </div>
        )}
        {shown.map((r) => {
          const cleaned = r.inactiveDomains + r.deletedHistory;
          const zero = cleaned === 0 && !r.error;
          return (
            <div key={r.ts} className="run">
              <span className="when">{formatDayMonth(r.ts)}</span>
              <span className="what">
                {r.error ? (
                  <em>error</em>
                ) : zero ? (
                  <>nothing to tidy</>
                ) : (
                  <>
                    past <em>{formatThresholdMs(r.thresholdMs)}</em>
                  </>
                )}
              </span>
              <span className={`n${zero ? ' zero' : ''}`}>
                {zero ? '—' : r.inactiveDomains.toLocaleString('en-US')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
