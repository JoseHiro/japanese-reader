import { describe, expect, it } from "vitest";
import {
  ARTEM_VOCAB,
  vocabForPool,
  vocabByMonth,
} from "./vocabulary";

describe("Artem vocab pool", () => {
  it("is non-empty and every entry has word, reading, and English", () => {
    expect(ARTEM_VOCAB.length).toBeGreaterThan(0);
    for (const v of ARTEM_VOCAB) {
      expect(v.word, JSON.stringify(v)).toBeTruthy();
      expect(v.reading, v.word).toBeTruthy();
      expect(v.meaningEn, v.word).toBeTruthy();
    }
  });

  it("has no duplicate headwords", () => {
    const seen = new Set<string>();
    const dupes: string[] = [];
    for (const v of ARTEM_VOCAB) {
      if (seen.has(v.word)) dupes.push(v.word);
      seen.add(v.word);
    }
    expect(dupes).toEqual([]);
  });

  it("contains the entries Artem asked us to store", () => {
    const words = new Set(ARTEM_VOCAB.map((v) => v.word));
    // A sampling of Artem's monthly list — if any of these drops out we
    // want the test to catch it, since articles are built assuming they're
    // in the pool.
    const required = [
      "麺", "味", "油", "お湯", "商品", "値段", "種類",
      "消費者", "元祖", "競争", "若者", "一人暮らし",
      "現在", "過去", "戦後", "以上", "東南", "化",
    ];
    for (const w of required) {
      expect(words, w).toContain(w);
    }
  });
});

describe("vocabForPool", () => {
  it('returns the pool for "artem"', () => {
    expect(vocabForPool("artem")).toBe(ARTEM_VOCAB);
  });
  it("returns [] for unknown or undefined pool ids", () => {
    expect(vocabForPool(undefined)).toEqual([]);
    expect(vocabForPool("does-not-exist")).toEqual([]);
  });
});

describe("vocabByMonth", () => {
  it("groups items by month tag, newest first", () => {
    const items = [
      { word: "a", reading: "あ", meaningEn: "a", month: "2026-09" },
      { word: "b", reading: "い", meaningEn: "b", month: "2026-10" },
      { word: "c", reading: "う", meaningEn: "c", month: "2026-09" },
      { word: "d", reading: "え", meaningEn: "d" },
    ];
    const groups = vocabByMonth(items);
    // Sort order is descending by month tag; entries without one collate
    // under "" which sorts last.
    expect(groups.map((g) => g.month)).toEqual(["2026-10", "2026-09", ""]);
    expect(groups[0].items).toHaveLength(1);
    expect(groups[1].items.map((i) => i.word)).toEqual(["a", "c"]);
    expect(groups[2].items[0].word).toBe("d");
  });

  it("handles an empty input", () => {
    expect(vocabByMonth([])).toEqual([]);
  });
});
