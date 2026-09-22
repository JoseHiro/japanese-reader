import { useEffect, useState } from "react";
import { loadTokenizer, toTokens, type Token } from "../tokenizer";
import { useReadingOverrides } from "./readingOverrides";

const KANJI_RE = /[一-鿿]/;
const MAX_OVERRIDE_SPAN = 4;

// Combine consecutive kuromoji tokens into a single "chip" when they
// together match an authored reading override (typically a name or
// compound kuromoji misreads). Non-matching tokens pass through
// individually with their kuromoji reading.
function groupWithOverrides(
  tokens: Token[],
  overrides: Record<string, string>,
): { surface: string; reading: string; hasKanji: boolean }[] {
  const chips: { surface: string; reading: string; hasKanji: boolean }[] = [];
  const hasOverrides = Object.keys(overrides).length > 0;
  let i = 0;
  while (i < tokens.length) {
    let matched: { len: number; surface: string; reading: string } | null = null;
    if (hasOverrides) {
      const maxLen = Math.min(MAX_OVERRIDE_SPAN, tokens.length - i);
      for (let len = maxLen; len >= 1; len--) {
        const surface = tokens
          .slice(i, i + len)
          .map((t) => t.surface)
          .join("");
        if (overrides[surface]) {
          matched = { len, surface, reading: overrides[surface] };
          break;
        }
      }
    }
    if (matched) {
      chips.push({
        surface: matched.surface,
        reading: matched.reading,
        hasKanji: KANJI_RE.test(matched.surface),
      });
      i += matched.len;
    } else {
      const t = tokens[i];
      chips.push({ surface: t.surface, reading: t.reading, hasKanji: t.hasKanji });
      i += 1;
    }
  }
  return chips;
}

// Renders an arbitrary Japanese string with furigana. Falls back to plain
// text until the tokenizer is ready, and honors a `show` toggle. Shared
// across the reader, quizzes, and word list. Reading overrides from the
// enclosing article (via ReadingOverridesContext) win over kuromoji's
// default reading — used to fix names / compounds like 錦織.
export function Furigana({ text, show }: { text: string; show: boolean }) {
  const [tokens, setTokens] = useState<Token[] | null>(null);
  const overrides = useReadingOverrides();
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
  const chips = groupWithOverrides(tokens, overrides);
  return (
    <>
      {chips.map((c, k) =>
        show && c.hasKanji && c.reading ? (
          <ruby key={k}>
            {c.surface}
            <rt>{c.reading}</rt>
          </ruby>
        ) : (
          <span key={k}>{c.surface}</span>
        ),
      )}
    </>
  );
}
