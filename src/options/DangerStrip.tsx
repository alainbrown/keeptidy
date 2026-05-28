interface DangerStripProps {
  onErase: () => void;
}

export function DangerStrip({ onErase }: DangerStripProps) {
  return (
    <div className="danger-strip">
      <div className="t">
        <b>Erase the entire history</b>
        <p>
          Removes every entry regardless of threshold or exempt rules.
          Bookmarks and passwords untouched.
        </p>
      </div>
      <button onClick={onErase}>Erase everything</button>
    </div>
  );
}
