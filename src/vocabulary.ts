// Per-user monthly vocabulary pools. Each user has a growing set of words
// they're actively studying. Articles and quizzes reference this pool by
// dictionary form so we can weight cloze picks and drive an EN → JP
// flashcard tab from the same source of truth.

export interface VocabItem {
  /** Dictionary form / headword (as it should appear in an article). */
  word: string;
  reading: string;
  /** Short English gloss, semicolon-separated for near-synonyms. */
  meaningEn: string;
  /** Rough part of speech tag, mostly for grouping in the UI. */
  pos?: string;
  /** Optional short note (contrast, usage, gotcha). */
  note?: string;
  /** Month tag when this word was added, e.g. "2026-09". */
  month?: string;
  /** Related Tobira lesson if the word co-occurs with that chapter's theme. */
  tobiraLesson?: number;
}

// Artem's monthly pool. First batch (2026-09) is his current list of ~60
// words. Additions in later months should carry a new `month` tag so the
// UI can highlight what's new without losing the review carry-over.
export const ARTEM_VOCAB: VocabItem[] = [
  // --- Verbs ---
  { word: "相談する", reading: "そうだんする", meaningEn: "to consult; to discuss", pos: "する動詞", month: "2026-09" },
  { word: "売る", reading: "うる", meaningEn: "to sell", pos: "動詞", month: "2026-09" },
  { word: "走る", reading: "はしる", meaningEn: "to run", pos: "動詞", month: "2026-09" },
  { word: "困る", reading: "こまる", meaningEn: "to be troubled; to be in a bind", pos: "動詞", month: "2026-09" },
  { word: "違う", reading: "ちがう", meaningEn: "to differ; to be wrong", pos: "動詞", note: "「違い」(noun) は差・違いのこと。", month: "2026-09" },
  { word: "習う", reading: "ならう", meaningEn: "to learn (from a teacher)", pos: "動詞", month: "2026-09" },
  { word: "作る", reading: "つくる", meaningEn: "to make; to build", pos: "動詞", month: "2026-09" },
  { word: "呼ぶ", reading: "よぶ", meaningEn: "to call; to invite", pos: "動詞", month: "2026-09" },
  { word: "増える", reading: "ふえる", meaningEn: "to increase", pos: "動詞", month: "2026-09" },
  { word: "残る", reading: "のこる", meaningEn: "to remain; to be left over", pos: "動詞", month: "2026-09" },
  { word: "続く", reading: "つづく", meaningEn: "to continue; to go on", pos: "動詞", month: "2026-09" },
  { word: "待つ", reading: "まつ", meaningEn: "to wait", pos: "動詞", month: "2026-09" },

  // --- Nouns: people & society ---
  { word: "先輩", reading: "せんぱい", meaningEn: "senior (at school/work)", pos: "名詞", month: "2026-09" },
  { word: "後輩", reading: "こうはい", meaningEn: "junior (at school/work)", pos: "名詞", month: "2026-09" },
  { word: "選手", reading: "せんしゅ", meaningEn: "athlete; player", pos: "名詞", month: "2026-09" },
  { word: "弟", reading: "おとうと", meaningEn: "younger brother", pos: "名詞", month: "2026-09" },
  { word: "皆さん", reading: "みなさん", meaningEn: "everyone (polite)", pos: "名詞", month: "2026-09" },
  { word: "若者", reading: "わかもの", meaningEn: "young people; youth", pos: "名詞", month: "2026-09" },
  { word: "消費者", reading: "しょうひしゃ", meaningEn: "consumer", pos: "名詞", month: "2026-09", tobiraLesson: 5 },
  { word: "一人暮らし", reading: "ひとりぐらし", meaningEn: "living alone", pos: "名詞", month: "2026-09" },

  // --- Nouns: places, things, food ---
  { word: "建物", reading: "たてもの", meaningEn: "building", pos: "名詞", month: "2026-09" },
  { word: "袋", reading: "ふくろ", meaningEn: "bag; sack", pos: "名詞", month: "2026-09" },
  { word: "列", reading: "れつ", meaningEn: "row; line; queue", pos: "名詞", month: "2026-09" },
  { word: "お湯", reading: "おゆ", meaningEn: "hot water", pos: "名詞", month: "2026-09", tobiraLesson: 5 },
  { word: "麺", reading: "めん", meaningEn: "noodles", pos: "名詞", month: "2026-09", tobiraLesson: 5 },
  { word: "油", reading: "あぶら", meaningEn: "oil (cooking or otherwise)", pos: "名詞", month: "2026-09", tobiraLesson: 5 },
  { word: "味", reading: "あじ", meaningEn: "taste; flavor", pos: "名詞", month: "2026-09", tobiraLesson: 5 },
  { word: "浅草", reading: "あさくさ", meaningEn: "Asakusa (district in Tokyo)", pos: "固有名詞", month: "2026-09" },

  // --- Nouns: business / abstract ---
  { word: "授業", reading: "じゅぎょう", meaningEn: "class; lesson", pos: "名詞", month: "2026-09" },
  { word: "商品", reading: "しょうひん", meaningEn: "product; merchandise", pos: "名詞", month: "2026-09", tobiraLesson: 5 },
  { word: "発明", reading: "はつめい", meaningEn: "invention", pos: "名詞・する動詞", month: "2026-09" },
  { word: "失敗", reading: "しっぱい", meaningEn: "failure; mistake", pos: "名詞・する動詞", month: "2026-09" },
  { word: "成功", reading: "せいこう", meaningEn: "success", pos: "名詞・する動詞", month: "2026-09" },
  { word: "競争", reading: "きょうそう", meaningEn: "competition", pos: "名詞・する動詞", month: "2026-09" },
  { word: "消費", reading: "しょうひ", meaningEn: "consumption (using up)", pos: "名詞・する動詞", month: "2026-09", tobiraLesson: 5 },
  { word: "元祖", reading: "がんそ", meaningEn: "founder; originator; the first", pos: "名詞", month: "2026-09", tobiraLesson: 5 },
  { word: "物語", reading: "ものがたり", meaningEn: "story; tale", pos: "名詞", month: "2026-09" },
  { word: "種類", reading: "しゅるい", meaningEn: "kind; type; variety", pos: "名詞", month: "2026-09" },
  { word: "値段", reading: "ねだん", meaningEn: "price", pos: "名詞", month: "2026-09" },
  { word: "違い", reading: "ちがい", meaningEn: "difference", pos: "名詞", note: "動詞「違う」の名詞形。", month: "2026-09" },

  // --- Nouns: time & place ---
  { word: "現在", reading: "げんざい", meaningEn: "the present; currently", pos: "名詞", month: "2026-09" },
  { word: "過去", reading: "かこ", meaningEn: "the past", pos: "名詞", month: "2026-09" },
  { word: "以上", reading: "いじょう", meaningEn: "or more; the above", pos: "名詞", month: "2026-09" },
  { word: "前", reading: "まえ", meaningEn: "before; in front", pos: "名詞", month: "2026-09" },
  { word: "初め", reading: "はじめ", meaningEn: "the beginning (period, not action)", pos: "名詞", note: "「始め」は動作の開始点。「初め」は時期・順序としての初期。", month: "2026-09" },
  { word: "始め", reading: "はじめ", meaningEn: "the start (of an action)", pos: "名詞", note: "「初め」は時期。「始め」は行動の開始。", month: "2026-09" },
  { word: "戦後", reading: "せんご", meaningEn: "postwar; after WWII", pos: "名詞", month: "2026-09" },
  { word: "国内", reading: "こくない", meaningEn: "domestic; within the country", pos: "名詞", month: "2026-09" },
  { word: "東南", reading: "とうなん", meaningEn: "southeast", pos: "名詞", month: "2026-09" },

  // --- Body / body-adjacent ---
  { word: "足", reading: "あし", meaningEn: "foot; leg", pos: "名詞", month: "2026-09" },

  // --- Adjectives ---
  { word: "便利", reading: "べんり", meaningEn: "convenient", pos: "形容動詞", month: "2026-09" },
  { word: "大切", reading: "たいせつ", meaningEn: "important; precious", pos: "形容動詞", month: "2026-09" },
  { word: "悪い", reading: "わるい", meaningEn: "bad", pos: "形容詞", month: "2026-09" },
  { word: "貧乏", reading: "びんぼう", meaningEn: "poor; broke", pos: "形容動詞", month: "2026-09" },
  { word: "簡単", reading: "かんたん", meaningEn: "easy; simple", pos: "形容動詞", month: "2026-09" },
  { word: "安い", reading: "やすい", meaningEn: "cheap; inexpensive", pos: "形容詞", month: "2026-09" },
  { word: "長い", reading: "ながい", meaningEn: "long", pos: "形容詞", month: "2026-09" },

  // --- Counters, quantifiers, particles-ish ---
  { word: "個", reading: "こ", meaningEn: "counter for small objects", pos: "助数詞", month: "2026-09" },
  { word: "億", reading: "おく", meaningEn: "hundred million (100,000,000)", pos: "名詞", month: "2026-09" },
  { word: "約", reading: "やく", meaningEn: "approximately; about", pos: "副詞", month: "2026-09" },
  {
    word: "化",
    reading: "か",
    meaningEn: "-ification; -ization (suffix)",
    pos: "接尾辞",
    note: "名詞やナ形容詞について「〜化する／〜化」と使う（例：現代化、ビジネス化）。とびら L5-8。",
    month: "2026-09",
    tobiraLesson: 5,
  },
];

const POOLS: Record<string, VocabItem[]> = {
  artem: ARTEM_VOCAB,
};

export function vocabForPool(poolId: string | undefined): VocabItem[] {
  if (!poolId) return [];
  return POOLS[poolId] ?? [];
}

/** Group a pool by month tag, newest first. */
export function vocabByMonth(items: VocabItem[]): { month: string; items: VocabItem[] }[] {
  const groups = new Map<string, VocabItem[]>();
  for (const it of items) {
    const key = it.month ?? "";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(it);
  }
  return [...groups.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([month, items]) => ({ month, items }));
}
