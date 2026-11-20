import { describe, expect, it } from "vitest";
import { findLesson, lessonMeta, type Blank, type Lesson } from "./lessons";
import { findUser, lessonsForUser } from "./users";

// Dominik's 箱根 practice: each N2 form appears only in the register where a
// native speaker would use it.
//   ryokan-reservation   spoken      → 〜からといって (1–2 blanks)
//   travel-agency-cancel polite call → 〜ざるを得ない (2 blanks)
//   ryokan-review        writing     → 〜ものの (≥2 in the model), ざるを得ない ≤1

const TARGETS = ["〜ものの", "〜からといって", "〜ざるを得ない"] as const;
type Target = (typeof TARGETS)[number];
const STEM: Record<Target, string> = {
  "〜ものの": "ものの",
  "〜からといって": "からといって",
  "〜ざるを得ない": "ざるを得",
};

const lesson = (id: string): Lesson => findLesson(id)!;
const blanksOf = (l: Lesson): Blank[] =>
  l.turns.flatMap((t) => (t.speaker === "student" ? [t.blank] : []));
const targetsOf = (rules: Blank["rules"]): Target[] =>
  TARGETS.filter((g) =>
    (rules ?? []).some((r) => r.kind === "grammar" && r.items.some((it) => it.startsWith(g))),
  );
const count = (text: string, stem: string) => text.split(stem).length - 1;

describe("Dominik's practice parts", () => {
  const SECTIONS = [
    "ryokan-reservation",
    "travel-agency-cancel",
    "ryokan-review",
    "hakone-followups",
    "hakone-culture",
  ];

  it("are one lesson for Dominik, with its sections in order", () => {
    const [group, ...rest] = lessonsForUser(findUser("dominik")!);
    expect(rest).toEqual([]);
    expect(group.id).toBe("hakone-practice");
    expect(group.turns).toEqual([]);
    expect(group.parts?.map((p) => p.id)).toEqual(SECTIONS);
    expect(group.parts?.map((p) => p.sectionLabel)).toEqual([
      "1. フロント",
      "2. 電話",
      "3. 口コミ",
      "4. 続けて話す",
      "5. 文化の質問",
    ]);
    expect(lessonMeta(group)).toBe("5 セクション");
  });

  it("every section opens with a register note and its target grammar", () => {
    for (const id of SECTIONS) {
      expect(lesson(id).register, id).toBeTruthy();
      expect(lesson(id).target, id).toBeTruthy();
    }
  });

  it("are Japanese only: no English fields, and labels without English", () => {
    for (const id of ["hakone-practice", ...SECTIONS]) {
      const l = lesson(id);
      expect(l.japaneseOnly, id).toBe(true);
      for (const key of ["titleEn", "shortTitleEn", "situationEn", "goalEn", "registerEn", "intentEn"] as const) {
        expect(l[key], `${id} ${key}`).toBeUndefined();
      }
      for (const b of blanksOf(l)) {
        expect(b.intentEn, `${id} ${b.id}`).toBeUndefined();
        for (const r of b.rules ?? []) expect(r.itemsEn, `${id} ${b.id}`).toBeUndefined();
      }
      for (const c of l.challenges ?? []) {
        expect(c.titleEn ?? c.promptEn, `${id} ${c.id}`).toBeUndefined();
        for (const r of c.rules ?? []) expect(r.itemsEn, `${id} ${c.id}`).toBeUndefined();
      }
    }
  });

  it("every challenge names a target grammar", () => {
    for (const id of SECTIONS) {
      for (const c of lesson(id).challenges ?? []) {
        expect(targetsOf(c.rules), `${id} ${c.id}`).not.toEqual([]);
      }
    }
  });

  it("blank samples use the grammar their rule asks for", () => {
    for (const id of ["ryokan-reservation", "travel-agency-cancel"]) {
      for (const b of blanksOf(lesson(id))) {
        for (const g of targetsOf(b.rules)) {
          for (const s of b.samples) expect(s, `${id} ${b.id}`).toContain(STEM[g]);
        }
        expect(b.teacherNote, `${id} ${b.id}`).toBeTruthy();
      }
    }
  });
});

describe("① 会話：旅館のフロント (spoken)", () => {
  const l = lesson("ryokan-reservation");
  const blanks = blanksOf(l);

  it("targets only 〜からといって, in 1–2 blanks", () => {
    const targeted = blanks.filter((b) => targetsOf(b.rules).length > 0);
    expect(targeted.length).toBeGreaterThanOrEqual(1);
    expect(targeted.length).toBeLessThanOrEqual(2);
    for (const b of targeted) expect(targetsOf(b.rules), b.id).toEqual(["〜からといって"]);
  });

  it("keeps stiff written forms out of the spoken dialogue", () => {
    const spoken = l.turns.flatMap((t) => (t.speaker === "them" ? [t.text] : t.blank.samples));
    for (const line of spoken) {
      expect(line).not.toContain("ものの");
      expect(line).not.toContain("ざるを得");
    }
  });
});

describe("② 丁寧な電話 (polite call)", () => {
  it("uses 〜ざるを得ない in exactly two blanks", () => {
    const blanks = blanksOf(lesson("travel-agency-cancel"));
    const targeted = blanks.filter((b) => targetsOf(b.rules).length > 0);
    expect(targeted.map((b) => targetsOf(b.rules))).toEqual([["〜ざるを得ない"], ["〜ざるを得ない"]]);
  });
});

describe("③ 書く：口コミ (writing)", () => {
  const l = lesson("ryokan-review");

  it("is a writing task: no dialogue, tasks as challenges", () => {
    expect(l.turns).toEqual([]);
    expect(lessonMeta(l)).toBe("課題 1");
  });

  it("the model review uses ものの at least twice and ざるを得ない at most once", () => {
    const model = l.challenges![0].samples[0];
    expect(count(model, "ものの")).toBeGreaterThanOrEqual(2);
    expect(count(model, "ざるを得")).toBeLessThanOrEqual(1);
    const sentences = model.split("。").filter(Boolean);
    expect(sentences.length).toBeGreaterThanOrEqual(4);
    expect(sentences.length).toBeLessThanOrEqual(6);
  });
});
