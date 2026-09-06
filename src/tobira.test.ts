import { describe, expect, it } from "vitest";
import {
  TOBIRA_LESSONS,
  grammarByKey,
  grammarKey,
  lessonById,
} from "./tobira";

describe("Tobira grammar reference", () => {
  it("loads all 15 chapters in order", () => {
    expect(TOBIRA_LESSONS).toHaveLength(15);
    expect(TOBIRA_LESSONS.map((l) => l.lesson)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    ]);
  });

  it("every chapter has a non-empty title and at least one grammar point", () => {
    for (const L of TOBIRA_LESSONS) {
      expect(L.title.length).toBeGreaterThan(0);
      expect(L.grammar.length).toBeGreaterThan(0);
    }
  });

  it("every grammar point has a title and explanation", () => {
    for (const L of TOBIRA_LESSONS) {
      for (const g of L.grammar) {
        expect(g.title, `L${L.lesson}#${g.n}`).toBeTruthy();
        expect(g.explanation, `L${L.lesson}#${g.n}`).toBeTruthy();
        expect(g.n).toBeGreaterThan(0);
      }
    }
  });

  it("grammar items within a chapter are 1-indexed and contiguous", () => {
    for (const L of TOBIRA_LESSONS) {
      const nums = L.grammar.map((g) => g.n);
      expect(nums).toEqual(
        Array.from({ length: nums.length }, (_, i) => i + 1),
      );
    }
  });

  it("grammarKey / grammarByKey roundtrip", () => {
    const key = grammarKey(5, 10);
    expect(key).toBe("tobira-5-10");
    const g = grammarByKey(key);
    expect(g).toBeDefined();
    expect(g!.n).toBe(10);
  });

  it("grammarByKey returns undefined for unknown or malformed keys", () => {
    expect(grammarByKey("tobira-99-1")).toBeUndefined();
    expect(grammarByKey("tobira-1-999")).toBeUndefined();
    expect(grammarByKey("not-a-key")).toBeUndefined();
    expect(grammarByKey("")).toBeUndefined();
  });

  it("lessonById returns the right lesson", () => {
    expect(lessonById(5)?.title).toBe("日本の食べ物");
    expect(lessonById(99)).toBeUndefined();
  });

  it("has the specific L5 items the marugame article targets", () => {
    // The Marugame Seimen article uses these five grammar points; if the
    // dataset is ever regenerated and numbering drifts, this catches it.
    const targets = [
      { key: "tobira-5-4", contains: "はじめ" },
      { key: "tobira-5-5", contains: "以上" },
      { key: "tobira-5-8", contains: "化" },
      { key: "tobira-5-10", contains: "違いない" },
      { key: "tobira-5-13", contains: "らしい" },
    ];
    for (const t of targets) {
      const g = grammarByKey(t.key);
      expect(g, t.key).toBeDefined();
      expect(g!.title, t.key).toContain(t.contains);
    }
  });
});
