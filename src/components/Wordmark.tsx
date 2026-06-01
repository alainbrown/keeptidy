interface WordmarkProps {
  size?: 'sm' | 'lg';
  subtitle?: string;
}

export function Wordmark({ size = 'sm', subtitle }: WordmarkProps) {
  return (
    <div className={`wordmark wordmark-${size}`}>
      <h1>
        keep<em>tidy</em>
      </h1>
      {subtitle && <span className="sub">{subtitle}</span>}
    </div>
  );
}
