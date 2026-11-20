import { useRef, type KeyboardEvent } from "react";
import type { FocusGrammar } from "./content";
import { Furigana } from "./shared/Furigana";
import { grammarRanges } from "./focusGrammar";

// 今回の文法: the grammar points an article is built around, above the
// body, one card at a time behind tabs. Each entry's color matches its
// highlights in the text.

export function FocusGrammarBox({
  items,
  selected,
  onSelect,
  showFurigana,
  highlight,
  onToggleHighlight,
}: {
  items: FocusGrammar[];
  /** Index of the grammar whose card is shown. */
  selected: number;
  onSelect: (index: number) => void;
  showFurigana: boolean;
  highlight: boolean;
  onToggleHighlight: () => void;
}) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = Math.min(Math.max(selected, 0), items.length - 1);
  const g = items[current];
  const i = current;

  // Arrow keys / Home / End move between tabs and select (WAI-ARIA tabs).
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const n = items.length;
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (current + 1) % n;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (current - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next === null) return;
    e.preventDefault();
    onSelect(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <section className="focus-grammar" aria-label="今回の文法">
      <div className="fg-head">
        <h3 className="section-title">今回の文法</h3>
        <button
          type="button"
          className={"fg-toggle" + (highlight ? " on" : "")}
          aria-pressed={highlight}
          onClick={onToggleHighlight}
        >
          本文の文法ハイライト {highlight ? "ON" : "OFF"}
        </button>
      </div>
      <div className="fg-tabs" role="tablist" aria-label="今回の文法" onKeyDown={onKeyDown}>
        {items.map((t, k) => (
          <button
            key={t.label}
            ref={(el) => {
              tabRefs.current[k] = el;
            }}
            type="button"
            role="tab"
            id={`fg-tab-${k}`}
            aria-selected={k === current}
            aria-controls="fg-panel"
            tabIndex={k === current ? 0 : -1}
            className={`fg-tab gram-${k % 3}` + (k === current ? " active" : "")}
            onClick={() => onSelect(k)}
          >
            <span className="fg-label">{t.label}</span>
            {t.level && <span className="fg-level">{t.level}</span>}
          </button>
        ))}
      </div>
      <div
        className={`fg-item gram-${i % 3}`}
        role="tabpanel"
        id="fg-panel"
        aria-labelledby={`fg-tab-${i}`}
        tabIndex={0}
      >
        <dl className="fg-rows">
          <dt>形</dt>
          <dd><Furigana text={g.form} show={showFurigana} /></dd>
          <dt>意味</dt>
          <dd>
            <Furigana text={g.meaning} show={showFurigana} />
            {g.meaningEn && <span className="fg-en">{g.meaningEn}</span>}
          </dd>
          <dt>注意</dt>
          <dd>
            <Furigana text={g.caution} show={showFurigana} />
            <span className="fg-register">
              <Furigana text={g.register} show={showFurigana} />
            </span>
          </dd>
          {g.differences?.length ? (
            <>
              <dt>違い</dt>
              <dd>
                <ul className="fg-diffs">
                  {g.differences.map((d) => (
                    <li key={d.form}>
                      <span className="fg-diff-form">
                        <Furigana text={d.form} show={showFurigana} />
                      </span>
                      <Furigana text={d.note} show={showFurigana} />
                      {d.example && (
                        <span className="fg-diff-ex">
                          <Furigana text={`例：${d.example}`} show={showFurigana} />
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </dd>
            </>
          ) : null}
          <dt>例</dt>
          <dd className="fg-example">
            <Furigana
              text={g.example}
              show={showFurigana}
              marks={grammarRanges(g.example, [g]).map((r) => ({ ...r, index: i }))}
            />
          </dd>
        </dl>
      </div>
    </section>
  );
}
