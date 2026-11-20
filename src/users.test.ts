import { describe, expect, it } from "vitest";
import { ARTICLES } from "./content";
import {
  USERS,
  findUser,
  articlesForUser,
  vocabForUser,
  lessonsForUser,
  hasGrammarChoice,
} from "./users";

describe("USERS registry", () => {
  it("has unique ids", () => {
    const ids = USERS.map((u) => u.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every listed article id resolves to an actual article", () => {
    const articleIds = new Set(ARTICLES.map((a) => a.id));
    for (const u of USERS) {
      for (const aid of [...u.articleIds, ...(u.podIds ?? [])]) {
        expect(articleIds, `${u.id} → ${aid}`).toContain(aid);
      }
    }
  });
});

describe("findUser", () => {
  it("returns the user for a known id", () => {
    expect(findUser("shaun")?.displayName).toBe("Shaun");
    expect(findUser("artem")?.displayName).toBe("Artem");
  });
  it("returns undefined for an unknown id", () => {
    expect(findUser("nobody")).toBeUndefined();
  });
});

describe("Artem's profile", () => {
  const artem = findUser("artem")!;

  it("is registered with the right shape", () => {
    expect(artem).toBeDefined();
    expect(artem.tobiraCurrent).toBe(5);
    expect(artem.tobiraReviewUpTo).toBe(4);
    expect(artem.vocabPoolId).toBe("artem");
  });

  it("owns the marugame article", () => {
    expect(artem.articleIds).toContain("marugame-seimen");
    const arts = articlesForUser(artem);
    expect(arts.map((a) => a.id)).toContain("marugame-seimen");
  });

  it("vocabForUser returns Artem's non-empty pool", () => {
    const pool = vocabForUser(artem);
    expect(pool.length).toBeGreaterThan(0);
  });
});

describe("Dominik's profile", () => {
  const dominik = findUser("dominik")!;

  it("has the 箱根 article and its three practice parts", () => {
    expect(articlesForUser(dominik).map((a) => a.id)).toEqual(["tabi-hakone-onsen"]);
    expect(lessonsForUser(dominik).map((l) => l.id)).toEqual(["hakone-practice"]);
  });

  it("gets 文法選択 without a Tobira chapter", () => {
    expect(dominik.tobiraCurrent).toBeUndefined();
    expect(hasGrammarChoice(dominik)).toBe(true);
  });
});
