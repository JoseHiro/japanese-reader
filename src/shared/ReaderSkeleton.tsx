// Placeholder shown in the reader while the tokenizer / article loads.
// Bars are laid out like the article's paragraphs (same line rhythm as
// the furigana'd text) so the page doesn't jump when the real text lands.

// Line widths (%) per paragraph — fixed so the shape is stable between loads.
const PARAGRAPHS = [
  [100, 97, 100, 64],
  [100, 94, 100, 99, 41],
  [100, 96, 78],
];

export function ReaderSkeleton() {
  return (
    <div className="reader-skeleton" role="status" aria-live="polite">
      <div className="sk-status">
        <span className="sk-dot" aria-hidden />
        読み込み中
      </div>
      {PARAGRAPHS.map((lines, pi) => (
        <div className="sk-para" key={pi} aria-hidden>
          {lines.map((w, li) => (
            <div className="sk-line" key={li} style={{ width: `${w}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}
