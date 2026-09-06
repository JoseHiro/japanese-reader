import { describe, expect, it } from "vitest";
import { shuffledOrder } from "./GrammarQuiz";

describe("shuffledOrder", () => {
  it("returns a permutation of 0..n-1", () => {
    for (const n of [2, 3, 5, 8, 13]) {
      const perm = shuffledOrder(n, 1);
      expect(perm).toHaveLength(n);
      expect([...perm].sort((a, b) => a - b)).toEqual(
        Array.from({ length: n }, (_, i) => i),
      );
    }
  });

  it("is deterministic for a given (n, seed)", () => {
    expect(shuffledOrder(5, 42)).toEqual(shuffledOrder(5, 42));
    expect(shuffledOrder(7, 3)).toEqual(shuffledOrder(7, 3));
  });

  it("produces different orderings for different seeds", () => {
    // Not a strict guarantee for all pairs, but for a fixed n=5 across a
    // handful of seeds we should see at least one distinct permutation.
    const seen = new Set(
      [1, 2, 3, 4, 5].map((s) => shuffledOrder(5, s).join(",")),
    );
    expect(seen.size).toBeGreaterThan(1);
  });

  it("never returns the identity permutation for n > 1", () => {
    // The shuffle rotates when the RNG happens to leave the identity, so
    // the learner never sees the answer already assembled for them.
    for (let seed = 1; seed <= 20; seed++) {
      for (const n of [2, 3, 4, 5]) {
        const perm = shuffledOrder(n, seed);
        const isIdentity = perm.every((v, i) => v === i);
        expect(isIdentity, `n=${n} seed=${seed} → ${perm.join(",")}`).toBe(
          false,
        );
      }
    }
  });

  it("handles n=1 by returning [0]", () => {
    expect(shuffledOrder(1, 1)).toEqual([0]);
  });
});
