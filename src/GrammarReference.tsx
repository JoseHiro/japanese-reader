import { useEffect, useMemo, useRef, useState } from "react";
import type { TobiraGrammar } from "./tobira";
import { TOBIRA_LESSONS } from "./tobira";

// Browsable reference of every grammar point in Tobira. Left column is a
// list of chapters (with the user's current chapter highlighted); right
// column is the selected chapter's grammar points, each expandable to see
// the pattern form, English gloss, and full explanation. Free-text search
// filters the whole book by title / meaning / explanation.

function matches(g: TobiraGrammar, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return (
    g.title.toLowerCase().includes(needle) ||
    g.meaning_en.toLowerCase().includes(needle) ||
    g.explanation.toLowerCase().includes(needle) ||
    g.pattern_form.toLowerCase().includes(needle)
  );
}

export function GrammarReference({
  currentLesson,
}: {
  currentLesson?: number;
}) {
  const [selectedLesson, setSelectedLesson] = useState<number>(
    currentLesson ?? 1,
  );
  const [query, setQuery] = useState("");
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set());
  const navRef = useRef<HTMLElement>(null);
  const activeNavRef = useRef<HTMLButtonElement>(null);

  // When the reference opens on the user's current lesson (or they pick a
  // new one), bring that nav button into view so it isn't hidden below the
  // fold — especially important in the stacked mobile layout where only a
  // few chapters are visible above the content column.
  useEffect(() => {
    activeNavRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [selectedLesson]);

  const searchHits = useMemo(() => {
    if (!query.trim()) return null;
    const results: { lesson: number; title: string; g: TobiraGrammar }[] = [];
    for (const L of TOBIRA_LESSONS) {
      for (const g of L.grammar) {
        if (matches(g, query.trim())) {
          results.push({ lesson: L.lesson, title: L.title, g });
        }
      }
    }
    return results;
  }, [query]);

  function toggle(key: string) {
    setOpenKeys((s) => {
      const n = new Set(s);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });
  }

  const activeLesson = TOBIRA_LESSONS.find((l) => l.lesson === selectedLesson);

  return (
    <div className="gr-root">
      <div className="gr-search">
        <input
          type="text"
          placeholder="文法・意味・説明を検索…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="gr-search-input"
        />
        {query && (
          <button className="gr-search-clear" onClick={() => setQuery("")}>
            ×
          </button>
        )}
      </div>

      {searchHits ? (
        <div className="gr-search-results">
          <p className="gr-hits">
            {searchHits.length} 件見つかりました
          </p>
          {searchHits.map(({ lesson, title, g }) => (
            <GrammarPoint
              key={`s-${lesson}-${g.n}`}
              g={g}
              open={openKeys.has(`s-${lesson}-${g.n}`)}
              onToggle={() => toggle(`s-${lesson}-${g.n}`)}
              subtitle={`第${lesson}課 ${title}`}
            />
          ))}
        </div>
      ) : (
        <div className="gr-body">
          <nav className="gr-nav" aria-label="扉の課" ref={navRef}>
            {TOBIRA_LESSONS.map((L) => (
              <button
                key={L.lesson}
                ref={L.lesson === selectedLesson ? activeNavRef : undefined}
                className={
                  "gr-nav-btn" +
                  (L.lesson === selectedLesson ? " active" : "") +
                  (L.lesson === currentLesson ? " current" : "")
                }
                onClick={() => setSelectedLesson(L.lesson)}
              >
                <span className="gr-nav-num">第{L.lesson}課</span>
                <span className="gr-nav-title">{L.title}</span>
                {L.lesson === currentLesson && (
                  <span className="gr-nav-badge">今</span>
                )}
              </button>
            ))}
          </nav>

          <div className="gr-lesson">
            {activeLesson && (
              <>
                <h3 className="gr-lesson-head">
                  第{activeLesson.lesson}課 {activeLesson.title}
                  <span className="gr-lesson-count">
                    ({activeLesson.grammar.length}項目)
                  </span>
                </h3>
                {activeLesson.grammar.map((g) => (
                  <GrammarPoint
                    key={`${activeLesson.lesson}-${g.n}`}
                    g={g}
                    open={openKeys.has(`${activeLesson.lesson}-${g.n}`)}
                    onToggle={() => toggle(`${activeLesson.lesson}-${g.n}`)}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function GrammarPoint({
  g,
  open,
  onToggle,
  subtitle,
}: {
  g: TobiraGrammar;
  open: boolean;
  onToggle: () => void;
  subtitle?: string;
}) {
  return (
    <div className={"gr-item" + (open ? " open" : "")}>
      <button className="gr-item-head" onClick={onToggle} aria-expanded={open}>
        <span className="gr-item-n">{g.n}</span>
        <span className="gr-item-title">{g.title}</span>
        {g.meaning_en && <span className="gr-item-en">{g.meaning_en}</span>}
      </button>
      {subtitle && open && <p className="gr-item-subtitle">{subtitle}</p>}
      {open && (
        <div className="gr-item-body">
          {g.pattern_form && (
            <p className="gr-item-form"><b>形:</b> {g.pattern_form}</p>
          )}
          <p className="gr-item-expl">{g.explanation}</p>
        </div>
      )}
    </div>
  );
}
