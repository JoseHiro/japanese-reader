import { useMemo, useState } from "react";
import { Furigana } from "./shared/Furigana";
import type { VocabItem } from "./vocabulary";
import { vocabByMonth } from "./vocabulary";

// English → Japanese flashcards, drawn from a user's monthly vocab pool.
// The card shows the English gloss first (production practice) and the
// Japanese is hidden until the learner clicks 表示. Each session shuffles
// the deck for a chosen month (or "すべて"). No SRS yet — just deliberate
// review with a self-scored ◯ / △ / × counter so the learner can see how
// many of the batch they knew this run.

type Grade = "known" | "shaky" | "unknown";

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP";
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

export function Flashcards({
  pool,
  showFurigana,
}: {
  pool: VocabItem[];
  showFurigana: boolean;
}) {
  const months = useMemo(() => vocabByMonth(pool), [pool]);
  const [selectedMonth, setSelectedMonth] = useState<string>("__all");
  const [deck, setDeck] = useState<VocabItem[]>(() => shuffle(pool));
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [grades, setGrades] = useState<Record<string, Grade>>({});

  function activePool(): VocabItem[] {
    if (selectedMonth === "__all") return pool;
    const m = months.find((mm) => mm.month === selectedMonth);
    return m?.items ?? [];
  }

  function pickMonth(m: string) {
    setSelectedMonth(m);
    const next = m === "__all" ? pool : months.find((mm) => mm.month === m)?.items ?? [];
    setDeck(shuffle(next));
    setI(0);
    setRevealed(false);
    setGrades({});
  }

  function reshuffle() {
    setDeck(shuffle(activePool()));
    setI(0);
    setRevealed(false);
    setGrades({});
  }

  function grade(g: Grade) {
    const card = deck[i];
    if (!card) return;
    setGrades((prev) => ({ ...prev, [card.word]: g }));
    if (i + 1 < deck.length) {
      setI(i + 1);
      setRevealed(false);
    } else {
      setI(deck.length);
    }
  }

  function restart() {
    setDeck(shuffle(activePool()));
    setI(0);
    setRevealed(false);
    setGrades({});
  }

  function retryWeak() {
    // Filter down to just the shaky / unknown from this round. If nothing
    // was flagged (all 知ってた), the button doesn't render, so this is a
    // safe deck source.
    const next = deck.filter(
      (c) => grades[c.word] === "shaky" || grades[c.word] === "unknown",
    );
    if (!next.length) return;
    setDeck(shuffle(next));
    setI(0);
    setRevealed(false);
    setGrades({});
  }

  if (!pool.length) {
    return <p className="hint">単語プールがまだ空です。</p>;
  }

  const done = i >= deck.length;
  const card = deck[i];
  const total = deck.length;

  const summary = {
    known: Object.values(grades).filter((g) => g === "known").length,
    shaky: Object.values(grades).filter((g) => g === "shaky").length,
    unknown: Object.values(grades).filter((g) => g === "unknown").length,
  };

  return (
    <div className="fc-root">
      <div className="fc-toolbar">
        <label className="fc-month-label">
          月:
          <select
            value={selectedMonth}
            onChange={(e) => pickMonth(e.target.value)}
            className="fc-select"
          >
            <option value="__all">すべて ({pool.length})</option>
            {months.map((m) => (
              <option key={m.month || "misc"} value={m.month || ""}>
                {m.month || "その他"} ({m.items.length})
              </option>
            ))}
          </select>
        </label>
        <button className="fc-btn" onClick={reshuffle}>🔀 シャッフル</button>
      </div>

      {!done && card && (
        <div className="fc-card">
          <div className="fc-progress">
            {i + 1} / {total}
          </div>
          <p className="fc-en">{card.meaningEn}</p>
          {card.pos && <p className="fc-pos">{card.pos}</p>}

          {!revealed ? (
            <div className="fc-controls">
              <button
                className="fc-reveal"
                onClick={() => setRevealed(true)}
              >
                日本語を表示
              </button>
            </div>
          ) : (
            <>
              <div className="fc-ja">
                <Furigana text={card.word} show={showFurigana} />
                <span className="fc-reading">【{card.reading}】</span>
                <button
                  className="fc-speak"
                  onClick={() => speak(card.word)}
                  title="読み上げ"
                  aria-label="日本語を読み上げる"
                >
                  ▶
                </button>
              </div>
              {card.note && <p className="fc-note">{card.note}</p>}
              <div className="fc-grade-row">
                <button
                  className="fc-grade fc-grade-known"
                  onClick={() => grade("known")}
                >
                  ◯ 知ってた
                </button>
                <button
                  className="fc-grade fc-grade-shaky"
                  onClick={() => grade("shaky")}
                >
                  △ 微妙
                </button>
                <button
                  className="fc-grade fc-grade-unknown"
                  onClick={() => grade("unknown")}
                >
                  × 覚えてない
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {done && (
        <div className="fc-card fc-done">
          <h3>お疲れさま！</h3>
          <p className="fc-summary">
            全 {total} 枚 —{" "}
            <span className="fc-tally-known">◯ {summary.known}</span> ・{" "}
            <span className="fc-tally-shaky">△ {summary.shaky}</span> ・{" "}
            <span className="fc-tally-unknown">× {summary.unknown}</span>
          </p>
          {summary.unknown + summary.shaky > 0 && (
            <p className="fc-hint-line">
              覚えてない単語:{" "}
              {deck
                .filter((c) => grades[c.word] === "unknown" || grades[c.word] === "shaky")
                .map((c) => c.word)
                .join("、")}
            </p>
          )}
          <div className="fc-done-actions">
            {summary.shaky + summary.unknown > 0 && (
              <button className="fc-btn fc-primary" onClick={retryWeak}>
                覚えてないのだけもう一度 ({summary.shaky + summary.unknown})
              </button>
            )}
            <button
              className={
                "fc-btn" +
                (summary.shaky + summary.unknown === 0 ? " fc-primary" : "")
              }
              onClick={restart}
            >
              全部もう一度
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
