import { useState } from "react";
import { Furigana } from "./shared/Furigana";
import type { Unit } from "./units";

// English -> Japanese production practice for Shaun's articles.
// For every sentence that has an authored English translation, show the
// English and hide the Japanese behind a reveal button.

interface Sentence {
  units: Unit[];
  text: string;
  translation?: string;
}
type Paragraph = Sentence[];

function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP";
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

function TranslateCard({
  number,
  sentence,
  showFurigana,
}: {
  number: number;
  sentence: Sentence;
  showFurigana: boolean;
}) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className={"tr-card" + (revealed ? " revealed" : "")}>
      <div className="tr-head">
        <span className="tr-num">{number}</span>
        <p className="tr-en">{sentence.translation}</p>
      </div>
      <div className="tr-controls">
        <button
          className="tr-reveal"
          onClick={() => setRevealed((v) => !v)}
        >
          {revealed ? "日本語を隠す" : "日本語を表示"}
        </button>
        {revealed && (
          <button
            className="tr-speak"
            onClick={() => speak(sentence.text)}
            title="読み上げ"
            aria-label="日本語を読み上げる"
          >
            ▶
          </button>
        )}
      </div>
      {revealed && (
        <p className="tr-ja">
          <Furigana text={sentence.text} show={showFurigana} />
        </p>
      )}
    </div>
  );
}

export function ArticleTranslate({
  paragraphs,
  showFurigana,
}: {
  paragraphs: Paragraph[];
  showFurigana: boolean;
}) {
  const sentences = paragraphs.flat().filter((s) => s.translation);
  if (paragraphs.length === 0) {
    return <p className="hint">左の記事を選ぶと、翻訳練習ができます。</p>;
  }
  if (sentences.length === 0) {
    return (
      <p className="hint">
        この記事にはまだ英訳がありません。
      </p>
    );
  }
  return (
    <div className="tr-practice">
      <p className="tr-intro">
        英語の文を見て、日本語で言えるか試しましょう。答えを見て確認できます。
        <br />
        <span className="tr-intro-sub">
          Read the English, say it in Japanese, then reveal to check.
        </span>
      </p>
      <div className="tr-list">
        {sentences.map((s, i) => (
          <TranslateCard
            key={i}
            number={i + 1}
            sentence={s}
            showFurigana={showFurigana}
          />
        ))}
      </div>
    </div>
  );
}
