// Parsing for 助詞クイズ sentences, shared by the quiz UI and the copy-results
// report. A sentence marks each particle to fill as ［を］.

/** Particles offered for every question (answers outside this set are appended). */
export const PARTICLES = ["は", "が", "を", "に", "で", "と", "へ", "も", "の", "から", "まで", "より"];

const BLANK_RE = /［([^］]+)］/g;

/**
 * Split "A［を］B［に］C" into text segments ["A", "B", "C"] and answers
 * ["を", "に"]. `segments.length` is always `answers.length + 1`.
 */
export function parseParticleText(text: string): { segments: string[]; answers: string[] } {
  const segments: string[] = [];
  const answers: string[] = [];
  let last = 0;
  for (const m of text.matchAll(BLANK_RE)) {
    segments.push(text.slice(last, m.index));
    answers.push(m[1]);
    last = m.index! + m[0].length;
  }
  segments.push(text.slice(last));
  return { segments, answers };
}

/** The particle chips for a question: the shared set plus any extra answers. */
export function particleChoices(answers: string[]): string[] {
  const extra = answers.filter((a, i) => !PARTICLES.includes(a) && answers.indexOf(a) === i);
  return [...PARTICLES, ...extra];
}
