import { useEffect, useMemo, useRef, useState } from "react";
import { loadTokenizer, toTokens, type Token } from "./tokenizer";
import { buildUnits, type Unit } from "./units";
import { ARTICLES, type Annotation, type Article } from "./content";
import { lookupGlosses } from "./dictionary";

interface Sentence {
  units: Unit[];
  text: string;
  translation?: string;
}
type Paragraph = Sentence[];

const SENTENCE_ENDERS = new Set(["。", "！", "？", "!", "?"]);

function splitIntoSentences(tokens: Token[]): { tokens: Token[]; text: string }[] {
  const sentences: { tokens: Token[]; text: string }[] = [];
  let current: Token[] = [];
  let quoteDepth = 0;
  const flush = () => {
    if (current.length) {
      sentences.push({ tokens: current, text: current.map((x) => x.surface).join("") });
      current = [];
    }
  };
  for (const t of tokens) {
    current.push(t);
    if (t.surface === "「" || t.surface === "『") quoteDepth++;
    else if (t.surface === "」" || t.surface === "』") quoteDepth = Math.max(0, quoteDepth - 1);
    // Only end a sentence on 。！？ when not inside quotes, so lines like
    // 「今年もやりきった！」 stay in one sentence.
    else if (quoteDepth === 0 && SENTENCE_ENDERS.has(t.surface)) flush();
  }
  flush();
  return sentences;
}

function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP";
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

function unitReading(unit: Unit): string {
  if (unit.annotation?.reading) return unit.annotation.reading;
  return unit.tokens.map((t) => t.reading).join("");
}

interface PopupState {
  unit: Unit;
  left: number;
  top: number;
}

// Renders an arbitrary Japanese string with furigana (used for quiz text,
// which isn't part of the tokenized reader). Falls back to plain text until
// the tokenizer is ready, and honors the global furigana toggle via `show`.
function Furigana({ text, show }: { text: string; show: boolean }) {
  const [tokens, setTokens] = useState<Token[] | null>(null);
  useEffect(() => {
    let alive = true;
    loadTokenizer().then((tk) => {
      if (alive) setTokens(toTokens(tk.tokenize(text)));
    });
    return () => {
      alive = false;
    };
  }, [text]);
  if (!tokens) return <>{text}</>;
  return (
    <>
      {tokens.map((t, k) =>
        show && t.hasKanji && t.reading ? (
          <ruby key={k}>
            {t.surface}
            <rt>{t.reading}</rt>
          </ruby>
        ) : (
          <span key={k}>{t.surface}</span>
        ),
      )}
    </>
  );
}

export default function App() {
  const [input, setInput] = useState("");
  const [article, setArticle] = useState<Article | null>(null);
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [showFurigana, setShowFurigana] = useState(true);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<PopupState | null>(null);
  const [glosses, setGlosses] = useState<"loading" | string[] | null>(null);
  const lookupSeq = useRef(0);
  const [shownTr, setShownTr] = useState<Set<string>>(new Set());
  const [headings, setHeadings] = useState<Set<string>>(new Set());
  const [clozePick, setClozePick] = useState<Record<number, number>>({});
  const [readReveal, setReadReveal] = useState<Set<number>>(new Set());
  const readerRef = useRef<HTMLDivElement>(null);

  function toggleTranslation(key: string) {
    setShownTr((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const counts = useMemo(() => {
    const units = paragraphs.flat().flatMap((s) => s.units);
    return {
      words: units.filter((u) => u.clickable).length,
      annotated: units.filter((u) => u.annotation).length,
    };
  }, [paragraphs]);

  async function analyze(
    text: string,
    annotations: Record<string, Annotation>,
    translations?: Record<string, string>,
  ) {
    setLoading(true);
    setPopup(null);
    setShownTr(new Set());
    try {
      const tokenizer = await loadTokenizer();
      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const result: Paragraph[] = lines.map((line) =>
        splitIntoSentences(toTokens(tokenizer.tokenize(line))).map((s) => ({
          units: buildUnits(s.tokens, annotations),
          text: s.text,
          translation: translations?.[s.text],
        })),
      );
      setParagraphs(result);
    } catch (e) {
      console.error("tokenize failed", e);
      alert("解析に失敗しました。コンソールを確認してください。");
    } finally {
      setLoading(false);
    }
  }

  function resetQuiz() {
    setClozePick({});
    setReadReveal(new Set());
  }

  function loadArticle(a: Article) {
    setArticle(a);
    setInput(a.text);
    setHeadings(new Set(a.headings ?? []));
    resetQuiz();
    analyze(a.text, a.annotations, a.translations);
  }

  function readPaste() {
    setArticle(null);
    setHeadings(new Set());
    resetQuiz();
    analyze(input, {});
  }

  function openPopup(unit: Unit, el: HTMLElement) {
    const container = readerRef.current;
    if (!container) return;
    const cr = container.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    const width = 268;
    let left = er.left - cr.left + container.scrollLeft;
    left = Math.min(left, container.clientWidth - width);
    if (left < 0) left = 0;
    setPopup({ unit, left, top: er.bottom - cr.top + container.scrollTop + 6 });

    // Authored words show their annotation; look up everything else in JMdict.
    const seq = ++lookupSeq.current;
    if (unit.annotation) {
      setGlosses(null);
      return;
    }
    setGlosses("loading");
    lookupGlosses(unit.key, unit.surface, unitReading(unit))
      .then((g) => {
        if (lookupSeq.current === seq) setGlosses(g);
      })
      .catch(() => {
        if (lookupSeq.current === seq) setGlosses(null);
      });
  }

  const renderTokens = (tokens: Token[]) =>
    tokens.map((t, k) =>
      showFurigana && t.hasKanji && t.reading ? (
        <ruby key={k}>
          {t.surface}
          <rt>{t.reading}</rt>
        </ruby>
      ) : (
        <span key={k}>{t.surface}</span>
      ),
    );

  return (
    <div
      className="app"
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest(".popup, .word")) setPopup(null);
      }}
    >
      <header className="header">
        <div className="brand">
          <span className="logo">読</span>
          <div>
            <h1>Yomu</h1>
            <p>日本語リーダー</p>
          </div>
        </div>
        <label className="toggle">
          振り仮名
          <input
            type="checkbox"
            checked={showFurigana}
            onChange={(e) => setShowFurigana(e.target.checked)}
          />
          <span className="switch" aria-hidden />
        </label>
      </header>

      <div className="source-group">
        <span className="source-label">記事から読む</span>
        <div className="chips">
          {ARTICLES.map((a) => (
            <button
              key={a.id}
              className={"chip" + (article?.id === a.id ? " active" : "")}
              onClick={() => loadArticle(a)}
            >
              {a.title}
            </button>
          ))}
        </div>
      </div>

      <div className="source-group">
        <span className="source-label">自分の文章を読む</span>
        <textarea
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="日本語の文章を貼り付けてください…"
          rows={5}
        />
        <div className="actions">
          <button className="primary" onClick={readPaste} disabled={loading || !input.trim()}>
            {loading ? "解析中…" : "読む"}
          </button>
          {counts.words > 0 && (
            <span className="meta">
              {counts.words} 語
              {counts.annotated > 0 && ` ・ 注釈 ${counts.annotated}`}
            </span>
          )}
        </div>
      </div>

      {article && (
        <div className="article-head">
          <h2>{article.title}</h2>
          {article.subtitle && <p>{article.subtitle}</p>}
        </div>
      )}

      <div className="reader" ref={readerRef}>
        {paragraphs.map((sents, pi) => {
          const paraText = sents.map((s) => s.text).join("");
          const isHeading = headings.has(paraText);
          return (
            <p className={"para" + (isHeading ? " heading" : "")} key={pi}>
              {sents.map((s, i) => {
                const trKey = `${pi}:${i}`;
                const trShown = shownTr.has(trKey);
                return (
                  <span className="sentence" key={i}>
                    {s.units.map((u, j) =>
                      u.clickable ? (
                        <span
                          className={"word" + (u.annotation ? " annotated" : "")}
                          key={j}
                          onClick={(e) => openPopup(u, e.currentTarget)}
                        >
                          {renderTokens(u.tokens)}
                        </span>
                      ) : (
                        <span key={j}>{renderTokens(u.tokens)}</span>
                      ),
                    )}
                    {!isHeading && (
                      <span className="sent-tools">
                        <button
                          className="speak-btn"
                          title="読み上げ"
                          aria-label="この文を読み上げる"
                          onClick={() => speak(s.text)}
                        >
                          ▶
                        </button>
                        {s.translation && (
                          <button
                            className={"tr-btn" + (trShown ? " on" : "")}
                            title="英訳"
                            aria-label="この文の英訳を表示"
                            aria-pressed={trShown}
                            onClick={() => toggleTranslation(trKey)}
                          >
                            訳
                          </button>
                        )}
                      </span>
                    )}{" "}
                    {s.translation && trShown && (
                      <span className="translation">{s.translation}</span>
                    )}
                  </span>
                );
              })}
            </p>
          );
        })}
        {paragraphs.length === 0 && !loading && (
          <p className="hint">
            上の記事を選ぶか、文章を貼って「読む」を押すと、単語ごとに解析されます。
          </p>
        )}

        {popup && (
          <div className="popup" style={{ left: popup.left, top: popup.top }}>
            <div className={"popup-head" + (popup.unit.annotation ? " authored" : "")}>
              <span className="popup-tag">
                {popup.unit.annotation ? "解説" : "辞書"}
              </span>
              <button className="popup-close" aria-label="閉じる" onClick={() => setPopup(null)}>
                ×
              </button>
            </div>
            <div className="popup-body">
              <div className="popup-word">
                <span className="pw">{popup.unit.key}</span>
                {unitReading(popup.unit) && (
                  <span className="pr">{unitReading(popup.unit)}</span>
                )}
              </div>
              <p className="pos">{popup.unit.pos}</p>

              {popup.unit.annotation ? (
                <>
                  <p className="meaning">{popup.unit.annotation.meaning}</p>
                  {popup.unit.annotation.note && (
                    <p className="note">{popup.unit.annotation.note}</p>
                  )}
                  {popup.unit.annotation.examples?.map((ex, k) => (
                    <p className="example" key={k}>
                      <span className="ex-ja">{ex.ja}</span>
                      <span className="ex-en">{ex.en}</span>
                    </p>
                  ))}
                </>
              ) : glosses === "loading" ? (
                <p className="meaning dim">辞書を読み込み中…</p>
              ) : glosses && glosses.length ? (
                <p className="meaning">{glosses.join("; ")}</p>
              ) : (
                <p className="meaning dim">辞書に登録がありません</p>
              )}

              <div className="popup-actions">
                <button onClick={() => speak(popup.unit.surface)}>▶ 読み上げ</button>
                <a
                  href={`https://jisho.org/search/${encodeURIComponent(popup.unit.key)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Jisho で見る
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {article?.quiz && (
        <section className="quiz">
          <h2 className="quiz-title">クイズ</h2>

          {article.quiz.cloze && article.quiz.cloze.length > 0 && (
            <div className="quiz-block">
              <span className="q-badge">穴埋め単語</span>
              {article.quiz.cloze.map((q, qi) => {
                const picked = clozePick[qi];
                const answered = picked !== undefined;
                return (
                  <div className="quiz-card" key={qi}>
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
                    <div className="opts">
                      {q.options.map((opt, oi) => {
                        let cls = "opt";
                        if (answered && oi === q.answer) cls += " correct";
                        else if (answered && oi === picked) cls += " wrong";
                        return (
                          <button
                            key={oi}
                            className={cls}
                            disabled={answered}
                            onClick={() => setClozePick((p) => ({ ...p, [qi]: oi }))}
                          >
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
                  </div>
                );
              })}
            </div>
          )}

          {article.quiz.reading && article.quiz.reading.length > 0 && (
            <div className="quiz-block">
              <span className="q-badge">読解</span>
              {article.quiz.reading.map((q, qi) => {
                const shown = readReveal.has(qi);
                return (
                  <div className="quiz-card" key={qi}>
                    <p className="q-text">
                      <Furigana text={q.question} show={showFurigana} />
                    </p>
                    <button
                      className="reveal-btn"
                      aria-expanded={shown}
                      onClick={() =>
                        setReadReveal((s) => {
                          const n = new Set(s);
                          if (n.has(qi)) n.delete(qi);
                          else n.add(qi);
                          return n;
                        })
                      }
                    >
                      {shown ? "解答を隠す" : "解答を見る"}
                    </button>
                    {shown && (
                      <p className="model-answer">
                        <Furigana text={q.answer} show={showFurigana} />
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      <footer className="footer">
        単語をクリックで詳細・文末の ▶ で読み上げ・訳。色の濃い単語には解説、記事にはクイズが付きます。
      </footer>
    </div>
  );
}
