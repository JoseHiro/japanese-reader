import type { Token } from "./tokenizer";
import type { Annotation } from "./content";

// A rendered unit is one clickable span in the reader. It usually wraps a
// single token, but can wrap several consecutive tokens when they together
// match an authored annotation key (e.g. 降園, which kuromoji splits into
// 降 + 園, or a compound like 預かり保育).
export interface Unit {
  tokens: Token[];
  /** Surface text of the whole unit. */
  surface: string;
  /** Dictionary form used as headword / Jisho query. */
  key: string;
  pos: string;
  /** Authored annotation, if this unit matched one. */
  annotation?: Annotation;
  clickable: boolean;
}

const MAX_SPAN = 4;

export function buildUnits(
  tokens: Token[],
  annotations: Record<string, Annotation>,
): Unit[] {
  const units: Unit[] = [];
  let i = 0;
  while (i < tokens.length) {
    let matched: { len: number; key: string } | null = null;

    // Prefer the longest multi-token surface match (compounds/phrases).
    for (let len = Math.min(MAX_SPAN, tokens.length - i); len >= 1; len--) {
      const surface = tokens
        .slice(i, i + len)
        .map((t) => t.surface)
        .join("");
      if (annotations[surface]) {
        matched = { len, key: surface };
        break;
      }
    }

    // Fall back to a single token's base form (conjugated verbs, etc.).
    if (!matched && annotations[tokens[i].base]) {
      matched = { len: 1, key: tokens[i].base };
    }

    if (matched) {
      const group = tokens.slice(i, i + matched.len);
      units.push({
        tokens: group,
        surface: group.map((t) => t.surface).join(""),
        key: matched.key,
        pos: annotations[matched.key].pos ?? group[0].pos,
        annotation: annotations[matched.key],
        clickable: true,
      });
      i += matched.len;
    } else {
      const t = tokens[i];
      units.push({
        tokens: [t],
        surface: t.surface,
        key: t.base,
        pos: t.pos,
        clickable: t.clickable,
      });
      i += 1;
    }
  }
  return units;
}
