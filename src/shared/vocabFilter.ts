// Shared vocabulary filters used by both the article word list and the
// lesson vocab list. `BASIC_WORDS` are N5-ish core items a learner past
// Genki 2 already knows; they're hidden by default to reduce noise.
// Hand-authored annotations / starred target words always override the
// filter — this list is only consulted for un-annotated tokens.

export const CONTENT_POS = new Set([
  "名詞",
  "動詞",
  "形容詞",
  "副詞",
  "連体詞",
  "感動詞",
]);

export const BASIC_WORDS = new Set<string>([
  // pronouns / demonstratives
  "私", "僕", "俺", "あなた", "君", "彼", "彼女", "自分",
  "これ", "それ", "あれ", "どれ", "この", "その", "あの", "どの",
  "ここ", "そこ", "あそこ", "どこ", "こちら", "そちら", "あちら", "どちら",
  "何", "誰", "いつ", "どう", "なぜ",
  // ultra-common verbs
  "する", "ある", "いる", "なる", "できる", "行く", "来る", "見る", "聞く",
  "言う", "思う", "分かる", "知る", "持つ", "使う", "出る", "入る", "作る",
  "話す", "書く", "読む", "買う", "食べる", "飲む", "会う", "遊ぶ", "働く",
  "休む", "起きる", "寝る", "帰る", "住む", "待つ", "取る", "始める", "終わる",
  "続く", "続ける", "始まる", "終わる", "変わる", "変える", "考える",
  "見せる", "教える", "呼ぶ", "忘れる", "覚える", "貸す", "借りる",
  "開ける", "閉める", "つける", "消す", "手伝う", "違う",
  "くれる", "あげる", "もらう", "みる", "きく",
  // time
  "今", "今日", "昨日", "明日", "今年", "去年", "来年", "今週", "先週", "来週",
  "朝", "昼", "夜", "夕方", "夕べ", "毎日", "毎週", "毎月", "毎年",
  "時", "分", "秒", "年", "月", "日", "週", "時間",
  // placeholder / very common nouns
  "人", "物", "事", "所", "とき", "こと", "もの", "ところ", "ため", "はず",
  "つもり", "方", "様", "たち", "みなさん", "みんな",
  // family / people
  "家族", "父", "母", "兄", "姉", "弟", "妹", "子", "子ども", "大人",
  "男", "女", "友達", "先生", "学生",
  // basic places
  "家", "部屋", "学校", "会社", "店", "駅", "町",
  // basic transport
  "車", "電車", "バス", "自転車", "飛行機",
  // basic food
  "水", "お茶", "ご飯", "ごはん", "パン",
  // basic spatial / relational
  "そば", "近く", "隣", "横", "側",
  // basic adjectives (i)
  "いい", "良い", "悪い", "大きい", "小さい", "新しい", "古い", "多い", "少ない",
  "楽しい", "面白い", "難しい", "易しい", "忙しい",
  "高い", "低い", "長い", "短い", "早い", "速い", "遅い", "近い", "遠い",
  "強い", "弱い", "熱い", "冷たい", "暑い", "寒い", "温かい", "涼しい",
  "美味しい", "まずい", "赤い", "青い", "白い", "黒い", "黄色い",
  // basic adjectives (na) / adjectival
  "好き", "嫌い", "上手", "下手", "元気", "大変", "大切", "簡単",
  "静か", "有名", "便利", "きれい", "きれいだ",
  // basic adverbs
  "とても", "もう", "まだ", "また", "いつも", "ずっと", "すぐ", "もっと",
  "ちょっと", "少し", "たくさん", "全部", "全然", "本当に", "実は",
  "たまに", "時々", "よく", "たぶん", "きっと", "ぜひ", "みんな",
  // numbers / counters (base forms)
  "一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "百", "千", "万",
  "つ", "個", "回", "本", "枚", "冊", "台", "度",
  // very common noun-like function words
  "後", "前", "上", "下", "中", "外", "右", "左", "間", "隣", "横", "側",
  // very common misc
  "はい", "いいえ", "ええ", "うん", "そう",
]);

/** True if a token's base or surface is in the N5-ish basic list. */
export function isBasicWord(key: string, surface: string): boolean {
  return BASIC_WORDS.has(key) || BASIC_WORDS.has(surface);
}

// Short surfaces that kuromoji tags as 名詞 or 動詞 but that are really
// grammatical fragments (auxiliaries, plural markers, counter stems,
// suffixes). Not worth listing as vocabulary.
const AUX_FRAGMENTS = new Set<string>([
  // passive / potential / causative auxiliaries and their stems
  "れ", "れる", "られ", "られる", "せる", "させる",
  // polite / assertive / conjectural
  "ます", "ました", "です", "でし", "でしょ", "だ", "だっ", "だろ",
  // plural / counter-like suffixes
  "たち", "ら", "つ", "個", "回", "本", "枚", "冊", "台", "度", "歳",
  // vowel-ending verb stems that appear alone after tokenization
  "い", "し", "き", "り",
  // sentence-final particles / interjections that slipped past POS
  "な", "ね", "よ", "か", "の",
  // honorifics / suffixes and other high-frequency function-y words
  // that aren't worth listing as target vocab
  "さん", "様", "君", "こう", "そう", "ああ", "どう",
]);

// Verb dictionary-form (辞書形) endings. A token tagged as 動詞 whose
// surface doesn't end in one of these is almost always a conjugated
// stem (出し, 届け, 運ん, 過ごし, 切り, もらい, やってき, …) rather
// than a headword worth listing.
const VERB_DICT_ENDINGS = new Set([
  "う", "く", "ぐ", "す", "つ", "ぬ", "ぶ", "む", "る",
]);

const KANJI_RE = /[一-龯㐀-䶿]/;
const DIGITS_PUNCT_RE = /^[\d\p{P}\p{S}\s]+$/u;

/**
 * True if a token looks like a grammatical fragment or non-word that
 * doesn't belong in a study word list. Numbers, single-kana particles,
 * and common auxiliary stems are trivial; anything with kanji or in the
 * curated fragment list is caught here.
 */
export function isTrivialToken(
  surface: string,
  key: string,
  pos?: string,
): boolean {
  const s = surface.trim();
  if (!s) return true;
  if (DIGITS_PUNCT_RE.test(s)) return true;
  // Single non-kanji character — almost always a particle/auxiliary
  // fragment, or a leftover conjugation piece.
  if (s.length === 1 && !KANJI_RE.test(s)) return true;
  if (AUX_FRAGMENTS.has(s) || AUX_FRAGMENTS.has(key)) return true;
  // Conjugated verb stems left over from tokenization (e.g. 出し, 届け,
  // 過ごし, 運ん). If it's tagged 動詞 but neither the surface nor the
  // base form ends in a dictionary-form kana, it's not a headword.
  if (pos === "動詞") {
    const lastS = s[s.length - 1];
    const lastK = key[key.length - 1];
    if (!VERB_DICT_ENDINGS.has(lastS) && !VERB_DICT_ENDINGS.has(lastK)) {
      return true;
    }
  }
  return false;
}
