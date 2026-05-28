interface WordmarkProps {
  size?: 'sm' | 'lg';
  version?: string;
  subtitle?: string;
}

export function Wordmark({ size = 'sm', version, subtitle }: WordmarkProps) {
  return (
    <div className={`wordmark wordmark-${size}`}>
      <h1>
        keep<em>tidy</em>
      </h1>
      {version && <span className="v">v{version}</span>}
      {subtitle && <span className="sub">{subtitle}</span>}
    </div>
  );
}
