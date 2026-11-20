import { describe, expect, it } from "vitest";
import { grammarByLevel } from "./grammar";
import { ARTICLES } from "./content";
import { normalizeGrammarTerm } from "./JlptGrammarList";

describe("JLPT grammar list", () => {
  it("matches the 箱根 focus grammar to N2 list entries (今回 marks)", () => {
    const terms = new Set(grammarByLevel("N2").map((g) => normalizeGrammarTerm(g.term)));
    const hakone = ARTICLES.find((a) => a.id === "tabi-hakone-onsen")!;
    for (const g of hakone.focusGrammar ?? []) {
      expect(terms, g.label).toContain(normalizeGrammarTerm(g.label));
    }
  });

  it("normalizes 〜 and numbering", () => {
    expect(normalizeGrammarTerm("〜ものの")).toBe("ものの");
    expect(normalizeGrammarTerm("ものの(1)")).toBe("ものの");
  });
});
