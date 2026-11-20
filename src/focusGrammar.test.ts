import { describe, expect, it } from "vitest";
import { ARTICLES } from "./content";
import { grammarForPieces, grammarRanges } from "./focusGrammar";

const hakone = ARTICLES.find((a) => a.id === "tabi-hakone-onsen")!;

function matches(index: number): string[] {
  return grammarRanges(hakone.text, hakone.focusGrammar)
    .filter((r) => r.index === index)
    .map((r) => hakone.text.slice(r.start, r.end));
}

describe("focus grammar highlights", () => {
  it("finds each 箱根 grammar point twice in the body", () => {
    expect(hakone.focusGrammar?.map((g) => g.label)).toEqual([
      "〜ものの",
      "〜からといって",
      "〜ざるを得ない",
    ]);
    expect(matches(0)).toEqual(["ものの", "ものの"]);
    expect(matches(1)).toEqual(["からといって", "からといって"]);
    expect(matches(2)).toEqual(["らざるを得ない", "らざるを得なかった"]);
  });

  it("does not target the N3 forms that only support the text", () => {
    const labels = (hakone.focusGrammar ?? []).map((g) => g.label).join();
    expect(labels).not.toMatch(/わけ/);
    expect(hakone.focusGrammar?.every((g) => g.level === "N2")).toBe(true);
  });

  it("marks every piece that overlaps a match", () => {
    const text = "早く帰らざるを得なかった。";
    const ranges = grammarRanges(text, hakone.focusGrammar);
    expect(grammarForPieces(["早く", "帰ら", "ざるを得", "なかっ", "た", "。"], ranges)).toEqual([
      undefined, 2, 2, 2, 2, undefined,
    ]);
  });

  it("has no matches without focus grammar", () => {
    expect(grammarRanges("ものの", undefined)).toEqual([]);
  });
});

describe("Article.focusGrammar data", () => {
  it("every example is from the body and contains its own pattern", () => {
    for (const a of ARTICLES) {
      for (const g of a.focusGrammar ?? []) {
        expect(a.text, `${a.id} ${g.label}`).toContain(g.example);
        expect(new RegExp(g.pattern).test(g.example), `${a.id} ${g.label}`).toBe(true);
        expect(g.form && g.meaning && g.caution && g.register, `${a.id} ${g.label}`).toBeTruthy();
        for (const d of g.differences ?? []) {
          expect(d.form && d.note, `${a.id} ${g.label} 違い`).toBeTruthy();
        }
      }
    }
  });
});
