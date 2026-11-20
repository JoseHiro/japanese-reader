import { describe, expect, it } from "vitest";
import { LESSONS, type Blank } from "./lessons";

const TARGETS = ["〜ものの", "〜からといって", "〜ざるを得ない"];

describe("ryokan-reservation lesson (Dominik, N2)", () => {
  const lesson = LESSONS.find((l) => l.id === "ryokan-reservation")!;
  const blanks = lesson.turns.flatMap((t) => (t.speaker === "student" ? [t.blank] : []));
  const targetsOf = (rules: Blank["rules"]) =>
    TARGETS.filter((g) =>
      (rules ?? []).some((r) => r.kind === "grammar" && r.items.some((it) => it.startsWith(g))),
    );

  it("every blank names an N2 target in a grammar rule, listed first", () => {
    for (const b of blanks) {
      expect(targetsOf(b.rules), b.id).not.toEqual([]);
      expect(b.rules?.[0].kind, b.id).toBe("grammar");
      expect(b.intentEn, b.id).toBeTruthy();
      expect(b.teacherNote, b.id).toBeTruthy();
    }
  });

  it("requires each target at least twice", () => {
    const counts = Object.fromEntries(TARGETS.map((g) => [g, 0]));
    for (const b of blanks) for (const g of targetsOf(b.rules)) counts[g]++;
    for (const g of TARGETS) expect(counts[g], g).toBeGreaterThanOrEqual(2);
  });

  it("samples actually use the blank's target", () => {
    const stem: Record<string, string> = {
      "〜ものの": "ものの",
      "〜からといって": "からといって",
      "〜ざるを得ない": "ざるを得",
    };
    for (const b of blanks) {
      for (const g of targetsOf(b.rules)) {
        for (const s of b.samples) expect(s, `${b.id} ${g}`).toContain(stem[g]);
      }
    }
  });

  it("every challenge names a target grammar", () => {
    for (const c of lesson.challenges ?? []) {
      expect(targetsOf(c.rules), c.id).not.toEqual([]);
    }
  });
});
