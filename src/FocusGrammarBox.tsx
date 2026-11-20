import type { FocusGrammar } from "./content";
import { Furigana } from "./shared/Furigana";
import { grammarRanges } from "./focusGrammar";

// 今回の文法: the grammar points an article is built around, above the
// body. Each entry's color matches its highlights in the text.

export function FocusGrammarBox({
  items,
  showFurigana,
  highlight,
  onToggleHighlight,
}: {
  items: FocusGrammar[];
  showFurigana: boolean;
  highlight: boolean;
  onToggleHighlight: () => void;
}) {
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
      <div className="fg-list">
        {items.map((g, i) => (
          <article className={`fg-item gram-${i % 3}`} key={g.label}>
            <header className="fg-item-head">
              <span className="fg-label">{g.label}</span>
              {g.level && <span className="fg-level">{g.level}</span>}
            </header>
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
              <dt>例</dt>
              <dd className="fg-example">
                <Furigana
                  text={g.example}
                  show={showFurigana}
                  marks={grammarRanges(g.example, [g]).map((r) => ({ ...r, index: i }))}
                />
              </dd>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
