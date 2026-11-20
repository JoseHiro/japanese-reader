import type { FocusGrammar } from "./content";

// Where an article's focus grammar (`Article.focusGrammar`) occurs in a
// piece of text. Each range carries the index of its grammar entry, which
// picks the highlight color (gram-0, gram-1, ...) in both the 今回の文法
// box and the article body.

export interface GrammarRange {
  start: number;
  end: number;
  /** Index into the article's focusGrammar list. */
  index: number;
}

export function grammarRanges(text: string, focus: readonly FocusGrammar[] | undefined): GrammarRange[] {
  const out: GrammarRange[] = [];
  (focus ?? []).forEach((g, index) => {
    const re = new RegExp(g.pattern, "g");
    for (const m of text.matchAll(re)) {
      if (!m[0]) continue;
      out.push({ start: m.index!, end: m.index! + m[0].length, index });
    }
  });
  return out.sort((a, b) => a.start - b.start);
}

/** The grammar index for the span [start, end), if it overlaps a range. */
export function grammarAt(ranges: readonly GrammarRange[], start: number, end: number): number | undefined {
  return ranges.find((r) => r.start < end && start < r.end)?.index;
}

/**
 * For a list of consecutive pieces of `text` (e.g. reader units), the
 * grammar index each piece overlaps.
 */
export function grammarForPieces(
  pieces: readonly string[],
  ranges: readonly GrammarRange[],
): (number | undefined)[] {
  let pos = 0;
  return pieces.map((p) => {
    const start = pos;
    pos += p.length;
    return grammarAt(ranges, start, pos);
  });
}

export function grammarClass(index: number | undefined): string {
  return index === undefined ? "" : ` gram gram-${index % 3}`;
}
