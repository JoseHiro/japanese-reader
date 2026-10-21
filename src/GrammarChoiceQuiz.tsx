import { useRef, useState } from "react";
import type { GrammarChoiceQuestion } from "./content";
import { Furigana } from "./shared/Furigana";
import { GrammarPanel, GrammarToggle } from "./shared/GrammarNote";
import { grammarByKey } from "./tobira";

// 文法選択 quiz. Each card shows the English meaning of a sentence and the
// Japanese sentence with its grammar part blanked; the learner picks one
// of four forms. The pick locks after the first answer (the review mode
// remounts the quiz with just the missed cards for another try).

function QuestionCard({
  q,
  number,
  showFurigana,
  onAnswer,
}: {
  q: GrammarChoiceQuestion;
  number: number;
  showFurigana: boolean;
  onAnswer: (correct: boolean) => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [showGrammar, setShowGrammar] = useState(false);
  const answered = picked !== null;
  const grammar = q.grammarKey ? grammarByKey(q.grammarKey) : undefined;

  function pick(oi: number) {
    if (answered) return;
    setPicked(oi);
    onAnswer(oi === q.answer);
  }

  return (
    <div className="quiz-card">
      <div className="q-row">
        <span className="q-num">{number}</span>
        <div>
          <p className="rq-en">{q.translation}</p>
          <p className="cloze-sentence">
            <Furigana text={q.before} show={showFurigana} />
            <span className="blank">
              {answered ? (
                <Furigana text={q.options[q.answer]} show={showFurigana} />
              ) : (
                "＿＿"
              )}
            </span>
            <Furigana text={q.after} show={showFurigana} />
          </p>
        </div>
      </div>
      <div className="opts">
        {q.options.map((opt, oi) => {
          let cls = "opt";
          if (answered && oi === q.answer) cls += " correct";
          else if (answered && oi === picked) cls += " wrong";
          return (
            <button key={oi} className={cls} disabled={answered} onClick={() => pick(oi)}>
              <Furigana text={opt} show={showFurigana} />
            </button>
          );
        })}
      </div>
      {answered && q.explanation && (
        <p className="explain">
          <Furigana text={q.explanation} show={showFurigana} />
        </p>
      )}
      {/* The button names the pattern, so it only appears after answering. */}
      {grammar && answered && (
        <div className="rq-actions">
          <GrammarToggle
            grammar={grammar}
            open={showGrammar}
            onToggle={() => setShowGrammar((v) => !v)}
          />
        </div>
      )}
      {grammar && answered && showGrammar && <GrammarPanel grammar={grammar} />}
    </div>
  );
}

export function GrammarChoiceQuiz({
  questions,
  numbers,
  showFurigana,
  onAllComplete,
  onResult,
  badgeLabel,
}: {
  questions: GrammarChoiceQuestion[];
  /** Displayed numbers per question (defaults to 1..n); review mode passes the originals. */
  numbers?: number[];
  showFurigana: boolean;
  /** Fired once when every question has been answered. */
  onAllComplete?: () => void;
  /** Fired when a card is answered; `index` is its position in `questions`. */
  onResult?: (index: number, correct: boolean) => void;
  badgeLabel?: string;
}) {
  const answeredRef = useRef<Set<number>>(new Set());
  const firedAllRef = useRef(false);
  if (!questions.length) {
    return <p className="hint">この記事にはまだ文法選択クイズがありません。</p>;
  }
  return (
    <div className="quiz-block">
      <span className="q-badge">{badgeLabel ?? "文法選択"}</span>
      {questions.map((q, i) => (
        <QuestionCard
          key={i}
          q={q}
          number={numbers?.[i] ?? i + 1}
          showFurigana={showFurigana}
          onAnswer={(correct) => {
            onResult?.(i, correct);
            answeredRef.current.add(i);
            if (!firedAllRef.current && answeredRef.current.size >= questions.length) {
              firedAllRef.current = true;
              onAllComplete?.();
            }
          }}
        />
      ))}
    </div>
  );
}
