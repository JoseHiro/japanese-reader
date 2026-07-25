// JLPT grammar list, shared across all users. Data is scraped from
// jlptgrammarlist.neocities.org (see scripts/scrape-grammar.mjs) and
// bundled at build time; there's no runtime fetch.
import raw from "./data/grammar.json";

export type JLPTLevel = "N5" | "N4" | "N3" | "N2" | "N1";

export interface GrammarEntry {
  level: JLPTLevel;
  /** Headword / grammar point (may include disambiguating "(1)"). */
  term: string;
  /** Short English gloss. */
  meaning: string;
  /** Example sentence in Japanese (may be empty). */
  example: string;
  /** Translation of the example (may be empty). */
  englishExample: string;
}

export const GRAMMAR: GrammarEntry[] = raw as GrammarEntry[];

export const GRAMMAR_LEVELS: JLPTLevel[] = ["N5", "N4", "N3", "N2", "N1"];

export function grammarByLevel(level: JLPTLevel): GrammarEntry[] {
  return GRAMMAR.filter((g) => g.level === level);
}

export const GRAMMAR_SOURCE = {
  name: "JLPT Grammar List",
  url: "https://jlptgrammarlist.neocities.org/",
};
