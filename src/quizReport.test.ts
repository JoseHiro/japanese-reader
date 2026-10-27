import { describe, expect, it } from "vitest";
import { ARTICLES, type Article } from "./content";
import { parseParticleText } from "./particles";
import {
  emptyAttempts,
  formatQuizReport,
  REPORT_LABELS,
  type QuizAttempts,
  type ReportKind,
} from "./quizReport";

const article: Article = {
  id: "t",
  title: "テスト記事",
  text: "",
  annotations: {},
  quiz: {
    cloze: [
      { before: "山と海に", after: "いる。", options: ["座って", "囲まれて"], answer: 1 },
      { before: "外に", after: "いる。", options: ["座って", "入って"], answer: 0 },
      { before: "友達と", after: "に歩く。", options: ["一緒", "最後"], answer: 0 },
    ],
    grammarChoice: [
      {
        translation: "at least once",
        before: "一度",
        after: "聞いた。",
        options: ["しか", "は"],
        answer: 1,
      },
    ],
    particle: [{ text: "山［と］海［に］囲まれる。", translation: "surrounded" }],
    rearrange: [{ translation: "A then B", chunks: ["A", "B", "C"] }],
    reading: [{ question: "なぜ？", answer: "模範" }, { question: "どう？", answer: "模範" }],
  },
};
const base = { article, userName: "Artem", date: new Date(2026, 9, 27) };

describe("formatQuizReport", () => {
  it("lists first try, retries, the right answer when missed, and unanswered", () => {
    const attempts = emptyAttempts();
    attempts.cloze = { 0: [1], 1: [1, 0] };
    const text = formatQuizReport({ ...base, kind: "cloze", attempts });
    expect(text).toBe(
      [
        "テスト記事｜単語クイズ",
        "Artem・2026/10/27・1回目の正解 1/3（未回答 1）",
        "",
        "1. 山と海に（＿＿）いる。",
        "   ✓ 囲まれて",
        "",
        "2. 外に（＿＿）いる。",
        "   ✗ 入って → ✓ 座って",
        "",
        "3. 友達と（＿＿）に歩く。",
        "   未回答（正解：一緒）",
        "",
      ].join("\n"),
    );
  });

  it("shows the correct answer after a wrong grammar choice", () => {
    const attempts = emptyAttempts();
    attempts.grammarChoice = { 0: [0] };
    const text = formatQuizReport({ ...base, kind: "grammarChoice", attempts });
    expect(text).toContain("1. at least once\n   一度（＿＿）聞いた。\n   ✗ しか（正解：は）");
  });

  it("numbers particle blanks and lists only the ones still wrong", () => {
    const attempts = emptyAttempts();
    attempts.particle = { 0: [["と", "で"]] };
    const text = formatQuizReport({ ...base, kind: "particle", attempts });
    expect(text).toContain("   山（①）海（②）囲まれる。\n   ✗ ①と ②で（正解：②に）");
  });

  it("shows the picked chunk order for rearrange", () => {
    const attempts = emptyAttempts();
    attempts.rearrange = { 0: [[1, 0, 2], [0, 1, 2]] };
    const text = formatQuizReport({ ...base, kind: "rearrange", attempts });
    expect(text).toContain("   ✗ B／A／C → ✓ A／B／C");
    expect(text).toContain("1回目の正解 0/1");
  });

  it("copies free-text reading answers and marks blanks as 未回答", () => {
    const attempts = emptyAttempts();
    attempts.reading = { 0: "山と海があるから。\n守りやすい。" };
    const text = formatQuizReport({ ...base, kind: "reading", attempts });
    expect(text).toContain("回答 1/2");
    expect(text).toContain("1. なぜ？\n   山と海があるから。\n   守りやすい。");
    expect(text).toContain("2. どう？\n   （未回答）");
  });
});

// Every real article × every quiz type it has: the copy report must cover
// every question, number them 1..n, score correctly, and never leak
// placeholders like "undefined" / "?" — whatever the learner did.
describe("formatQuizReport on every article", () => {
  const kinds = Object.keys(REPORT_LABELS) as ReportKind[];

  // Fill attempts for every question: all right, all wrong, or none.
  function answerAll(a: Article, kind: ReportKind, mode: "right" | "wrong"): QuizAttempts {
    const at = emptyAttempts();
    const q = a.quiz!;
    if (kind === "cloze" || kind === "grammarChoice") {
      (q[kind] ?? []).forEach((item, i) => {
        at[kind][i] = [mode === "right" ? item.answer : (item.answer + 1) % item.options.length];
      });
    } else if (kind === "particle") {
      (q.particle ?? []).forEach((item, i) => {
        const { answers } = parseParticleText(item.text);
        at.particle[i] = [mode === "right" ? answers : answers.map((p) => (p === "を" ? "が" : "を"))];
      });
    } else if (kind === "rearrange") {
      (q.rearrange ?? []).forEach((item, i) => {
        const order = item.chunks.map((_, k) => k);
        at.rearrange[i] = [mode === "right" ? order : [...order].reverse()];
      });
    } else {
      (q.reading ?? []).forEach((_, i) => {
        at.reading[i] = mode === "right" ? `答え${i + 1}` : "";
      });
    }
    return at;
  }

  const cases = ARTICLES.flatMap((a) =>
    kinds
      .filter((k) => (a.quiz?.[k]?.length ?? 0) > 0)
      .map((k) => ({ a, k, n: a.quiz![k]!.length })),
  );

  it("has quizzes to check", () => {
    expect(cases.length).toBeGreaterThan(10);
  });

  it.each(cases.map((c) => [`${c.a.id} / ${c.k}`, c] as const))("%s", (_, { a, k, n }) => {
    for (const mode of ["right", "wrong", "none"] as const) {
      const attempts = mode === "none" ? emptyAttempts() : answerAll(a, k, mode);
      const text = formatQuizReport({ article: a, kind: k, attempts, userName: "T", date: new Date(2026, 0, 1) });
      const label = `${a.id}/${k}/${mode}`;

      expect(text.startsWith(`${a.title}｜${REPORT_LABELS[k]}\n`), label).toBe(true);
      // One numbered block per question, in order.
      const nums = [...text.matchAll(/^(\d+)\. /gm)].map((m) => Number(m[1]));
      expect(nums, label).toEqual(Array.from({ length: n }, (_, i) => i + 1));
      expect(text, label).not.toMatch(/undefined|NaN|\[object/);
      expect(text, label).not.toContain(" ?");

      if (k === "reading") {
        expect(text, label).toContain(`回答 ${mode === "right" ? n : 0}/${n}`);
      } else {
        expect(text, label).toContain(`1回目の正解 ${mode === "right" ? n : 0}/${n}`);
        const marks = (text.match(/✓/g) ?? []).length;
        expect(marks, label).toBe(mode === "right" ? n : 0);
        if (mode === "none") expect((text.match(/未回答（正解：/g) ?? []).length, label).toBe(n);
      }
    }
  });
});
