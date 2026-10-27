import { useRef, useState } from "react";
import type { ParticleQuestion } from "./content";
import { Choice, Choices } from "./shared/Choice";
import { Furigana } from "./shared/Furigana";
import { parseParticleText, particleChoices } from "./particles";

// 助詞 quiz. Each sentence has several particles blanked out. The learner
// taps a blank (the first empty one is selected automatically), then a
// particle chip to fill it; once every blank is filled, 答え合わせ grades
// all of them at once.

function QuestionCard({
  q,
  number,
  showFurigana,
  onCheck,
}: {
  q: ParticleQuestion;
  number: number;
  showFurigana: boolean;
  /** Fired each time the learner grades the card. */
  onCheck: (correct: boolean, fills: string[]) => void;
}) {
  const { segments, answers } = parseParticleText(q.text);
  const choices = particleChoices(answers);
  // Fills and the selected blank live together so rapid taps always build
  // on the latest state (each tap fills one blank, then moves on).
  const [state, setState] = useState<{ fills: (string | null)[]; active: number }>(() => ({
    fills: answers.map(() => null),
    active: 0,
  }));
  const { fills, active } = state;
  const [checked, setChecked] = useState(false);

  const allFilled = fills.every((f) => f !== null);
  const allCorrect = fills.every((f, i) => f === answers[i]);

  function fill(p: string) {
    if (checked) return;
    setState(({ fills, active }) => {
      const next = fills.map((f, i) => (i === active ? p : f));
      // Move on to the next empty blank (wrapping), or stay if none are left.
      const empty = [...next.keys()].filter((i) => next[i] === null);
      const nextEmpty = empty.find((i) => i > active) ?? empty[0];
      return { fills: next, active: nextEmpty ?? active };
    });
  }
  function select(i: number) {
    setState((s) => ({ ...s, active: i }));
  }
  function check() {
    setChecked(true);
    onCheck(allCorrect, fills.map((f) => f ?? ""));
  }
  function reset() {
    setState({ fills: answers.map(() => null), active: 0 });
    setChecked(false);
  }

  return (
    <div className="quiz-card">
      <div className="q-row">
        <span className="q-num">{number}</span>
        <div>
          {q.translation && <p className="rq-en">{q.translation}</p>}
          <p className="cloze-sentence pq-sentence">
            {segments.map((seg, i) => (
              <span key={i}>
                <Furigana text={seg} show={showFurigana} />
                {i < answers.length && (
                  <button
                    className={
                      "pq-blank" +
                      (!checked && i === active ? " active" : "") +
                      (checked ? (fills[i] === answers[i] ? " correct" : " wrong") : "")
                    }
                    onClick={() => !checked && select(i)}
                    disabled={checked}
                    aria-label={`空欄 ${i + 1}`}
                  >
                    {fills[i] ?? "　"}
                  </button>
                )}
              </span>
            ))}
          </p>
        </div>
      </div>

      <Choices label="助詞">
        {choices.map((p) => (
          <Choice key={p} className="pq-chip" onClick={() => fill(p)} disabled={checked}>
            {p}
          </Choice>
        ))}
      </Choices>

      {checked && (
        <div className="rq-result">
          {allCorrect ? (
            <p className="rq-verdict correct">✓ 正解です</p>
          ) : (
            <div>
              <p className="rq-verdict wrong">
                残念、{fills.filter((f, i) => f !== answers[i]).length}か所違います。
              </p>
              <p className="rq-correct-line">
                <span className="rq-correct-label">正解:</span>{" "}
                {segments.map((seg, i) => (
                  <span key={i}>
                    <Furigana text={seg} show={showFurigana} />
                    {i < answers.length && <span className="pq-answer">{answers[i]}</span>}
                  </span>
                ))}
              </p>
            </div>
          )}
          {q.explanation && (
            <p className="explain">
              <Furigana text={q.explanation} show={showFurigana} />
            </p>
          )}
        </div>
      )}

      <div className="rq-actions">
        {!checked && (
          <button className="reveal-btn" onClick={check} disabled={!allFilled}>
            答え合わせ
          </button>
        )}
        {checked && (
          <button className="rq-btn" onClick={reset}>
            もう一度
          </button>
        )}
      </div>
    </div>
  );
}

export function ParticleQuiz({
  questions,
  numbers,
  showFurigana,
  onAllComplete,
  onResult,
  badgeLabel,
}: {
  questions: ParticleQuestion[];
  /** Displayed numbers per question (defaults to 1..n); review mode passes the originals. */
  numbers?: number[];
  showFurigana: boolean;
  /** Fired once when every question has been graded at least once. */
  onAllComplete?: () => void;
  /** Fired each time a card is graded; `index` is its position in `questions`. */
  onResult?: (index: number, correct: boolean, fills: string[]) => void;
  badgeLabel?: string;
}) {
  const checkedRef = useRef<Set<number>>(new Set());
  const firedAllRef = useRef(false);
  if (!questions.length) {
    return <p className="hint">この記事にはまだ助詞クイズがありません。</p>;
  }
  return (
    <div className="quiz-block">
      <span className="q-badge">{badgeLabel ?? "助詞穴埋め"}</span>
      {questions.map((q, i) => (
        <QuestionCard
          key={i}
          q={q}
          number={numbers?.[i] ?? i + 1}
          showFurigana={showFurigana}
          onCheck={(correct, fills) => {
            onResult?.(i, correct, fills);
            checkedRef.current.add(i);
            if (!firedAllRef.current && checkedRef.current.size >= questions.length) {
              firedAllRef.current = true;
              onAllComplete?.();
            }
          }}
        />
      ))}
    </div>
  );
}
