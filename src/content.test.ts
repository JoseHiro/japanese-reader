import { describe, expect, it } from "vitest";
import { ARTICLES } from "./content";
import { grammarByKey } from "./tobira";
import { ARTEM_VOCAB } from "./vocabulary";
import { parseParticleText } from "./ParticleQuiz";

describe("ARTICLES structural invariants", () => {
  it("has unique article ids", () => {
    const ids = ARTICLES.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every article has non-empty text and a title", () => {
    for (const a of ARTICLES) {
      expect(a.title, a.id).toBeTruthy();
      expect(a.text.trim().length, a.id).toBeGreaterThan(0);
    }
  });

  it("cloze questions have four options and a valid answer index", () => {
    for (const a of ARTICLES) {
      for (const [qi, q] of (a.quiz?.cloze ?? []).entries()) {
        expect(q.options.length, `${a.id}#${qi}`).toBe(4);
        expect(q.answer, `${a.id}#${qi}`).toBeGreaterThanOrEqual(0);
        expect(q.answer, `${a.id}#${qi}`).toBeLessThan(q.options.length);
      }
    }
  });

  it("rearrange questions have at least two chunks and a translation", () => {
    for (const a of ARTICLES) {
      for (const [qi, q] of (a.quiz?.rearrange ?? []).entries()) {
        expect(q.chunks.length, `${a.id}#${qi}`).toBeGreaterThanOrEqual(2);
        for (const c of q.chunks) expect(c.trim(), `${a.id}#${qi}`).toBeTruthy();
        expect(q.translation.trim(), `${a.id}#${qi}`).toBeTruthy();
      }
    }
  });

  it("every rearrange grammarKey resolves in the Tobira index", () => {
    for (const a of ARTICLES) {
      for (const [qi, q] of (a.quiz?.rearrange ?? []).entries()) {
        if (!q.grammarKey) continue;
        expect(
          grammarByKey(q.grammarKey),
          `${a.id}#${qi} grammarKey=${q.grammarKey}`,
        ).toBeDefined();
      }
    }
  });

  it("grammarChoice questions have four options, a valid answer and a known grammarKey", () => {
    for (const a of ARTICLES) {
      for (const [qi, q] of (a.quiz?.grammarChoice ?? []).entries()) {
        expect(q.options.length, `${a.id}#${qi}`).toBe(4);
        expect(q.answer, `${a.id}#${qi}`).toBeGreaterThanOrEqual(0);
        expect(q.answer, `${a.id}#${qi}`).toBeLessThan(q.options.length);
        expect(q.translation.trim(), `${a.id}#${qi}`).toBeTruthy();
        if (q.grammarKey) {
          expect(grammarByKey(q.grammarKey), `${a.id}#${qi} ${q.grammarKey}`).toBeDefined();
        }
      }
    }
  });

  it("particle questions have at least one blank", () => {
    for (const a of ARTICLES) {
      for (const [qi, q] of (a.quiz?.particle ?? []).entries()) {
        expect(parseParticleText(q.text).answers.length, `${a.id}#${qi}`).toBeGreaterThan(0);
      }
    }
  });

  it("every translationPractice sentence has a matching translation entry", () => {
    for (const a of ARTICLES) {
      if (!a.translationPractice) continue;
      const translations = { ...a.translations, ...a.practiceTranslations };
      const missing = a.translationPractice.filter((s) => !(s in translations));
      expect(missing, `${a.id} unmatched: ${missing.join(" | ")}`).toEqual([]);
    }
  });

  it("every practiceTranslations key is a sentence of the article", () => {
    for (const a of ARTICLES) {
      const missing = Object.keys(a.practiceTranslations ?? {}).filter(
        (s) => !a.text.includes(s),
      );
      expect(missing, `${a.id} not in text: ${missing.join(" | ")}`).toEqual([]);
    }
  });
});

describe("Marugame Seimen article", () => {
  const article = ARTICLES.find((a) => a.id === "marugame-seimen");

  it("exists", () => {
    expect(article).toBeDefined();
  });

  it("has all its targetGrammar keys in the Tobira index", () => {
    for (const key of article!.targetGrammar ?? []) {
      expect(grammarByKey(key), key).toBeDefined();
    }
  });

  it("has all its targetVocab words in Artem's pool", () => {
    const pool = new Set(ARTEM_VOCAB.map((v) => v.word));
    // The article stores dictionary-form headwords in targetVocab. Words
    // that appear conjugated in the text (残る → 残っている) still list
    // their dictionary form in the tag list.
    for (const w of article!.targetVocab ?? []) {
      expect(pool, w).toContain(w);
    }
  });

  it("its target vocab actually appears in the article text", () => {
    const text = article!.text;
    // Every listed word should have at least one occurrence somewhere in
    // the prose, either as its exact form or a common conjugation. We use
    // a small alias table for the handful of words that show up inflected.
    const aliases: Record<string, string[]> = {
      残る: ["残っている"],
      作る: ["作り", "作る"],
      続く: ["続いて"],
      安い: ["安く", "安く"],
      成功: ["成功"],
    };
    for (const w of article!.targetVocab ?? []) {
      const forms = [w, ...(aliases[w] ?? [])];
      const found = forms.some((f) => text.includes(f));
      expect(found, `${w} not found in article body`).toBe(true);
    }
  });

  it("translations cover every sentence delimited by 。", () => {
    // If a sentence in the body has no translation entry, the 翻訳練習 tab
    // will silently skip it — worth catching in tests.
    const text = article!.text;
    const translations = article!.translations ?? {};
    // Split on 。 but drop empty tails, and re-append the delimiter so
    // keys line up with how the app stores them.
    const sentences = text
      .split("\n")
      .flatMap((line) =>
        line
          .split(/(?<=。)/)
          .filter((s) => s.trim().length > 0 && s.includes("。")),
      );
    const missing = sentences.filter((s) => !(s in translations));
    expect(missing, `missing translations: ${missing.join(" | ")}`).toEqual([]);
  });
});

describe("Kamakura article", () => {
  const article = ARTICLES.find((a) => a.id === "kamakura-jidai")!;

  it("has a translation for every sentence", () => {
    const sentences = article.text
      .split("\n")
      .flatMap((line) => line.split(/(?<=。)/).filter((s) => s.includes("。")));
    const missing = sentences.filter((s) => !(s in (article.translations ?? {})));
    expect(missing).toEqual([]);
  });

  it("builds its grammarChoice and particle questions from article sentences", () => {
    for (const q of article.quiz?.grammarChoice ?? []) {
      const sentence = q.before + q.options[q.answer] + q.after;
      expect(article.text, sentence).toContain(sentence);
    }
    for (const q of article.quiz?.particle ?? []) {
      const sentence = q.text.replace(/［([^］]+)］/g, "$1");
      expect(article.text, sentence).toContain(sentence);
    }
  });
});
