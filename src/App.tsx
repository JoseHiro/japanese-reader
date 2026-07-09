import { useMemo, useRef, useState } from "react";
import { loadTokenizer, toTokens, type Token } from "./tokenizer";

const SAMPLE = `子どもたちと過ごす日々
出勤は大体8時より少し前です。大体8時半から子どもたちが登園してくるので、朝の支度を手伝ったり、声をかけたりします。9時半過ぎにクラスの全員がそろうので、そこからトイレや手洗いなどをうながし、10時前後から一斉の活動が始まります。出欠を取ったり、その日のお当番を決めたりした後、図画工作などの「製作」やプール、体操などの主活動に入ります。12時から給食の準備が始まり、13時ごろまで給食の時間です。午後は天気がよければ外で、悪ければ室内で子どもたちと遊びます。13時半から帰りの準備が始まり、子どもたちに絵本や紙芝居を読んで、13時45分には子どもたちは降園となります。ただ、通園バスに乗って帰る子と保護者がお迎えに来る子たちの時間がバラバラなので、全員帰るのは大体14時45分です。全員が降園するまでは子どもたちと室内で遊んだりして過ごし、預かり保育の子は昼間とは別の先生が担当しますので、そこで交代になります。
子どもたちが帰った後は、園舎や部屋の掃除をして、その日の日誌を書きます。16時ぐらいに終礼があり、終わったら同じ学年の先生と打ち合わせや準備をして、17時15分に退勤します。
土日祝日と、夏休み、春休み、冬休みなどの長期休みは幼稚園も基本的にはお休みですが、預かり保育を希望するご家庭もあるので、先生たちは交代で出勤します。`;

type Paragraph = Sentence[];

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
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [showFurigana, setShowFurigana] = useState(true);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<PopupState | null>(null);
  const readerRef = useRef<HTMLDivElement>(null);

  const wordCount = useMemo(
    () =>
      paragraphs
        .flat()
        .reduce((n, s) => n + s.tokens.filter((t) => t.clickable).length, 0),
    [paragraphs],
  );

  async function handleRead() {
    setLoading(true);
    setPopup(null);
    try {
      const tokenizer = await loadTokenizer();
      const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const result = lines.map((line) =>
        splitSentences(toTokens(tokenizer.tokenize(line))),
      );
      setParagraphs(result);
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
        rows={6}
      />
      <div className="actions">
        <button className="primary" onClick={handleRead} disabled={loading}>
          {loading ? "解析中…" : "読む"}
        </button>
        {wordCount > 0 && <span className="meta">{wordCount} 語</span>}
      </div>

      <div className="reader" ref={readerRef}>
        {paragraphs.map((sents, pi) => (
          <p className="para" key={pi}>
            {sents.map((s, i) => (
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
          </p>
        ))}
        {paragraphs.length === 0 && !loading && (
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
