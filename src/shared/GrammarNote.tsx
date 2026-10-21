import type { ReactNode } from "react";
import type { TobiraGrammar } from "../tobira";

// Ways to show a Tobira grammar explanation in the quizzes: a 📘 文法 toggle
// button + panel (文法選択), or a hint you hover / tap to pop the same panel
// up (並べ替え).

export function GrammarToggle({
  grammar,
  open,
  onToggle,
}: {
  grammar: TobiraGrammar;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      className="rq-btn rq-grammar-toggle"
      onClick={onToggle}
      aria-expanded={open}
    >
      {open ? "▾ 文法を隠す" : `📘 文法 (${grammar.title})`}
    </button>
  );
}

export function GrammarPanel({ grammar }: { grammar: TobiraGrammar }) {
  return (
    <aside className="rq-grammar">
      <h4>{grammar.title}</h4>
      {grammar.meaning_en && <p className="rq-grammar-en">{grammar.meaning_en}</p>}
      {grammar.pattern_form && (
        <p className="rq-grammar-form"><b>形:</b> {grammar.pattern_form}</p>
      )}
      <p className="rq-grammar-expl">{grammar.explanation}</p>
    </aside>
  );
}

export function GrammarHint({
  grammar,
  children,
}: {
  grammar: TobiraGrammar;
  children: ReactNode;
}) {
  // Focusable so a tap on touch screens (and Tab on keyboards) opens it too.
  return (
    <span className="grammar-hint" tabIndex={0}>
      <span className="grammar-hint-label">{children}</span>
      <span className="grammar-pop" role="tooltip">
        <GrammarPanel grammar={grammar} />
      </span>
    </span>
  );
}
