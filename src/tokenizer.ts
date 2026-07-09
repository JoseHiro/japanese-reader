import type { IpadicFeatures, Tokenizer } from "kuromoji";

// The prebuilt kuromoji browser bundle (loaded via a <script> tag in
// index.html) exposes a global `kuromoji`. We only import its types here.
interface KuromojiGlobal {
  builder(opt: { dicPath: string }): {
    build(
      cb: (err: Error | null, tokenizer: Tokenizer<IpadicFeatures>) => void,
    ): void;
  };
}
declare global {
  interface Window {
    kuromoji?: KuromojiGlobal;
  }
}

export interface Token {
  surface: string;
  /** Reading in hiragana (empty when kuromoji has none, e.g. punctuation). */
  reading: string;
  base: string;
  pos: string;
  /** Whether this token is a "content" word worth making interactive. */
  clickable: boolean;
  /** Whether the surface contains kanji (so furigana is meaningful). */
  hasKanji: boolean;
}

let tokenizerPromise: Promise<Tokenizer<IpadicFeatures>> | null = null;

// Dictionary files live in public/dict; BASE_URL keeps it correct on
// GitHub Pages project sites (served from /<repo>/).
const dicPath = `${import.meta.env.BASE_URL}dict/`;

function waitForKuromoji(): Promise<KuromojiGlobal> {
  if (window.kuromoji) return Promise.resolve(window.kuromoji);
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const id = setInterval(() => {
      if (window.kuromoji) {
        clearInterval(id);
        resolve(window.kuromoji);
      } else if (Date.now() - start > 10000) {
        clearInterval(id);
        reject(new Error("kuromoji script failed to load"));
      }
    }, 50);
  });
}

export function loadTokenizer(): Promise<Tokenizer<IpadicFeatures>> {
  if (!tokenizerPromise) {
    tokenizerPromise = waitForKuromoji().then(
      (k) =>
        new Promise<Tokenizer<IpadicFeatures>>((resolve, reject) => {
          k.builder({ dicPath }).build((err, tokenizer) => {
            if (err) reject(err);
            else resolve(tokenizer);
          });
        }),
    );
  }
  return tokenizerPromise;
}

const KATA_TO_HIRA_OFFSET = 0x60;

function katakanaToHiragana(input: string): string {
  let out = "";
  for (const ch of input) {
    const code = ch.charCodeAt(0);
    // Katakana block (excluding the long-vowel mark ー, which we keep as-is)
    if (code >= 0x30a1 && code <= 0x30f6) {
      out += String.fromCharCode(code - KATA_TO_HIRA_OFFSET);
    } else {
      out += ch;
    }
  }
  return out;
}

function containsKanji(input: string): boolean {
  return /[一-龯㐀-䶿]/.test(input);
}

// Parts of speech that carry meaning worth looking up. 助詞 (particles),
// 助動詞 (auxiliaries), 記号 (symbols) are skipped.
const CONTENT_POS = new Set(["名詞", "動詞", "形容詞", "副詞", "連体詞", "感動詞"]);

export function toTokens(features: IpadicFeatures[]): Token[] {
  return features.map((f) => {
    const hasKanji = containsKanji(f.surface_form);
    const reading =
      f.reading && f.reading !== "*" ? katakanaToHiragana(f.reading) : "";
    return {
      surface: f.surface_form,
      reading,
      base: f.basic_form && f.basic_form !== "*" ? f.basic_form : f.surface_form,
      pos: f.pos,
      clickable: CONTENT_POS.has(f.pos),
      hasKanji,
    };
  });
}
