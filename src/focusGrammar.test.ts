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
      "〜わけにはいかない",
      "〜わけではない",
    ]);
    expect(matches(0)).toEqual(["ものの", "ものの"]);
    expect(matches(1)).toEqual(["わけにはいかない", "らないわけにはいかなかった"]);
    expect(matches(2)).toEqual(["というわけではない", "というわけではない"]);
  });

  it("marks every piece that overlaps a match", () => {
    const text = "帰らないわけにはいかなかった。";
    const ranges = grammarRanges(text, hakone.focusGrammar);
    expect(grammarForPieces(["帰ら", "ない", "わけにはいか", "なかっ", "た", "。"], ranges)).toEqual([
      1, 1, 1, 1, 1, undefined,
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
      }
    }
  });
});
