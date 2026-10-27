// Plain-text report of a learner's answers for one quiz tab, built for the
// 📋 結果をコピー button so a student can paste their results into a chat
// instead of screenshotting the page. Every attempt is kept (first try
// first), so wrong answers show up even after a correct retry.

import type { Article } from "./content";
import { parseParticleText } from "./particles";

/** Everything the learner did this session, per quiz, keyed by question index. */
export interface QuizAttempts {
  /** Picked option index per attempt. */
  cloze: Record<number, number[]>;
  /** Picked option index per attempt. */
  grammarChoice: Record<number, number[]>;
  /** Filled particle per blank, per attempt. */
  particle: Record<number, string[][]>;
  /** Chunk indices in the order picked, per attempt. */
  rearrange: Record<number, number[][]>;
  /** Free-text answer (latest only). */
  reading: Record<number, string>;
}

export type ReportKind = keyof QuizAttempts;

export function emptyAttempts(): QuizAttempts {
  return { cloze: {}, grammarChoice: {}, particle: {}, rearrange: {}, reading: {} };
}

export const REPORT_LABELS: Record<ReportKind, string> = {
  cloze: "単語クイズ",
  grammarChoice: "文法選択",
  particle: "助詞クイズ",
  rearrange: "文法クイズ（並べ替え）",
  reading: "読解クイズ",
};

const CIRCLED = "①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳";
const circled = (i: number) => CIRCLED[i] ?? `(${i + 1})`;
const BLANK = "（＿＿）";
const INDENT = "   ";

/** "✓ A" / "✗ B → ✓ A", with the right answer appended if never reached. */
function attemptLine<T>(
  attempts: T[] | undefined,
  isCorrect: (a: T) => boolean,
  show: (a: T) => string,
  correctText: string,
): string {
  if (!attempts?.length) return `${INDENT}未回答（正解：${correctText}）`;
  const parts = attempts.map((a) => `${isCorrect(a) ? "✓" : "✗"} ${show(a)}`);
  const solved = attempts.some(isCorrect);
  return INDENT + parts.join(" → ") + (solved ? "" : `（正解：${correctText}）`);
}

function questionBlocks(article: Article, kind: ReportKind, attempts: QuizAttempts): {
  blocks: string[];
  firstTryCorrect: number;
  answered: number;
  total: number;
} {
  const q = article.quiz ?? {};
  const blocks: string[] = [];
  let firstTryCorrect = 0;
  let answered = 0;
  const tally = (list: unknown[] | undefined, firstOk: boolean) => {
    if (list?.length) {
      answered++;
      if (firstOk) firstTryCorrect++;
    }
  };

  if (kind === "cloze" || kind === "grammarChoice") {
    const qs = (kind === "cloze" ? q.cloze : q.grammarChoice) ?? [];
    qs.forEach((item, i) => {
      const tries = attempts[kind][i];
      tally(tries, tries?.[0] === item.answer);
      const head =
        kind === "grammarChoice" && "translation" in item
          ? `${i + 1}. ${item.translation}\n${INDENT}${item.before}${BLANK}${item.after}`
          : `${i + 1}. ${item.before}${BLANK}${item.after}`;
      const line = attemptLine(
        tries,
        (a) => a === item.answer,
        (a) => item.options[a] ?? "?",
        item.options[item.answer],
      );
      blocks.push(`${head}\n${line}`);
    });
    return { blocks, firstTryCorrect, answered, total: qs.length };
  }

  if (kind === "particle") {
    const qs = q.particle ?? [];
    qs.forEach((item, i) => {
      const { segments, answers } = parseParticleText(item.text);
      const sentence = segments
        .map((seg, k) => seg + (k < answers.length ? `（${circled(k)}）` : ""))
        .join("");
      const tries = attempts.particle[i];
      const ok = (fills: string[]) => fills.every((f, k) => f === answers[k]);
      tally(tries, !!tries?.[0] && ok(tries[0]));
      const show = (fills: string[]) => fills.map((f, k) => `${circled(k)}${f}`).join(" ");
      let line: string;
      if (!tries?.length) {
        line = `${INDENT}未回答（正解：${show(answers)}）`;
      } else {
        line = INDENT + tries.map((t) => `${ok(t) ? "✓" : "✗"} ${show(t)}`).join(" → ");
        if (!tries.some(ok)) {
          // Only list the blanks the last attempt got wrong.
          const last = tries[tries.length - 1];
          const fixes = answers
            .map((a, k) => (last[k] === a ? "" : `${circled(k)}${a}`))
            .filter(Boolean)
            .join(" ");
          line += `（正解：${fixes}）`;
        }
      }
      const head = item.translation
        ? `${i + 1}. ${item.translation}\n${INDENT}${sentence}`
        : `${i + 1}. ${sentence}`;
      blocks.push(`${head}\n${line}`);
    });
    return { blocks, firstTryCorrect, answered, total: qs.length };
  }

  if (kind === "rearrange") {
    const qs = q.rearrange ?? [];
    qs.forEach((item, i) => {
      const tries = attempts.rearrange[i];
      const ok = (order: number[]) => order.every((v, k) => v === k);
      tally(tries, !!tries?.[0] && ok(tries[0]));
      const line = attemptLine(
        tries,
        ok,
        (order) => order.map((k) => item.chunks[k]).join("／"),
        item.chunks.join("／"),
      );
      blocks.push(`${i + 1}. ${item.translation}\n${line}`);
    });
    return { blocks, firstTryCorrect, answered, total: qs.length };
  }

  // reading: free text, no right/wrong
  const qs = q.reading ?? [];
  qs.forEach((item, i) => {
    const text = attempts.reading[i]?.trim();
    if (text) answered++;
    const body = text ? text.split("\n").join(`\n${INDENT}`) : "（未回答）";
    blocks.push(`${i + 1}. ${item.question}\n${INDENT}${body}`);
  });
  return { blocks, firstTryCorrect, answered, total: qs.length };
}

export function formatQuizReport({
  article,
  kind,
  attempts,
  userName,
  date,
}: {
  article: Article;
  kind: ReportKind;
  attempts: QuizAttempts;
  userName: string;
  date: Date;
}): string {
  const { blocks, firstTryCorrect, answered, total } = questionBlocks(article, kind, attempts);
  const day = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  const score =
    kind === "reading"
      ? `回答 ${answered}/${total}`
      : `1回目の正解 ${firstTryCorrect}/${total}` +
        (answered < total ? `（未回答 ${total - answered}）` : "");
  return [`${article.title}｜${REPORT_LABELS[kind]}`, `${userName}・${day}・${score}`, "", blocks.join("\n\n")]
    .join("\n")
    .trimEnd() + "\n";
}
