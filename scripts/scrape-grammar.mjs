// Scrape https://jlptgrammarlist.neocities.org/ into src/data/grammar.json.
// Run manually with `node scripts/scrape-grammar.mjs` when refreshing the
// data set. Attribution: content is from jlptgrammarlist.neocities.org.
import { writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const outPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src/data/grammar.json",
);

const url = "https://jlptgrammarlist.neocities.org/";
const html = await (await fetch(url)).text();

const decode = (s) =>
  s.replace(/&nbsp;/g, " ")
   .replace(/&amp;/g, "&")
   .replace(/&lt;/g, "<")
   .replace(/&gt;/g, ">")
   .replace(/&quot;/g, '"')
   .replace(/&#39;/g, "'");

const stripTags = (s) => decode(s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());
const cleanTerm = (t) =>
  decode(t.replace(/<sup>([^<]+)<\/sup>/g, " ($1)").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());

const levels = ["n5", "n4", "n3", "n2", "n1"];

function sectionSlice(level, i) {
  const start = html.indexOf(`id="${level}"`);
  const end = i + 1 < levels.length ? html.indexOf(`id="${levels[i + 1]}"`, start) : html.indexOf("</body>", start);
  return html.slice(start, end);
}

function parseItem(raw) {
  const termM = /<span class="term">([\s\S]*?)<\/span>/.exec(raw);
  if (!termM) return null;
  const term = cleanTerm(termM[1]);

  // After the term span, meaning text runs until the first inner block
  // (japanese-sentence div, term-note span) or the item's closing </div>.
  // Strip out any <span class="common"></span> wrapper.
  const afterTerm = raw.slice(termM.index + termM[0].length);
  const stopIdx = (() => {
    const candidates = [
      afterTerm.indexOf('<div class="japanese-sentence"'),
      afterTerm.indexOf('<span class="term-note"'),
      afterTerm.indexOf('<div class="english-meaning"'),
      afterTerm.length,
    ].filter((n) => n >= 0);
    return Math.min(...candidates);
  })();
  const meaning = stripTags(afterTerm.slice(0, stopIdx));

  const sentenceM = /<div class="japanese-sentence">([\s\S]*?)<\/div>/.exec(raw);
  const example = sentenceM ? stripTags(sentenceM[1]) : "";

  const englishM = /<div class="english-meaning">([\s\S]*?)<\/div>/.exec(raw);
  const englishExample = englishM ? stripTags(englishM[1]) : "";

  return { term, meaning, example, englishExample };
}

const entries = [];
const SKIP_TERMS = new Set(["Verb Conjugation"]);
for (let i = 0; i < levels.length; i++) {
  const level = levels[i];
  const section = sectionSlice(level, i);
  const parts = section.split('<div class="item">');
  for (let j = 1; j < parts.length; j++) {
    const it = parseItem(parts[j]);
    if (!it || !it.term) continue;
    if (SKIP_TERMS.has(it.term)) continue;
    if (!it.meaning && !it.example) continue;
    entries.push({ level: level.toUpperCase(), ...it });
  }
}

const perLevel = Object.fromEntries(
  levels.map((l) => [l.toUpperCase(), entries.filter((e) => e.level === l.toUpperCase()).length]),
);
console.log("entries:", entries.length, "by level:", perLevel);
console.log("N2 sample:", entries.filter((e) => e.level === "N2").slice(0, 3));
console.log("N1 sample:", entries.filter((e) => e.level === "N1").slice(0, 3));

await writeFile(outPath, JSON.stringify(entries));
console.log("wrote", outPath, "(", (JSON.stringify(entries).length / 1024).toFixed(1), "KB )");
