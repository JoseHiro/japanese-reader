import { useMemo, useRef, useState } from "react";
import { loadTokenizer, toTokens, type Token } from "./tokenizer";

const SAMPLE = `モカの名前は、「コーヒー豆の色と似てるから『モカ』！」と、付けられた。出勤は大体8時より少し前です。大体8時半から子どもたちが登園してくるので、朝の支度を手伝ったり、声をかけたりします。`;

interface Sentence {
  tokens: Token[];
  text: string;
}

const SENTENCE_ENDERS = new Set(["。", "！", "？", "!", "?"]);

function splitSentences(tokens: Token[]): Sentence[] {
  const sentences: Sentence[] = [];
  let current: Token[] = [];
  for (const t of tokens) {
    current.push(t);
    if (SENTENCE_ENDERS.has(t.surface)) {
      sentences.push({ tokens: current, text: current.map((x) => x.surface).join("") });
      current = [];
    }
  }
  if (current.length) {
    sentences.push({ tokens: current, text: current.map((x) => x.surface).join("") });
  }
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

interface PopupState {
  token: Token;
  left: number;
  top: number;
}

export default function App() {
  const [input, setInput] = useState(SAMPLE);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [showFurigana, setShowFurigana] = useState(true);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<PopupState | null>(null);
  const readerRef = useRef<HTMLDivElement>(null);

  const wordCount = useMemo(
    () => sentences.reduce((n, s) => n + s.tokens.filter((t) => t.clickable).length, 0),
    [sentences],
  );

  async function handleRead() {
    setLoading(true);
    setPopup(null);
    try {
      const tokenizer = await loadTokenizer();
      const features = tokenizer.tokenize(input);
      setSentences(splitSentences(toTokens(features)));
    } catch (e) {
      console.error("tokenize failed", e);
      alert("解析に失敗しました。コンソールを確認してください。");
    } finally {
      setLoading(false);
    }
  }

  function openPopup(token: Token, el: HTMLElement) {
    const container = readerRef.current;
    if (!container) return;
    const cr = container.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    const width = 260;
    let left = er.left - cr.left + container.scrollLeft;
    left = Math.min(left, container.clientWidth - width);
    if (left < 0) left = 0;
    setPopup({ token, left, top: er.bottom - cr.top + container.scrollTop + 6 });
  }

  return (
    <div className="app" onClick={(e) => {
      if (!(e.target as HTMLElement).closest(".popup, .word")) setPopup(null);
    }}>
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

      <textarea
        className="input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="日本語の文章を貼り付けてください…"
        rows={4}
      />
      <div className="actions">
        <button className="primary" onClick={handleRead} disabled={loading}>
          {loading ? "解析中…" : "読む"}
        </button>
        {wordCount > 0 && <span className="meta">{wordCount} 語</span>}
      </div>

      <div className="reader" ref={readerRef}>
        {sentences.map((s, i) => (
          <span className="sentence" key={i}>
            {s.tokens.map((t, j) =>
              t.clickable ? (
                <span
                  className="word"
                  key={j}
                  onClick={(e) => openPopup(t, e.currentTarget)}
                >
                  {showFurigana && t.hasKanji && t.reading ? (
                    <ruby>
                      {t.surface}
                      <rt>{t.reading}</rt>
                    </ruby>
                  ) : (
                    t.surface
                  )}
                </span>
              ) : (
                <span key={j}>{t.surface}</span>
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
        {sentences.length === 0 && !loading && (
          <p className="hint">「読む」を押すと、文章が単語ごとに解析されます。</p>
        )}

        {popup && (
          <div className="popup" style={{ left: popup.left, top: popup.top }}>
            <div className="popup-head">
              <span className="popup-tag">辞書</span>
              <button className="popup-close" aria-label="閉じる" onClick={() => setPopup(null)}>
                ×
              </button>
            </div>
            <div className="popup-body">
              <div className="popup-word">
                <span className="pw">{popup.token.base}</span>
                {popup.token.reading && <span className="pr">{popup.token.reading}</span>}
              </div>
              <p className="pos">{popup.token.pos}</p>
              <div className="popup-actions">
                <button onClick={() => speak(popup.token.base)}>▶ 読み上げ</button>
                <a
                  href={`https://jisho.org/search/${encodeURIComponent(popup.token.base)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Jisho で意味を見る
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="footer">
        単語をクリックで詳細・文末の ▶ で読み上げ。英語の語義（JMdict）は次の段階で追加します。
      </footer>
    </div>
  );
}
