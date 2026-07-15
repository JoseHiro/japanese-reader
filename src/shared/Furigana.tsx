import { useEffect, useState } from "react";
import { loadTokenizer, toTokens, type Token } from "../tokenizer";

// Renders an arbitrary Japanese string with furigana. Falls back to plain
// text until the tokenizer is ready, and honors a `show` toggle. Shared
// across the reader, quizzes, and word list.
export function Furigana({ text, show }: { text: string; show: boolean }) {
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
