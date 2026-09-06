import { useMemo, useState } from "react";
import type { RearrangeQuestion } from "./content";
import { Furigana } from "./shared/Furigana";
import { grammarByKey } from "./tobira";

// Sentence-rearrangement quiz. For each question, chunks are stored in
// correct order and shuffled at display time (deterministically per index
// so a re-render doesn't reshuffle mid-answer). The learner picks chunks
// in order; each pick moves from the pool to the answer strip. Once every
// chunk is placed, per-chunk correctness is shown against the original
// order.

export function shuffledOrder(n: number, seed: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  // Deterministic Fisher-Yates using a simple LCG seeded by (seed, i).
  let s = (seed * 9301 + 49297) % 233280;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // If the shuffle happened to leave chunks in the correct order, rotate.
  if (arr.every((v, i) => v === i) && n > 1) {
    arr.push(arr.shift()!);
  }
  return arr;
}

function QuestionCard({
  q,
  index,
  showFurigana,
}: {
  q: RearrangeQuestion;
  index: number;
  showFurigana: boolean;
}) {
  const shuffledIdx = useMemo(
    () => shuffledOrder(q.chunks.length, index + 1),
    [q.chunks.length, index],
  );
  // `picked` holds the original chunk indices in the order the learner picked them.
  const [picked, setPicked] = useState<number[]>([]);
  const [showGrammar, setShowGrammar] = useState(false);

  const remaining = shuffledIdx.filter((i) => !picked.includes(i));
  const complete = picked.length === q.chunks.length;

  const grammar = q.grammarKey ? grammarByKey(q.grammarKey) : undefined;

  function pick(i: number) {
    if (complete) return;
    setPicked((p) => [...p, i]);
  }
  function unpick(i: number) {
    setPicked((p) => p.filter((x) => x !== i));
  }
  function reset() {
    setPicked([]);
  }

  return (
    <div className="quiz-card">
      <p className="rq-en">{q.translation}</p>
      {q.hint && <p className="rq-hint">💡 {q.hint}</p>}

      <div className="rq-answer" aria-label="あなたの解答">
        {picked.length === 0 && (
          <span className="rq-answer-empty">下から順番にチップを選んでください</span>
        )}
        {picked.map((origIdx, pos) => {
          const isCorrect = origIdx === pos;
          const cls =
            "rq-chip rq-picked" +
            (complete ? (isCorrect ? " correct" : " wrong") : "");
          return (
            <button
              key={`${origIdx}-${pos}`}
              className={cls}
              onClick={() => unpick(origIdx)}
              disabled={complete}
              title={complete ? "" : "クリックで戻す"}
            >
              <Furigana text={q.chunks[origIdx]} show={showFurigana} />
            </button>
          );
        })}
      </div>

      <div className="rq-pool" aria-label="選択肢">
        {remaining.map((origIdx) => (
          <button
            key={origIdx}
            className="rq-chip"
            onClick={() => pick(origIdx)}
          >
            <Furigana text={q.chunks[origIdx]} show={showFurigana} />
          </button>
        ))}
      </div>

      {complete && (
        <div className="rq-result">
          {picked.every((v, i) => v === i) ? (
            <p className="rq-verdict correct">✓ 正解です</p>
          ) : (
            <div>
              <p className="rq-verdict wrong">残念、順番が違います。</p>
              <p className="rq-correct-line">
                <span className="rq-correct-label">正解:</span>{" "}
                <Furigana text={q.chunks.join(" ")} show={showFurigana} />
              </p>
            </div>
          )}
        </div>
      )}

      <div className="rq-actions">
        {picked.length > 0 && (
          <button className="rq-btn" onClick={reset}>
            もう一度
          </button>
        )}
        {grammar && (
          <button
            className="rq-btn rq-grammar-toggle"
            onClick={() => setShowGrammar((v) => !v)}
            aria-expanded={showGrammar}
          >
            {showGrammar ? "▾ 文法を隠す" : `📘 文法 (${grammar.title})`}
          </button>
        )}
      </div>

      {grammar && showGrammar && (
        <aside className="rq-grammar">
          <h4>{grammar.title}</h4>
          {grammar.meaning_en && <p className="rq-grammar-en">{grammar.meaning_en}</p>}
          {grammar.pattern_form && (
            <p className="rq-grammar-form"><b>形:</b> {grammar.pattern_form}</p>
          )}
          <p className="rq-grammar-expl">{grammar.explanation}</p>
        </aside>
      )}
    </div>
  );
}

export function GrammarQuiz({
  questions,
  showFurigana,
}: {
  questions: RearrangeQuestion[];
  showFurigana: boolean;
}) {
  if (!questions.length) {
    return <p className="hint">この記事にはまだ文法クイズがありません。</p>;
  }
  return (
    <div className="quiz-block">
      <span className="q-badge">並び替え</span>
      {questions.map((q, i) => (
        <QuestionCard key={i} q={q} index={i} showFurigana={showFurigana} />
      ))}
    </div>
  );
}
