// Grammar reference for 『上級へのとびら』 (Tobira: Gateway to Advanced
// Japanese). Data was scraped from
// https://sethclydesdale.github.io/tobira-study-resources/lessons/appendix/grammar-index/
// and bundled at build time; there's no runtime fetch.
import raw from "./data/tobira-grammar.json";

export interface TobiraGrammar {
  /** Position in the chapter, 1-indexed. */
  n: number;
  /** Grammar pattern, e.g. "～ば～ほど". */
  title: string;
  /** Short English gloss (may be empty for descriptive patterns). */
  meaning_en: string;
  /** Full English explanation from the textbook. */
  explanation: string;
  /** Connection form, e.g. "V/A-plain + ば, V/A-plain + ほど". */
  pattern_form: string;
}

export interface TobiraLesson {
  /** Chapter number, 1..15. */
  lesson: number;
  /** Chapter title in Japanese. */
  title: string;
  grammar: TobiraGrammar[];
}

type RawFile = Record<string, { title: string; grammar: TobiraGrammar[] }>;

export const TOBIRA_LESSONS: TobiraLesson[] = Object.entries(raw as RawFile)
  .map(([k, v]) => ({ lesson: Number(k), title: v.title, grammar: v.grammar }))
  .sort((a, b) => a.lesson - b.lesson);

/** "tobira-5-10" -> the grammar at Lesson 5, item 10. */
export function grammarByKey(key: string): TobiraGrammar | undefined {
  const m = /^tobira-(\d+)-(\d+)$/.exec(key);
  if (!m) return undefined;
  const lesson = TOBIRA_LESSONS.find((l) => l.lesson === Number(m[1]));
  return lesson?.grammar.find((g) => g.n === Number(m[2]));
}

export function grammarKey(lesson: number, n: number): string {
  return `tobira-${lesson}-${n}`;
}

export function lessonById(lesson: number): TobiraLesson | undefined {
  return TOBIRA_LESSONS.find((l) => l.lesson === lesson);
}

export const TOBIRA_SOURCE = {
  name: "上級へのとびら (Tobira: Gateway to Advanced Japanese)",
  url: "https://sethclydesdale.github.io/tobira-study-resources/lessons/appendix/grammar-index/",
};
