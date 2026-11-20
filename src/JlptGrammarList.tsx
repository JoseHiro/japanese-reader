import { useMemo, useState } from "react";
import { GRAMMAR_SOURCE, grammarByLevel, type JLPTLevel } from "./grammar";
import { Furigana } from "./shared/Furigana";

// Low-key JLPT grammar list (e.g. N2 for Dominik), opened from the small
// item at the bottom of the rail. Same look as 文法帳 (gr-* styles); the
// current article's focus grammar gets a 今回 mark.

/** "〜ものの" / "ものの(1)" → "ものの", for matching list terms to focus grammar. */
export function normalizeGrammarTerm(s: string): string {
  return s.replace(/^〜/, "").replace(/[（(]\d+[)）]$/, "").trim();
}

export function JlptGrammarList({
  level,
  current,
  showFurigana,
}: {
  level: JLPTLevel;
  /** Focus-grammar labels of the current article, e.g. "〜ものの". */
  current: string[];
  showFurigana: boolean;
}) {
  const [query, setQuery] = useState("");
  const entries = useMemo(() => grammarByLevel(level), [level]);
  const currentSet = useMemo(() => new Set(current.map(normalizeGrammarTerm)), [current]);
  const q = query.trim().toLowerCase();
  const shown = q
    ? entries.filter(
        (g) => g.term.toLowerCase().includes(q) || g.meaning.toLowerCase().includes(q),
      )
    : entries;

  return (
    <div className="gr-root jlpt-list">
      <div className="gr-search">
        <input
          type="text"
          placeholder={`${level} の文法・意味を検索…`}
          aria-label={`${level} の文法を検索`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="gr-search-input"
        />
        {query && (
          <button className="gr-search-clear" aria-label="検索をクリア" onClick={() => setQuery("")}>
            ×
          </button>
        )}
      </div>
      <p className="gr-hits">
        {q ? `${shown.length} 件見つかりました` : `JLPT ${level} の文法 ${entries.length} 項目`}
      </p>
      <div className="gr-search-results">
        {shown.map((g, i) => {
          const isCurrent = currentSet.has(normalizeGrammarTerm(g.term));
          return (
            <div className={"gr-item" + (isCurrent ? " jlpt-current" : "")} key={`${g.term}-${i}`}>
              <div className="gr-item-head jlpt-head">
                <span className="gr-item-title">
                  {g.term}
                  {isCurrent && <span className="jlpt-now">今回</span>}
                </span>
                <span className="gr-item-en">{g.meaning}</span>
              </div>
              {(g.example || g.englishExample) && (
                <div className="gr-item-body">
                  {g.example && (
                    <p className="gr-item-expl"><Furigana text={g.example} show={showFurigana} /></p>
                  )}
                  {g.englishExample && <p className="jlpt-en">{g.englishExample}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="jlpt-source">
        出典：<a href={GRAMMAR_SOURCE.url} target="_blank" rel="noreferrer">{GRAMMAR_SOURCE.name}</a>
      </p>
    </div>
  );
}
