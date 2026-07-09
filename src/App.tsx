import { useMemo, useRef, useState } from "react";
import { loadTokenizer, toTokens, type Token } from "./tokenizer";
import { buildUnits, type Unit } from "./units";
import { ARTICLES, type Annotation, type Article } from "./content";

interface Sentence {
  units: Unit[];
  text: string;
}
type Paragraph = Sentence[];

const SENTENCE_ENDERS = new Set(["。", "！", "？", "!", "?"]);

function splitIntoSentences(tokens: Token[]): { tokens: Token[]; text: string }[] {
  const sentences: { tokens: Token[]; text: string }[] = [];
  let current: Token[] = [];
  const flush = () => {
    if (current.length) {
      sentences.push({ tokens: current, text: current.map((x) => x.surface).join("") });
      current = [];
    }
  };
  for (const t of tokens) {
    current.push(t);
    if (SENTENCE_ENDERS.has(t.surface)) flush();
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

export default function App() {
  const [input, setInput] = useState("");
  const [article, setArticle] = useState<Article | null>(null);
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [showFurigana, setShowFurigana] = useState(true);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<PopupState | null>(null);
  const readerRef = useRef<HTMLDivElement>(null);

  const counts = useMemo(() => {
    const units = paragraphs.flat().flatMap((s) => s.units);
    return {
      words: units.filter((u) => u.clickable).length,
      annotated: units.filter((u) => u.annotation).length,
    };
  }, [paragraphs]);

  async function analyze(text: string, annotations: Record<string, Annotation>) {
    setLoading(true);
    setPopup(null);
    try {
      const tokenizer = await loadTokenizer();
      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const result: Paragraph[] = lines.map((line) =>
        splitIntoSentences(toTokens(tokenizer.tokenize(line))).map((s) => ({
          units: buildUnits(s.tokens, annotations),
          text: s.text,
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

  function loadArticle(a: Article) {
    setArticle(a);
    setInput(a.text);
    analyze(a.text, a.annotations);
  }

  function readPaste() {
    setArticle(null);
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
        {paragraphs.map((sents, pi) => (
          <p className="para" key={pi}>
            {sents.map((s, i) => (
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
                <button
                  className="speak-btn"
                  title="読み上げ"
                  aria-label="この文を読み上げる"
                  onClick={() => speak(s.text)}
                >
                  ▶
                </button>{" "}
              </span>
            ))}
          </p>
        ))}
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
              ) : null}

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

      <footer className="footer">
        単語をクリックで詳細・文末の ▶ で読み上げ。色の濃い単語には解説が付いています。
      </footer>
    </div>
  );
}
