// Curated articles with hand-authored per-word annotations. These are the
// "AI draft → hand edit" content: meanings/notes/examples you can freely
// edit. Words without an annotation still get automatic reading/POS from
// kuromoji, so only the important words need entries here.

export interface Example {
  ja: string;
  en: string;
}

export interface Annotation {
  /** Reading in hiragana (optional; falls back to kuromoji's reading). */
  reading?: string;
  /** Short gloss, e.g. "to help; to assist". */
  meaning: string;
  /** Optional part of speech label shown in the popup. */
  pos?: string;
  /** Optional grammar/context note (Satori's "OTHER NOTE" equivalent). */
  note?: string;
  examples?: Example[];
}

export interface Article {
  id: string;
  title: string;
  subtitle?: string;
  /** Body text; blank lines separate paragraphs. */
  text: string;
  /**
   * Annotations keyed by dictionary form. A key matches either a single
   * token's base form (e.g. "手伝う") or the surface of one-or-more
   * consecutive tokens (e.g. "降園", which kuromoji may split into 降 + 園).
   */
  annotations: Record<string, Annotation>;
  /**
   * Sentence-level English translations, keyed by the exact sentence text
   * (including trailing 。). Shown on demand via the per-sentence 訳 button.
   */
  translations?: Record<string, string>;
}

export const ARTICLES: Article[] = [
  {
    id: "kindergarten",
    title: "子どもたちと過ごす日々",
    subtitle: "幼稚園の先生の一日",
    text: `出勤は大体8時より少し前です。大体8時半から子どもたちが登園してくるので、朝の支度を手伝ったり、声をかけたりします。9時半過ぎにクラスの全員がそろうので、そこからトイレや手洗いなどをうながし、10時前後から一斉の活動が始まります。出欠を取ったり、その日のお当番を決めたりした後、図画工作などの「製作」やプール、体操などの主活動に入ります。12時から給食の準備が始まり、13時ごろまで給食の時間です。午後は天気がよければ外で、悪ければ室内で子どもたちと遊びます。13時半から帰りの準備が始まり、子どもたちに絵本や紙芝居を読んで、13時45分には子どもたちは降園となります。ただ、通園バスに乗って帰る子と保護者がお迎えに来る子たちの時間がバラバラなので、全員帰るのは大体14時45分です。全員が降園するまでは子どもたちと室内で遊んだりして過ごし、預かり保育の子は昼間とは別の先生が担当しますので、そこで交代になります。
子どもたちが帰った後は、園舎や部屋の掃除をして、その日の日誌を書きます。16時ぐらいに終礼があり、終わったら同じ学年の先生と打ち合わせや準備をして、17時15分に退勤します。
土日祝日と、夏休み、春休み、冬休みなどの長期休みは幼稚園も基本的にはお休みですが、預かり保育を希望するご家庭もあるので、先生たちは交代で出勤します。`,
    annotations: {
      出勤: {
        reading: "しゅっきん",
        pos: "名詞・する動詞",
        meaning: "going to work; reporting for work",
        note: "「出（で）」+「勤（つとめ）」。会社や職場に行くこと。反対は「退勤」。",
        examples: [{ ja: "毎朝8時に出勤する。", en: "I go to work at 8 every morning." }],
      },
      登園: {
        reading: "とうえん",
        pos: "名詞・する動詞",
        meaning: "(of a child) arriving at nursery school / kindergarten",
        note: "園児が幼稚園・保育園に来ること。帰るときは「降園（こうえん）」。",
      },
      支度: {
        reading: "したく",
        pos: "名詞・する動詞",
        meaning: "preparation; getting ready",
        note: "「準備」とほぼ同じだが、身の回りのことに使うことが多い（食事の支度、出かける支度）。",
      },
      手伝う: {
        reading: "てつだう",
        pos: "動詞（五段）",
        meaning: "to help; to assist",
        examples: [{ ja: "母の料理を手伝う。", en: "I help my mother cook." }],
      },
      一斉: {
        reading: "いっせい",
        pos: "名詞・副詞的",
        meaning: "all at once; all together; simultaneous",
        note: "「一斉に」の形で「みんな同時に」の意味。",
      },
      出欠: {
        reading: "しゅっけつ",
        pos: "名詞",
        meaning: "attendance (presence or absence)",
        note: "「出席」と「欠席」を合わせた語。「出欠を取る」で出席確認をすること。",
      },
      当番: {
        reading: "とうばん",
        pos: "名詞",
        meaning: "being on duty; person whose turn it is",
        note: "順番で回ってくる係。「お当番」と丁寧に言うことも多い。",
      },
      製作: {
        reading: "せいさく",
        pos: "名詞・する動詞",
        meaning: "making; production (here: arts and crafts)",
        note: "物を作ること。幼稚園では工作・お絵かきなどの活動を指す。",
      },
      体操: { reading: "たいそう", pos: "名詞・する動詞", meaning: "exercises; gymnastics" },
      給食: {
        reading: "きゅうしょく",
        pos: "名詞",
        meaning: "school lunch (provided meal)",
        note: "学校や園でみんなに出される食事。",
      },
      準備: { reading: "じゅんび", pos: "名詞・する動詞", meaning: "preparation; getting ready" },
      紙芝居: {
        reading: "かみしばい",
        pos: "名詞",
        meaning: "kamishibai; picture-story show",
        note: "絵を1枚ずつ見せながら語る、紙の芝居。日本の伝統的な語り物。",
      },
      降園: {
        reading: "こうえん",
        pos: "名詞・する動詞",
        meaning: "leaving nursery school / kindergarten (to go home)",
        note: "園児が帰ること。来るときは「登園」。",
      },
      保護者: {
        reading: "ほごしゃ",
        pos: "名詞",
        meaning: "guardian; parent",
        note: "子どもを保護する人（親など）。学校からのお知らせでよく使う丁寧な語。",
      },
      園舎: { reading: "えんしゃ", pos: "名詞", meaning: "the nursery / kindergarten building" },
      掃除: { reading: "そうじ", pos: "名詞・する動詞", meaning: "cleaning" },
      日誌: {
        reading: "にっし",
        pos: "名詞",
        meaning: "daily log; journal",
        note: "その日の出来事を記録するノート。「日記」より公的・業務的な語。",
      },
      終礼: {
        reading: "しゅうれい",
        pos: "名詞",
        meaning: "end-of-day meeting",
        note: "一日の終わりの短い集まり。朝は「朝礼（ちょうれい）」。",
      },
      退勤: { reading: "たいきん", pos: "名詞・する動詞", meaning: "leaving work; clocking out" },
      幼稚園: { reading: "ようちえん", pos: "名詞", meaning: "kindergarten" },
      預かり保育: {
        reading: "あずかりほいく",
        pos: "名詞",
        meaning: "extended childcare (outside regular hours)",
        note: "通常の保育時間の前後に、希望者の子どもを預かる保育。",
      },
      担当: {
        reading: "たんとう",
        pos: "名詞・する動詞",
        meaning: "being in charge of; taking care of",
      },
    },
    translations: {
      "出勤は大体8時より少し前です。": "I usually get to work a little before 8.",
      "大体8時半から子どもたちが登園してくるので、朝の支度を手伝ったり、声をかけたりします。":
        "The children start arriving around 8:30, so I help them get ready in the morning and greet them.",
      "9時半過ぎにクラスの全員がそろうので、そこからトイレや手洗いなどをうながし、10時前後から一斉の活動が始まります。":
        "By a little after 9:30 the whole class has gathered, so from there I get them to use the toilet and wash their hands, and around 10 the group activities begin.",
      "出欠を取ったり、その日のお当番を決めたりした後、図画工作などの「製作」やプール、体操などの主活動に入ります。":
        "After taking attendance and deciding the day's helpers, we move into the main activities, such as arts and crafts (\"seisaku\"), swimming, and exercises.",
      "12時から給食の準備が始まり、13時ごろまで給食の時間です。":
        "Lunch preparation starts at 12, and lunchtime lasts until around 1.",
      "午後は天気がよければ外で、悪ければ室内で子どもたちと遊びます。":
        "In the afternoon, if the weather is nice we play outside with the children, and if not, indoors.",
      "13時半から帰りの準備が始まり、子どもたちに絵本や紙芝居を読んで、13時45分には子どもたちは降園となります。":
        "Preparation for going home starts at 1:30; we read the children picture books and kamishibai, and at 1:45 they head home.",
      "ただ、通園バスに乗って帰る子と保護者がお迎えに来る子たちの時間がバラバラなので、全員帰るのは大体14時45分です。":
        "However, since the times differ for children who take the bus and those whose guardians come to pick them up, everyone is gone by about 2:45.",
      "全員が降園するまでは子どもたちと室内で遊んだりして過ごし、預かり保育の子は昼間とは別の先生が担当しますので、そこで交代になります。":
        "Until everyone has left, I spend the time playing indoors with the children, and since a different teacher takes charge of the extended-care kids, we switch over at that point.",
      "子どもたちが帰った後は、園舎や部屋の掃除をして、その日の日誌を書きます。":
        "After the children go home, I clean the building and the rooms and write the day's log.",
      "16時ぐらいに終礼があり、終わったら同じ学年の先生と打ち合わせや準備をして、17時15分に退勤します。":
        "Around 4 there's an end-of-day meeting, and afterward I plan and prepare with the teachers in the same grade, then leave work at 5:15.",
      "土日祝日と、夏休み、春休み、冬休みなどの長期休みは幼稚園も基本的にはお休みですが、預かり保育を希望するご家庭もあるので、先生たちは交代で出勤します。":
        "The kindergarten is basically closed on weekends, holidays, and long breaks like summer, spring, and winter vacation, but since some families want extended childcare, the teachers take turns coming in to work.",
    },
  },
  {
    id: "mocha",
    title: "モカの紹介",
    subtitle: "コーヒー色の猫",
    text: `モカはコーヒー豆の色によく似ている猫です。名前はその毛の色から付けられました。とても食いしんぼうで、いつも何か食べています。`,
    annotations: {
      モカ: {
        reading: "もか",
        pos: "名詞（固有名詞）",
        meaning: "Mocha (the cat's name)",
        note: "コーヒーの一種「モカ」から。毛の色がコーヒー豆に似ていることが由来。",
      },
      コーヒー豆: { reading: "コーヒーまめ", pos: "名詞", meaning: "coffee bean(s)" },
      似る: {
        reading: "にる",
        pos: "動詞（上一段）",
        meaning: "to resemble; to look like",
        note: "「〜に似ている」の形でよく使う。ここでは「色に似ている」。",
      },
      付ける: {
        reading: "つける",
        pos: "動詞（下一段）",
        meaning: "to attach; (here) to give (a name)",
        note: "「名前をつける」で「名づける」という意味の決まった言い方。",
      },
      食いしんぼう: {
        reading: "くいしんぼう",
        pos: "名詞",
        meaning: "glutton; someone who loves eating",
      },
    },
    translations: {
      "モカはコーヒー豆の色によく似ている猫です。":
        "Mocha is a cat whose color closely resembles that of coffee beans.",
      "名前はその毛の色から付けられました。":
        "Her name was given after the color of her fur.",
      "とても食いしんぼうで、いつも何か食べています。":
        "She's a real glutton and is always eating something.",
    },
  },
];
