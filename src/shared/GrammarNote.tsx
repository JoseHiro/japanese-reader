import type { TobiraGrammar } from "../tobira";

// The 📘 文法 toggle button and the Tobira explanation panel it reveals.
// Shared by the grammar quizzes; the open/closed state lives in the card.

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
