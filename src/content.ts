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

/** Fill-in-the-blank vocabulary question (4 choices). */
export interface ClozeQuestion {
  /** Text before the blank. */
  before: string;
  /** Text after the blank. */
  after: string;
  options: string[];
  /** Index into options of the correct word. */
  answer: number;
  explanation?: string;
}

/** Open reading-comprehension question with a reveal-on-click model answer. */
export interface ReadingQuestion {
  question: string;
  /** Model answer, revealed when the reader clicks "解答を見る". */
  answer: string;
  /**
   * Optional list of words the learner should use in their own answer.
   * Shown as chips behind a click-to-reveal "使う単語のヒント" button so
   * they don't spoil the exercise unless asked for.
   */
  hints?: string[];
}

/**
 * Sentence-rearrangement question. `chunks` are stored in correct order and
 * shuffled at display time. `grammarKey` points into the Tobira grammar
 * index (e.g. "tobira-5-10") so the UI can show the pattern's explanation.
 */
export interface RearrangeQuestion {
  /** English target sentence the learner should reconstruct. */
  translation: string;
  /** Chunks in the correct order; the UI shuffles for display. */
  chunks: string[];
  /** Tobira grammar id, e.g. "tobira-5-10". */
  grammarKey?: string;
  /** Optional short prompt shown above the chunks. */
  hint?: string;
}

export interface Quiz {
  cloze?: ClozeQuestion[];
  reading?: ReadingQuestion[];
  rearrange?: RearrangeQuestion[];
}

export interface Article {
  id: string;
  title: string;
  subtitle?: string;
  /** Date the article was added (YYYY-MM-DD); used to sort the sidebar. */
  date?: string;
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
  /**
   * Paragraph lines (exact text) that should render as section headings
   * rather than body text.
   */
  headings?: string[];
  /** Optional per-article quiz (fill-in-the-blank + reading comprehension). */
  quiz?: Quiz;
  /**
   * Tobira grammar ids this article intentionally practices (e.g.
   * "tobira-5-10"). Used to pick review articles and to render tags in the
   * sidebar. Purely informational — the article is still just prose.
   */
  targetGrammar?: string[];
  /**
   * Dictionary-form words from the user's monthly vocab pool that this
   * article intentionally features. Used to weight cloze picks and to show
   * which pool items each article covers.
   */
  targetVocab?: string[];
}

export const ARTICLES: Article[] = [
  {
    id: "growth",
    title: "子どもたちの成長を見守れる",
    subtitle: "足立つばめ幼稚園の先生インタビュー",
    date: "2026-07-12",
    text: `この仕事のやりがいは、「子どもたちの成長が見える」ところです。年少クラスの幼いときから見ていた子が、年中、年長となり、卒園していくときにはいつもすごく感動します。「こんなことができるようになったんだな」とか「おむつをはいていたのに」とか、そういった成長を近くで感じられるという点で、とても魅力的な仕事だと思っています。
また、普通の仕事よりも、「一年間の流れ」というのを意識することが多い仕事ではないでしょうか。学生のころみたいに長期休みがあり、この季節はこんな感じで、こういう行事があって、というのを、子どもたちに教えながら、自分自身も感じつつ仕事をしていきます。季節の移ろいや自然の変化も身近に感じますし、一年ごとに「今年もやりきった！」という気持ちになれるのもいいところだと思います。
あと、足立つばめ幼稚園の特色としては、開園したのが1967年と、とても長く続いている幼稚園です。そうなると、この園を卒園した子が大人になり、結婚してお子さんができて、今度は自分が通っていた幼稚園にお子さんを通わせる、という方も多いです。また、年長のときに同じクラスだった卒園生同士で結婚して、今、お子さんを通わせている方もいます。そういう再会があるのも、この仕事の魅力ですね。
子どもたちみんなが「今日は楽しかった」で帰れるように
日々心がけているのは、「来たときと同じ状態で子どもを帰す」ということです。これは私が通っていた専修学校で教えられたことなのですが、登園してきた子どもがけがなどをせず、来たときと同じように元気な状態で帰宅できるように、ということです。もちろん、朝なにかがあり泣きながら登園してくる子どももいるので、そういう子は笑顔で帰れるといいですよね。最終的には、みんなが「今日は楽しかったな」という気持ちで帰れるようにしたいなと思っています。
あとは、「正しい言葉」を使うこと、汚い言葉を使わないことを心がけています。流行の言葉などもあまり使わないようにしています。また、「正しいこと」「よくないこと」をきちんと教えることも大切にしています。子どもたちがなにかよくないことや危ないことをしていたとき、軽く「ダメだよ」と流してしまうと、エスカレートしてけがにつながることもあります。悪いことをしたときは「ダメだよ」と、その都度きちんと教えるようにしています。`,
    headings: ["子どもたちみんなが「今日は楽しかった」で帰れるように"],
    annotations: {
      やりがい: {
        reading: "やりがい",
        pos: "名詞",
        meaning: "sense of fulfillment; something worth doing",
      },
      成長: { reading: "せいちょう", pos: "名詞・する動詞", meaning: "growth; development" },
      年少: {
        reading: "ねんしょう",
        pos: "名詞",
        meaning: "youngest class (3-year-olds)",
        note: "幼稚園のクラス分け。下から 年少→年中→年長。",
      },
      年中: { reading: "ねんちゅう", pos: "名詞", meaning: "middle class (4-year-olds)" },
      年長: { reading: "ねんちょう", pos: "名詞", meaning: "oldest class (5-year-olds)" },
      卒園: {
        reading: "そつえん",
        pos: "名詞・する動詞",
        meaning: "graduating from kindergarten",
        note: "「卒業」の幼稚園・保育園版。",
      },
      感動: {
        reading: "かんどう",
        pos: "名詞・する動詞",
        meaning: "being deeply moved; being touched",
      },
      幼い: { reading: "おさない", pos: "形容詞", meaning: "very young; little" },
      魅力的: { reading: "みりょくてき", pos: "形容動詞", meaning: "attractive; appealing" },
      普通: { reading: "ふつう", pos: "名詞・形容動詞", meaning: "ordinary; normal; usual" },
      意識: {
        reading: "いしき",
        pos: "名詞・する動詞",
        meaning: "awareness; being conscious of",
        note: "「〜を意識する」で「〜を強く気にかける」。",
      },
      行事: { reading: "ぎょうじ", pos: "名詞", meaning: "event; scheduled function" },
      季節: { reading: "きせつ", pos: "名詞", meaning: "season" },
      移ろい: {
        reading: "うつろい",
        pos: "名詞",
        meaning: "change; transition (esp. of the seasons)",
      },
      身近: { reading: "みぢか", pos: "形容動詞", meaning: "close; familiar; near at hand" },
      特色: { reading: "とくしょく", pos: "名詞", meaning: "distinctive feature; characteristic" },
      開園: {
        reading: "かいえん",
        pos: "名詞・する動詞",
        meaning: "opening (of a kindergarten / park)",
      },
      結婚: { reading: "けっこん", pos: "名詞・する動詞", meaning: "marriage; getting married" },
      同士: {
        reading: "どうし",
        pos: "名詞（接尾的）",
        meaning: "fellow —; one another (of the same kind)",
        note: "「卒園生同士」で「卒園生どうし＝互いに卒園生」。",
      },
      再会: { reading: "さいかい", pos: "名詞・する動詞", meaning: "reunion; meeting again" },
      魅力: { reading: "みりょく", pos: "名詞", meaning: "charm; appeal; attraction" },
      心がける: {
        reading: "こころがける",
        pos: "動詞（下一段）",
        meaning: "to keep in mind; to make a point of",
      },
      状態: { reading: "じょうたい", pos: "名詞", meaning: "state; condition" },
      専修学校: {
        reading: "せんしゅうがっこう",
        pos: "名詞",
        meaning: "vocational / specialized training school",
      },
      帰宅: { reading: "きたく", pos: "名詞・する動詞", meaning: "returning home" },
      笑顔: { reading: "えがお", pos: "名詞", meaning: "smile; smiling face" },
      最終的: { reading: "さいしゅうてき", pos: "形容動詞", meaning: "ultimate; in the end" },
      言葉: { reading: "ことば", pos: "名詞", meaning: "word; language; speech" },
      流行: {
        reading: "りゅうこう",
        pos: "名詞・する動詞",
        meaning: "trend; fashion; what's popular",
      },
      大切: { reading: "たいせつ", pos: "形容動詞", meaning: "important; precious" },
      危ない: { reading: "あぶない", pos: "形容詞", meaning: "dangerous; risky" },
      都度: {
        reading: "つど",
        pos: "名詞",
        meaning: "each time; every time",
        note: "「その都度」で「そのたびごとに」。",
      },
    },
    translations: {
      "この仕事のやりがいは、「子どもたちの成長が見える」ところです。":
        "The rewarding part of this job is that you can see the children grow.",
      "年少クラスの幼いときから見ていた子が、年中、年長となり、卒園していくときにはいつもすごく感動します。":
        "When a child I'd watched since the youngest (nensho) class moves up through the middle and oldest classes and then graduates, it always moves me deeply.",
      "「こんなことができるようになったんだな」とか「おむつをはいていたのに」とか、そういった成長を近くで感じられるという点で、とても魅力的な仕事だと思っています。":
        "Being able to feel that growth up close — thinking \"so they can do this now\" or \"and to think they were still in diapers\" — makes it a truly appealing job.",
      "また、普通の仕事よりも、「一年間の流れ」というのを意識することが多い仕事ではないでしょうか。":
        "Also, isn't this a job where, more than ordinary work, you're often conscious of \"the flow of the year\"?",
      "学生のころみたいに長期休みがあり、この季節はこんな感じで、こういう行事があって、というのを、子どもたちに教えながら、自分自身も感じつつ仕事をしていきます。":
        "Like in your student days there are long vacations, and I work while teaching the children — and feeling it myself — that this season feels a certain way and comes with certain events.",
      "季節の移ろいや自然の変化も身近に感じますし、一年ごとに「今年もやりきった！」という気持ちになれるのもいいところだと思います。":
        "I feel the changing seasons and shifts in nature up close, and it's nice that each year I get to feel \"I gave it my all again this year.\"",
      "あと、足立つばめ幼稚園の特色としては、開園したのが1967年と、とても長く続いている幼稚園です。":
        "As for what makes Adachi Tsubame Kindergarten distinctive, it opened in 1967 and has been running for a very long time.",
      "そうなると、この園を卒園した子が大人になり、結婚してお子さんができて、今度は自分が通っていた幼稚園にお子さんを通わせる、という方も多いです。":
        "As a result, many people who graduated from this kindergarten grow up, get married, have children, and then send their own children to the kindergarten they once attended.",
      "また、年長のときに同じクラスだった卒園生同士で結婚して、今、お子さんを通わせている方もいます。":
        "There are also people who married a fellow graduate who was in the same class in the oldest year, and now send their children here.",
      "そういう再会があるのも、この仕事の魅力ですね。":
        "Having those kinds of reunions is another appeal of this job.",
      "日々心がけているのは、「来たときと同じ状態で子どもを帰す」ということです。":
        "What I keep in mind every day is \"sending a child home in the same condition they came in.\"",
      "これは私が通っていた専修学校で教えられたことなのですが、登園してきた子どもがけがなどをせず、来たときと同じように元気な状態で帰宅できるように、ということです。":
        "This is something I was taught at the vocational school I attended: making sure a child who comes to kindergarten goes home without injuries, just as healthy as when they arrived.",
      "もちろん、朝なにかがあり泣きながら登園してくる子どももいるので、そういう子は笑顔で帰れるといいですよね。":
        "Of course, some children arrive in the morning crying because something happened, so it would be lovely if those children could go home smiling.",
      "最終的には、みんなが「今日は楽しかったな」という気持ちで帰れるようにしたいなと思っています。":
        "Ultimately, I want everyone to be able to go home feeling \"today was fun.\"",
      "あとは、「正しい言葉」を使うこと、汚い言葉を使わないことを心がけています。":
        "I also make a point of using \"correct language\" and not using coarse words.",
      "流行の言葉などもあまり使わないようにしています。":
        "I try not to use trendy slang too much either.",
      "また、「正しいこと」「よくないこと」をきちんと教えることも大切にしています。":
        "I also make sure to clearly teach what is \"right\" and what is \"not good.\"",
      "子どもたちがなにかよくないことや危ないことをしていたとき、軽く「ダメだよ」と流してしまうと、エスカレートしてけがにつながることもあります。":
        "When children are doing something bad or dangerous, brushing it off with a light \"no, don't\" can escalate and lead to injury.",
      "悪いことをしたときは「ダメだよ」と、その都度きちんと教えるようにしています。":
        "So when they do something wrong, I make sure to teach them properly, each and every time, with a firm \"no.\"",
    },
    quiz: {
      cloze: [
        {
          before: "年少クラスの幼いときから見ていた子が、年中、年長となり、",
          after: "していくときにはいつもすごく感動します。",
          options: ["登園", "卒園", "出勤", "開園"],
          answer: 1,
          explanation:
            "「卒園」は幼稚園を終えて出ていくこと。来る「登園」／帰る「降園」とセットで覚えると◎。",
        },
        {
          before: "また、普通の仕事よりも、「一年間の流れ」というのを",
          after: "することが多い仕事ではないでしょうか。",
          options: ["意識", "感動", "再会", "準備"],
          answer: 0,
          explanation: "「〜を意識する」＝〜を強く気にかける。ここでは一年の流れを常に気にかける。",
        },
        {
          before: "登園してきた子どもがけがなどをせず、来たときと同じように元気な",
          after: "で帰宅できるように、ということです。",
          options: ["状態", "気持ち", "笑顔", "季節"],
          answer: 0,
          explanation: "「状態」＝コンディション。「元気な状態で帰宅する」。",
        },
        {
          before: "もちろん、朝なにかがあり泣きながら登園してくる子どももいるので、そういう子は",
          after: "で帰れるといいですよね。",
          options: ["笑顔", "状態", "都度", "行事"],
          answer: 0,
          explanation: "泣いて来た子が「笑顔」で帰れるといい、という対比。",
        },
      ],
      reading: [
        {
          question: "筆者がこの仕事に最も「やりがい」を感じるのはどんなときですか。本文の言葉を使って書きましょう。",
          answer:
            "年少のときから見ていた子が年中・年長となり、卒園していくとき。子どもたちの成長を近くで感じられることに、やりがいと感動を覚えている。",
        },
        {
          question: "「一年ごとに『今年もやりきった！』という気持ちになれる」のはなぜですか。",
          answer:
            "幼稚園は普通の仕事より「一年間の流れ」を意識する仕事で、季節の移ろいや行事を子どもに教えながら自分自身も感じるため、一年の区切りで達成感を得られるから。",
        },
        {
          question: "足立つばめ幼稚園が長く続いていることで生まれる「再会」を、2つ挙げましょう。",
          answer:
            "①この園を卒園した人が大人になり、自分の子を同じ幼稚園に通わせること。②年長で同じクラスだった卒園生同士が結婚し、子どもを通わせること。",
        },
        {
          question: "「来たときと同じ状態で子どもを帰す」とは、具体的にどういうことですか。",
          answer:
            "登園してきた子どもがけがなどをせず、来たときと同じように元気な状態で帰宅できるようにする、ということ。",
        },
        {
          question: "子どもが危ないことをしたとき、筆者はなぜ「その都度きちんと教える」のですか。",
          answer:
            "軽く「ダメだよ」と流してしまうと、行動がエスカレートしてけがにつながることがあるから。",
        },
      ],
    },
  },
  {
    id: "professions-daily",
    title: "身近な職業",
    subtitle: "生活を支える人たち",
    date: "2026-08-02",
    text: `私たちの生活は、いろいろな仕事の人に支えられています。今日はその中で、毎日どこかで出会う職業を紹介します。

まず、病院で働く人たちです。体の具合が悪くなったら、まず医師に診てもらいます。医師の中でも、風邪やお腹の痛みなど体の中の病気を診るのは内科医、手術で病気やけがを治すのは外科医です。子ども専門の医師は小児科医と呼ばれます。医師のそばで患者さんの世話をするのが看護師です。診察が終わったら、薬局に行きます。そこで薬を出してくれるのが薬剤師です。

次に、学校です。学校で勉強を教えてくれる人を先生といいます。小さい子どもをみる保育士も、広い意味では先生の一種です。保育士は、保育園で1歳から5歳ぐらいの子どもと一緒に過ごし、生活の仕方を教えます。

町のお店にも、たくさんの仕事があります。コンビニやスーパーの店員は、レジや商品の並べ直しをしています。髪を切りたくなったら、美容師のいる美容室に行きます。朝ごはんのパンは、パン屋さんが毎朝早く起きて作ってくれています。

最後に、町で見かける人たちです。警察官は、町の安全を守る仕事をしています。火事が起きたら、消防車で消防士がやってきます。ネットで買った荷物は配達員が家まで運んでくれて、手紙やはがきは郵便屋さんが届けてくれます。こうしてみると、私たちの一日は、本当にたくさんの職業に支えられていますね。`,
    annotations: {
      職業: {
        reading: "しょくぎょう",
        pos: "名詞",
        meaning: "occupation; profession",
        note: "「仕事」より少し硬い言葉。履歴書やアンケートでよく使う。",
      },
      支える: {
        reading: "ささえる",
        pos: "動詞（下一段）",
        meaning: "to support; to hold up",
        note: "物理的にも比喩的にも使う。「家族を支える」「経済を支える」など。",
      },
      医師: {
        reading: "いし",
        pos: "名詞",
        meaning: "doctor; physician",
        note: "病気やけがの人を診て、治す仕事。会話では「お医者さん」の方が多い。",
        examples: [
          { ja: "姉は大学病院で医師として働いています。", en: "My older sister works as a doctor at a university hospital." },
        ],
      },
      診る: {
        reading: "みる",
        pos: "動詞（上一段）",
        meaning: "to examine (a patient)",
        note: "「見る」と同じ発音だが、医師が患者を診察する時はこちらの漢字を使う。",
      },
      内科医: {
        reading: "ないかい",
        pos: "名詞",
        meaning: "internist; internal medicine doctor",
        note: "風邪やお腹の痛みなど、体の中の病気を診る医師。手術はしない。",
        examples: [
          { ja: "熱が下がらないので、内科医に診てもらった。", en: "My fever wouldn't go down, so I had an internist see me." },
        ],
      },
      外科医: {
        reading: "げかい",
        pos: "名詞",
        meaning: "surgeon",
        note: "手術で病気やけがを治す医師。",
        examples: [
          { ja: "その病気は外科医の手術が必要です。", en: "That illness needs surgery from a surgeon." },
        ],
      },
      小児科医: {
        reading: "しょうにかい",
        pos: "名詞",
        meaning: "pediatrician",
        note: "子ども専門の医師。「小児科」は病院の科の名前。",
        examples: [
          { ja: "息子が熱を出したので、小児科医に連れて行った。", en: "My son had a fever, so I took him to the pediatrician." },
        ],
      },
      手術: {
        reading: "しゅじゅつ",
        pos: "名詞・する動詞",
        meaning: "surgery; operation",
      },
      看護師: {
        reading: "かんごし",
        pos: "名詞",
        meaning: "nurse",
        note: "医師のそばで、患者さんの世話や治療の補助をする人。以前は「看護婦（女性）」「看護士（男性）」と分けていたが、現在は男女とも「看護師」に統一されている。",
        examples: [
          { ja: "看護師さんが優しくて、安心しました。", en: "The nurse was kind, and it put me at ease." },
        ],
      },
      患者: {
        reading: "かんじゃ",
        pos: "名詞",
        meaning: "patient",
      },
      診察: {
        reading: "しんさつ",
        pos: "名詞・する動詞",
        meaning: "medical examination; consultation",
      },
      薬局: {
        reading: "やっきょく",
        pos: "名詞",
        meaning: "pharmacy",
      },
      薬剤師: {
        reading: "やくざいし",
        pos: "名詞",
        meaning: "pharmacist",
        note: "薬局で薬を出したり、飲み方を説明したりする人。国家資格が必要。",
        examples: [
          { ja: "薬剤師に薬の飲み方を教えてもらった。", en: "The pharmacist explained how to take the medicine." },
        ],
      },
      先生: {
        reading: "せんせい",
        pos: "名詞",
        meaning: "teacher; (also used for doctors, lawyers, etc.)",
        note: "学校で勉強を教える人。日本語では医師・弁護士・政治家などにも「先生」と呼びかける。",
      },
      保育士: {
        reading: "ほいくし",
        pos: "名詞",
        meaning: "nursery / preschool teacher",
        note: "保育園で、小さい子どもの生活を見守り、世話をする人。国家資格が必要。",
        examples: [
          { ja: "妹は保育士として3歳児クラスを担当している。", en: "My little sister works as a nursery teacher in charge of the 3-year-olds' class." },
        ],
      },
      保育園: {
        reading: "ほいくえん",
        pos: "名詞",
        meaning: "daycare; nursery school",
        note: "0歳から小学校に入る前までの子どもを預かる施設。「幼稚園」より預かる時間が長い。",
      },
      一種: {
        reading: "いっしゅ",
        pos: "名詞",
        meaning: "a kind; a type",
        note: "「〜の一種」で「〜の仲間の一つ」の意味。",
      },
      店員: {
        reading: "てんいん",
        pos: "名詞",
        meaning: "shop clerk; store staff",
        note: "お店で、お客さんの対応や商品の管理をする人。",
        examples: [
          { ja: "レジで店員に袋をもらった。", en: "I got a bag from the clerk at the register." },
        ],
      },
      並べ直し: {
        reading: "ならべなおし",
        pos: "名詞",
        meaning: "rearranging; restocking (on shelves)",
        note: "「並べる」＋「〜直す（もう一度〜する）」。",
      },
      美容師: {
        reading: "びようし",
        pos: "名詞",
        meaning: "hair stylist",
        note: "美容室で、髪を切ったり染めたりパーマをかけたりする人。国家資格が必要。",
        examples: [
          { ja: "いつもの美容師に髪を短くしてもらった。", en: "I had my usual stylist cut my hair short." },
        ],
      },
      美容室: {
        reading: "びようしつ",
        pos: "名詞",
        meaning: "hair salon",
        note: "「美容院（びよういん）」ともいう。",
      },
      "パン屋さん": {
        reading: "パンやさん",
        pos: "名詞",
        meaning: "baker; bakery",
        note: "パンを作って売る店、またはそこで働く人。朝が早い仕事として知られている。",
        examples: [
          { ja: "近所のパン屋さんは朝6時から開いている。", en: "The bakery in the neighborhood opens at 6 a.m." },
        ],
      },
      警察官: {
        reading: "けいさつかん",
        pos: "名詞",
        meaning: "police officer",
        note: "町の安全を守り、事件や事故に対応する仕事。会話では「お巡（まわ）りさん」とも呼ばれる。",
        examples: [
          { ja: "道に迷ったので、警察官に道を聞いた。", en: "I got lost, so I asked a police officer for directions." },
        ],
      },
      消防士: {
        reading: "しょうぼうし",
        pos: "名詞",
        meaning: "firefighter",
        note: "火事を消したり、けが人や病人を助けたりする仕事。命がけの仕事。",
        examples: [
          { ja: "消防士たちが火事から住民を助けた。", en: "The firefighters rescued the residents from the fire." },
        ],
      },
      消防車: {
        reading: "しょうぼうしゃ",
        pos: "名詞",
        meaning: "fire engine; fire truck",
      },
      配達員: {
        reading: "はいたついん",
        pos: "名詞",
        meaning: "delivery person",
        note: "荷物を注文者の家まで運ぶ仕事。宅配便やフードデリバリーなど。",
        examples: [
          { ja: "配達員が大きな荷物を玄関まで運んでくれた。", en: "The delivery person brought the big package all the way to the front door." },
        ],
      },
      "郵便屋さん": {
        reading: "ゆうびんやさん",
        pos: "名詞",
        meaning: "mail carrier",
        note: "手紙やはがき、小包を家まで届けてくれる人。正式には「郵便配達員（ゆうびんはいたついん）」。",
        examples: [
          { ja: "毎朝10時ごろ、郵便屋さんが来ます。", en: "The mail carrier comes around 10 a.m. every morning." },
        ],
      },
      "こうしてみると": {
        reading: "こうしてみると",
        pos: "表現",
        meaning: "when you look at it this way; seen like this",
        note: "何かを振り返って気づいたことを述べる時に使う。",
      },
    },
    translations: {
      "私たちの生活は、いろいろな仕事の人に支えられています。":
        "Our daily lives are supported by people in all kinds of jobs.",
      "今日はその中で、毎日どこかで出会う職業を紹介します。":
        "Today I'll introduce some of the professions we run into somewhere every day.",
      "まず、病院で働く人たちです。":
        "First, the people who work at hospitals.",
      "体の具合が悪くなったら、まず医師に診てもらいます。":
        "When you don't feel well, the first thing you do is have a doctor examine you.",
      "医師の中でも、風邪やお腹の痛みなど体の中の病気を診るのは内科医、手術で病気やけがを治すのは外科医です。":
        "Among doctors, the ones who see internal illnesses like colds or stomachaches are internists, and the ones who treat illnesses and injuries with surgery are surgeons.",
      "子ども専門の医師は小児科医と呼ばれます。":
        "Doctors who specialize in children are called pediatricians.",
      "医師のそばで患者さんの世話をするのが看護師です。":
        "The one who takes care of patients alongside the doctor is the nurse.",
      "診察が終わったら、薬局に行きます。":
        "Once the exam is over, you go to the pharmacy.",
      "そこで薬を出してくれるのが薬剤師です。":
        "The person who fills your prescription there is the pharmacist.",
      "次に、学校です。":
        "Next, schools.",
      "学校で勉強を教えてくれる人を先生といいます。":
        "The people who teach you at school are called teachers (sensei).",
      "小さい子どもをみる保育士も、広い意味では先生の一種です。":
        "Nursery teachers, who look after little children, are in a broad sense also a kind of teacher.",
      "保育士は、保育園で1歳から5歳ぐらいの子どもと一緒に過ごし、生活の仕方を教えます。":
        "Nursery teachers spend the day with children aged about 1 to 5 at daycare, teaching them how to live and take care of themselves.",
      "町のお店にも、たくさんの仕事があります。":
        "There are lots of jobs in the shops around town too.",
      "コンビニやスーパーの店員は、レジや商品の並べ直しをしています。":
        "Convenience store and supermarket clerks work the register and restock the shelves.",
      "髪を切りたくなったら、美容師のいる美容室に行きます。":
        "When you want a haircut, you go to a salon where a hair stylist works.",
      "朝ごはんのパンは、パン屋さんが毎朝早く起きて作ってくれています。":
        "The bread for your breakfast is made by the baker, who gets up early every morning.",
      "最後に、町で見かける人たちです。":
        "Lastly, the people you see around town.",
      "警察官は、町の安全を守る仕事をしています。":
        "Police officers do the job of keeping the town safe.",
      "火事が起きたら、消防車で消防士がやってきます。":
        "When a fire breaks out, firefighters come in fire trucks.",
      "ネットで買った荷物は配達員が家まで運んでくれて、手紙やはがきは郵便屋さんが届けてくれます。":
        "Packages you buy online are brought to your door by delivery drivers, and letters and postcards are delivered by the mail carrier.",
      "こうしてみると、私たちの一日は、本当にたくさんの職業に支えられていますね。":
        "Seen this way, our day really is supported by a great many professions, isn't it.",
    },
    quiz: {
      cloze: [
        {
          before: "髪を切ってくれるのは、",
          after: "です。",
          options: ["美容師", "医師", "大工", "駅員"],
          answer: 0,
          explanation: "「美容師」は美容室で髪を切ったり染めたりする人です。",
        },
        {
          before: "火事が起きた時にやってくるのは、",
          after: "です。",
          options: ["警察官", "消防士", "配達員", "郵便屋さん"],
          answer: 1,
          explanation: "「消防士」は火を消したり、人を助けたりする仕事です。警察官は事件や事故を担当します。",
        },
        {
          before: "病院で医師のそばで患者さんの世話をするのが、",
          after: "です。",
          options: ["薬剤師", "看護師", "小児科医", "保育士"],
          answer: 1,
          explanation: "「看護師」は病院で患者さんに一番近い場所で働きます。",
        },
        {
          before: "薬局で薬を出してくれるのは、",
          after: "です。",
          options: ["医師", "看護師", "薬剤師", "内科医"],
          answer: 2,
          explanation: "「薬剤師」は薬局で薬を出し、飲み方も説明してくれます。",
        },
        {
          before: "手術で病気やけがを治すのは、",
          after: "です。",
          options: ["内科医", "外科医", "小児科医", "看護師"],
          answer: 1,
          explanation: "「外科医」は手術を担当します。内科医は薬などで治療する医師です。",
        },
        {
          before: "子ども専門の医師を、",
          after: "といいます。",
          options: ["内科医", "外科医", "小児科医", "眼科医"],
          answer: 2,
          explanation: "「小児科医」は子どもの病気を診る医師です。",
        },
        {
          before: "手紙やはがきを届けてくれるのは、",
          after: "です。",
          options: ["配達員", "郵便屋さん", "警察官", "消防士"],
          answer: 1,
          explanation: "「郵便屋さん」（郵便配達員）は郵便を担当します。「配達員」は荷物一般を運ぶ、もっと広い言葉です。",
        },
        {
          before: "保育園で小さい子どもと過ごし、生活の仕方を教える人を、",
          after: "といいます。",
          options: ["先生", "保育士", "看護師", "小児科医"],
          answer: 1,
          explanation: "「保育士」は保育園で乳幼児の世話をする専門職。国家資格が必要です。",
        },
      ],
      reading: [
        {
          question: "内科医と外科医は、どんな違いがありますか？",
          answer:
            "内科医は、風邪やお腹の痛みなど、体の中の病気を診る医師です。一方、外科医は、手術で病気やけがを治す医師です。同じ「医師」でも、内科医は手術をせず、外科医は手術で病気やけがを治すところが違います。",
          hints: ["内科医", "外科医", "医師", "手術", "病気", "けが", "治す"],
        },
        {
          question: "看護師はどんな仕事ですか？",
          answer:
            "看護師は、病院で医師のそばで働き、患者さんの世話をする人です。診察の時に医師を助けたり、薬を渡したり、体の具合が悪い患者さんに声をかけたりします。医師の一番近くで働く、大切な仕事です。",
          hints: ["看護師", "病院", "医師", "そば", "患者", "世話", "診察", "薬"],
        },
        {
          question: "美容師はどんな仕事ですか？",
          answer:
            "美容師は、美容室で働く人です。お客さんの髪を切ったり、染めたり、パーマをかけたりします。美容師になるためには、国家資格が必要で、専門の勉強をしなければなりません。",
          hints: ["美容師", "美容室", "髪", "切る", "染める", "パーマ", "国家資格"],
        },
        {
          question: "警察官はどんな仕事ですか？",
          answer:
            "警察官は、町の安全を守る仕事です。事件や事故が起きた時に対応したり、道に迷った人に道を教えたりします。「お巡りさん」と呼ばれることもあり、生活の中で困った時に助けてくれる、大切な仕事です。",
          hints: ["警察官", "町", "安全", "守る", "事件", "事故", "お巡りさん", "助ける"],
        },
        {
          question: "配達員と郵便屋さんは何が違いますか？",
          answer:
            "配達員は、家まで荷物を運ぶ仕事の人で、宅配便やフードデリバリーの人もふくまれます。一方、郵便屋さんは、手紙やはがき、小包など、郵便を届ける人です。正式には「郵便配達員」と呼ばれます。",
          hints: ["配達員", "郵便屋さん", "荷物", "運ぶ", "手紙", "はがき", "宅配便"],
        },
        {
          question:
            "熱が出て病院に行くとき、どんな職業の人に、どんな順番で会いますか？順を追って説明してください。",
          answer:
            "まず病院に行ったら、医師（内科医）に体の具合を話して、診察してもらいます。診察の時、医師のそばには看護師がいて、患者さんの世話をしてくれます。診察が終わったら、薬局に行きます。薬局では、薬剤師が薬を出してくれます。このように、一度病院に行くだけで、医師・看護師・薬剤師の三つの職業の人に会うことになります。",
          hints: ["病院", "医師", "内科医", "診察", "看護師", "薬局", "薬剤師", "薬"],
        },
        {
          question: "もし町に警察官も消防士もいなかったら、どんなことが起きると思いますか？",
          answer:
            "警察官がいなければ、事件や事故が起きた時に助けてくれる人がいなくなり、町の安全が守れなくなります。消防士がいなければ、火事が起きた時に火を消す人も、けが人や病人を助ける人もいなくなります。町も家も燃えてしまうかもしれません。この二つの職業は、私たちの生活の安全を守る、とても大切な仕事だと分かります。",
          hints: ["警察官", "消防士", "事件", "事故", "火事", "安全", "守る", "助ける"],
        },
        {
          question: "医師と看護師の仕事は、どんなところが似ていて、どんなところが違いますか？",
          answer:
            "似ているところは、どちらも病院で働き、患者さんのために仕事をする点です。違うところは、まず何をするかです。医師は、病気やけがを診て、治す人です。看護師は、医師のそばで患者さんの世話をする人です。また、医師になるためには、看護師よりずっと長く勉強しなければなりません。どちらも国家資格が必要な、大切な仕事です。",
          hints: ["医師", "看護師", "病院", "患者", "世話", "病気", "けが", "診る", "治す", "国家資格"],
        },
        {
          question:
            "「先生」という言葉は、学校の先生だけでなく、医師や弁護士にも使います。なぜだと思いますか？",
          answer:
            "「先生」は、人に何かを教えたり、助けたりする人を呼ぶ言葉だからだと思います。学校の先生は勉強を教え、医師は病気の治し方を教えてくれます。弁護士も、法律のことで困った人を助けてくれます。みんな、自分よりくわしい人に対して、大切に思う気持ちで「先生」と呼ぶのだと思います。",
          hints: ["先生", "教える", "助ける", "医師", "弁護士", "学校", "勉強"],
        },
      ],
    },
  },
  {
    id: "professions-transport",
    title: "移動を支える人たち",
    subtitle: "町と空で働く仕事",
    date: "2026-08-03",
    text: `私たちが毎日どこかへ行けるのは、乗り物を運転したり、案内したりしてくれる人たちのおかげです。今回は、町の中や空の上で「移動」を支えている職業を紹介します。

まず、道の上を走る車の運転手です。運転手といっても、乗せるものや目的によって仕事が違います。バスの運転手は、決まった時間に決まった道を走り、たくさんのお客さんを一度に運びます。タクシーの運転手は、お客さんが行きたい場所まで、一人か少人数を運ぶ仕事です。トラックの運転手は、人ではなく荷物を、遠くの町や工場まで運びます。長い距離を一人で走ることも多く、体力が必要な仕事です。

次に、電車で移動するときに出会う人たちです。駅で切符を確認したり、お客さんに道を案内したりしてくれるのが駅員です。乗り換えが分からなかったり、忘れ物をしたりしたら、駅員に相談すればすぐに助けてくれます。電車に乗ってからも、車内には車掌がいます。車掌は、電車の中で放送をしたり、切符を確認したり、安全に走れるように運転士と協力したりする仕事です。

最後に、空を飛ぶ飛行機に関わる人たちです。飛行機を操縦するのはパイロットです。何百人ものお客さんの命を預かる、責任の重い仕事で、なるためには長い訓練が必要です。飛行機の中でお客さんの世話をするのが客室乗務員、または「CA」と呼ばれる人たちです。飲み物を配ったり、安全のための説明をしたり、体調が悪くなった人を助けたりします。そして、飛行機に乗る前に空港のカウンターでチェックインなどを担当するのがグランドスタッフです。地上（グランド）で働くから、この名前で呼ばれています。

こうして考えてみると、私たちが「行きたい所へ行ける」という当たり前のことは、本当にたくさんの人の仕事に支えられているんですね。`,
    annotations: {
      移動: {
        reading: "いどう",
        pos: "名詞・する動詞",
        meaning: "movement; travel; getting around",
        note: "場所を変わって動くこと。「引っ越し」より広い意味で、日常の通勤・旅行にも使う。",
      },
      乗り物: {
        reading: "のりもの",
        pos: "名詞",
        meaning: "vehicle; ride",
        note: "人や物を運ぶために乗る物の総称。車、電車、飛行機、船など。",
      },
      案内: {
        reading: "あんない",
        pos: "名詞・する動詞",
        meaning: "guidance; showing (someone) around",
        note: "相手が分からないことを教えたり、目的地まで連れて行ったりすること。",
        examples: [
          { ja: "駅員さんに改札まで案内してもらった。", en: "The station attendant showed me the way to the ticket gate." },
        ],
      },
      運転手: {
        reading: "うんてんしゅ",
        pos: "名詞",
        meaning: "driver",
        note: "車やバス、トラックなどを運転する仕事の人。",
        examples: [
          { ja: "バスの運転手さんに次の停留所を聞いた。", en: "I asked the bus driver about the next stop." },
        ],
      },
      "バスの運転手": {
        reading: "バスのうんてんしゅ",
        pos: "名詞",
        meaning: "bus driver",
        note: "決まった時間に、決まった道（ルート）を走り、たくさんの人を一度に運ぶ仕事。",
      },
      "タクシーの運転手": {
        reading: "タクシーのうんてんしゅ",
        pos: "名詞",
        meaning: "taxi driver",
        note: "お客さんの行きたい場所まで、一人か少人数を運ぶ仕事。料金は走った距離や時間で決まる。",
      },
      "トラックの運転手": {
        reading: "トラックのうんてんしゅ",
        pos: "名詞",
        meaning: "truck driver",
        note: "人ではなく、荷物を遠くの町や工場まで運ぶ仕事。長距離を一人で走ることが多い。",
      },
      距離: {
        reading: "きょり",
        pos: "名詞",
        meaning: "distance",
        note: "二つの場所の間の長さ。「距離が長い／短い」の形でよく使う。",
      },
      体力: {
        reading: "たいりょく",
        pos: "名詞",
        meaning: "physical strength; stamina",
        note: "疲れずに体を動かし続けられる力。「体力がある／ない」の形で使う。",
      },
      駅員: {
        reading: "えきいん",
        pos: "名詞",
        meaning: "station attendant / staff",
        note: "駅の中で働く人。切符の確認、道案内、忘れ物の対応など、駅を利用する人を助ける仕事。",
        examples: [
          { ja: "乗り換えが分からなくて、駅員さんに聞いた。", en: "I didn't know how to transfer, so I asked a station attendant." },
        ],
      },
      切符: {
        reading: "きっぷ",
        pos: "名詞",
        meaning: "ticket",
        note: "電車やバスなどに乗るために買う紙のチケット。今はICカード（Suica、PASMOなど）を使う人も多い。",
      },
      乗り換え: {
        reading: "のりかえ",
        pos: "名詞・する動詞",
        meaning: "transfer (between trains/buses)",
        note: "一つの電車やバスから、別のに乗り移ること。",
        examples: [
          { ja: "東京駅で新幹線に乗り換えます。", en: "I'll transfer to the Shinkansen at Tokyo Station." },
        ],
      },
      車内: {
        reading: "しゃない",
        pos: "名詞",
        meaning: "inside a train / vehicle",
        note: "反対は「車外（しゃがい）」。「車内放送」で電車の中の放送のこと。",
      },
      車掌: {
        reading: "しゃしょう",
        pos: "名詞",
        meaning: "train conductor",
        note: "電車の中で働く人。放送、切符の確認、ドアの開閉、安全確認などを担当する。運転士とペアで働く。",
        examples: [
          { ja: "車掌さんの放送で、次の駅を知った。", en: "I learned the next station from the conductor's announcement." },
        ],
      },
      放送: {
        reading: "ほうそう",
        pos: "名詞・する動詞",
        meaning: "broadcast; (P.A.) announcement",
      },
      運転士: {
        reading: "うんてんし",
        pos: "名詞",
        meaning: "operator (of a train); train driver",
        note: "電車や新幹線を運転する人。バスやタクシーの「運転手」とは漢字が違う。",
      },
      操縦: {
        reading: "そうじゅう",
        pos: "名詞・する動詞",
        meaning: "piloting; operating (a machine)",
        note: "飛行機や船、大型の機械を動かすこと。「運転」より専門的な言葉。",
      },
      パイロット: {
        reading: "パイロット",
        pos: "名詞",
        meaning: "pilot",
        note: "飛行機を操縦する人。国家資格が必要で、なるためには長い訓練を受ける必要がある。",
        examples: [
          { ja: "兄はパイロットになる夢を持っている。", en: "My older brother has a dream of becoming a pilot." },
        ],
      },
      命: {
        reading: "いのち",
        pos: "名詞",
        meaning: "life",
        note: "生きている力。「命を守る」「命を預かる」など重い場面でよく使う。",
      },
      預かる: {
        reading: "あずかる",
        pos: "動詞（五段）",
        meaning: "to look after; to keep in trust",
        note: "相手の大切な物や人を、代わりに守ること。反対は「預ける（あずける）」。",
      },
      責任: {
        reading: "せきにん",
        pos: "名詞",
        meaning: "responsibility",
        note: "しなければならないこと、間違えたら自分のせいになる立場。「責任が重い」でよく使う。",
      },
      訓練: {
        reading: "くんれん",
        pos: "名詞・する動詞",
        meaning: "training; drill",
        note: "上手にできるようになるまで、何度も練習すること。",
      },
      客室乗務員: {
        reading: "きゃくしつじょうむいん",
        pos: "名詞",
        meaning: "flight attendant; cabin crew",
        note: "飛行機の中でお客さんの世話や安全確認をする人。「キャビンアテンダント」「CA」とも呼ばれる。",
        examples: [
          { ja: "CAさんが水を持ってきてくれた。", en: "The flight attendant brought me some water." },
        ],
      },
      体調: {
        reading: "たいちょう",
        pos: "名詞",
        meaning: "physical condition; how one feels",
        note: "「体調が良い／悪い」の形でよく使う。",
      },
      空港: {
        reading: "くうこう",
        pos: "名詞",
        meaning: "airport",
      },
      グランドスタッフ: {
        reading: "グランドスタッフ",
        pos: "名詞",
        meaning: "airport ground staff",
        note: "空港のカウンターで、チェックイン、荷物預かり、搭乗案内などを担当する人。「地上（グランド）で働くスタッフ」から。",
        examples: [
          { ja: "グランドスタッフに搭乗券を渡した。", en: "I handed my boarding pass to the ground staff." },
        ],
      },
      地上: {
        reading: "ちじょう",
        pos: "名詞",
        meaning: "the ground; on land",
        note: "地面の上。反対は「地下（ちか）」「空中（くうちゅう）」。",
      },
    },
    translations: {
      "私たちが毎日どこかへ行けるのは、乗り物を運転したり、案内したりしてくれる人たちのおかげです。":
        "The reason we can go somewhere every day is thanks to the people who drive vehicles and guide us.",
      "今回は、町の中や空の上で「移動」を支えている職業を紹介します。":
        "This time I'll introduce the professions that support movement — around town and up in the sky.",
      "まず、道の上を走る車の運転手です。":
        "First, drivers of vehicles that run on the roads.",
      "運転手といっても、乗せるものや目的によって仕事が違います。":
        "Even if we call them all \"drivers,\" the job differs depending on what they carry and their purpose.",
      "バスの運転手は、決まった時間に決まった道を走り、たくさんのお客さんを一度に運びます。":
        "Bus drivers follow a set schedule and a set route, and move many passengers at once.",
      "タクシーの運転手は、お客さんが行きたい場所まで、一人か少人数を運ぶ仕事です。":
        "Taxi drivers take one passenger — or a small group — to wherever they want to go.",
      "トラックの運転手は、人ではなく荷物を、遠くの町や工場まで運びます。":
        "Truck drivers carry cargo, not people, out to distant towns and factories.",
      "長い距離を一人で走ることも多く、体力が必要な仕事です。":
        "They often drive long distances alone, so it's a job that requires stamina.",
      "次に、電車で移動するときに出会う人たちです。":
        "Next, the people you meet when getting around by train.",
      "駅で切符を確認したり、お客さんに道を案内したりしてくれるのが駅員です。":
        "The ones who check tickets and give directions at the station are station attendants.",
      "乗り換えが分からなかったり、忘れ物をしたりしたら、駅員に相談すればすぐに助けてくれます。":
        "If you don't know how to transfer, or you leave something behind, the station attendant will help you right away.",
      "電車に乗ってからも、車内には車掌がいます。":
        "Once you board the train, there's a conductor on board too.",
      "車掌は、電車の中で放送をしたり、切符を確認したり、安全に走れるように運転士と協力したりする仕事です。":
        "The conductor's job is to make announcements, check tickets, and work with the train driver to keep the train running safely.",
      "最後に、空を飛ぶ飛行機に関わる人たちです。":
        "Lastly, the people involved with airplanes that fly through the sky.",
      "飛行機を操縦するのはパイロットです。":
        "The one who pilots the airplane is the pilot.",
      "何百人ものお客さんの命を預かる、責任の重い仕事で、なるためには長い訓練が必要です。":
        "It's a heavy responsibility, holding hundreds of passengers' lives in your hands, and becoming one takes long training.",
      "飛行機の中でお客さんの世話をするのが客室乗務員、または「CA」と呼ばれる人たちです。":
        "The ones who look after passengers on the plane are called cabin attendants, or \"CAs.\"",
      "飲み物を配ったり、安全のための説明をしたり、体調が悪くなった人を助けたりします。":
        "They pass out drinks, give safety announcements, and help passengers who feel unwell.",
      "そして、飛行機に乗る前に空港のカウンターでチェックインなどを担当するのがグランドスタッフです。":
        "And the ones who handle check-in and other counter work at the airport before you board are the ground staff.",
      "地上（グランド）で働くから、この名前で呼ばれています。":
        "They're called that because they work on the ground (\"grand\").",
      "こうして考えてみると、私たちが「行きたい所へ行ける」という当たり前のことは、本当にたくさんの人の仕事に支えられているんですね。":
        "When you think about it this way, the everyday fact that we can \"go where we want to go\" really is supported by so many people's work.",
    },
    quiz: {
      cloze: [
        {
          before: "飛行機を操縦するのは、",
          after: "です。",
          options: ["パイロット", "CA", "グランドスタッフ", "車掌"],
          answer: 0,
          explanation: "「パイロット」は飛行機を操縦する専門の仕事です。",
        },
        {
          before: "電車の中で放送をしたり、切符を確認したりするのは、",
          after: "です。",
          options: ["駅員", "車掌", "運転士", "CA"],
          answer: 1,
          explanation: "「車掌」は電車の中で働きます。駅員は駅の中で働くので場所が違います。",
        },
        {
          before: "荷物を遠くの工場まで運ぶのは、",
          after: "です。",
          options: ["バスの運転手", "タクシーの運転手", "トラックの運転手", "配達員"],
          answer: 2,
          explanation: "「トラックの運転手」は人ではなく荷物を運びます。長距離を走ることが多い仕事です。",
        },
        {
          before: "飛行機の中でお客さんの世話をする人を、",
          after: "、または「CA」といいます。",
          options: ["パイロット", "駅員", "客室乗務員", "グランドスタッフ"],
          answer: 2,
          explanation: "「客室乗務員」は英語で cabin attendant。略して「CA」とも呼ばれます。",
        },
        {
          before: "空港のカウンターでチェックインを担当するのは、",
          after: "です。",
          options: ["パイロット", "CA", "駅員", "グランドスタッフ"],
          answer: 3,
          explanation: "「グランドスタッフ」は地上（グランド）で働く空港スタッフです。",
        },
        {
          before: "駅で切符を確認したり、道を案内したりするのは、",
          after: "です。",
          options: ["車掌", "駅員", "運転士", "パイロット"],
          answer: 1,
          explanation: "「駅員」は駅の中で乗客を助ける仕事です。",
        },
        {
          before: "決まった時間に決まった道を走り、たくさんの人を一度に運ぶのは、",
          after: "です。",
          options: ["タクシーの運転手", "バスの運転手", "トラックの運転手", "パイロット"],
          answer: 1,
          explanation: "「バスの運転手」はルートと時刻表に沿って走ります。",
        },
        {
          before: "お客さんが行きたい場所まで、一人か少人数を運ぶのは、",
          after: "です。",
          options: ["バスの運転手", "タクシーの運転手", "トラックの運転手", "配達員"],
          answer: 1,
          explanation: "「タクシーの運転手」は決まったルートではなく、お客さんの目的地まで運びます。",
        },
      ],
      reading: [
        {
          question: "パイロットはどんな仕事ですか？",
          answer:
            "パイロットは、飛行機を操縦する仕事です。何百人ものお客さんの命を預かって、目的の場所まで安全に飛ぶことが仕事です。責任がとても重い仕事なので、なるためには長い訓練が必要です。",
          hints: ["パイロット", "飛行機", "操縦", "命", "預かる", "責任", "安全", "訓練"],
        },
        {
          question: "客室乗務員（CA）はどんな仕事ですか？",
          answer:
            "客室乗務員は、飛行機の中でお客さんの世話をする仕事です。飲み物を配ったり、安全のための説明をしたり、体調が悪くなった人を助けたりします。長い時間、お客さんが安心して過ごせるように働く、大切な仕事です。",
          hints: ["客室乗務員", "飛行機", "世話", "飲み物", "配る", "安全", "説明", "体調"],
        },
        {
          question: "駅員と車掌の違いは何ですか？",
          answer:
            "駅員は、駅の中で働く人で、切符を確認したり、お客さんに道を案内したりします。忘れ物や乗り換えの相談にも乗ってくれます。一方、車掌は、電車の中で働く人で、放送や切符の確認、安全のための運転士との協力が仕事です。同じ電車に関わる仕事でも、働く場所が違います。",
          hints: ["駅員", "車掌", "駅", "電車", "切符", "案内", "放送", "運転士"],
        },
        {
          question: "トラックの運転手はどんな仕事ですか？",
          answer:
            "トラックの運転手は、人ではなく荷物を、遠くの町や工場まで運ぶ仕事です。長い距離を一人で走ることが多いので、体力が必要な仕事です。私たちの生活に必要な物を運んでくれる、とても大切な仕事です。",
          hints: ["トラックの運転手", "荷物", "遠く", "工場", "運ぶ", "距離", "体力"],
        },
        {
          question:
            "空港に着いてから飛行機に乗るまで、どんな職業の人に会いますか？順を追って説明してください。",
          answer:
            "まず空港に着いたら、グランドスタッフのカウンターでチェックインをして、荷物を預けます。飛行機に乗ると、客室乗務員がお客さんの世話をしてくれます。そして、飛行機を操縦して、安全に飛べるようにしてくれるのが、パイロットです。目的の場所に着くまで、たくさんの職業の人に支えられて移動していることが分かります。",
          hints: ["空港", "グランドスタッフ", "チェックイン", "荷物", "飛行機", "客室乗務員", "パイロット", "操縦"],
        },
        {
          question: "もし駅員がいなかったら、駅ではどんなことに困ると思いますか？",
          answer:
            "もし駅員がいなかったら、まず切符の使い方や乗り換えが分からない人が、誰にも相談できなくなります。忘れ物をした人も、探すのが難しくなります。特に、初めてその駅を使う人にとって、駅がとても分かりにくい場所になってしまうでしょう。駅員は、駅を使う人みんなを助けてくれる大切な仕事だと分かります。",
          hints: ["駅員", "駅", "切符", "乗り換え", "忘れ物", "相談", "助ける"],
        },
        {
          question:
            "バスの運転手とタクシーの運転手は、どんなところが似ていて、どんなところが違いますか？",
          answer:
            "似ているところは、どちらも車を運転して、お客さんを運ぶ仕事という点です。違うところは、まず走り方です。バスの運転手は、決まった時間に決まった道を走り、一度にたくさんのお客さんを運びます。タクシーの運転手は、お客さんが行きたい場所まで、一人か少人数を運びます。走る道と、乗せるお客さんの数が違う仕事です。",
          hints: ["バスの運転手", "タクシーの運転手", "運転", "決まった", "道", "時間", "たくさん", "少人数"],
        },
        {
          question:
            "パイロットになるために大切なことは何だと思いますか？自分の考えを話してください。",
          answer:
            "パイロットは、何百人もの命を預かる、責任のとても重い仕事です。だから、まず飛行機を安全に操縦するために、たくさん勉強しなければなりません。長い訓練を続ける強い気持ちも必要だと思います。それから、何かあった時に、あわてずに動ける人が、パイロットになれるのだと思います。",
          hints: ["パイロット", "命", "預かる", "責任", "訓練", "操縦", "安全", "飛行機"],
        },
      ],
    },
  },
  {
    id: "professions-food",
    title: "食を支える人たち",
    subtitle: "畑・海・お店で働く仕事",
    date: "2026-08-29",
    text: `私たちが毎日ごはんを食べられるのは、食べ物を作ったり、料理してくれたりする人たちのおかげです。今回は、私たちの「食」を支えている職業を紹介します。

まず、食べ物のもとになるものを育てたり、とったりする人たちです。米や野菜、果物を畑や田んぼで育てるのが農家です。天気や季節に合わせて、毎日大切に世話をする、体力と経験が必要な仕事です。魚や貝を海でとるのが漁師です。朝早くから船に乗って海に出て、その日にとれた魚を港に持って帰ります。牛や豚、鶏などを育てるのが畜産農家で、その中でも牛からミルクをとる人を酪農家と呼びます。私たちが毎朝飲む牛乳や、食べる卵は、こうした人たちの仕事から届きます。

次に、食べ物を料理に変える人たちです。レストランで料理を作るのが料理人、または「シェフ」です。特にフランス料理やイタリア料理などのお店では、シェフと呼ばれることが多いです。日本には、寿司を専門に作る寿司職人もいます。長い修行をして、魚の切り方や、シャリの握り方を身につけます。朝早くから焼きたてのパンを作るのがパン職人です。そして、ケーキやチョコレートなど、甘いお菓子を作る人をパティシエと呼びます。

最後に、料理を届けたり、私たちの健康を守ったりする人たちです。レストランでお客さんに料理を運び、注文を聞くのがウェイター（給仕）です。お客さんが気持ちよく食事ができるように、笑顔と気配りが大切な仕事です。学校や病院で、栄養のバランスを考えて献立を作るのが栄養士です。子どもや患者さんの体に合った、体にいい食事を考えるのが仕事で、食べ物の知識が必要です。

こうしてみると、私たちが毎日「おいしいね」と言って食べているごはんは、本当にたくさんの人の仕事に支えられているんですね。`,
    annotations: {
      食: {
        reading: "しょく",
        pos: "名詞",
        meaning: "food; eating",
        note: "「食べること」全般を指す言葉。「食生活」「和食」「食文化」などでよく使う。",
      },
      食べ物: {
        reading: "たべもの",
        pos: "名詞",
        meaning: "food",
      },
      もと: {
        reading: "もと",
        pos: "名詞",
        meaning: "source; base; origin",
        note: "「〜のもとになる」で「〜の材料・出発点になる」の意味。",
      },
      育てる: {
        reading: "そだてる",
        pos: "動詞（一段）",
        meaning: "to raise; to grow (crops, animals, children)",
      },
      農家: {
        reading: "のうか",
        pos: "名詞",
        meaning: "farmer; farm household",
        note: "米や野菜、果物などを畑や田んぼで作る仕事の人。家族でやっていることも多い。",
        examples: [
          { ja: "この村には米を作る農家が多い。", en: "There are many rice-growing farmers in this village." },
        ],
      },
      畑: {
        reading: "はたけ",
        pos: "名詞",
        meaning: "field (dry); vegetable/fruit patch",
        note: "水を張らずに、野菜や果物などを育てる土地。田んぼとは違う。",
      },
      田んぼ: {
        reading: "たんぼ",
        pos: "名詞",
        meaning: "rice paddy",
        note: "水を張って米を育てる土地。単に「田（た）」ともいう。",
      },
      季節: {
        reading: "きせつ",
        pos: "名詞",
        meaning: "season",
      },
      世話: {
        reading: "せわ",
        pos: "名詞・する動詞",
        meaning: "care; looking after",
        note: "人や動物、植物などの面倒を見ること。「世話をする」「お世話になる」の形でよく使う。",
      },
      経験: {
        reading: "けいけん",
        pos: "名詞・する動詞",
        meaning: "experience",
      },
      漁師: {
        reading: "りょうし",
        pos: "名詞",
        meaning: "fisherman",
        note: "海や川で魚や貝をとることを仕事にしている人。",
        examples: [
          { ja: "父は若いころ、漁師として働いていた。", en: "My father worked as a fisherman when he was young." },
        ],
      },
      貝: {
        reading: "かい",
        pos: "名詞",
        meaning: "shellfish; shell",
      },
      船: {
        reading: "ふね",
        pos: "名詞",
        meaning: "boat; ship",
      },
      港: {
        reading: "みなと",
        pos: "名詞",
        meaning: "harbor; port",
        note: "船が出たり入ったりする場所。魚をおろす漁港（ぎょこう）もある。",
      },
      畜産農家: {
        reading: "ちくさんのうか",
        pos: "名詞",
        meaning: "livestock farmer",
        note: "牛・豚・鶏など、食べるための動物を育てる仕事の人。",
      },
      酪農家: {
        reading: "らくのうか",
        pos: "名詞",
        meaning: "dairy farmer",
        note: "牛を育てて牛乳をとる仕事の人。北海道に多い。",
      },
      料理人: {
        reading: "りょうりにん",
        pos: "名詞",
        meaning: "cook; chef",
        note: "お店で料理を作ることを仕事にしている人。西洋料理のお店では「シェフ」と呼ばれることが多い。",
      },
      シェフ: {
        reading: "シェフ",
        pos: "名詞",
        meaning: "chef",
        note: "フランス語から来た言葉。西洋料理のお店で料理を作る人、特にその責任者。",
      },
      寿司職人: {
        reading: "すししょくにん",
        pos: "名詞",
        meaning: "sushi chef",
        note: "寿司を作ることを専門とする料理人。一人前になるまで長い修行が必要と言われる。",
      },
      職人: {
        reading: "しょくにん",
        pos: "名詞",
        meaning: "craftsman; skilled artisan",
        note: "手の技術で物を作る仕事の人。「〇〇職人」で「〇〇を作る専門家」の意味になる。",
      },
      修行: {
        reading: "しゅぎょう",
        pos: "名詞・する動詞",
        meaning: "training; apprenticeship; discipline",
        note: "技術や心を身につけるために、長い間つらい練習をすること。「訓練」より精神的な意味が強い。",
      },
      シャリ: {
        reading: "シャリ",
        pos: "名詞",
        meaning: "sushi rice (vinegared rice)",
        note: "寿司に使う、酢を混ぜたご飯のこと。寿司屋で使われる言葉。",
      },
      パン職人: {
        reading: "パンしょくにん",
        pos: "名詞",
        meaning: "baker; bread craftsman",
        note: "パンを作ることを仕事にしている人。朝早くから焼くのが特徴。",
      },
      焼きたて: {
        reading: "やきたて",
        pos: "名詞",
        meaning: "freshly baked / grilled",
        note: "焼いたばかりで、まだ温かい状態。「〜たて」で「〜したばかり」の意味。",
      },
      パティシエ: {
        reading: "パティシエ",
        pos: "名詞",
        meaning: "pastry chef",
        note: "フランス語から来た言葉。ケーキやチョコレートなど、甘いお菓子を作る人。",
      },
      ウェイター: {
        reading: "ウェイター",
        pos: "名詞",
        meaning: "waiter",
        note: "レストランでお客さんに料理を運んだり、注文を聞いたりする人。女性は「ウェイトレス」とも。",
      },
      給仕: {
        reading: "きゅうじ",
        pos: "名詞・する動詞",
        meaning: "waiting on tables; server",
        note: "食事の場でお客さんに料理や飲み物を出すこと、またその仕事の人。少し古い、かたい言葉。",
      },
      注文: {
        reading: "ちゅうもん",
        pos: "名詞・する動詞",
        meaning: "order (in a restaurant / for goods)",
        examples: [
          { ja: "ウェイターに注文をお願いした。", en: "I placed my order with the waiter." },
        ],
      },
      気配り: {
        reading: "きくばり",
        pos: "名詞・する動詞",
        meaning: "attentiveness; consideration for others",
        note: "相手が困らないように、細かいところまで気をつけること。サービス業で大切にされる。",
      },
      栄養士: {
        reading: "えいようし",
        pos: "名詞",
        meaning: "nutritionist; dietitian",
        note: "食べ物の栄養を考えて、健康にいい食事を計画する仕事の人。学校や病院、会社の食堂などで働く。",
        examples: [
          { ja: "病院の栄養士が入院中の食事を考えてくれる。", en: "The hospital's dietitian plans meals for inpatients." },
        ],
      },
      栄養: {
        reading: "えいよう",
        pos: "名詞",
        meaning: "nutrition",
        note: "食べ物の中にある、体を作ったり動かしたりする成分。「栄養がある／ない」の形でよく使う。",
      },
      献立: {
        reading: "こんだて",
        pos: "名詞",
        meaning: "menu; meal plan",
        note: "その日に何を食べるかを決めた組み合わせ。学校や病院で作る「今日の献立」のこと。",
      },
      患者: {
        reading: "かんじゃ",
        pos: "名詞",
        meaning: "patient (medical)",
        note: "病気やけがで、病院にかかっている人。",
      },
      知識: {
        reading: "ちしき",
        pos: "名詞",
        meaning: "knowledge",
      },
    },
    translations: {
      "私たちが毎日ごはんを食べられるのは、食べ物を作ったり、料理してくれたりする人たちのおかげです。":
        "The reason we get to eat every day is thanks to the people who grow food and cook it for us.",
      "今回は、私たちの「食」を支えている職業を紹介します。":
        "This time I'll introduce the professions that support our \"food\" — what we eat.",
      "まず、食べ物のもとになるものを育てたり、とったりする人たちです。":
        "First, the people who grow or catch what our food is made from.",
      "米や野菜、果物を畑や田んぼで育てるのが農家です。":
        "The ones who grow rice, vegetables, and fruit in fields and paddies are farmers.",
      "天気や季節に合わせて、毎日大切に世話をする、体力と経験が必要な仕事です。":
        "It's a job that needs stamina and experience — you tend the crops carefully every day, matching the weather and the season.",
      "魚や貝を海でとるのが漁師です。":
        "The ones who catch fish and shellfish out at sea are fishermen.",
      "朝早くから船に乗って海に出て、その日にとれた魚を港に持って帰ります。":
        "They board their boats early in the morning, head out to sea, and bring the day's catch back to the harbor.",
      "牛や豚、鶏などを育てるのが畜産農家で、その中でも牛からミルクをとる人を酪農家と呼びます。":
        "The ones who raise cows, pigs, chickens and so on are livestock farmers, and among them, those who take milk from cows are called dairy farmers.",
      "私たちが毎朝飲む牛乳や、食べる卵は、こうした人たちの仕事から届きます。":
        "The milk we drink and the eggs we eat every morning come to us from these people's work.",
      "次に、食べ物を料理に変える人たちです。":
        "Next, the people who turn ingredients into dishes.",
      "レストランで料理を作るのが料理人、または「シェフ」です。":
        "The ones who cook at restaurants are called cooks, or \"chefs.\"",
      "特にフランス料理やイタリア料理などのお店では、シェフと呼ばれることが多いです。":
        "Especially at French, Italian, and other Western-style restaurants, they're often called chefs.",
      "日本には、寿司を専門に作る寿司職人もいます。":
        "In Japan, there are also sushi chefs, who specialize in making sushi.",
      "長い修行をして、魚の切り方や、シャリの握り方を身につけます。":
        "Through long training, they master how to cut the fish and how to shape the vinegared rice.",
      "朝早くから焼きたてのパンを作るのがパン職人です。":
        "The ones who bake fresh bread from early in the morning are bakers.",
      "そして、ケーキやチョコレートなど、甘いお菓子を作る人をパティシエと呼びます。":
        "And the people who make cakes, chocolates, and other sweet treats are called pâtissiers.",
      "最後に、料理を届けたり、私たちの健康を守ったりする人たちです。":
        "Lastly, the people who bring food to us and look after our health.",
      "レストランでお客さんに料理を運び、注文を聞くのがウェイター（給仕）です。":
        "The ones who bring food to customers and take orders at restaurants are waiters (servers).",
      "お客さんが気持ちよく食事ができるように、笑顔と気配りが大切な仕事です。":
        "It's a job where a smile and attentiveness matter, so that customers can enjoy their meal comfortably.",
      "学校や病院で、栄養のバランスを考えて献立を作るのが栄養士です。":
        "The ones who plan menus with balanced nutrition at schools and hospitals are dietitians.",
      "子どもや患者さんの体に合った、体にいい食事を考えるのが仕事で、食べ物の知識が必要です。":
        "Their job is to design meals suited to children or patients and good for the body, so knowledge about food is essential.",
      "こうしてみると、私たちが毎日「おいしいね」と言って食べているごはんは、本当にたくさんの人の仕事に支えられているんですね。":
        "When you look at it this way, the meals we eat every day while saying \"delicious!\" really are supported by so many people's work.",
    },
    quiz: {
      cloze: [
        {
          before: "米や野菜、果物を畑や田んぼで育てるのは、",
          after: "です。",
          options: ["漁師", "農家", "料理人", "栄養士"],
          answer: 1,
          explanation: "「農家」は畑や田んぼで作物を育てる仕事です。",
        },
        {
          before: "魚や貝を海でとるのは、",
          after: "です。",
          options: ["酪農家", "農家", "漁師", "パン職人"],
          answer: 2,
          explanation: "「漁師」は海や川で魚をとることを仕事にしている人です。",
        },
        {
          before: "牛を育てて牛乳をとる人を、",
          after: "と呼びます。",
          options: ["畜産農家", "農家", "酪農家", "漁師"],
          answer: 2,
          explanation: "「酪農家」は牛から乳をとる仕事の人。畜産農家の中でも、特にミルクを扱う人を指します。",
        },
        {
          before: "寿司を専門に作る料理人を、",
          after: "といいます。",
          options: ["パティシエ", "シェフ", "寿司職人", "ウェイター"],
          answer: 2,
          explanation: "「寿司職人」は寿司を作る専門家。一人前になるには長い修行が必要です。",
        },
        {
          before: "ケーキやチョコレートなど、甘いお菓子を作る人を、",
          after: "と呼びます。",
          options: ["シェフ", "パン職人", "パティシエ", "料理人"],
          answer: 2,
          explanation: "「パティシエ」はフランス語から来た言葉で、お菓子を作る専門家のことです。",
        },
        {
          before: "レストランでお客さんに料理を運び、注文を聞くのは、",
          after: "です。",
          options: ["シェフ", "ウェイター", "パティシエ", "栄養士"],
          answer: 1,
          explanation: "「ウェイター」はお客さんに料理を運んだり、注文を聞いたりする仕事です。",
        },
        {
          before: "学校や病院で、栄養のバランスを考えて献立を作るのは、",
          after: "です。",
          options: ["料理人", "栄養士", "パン職人", "シェフ"],
          answer: 1,
          explanation: "「栄養士」は食べ物の栄養を考えて、健康にいい食事を計画する仕事です。",
        },
        {
          before: "朝早くから焼きたてのパンを作るのは、",
          after: "です。",
          options: ["パティシエ", "シェフ", "パン職人", "寿司職人"],
          answer: 2,
          explanation: "「パン職人」はパンを作る職人。パティシエ（お菓子）とは仕事が違います。",
        },
      ],
      reading: [
        {
          question: "農家はどんな仕事ですか？",
          answer:
            "農家は、米や野菜、果物を畑や田んぼで育てる仕事です。天気や季節に合わせて、毎日大切に世話をしなければなりません。体力と経験が必要な、私たちの食を支える大切な仕事です。",
          hints: ["農家", "米", "野菜", "果物", "畑", "田んぼ", "育てる", "季節", "世話", "体力", "経験"],
        },
        {
          question: "漁師はどんな仕事ですか？",
          answer:
            "漁師は、海で魚や貝をとる仕事です。朝早くから船に乗って海に出て、その日にとれた魚を港に持って帰ります。私たちがお店で買う魚は、漁師の仕事から届いています。",
          hints: ["漁師", "海", "魚", "貝", "船", "港", "朝早く"],
        },
        {
          question: "畜産農家と酪農家の違いは何ですか？",
          answer:
            "畜産農家は、牛や豚、鶏などを育てる仕事です。その中でも、牛からミルクをとる人を特に酪農家と呼びます。つまり、酪農家は畜産農家の中の一つで、ミルクをとることを専門にしている人です。",
          hints: ["畜産農家", "酪農家", "牛", "豚", "鶏", "育てる", "ミルク", "牛乳"],
        },
        {
          question: "寿司職人はどんな仕事ですか？",
          answer:
            "寿司職人は、寿司を専門に作る料理人です。長い修行をして、魚の切り方や、シャリの握り方を身につけます。日本の食文化を支える、経験が大切な仕事です。",
          hints: ["寿司職人", "寿司", "料理人", "修行", "魚", "切り方", "シャリ", "握り方"],
        },
        {
          question: "料理人（シェフ）とパティシエは、どんなところが違いますか？",
          answer:
            "料理人（シェフ）は、レストランで料理を作る人です。特にフランス料理やイタリア料理などのお店で、シェフと呼ばれることが多いです。一方、パティシエは、ケーキやチョコレートなど、甘いお菓子を作る人です。作るものが、料理かお菓子か、というところが大きな違いです。",
          hints: ["料理人", "シェフ", "パティシエ", "レストラン", "料理", "ケーキ", "お菓子", "甘い"],
        },
        {
          question: "栄養士はどんな仕事ですか？",
          answer:
            "栄養士は、学校や病院で、栄養のバランスを考えて献立を作る仕事です。子どもや患者さんの体に合った、体にいい食事を考えます。食べ物の知識が必要な、健康を支える大切な仕事です。",
          hints: ["栄養士", "学校", "病院", "栄養", "バランス", "献立", "患者", "健康", "知識"],
        },
        {
          question: "レストランで食事をしてから帰るまでに、どんな職業の人に会いますか？順を追って説明してください。",
          answer:
            "まずレストランに入ると、ウェイターが席に案内してくれます。料理を選んだら、ウェイターに注文を伝えます。注文した料理を作ってくれるのは、料理人（シェフ）です。食事が終わったら、またウェイターがお会計をしてくれます。一度の食事でも、いろいろな職業の人に支えられていることが分かります。",
          hints: ["レストラン", "ウェイター", "案内", "注文", "料理人", "シェフ", "料理", "お会計"],
        },
        {
          question: "もし農家や漁師がいなかったら、私たちの生活はどうなると思いますか？自分の考えを話してください。",
          answer:
            "もし農家がいなかったら、米や野菜、果物がお店に並ばなくなります。漁師がいなかったら、魚も食べられなくなります。料理人が上手に料理を作っても、そのもとになる食べ物がなければ、何も作れません。農家や漁師は、私たちの食の一番はじめを支える、なくてはならない仕事だと思います。",
          hints: ["農家", "漁師", "米", "野菜", "果物", "魚", "料理人", "食", "生活"],
        },
      ],
    },
  },
  {
    id: "marugame-seimen",
    title: "「丸亀」ではない丸亀製麺",
    subtitle: "讃岐うどんチェーンの誕生と世界進出",
    date: "2026-09-06",
    text: `「丸亀製麺」というチェーン店を知っていますか。名前を聞くと、香川県の丸亀市にあるお店だと思うに違いありません。しかし実は、1号店ができたのは、2000年11月、兵庫県の加古川市でした。現在、香川県内に残っている丸亀製麺は、高松市に一店舗だけです。
創業したのは、トリドールの粟田貴也社長です。粟田社長は2000年に初めて丸亀市を訪れて、うどん店に並ぶ長い列で待つお客さんを見ました。そこで「讃岐うどんの文化をもっと広めたい」と考えたそうです。父親が香川県坂出市の出身なので、讃岐うどんは身近な食べ物でした。ただし、「丸亀」という名前をつけた時、地元に同じ名前の会社があることは知らなかったと言われています。
丸亀製麺の一番の特徴は、店内で麺を作ることです。麺は100%国産の小麦から作ります。注文を受けてから茹でるので、いつも茹でたてです。これはチェーン店らしくない作り方だと言えます。値段も一杯300円台からと安く、便利で早いので、若者を中心に消費者から人気を集めました。トッピングの種類も豊富で、本場の讃岐うどんに近い味を安く食べられます。同じ時期にできた「はなまるうどん」との競争もあり、2011年には、うどんチェーンとして初めて47都道府県すべてに出店しました。
海外進出
海外にも積極的です。同じ2011年、ハワイのワイキキに海外1号店をオープンしました。続いてタイ、インドネシアをはじめ、東南アジア各国にも広がっていきました。2018年には世界の店舗数が1000店以上になり、国内のうどんチェーンから、グローバル化した企業へと成長しました。特にハワイのワイキキ店は、世界で最も売れている店だそうです。
この成功の一方で、「丸亀」という名前を使いながら丸亀市に店がないことについては、讃岐うどん文化を大切にする人から批判の声もあります。「讃岐うどんへの敬意が足りない」という意見です。ただし、会社は「本場」や「発祥地」という言葉を使っていないので、法律上は問題ないと説明しています。`,
    headings: ["海外進出"],
    targetGrammar: [
      "tobira-5-4",  // Nをはじめ
      "tobira-5-5",  // 〜以上／〜以下
      "tobira-5-8",  // {N/no-Adj}化(する)
      "tobira-5-10", // 〜に違いない
      "tobira-5-13", // Nらしい
    ],
    targetVocab: [
      "現在", "残る", "列", "待つ", "長い", "作る", "麺", "値段", "安い",
      "便利", "若者", "消費者", "種類", "味", "競争", "続く", "東南",
      "以上", "化", "成功", "大切",
    ],
    annotations: {
      丸亀製麺: {
        reading: "まるがめせいめん",
        pos: "固有名詞",
        meaning: "Marugame Seimen (udon chain)",
        note: "「製麺」は「麺を作ること」。",
      },
      チェーン店: { reading: "チェーンてん", pos: "名詞", meaning: "chain store" },
      香川県: { reading: "かがわけん", pos: "固有名詞", meaning: "Kagawa Prefecture (Shikoku)" },
      丸亀市: { reading: "まるがめし", pos: "固有名詞", meaning: "Marugame City (in Kagawa)" },
      実は: { reading: "じつは", pos: "副詞", meaning: "actually; in fact" },
      違いありません: {
        reading: "ちがいありません",
        pos: "文型",
        meaning: "there is no doubt; must be",
        note: "「〜に違いない」の丁寧形。とびら L5-10。",
      },
      現在: { reading: "げんざい", pos: "名詞・副詞", meaning: "currently; at present" },
      残っている: {
        reading: "のこっている",
        pos: "動詞",
        meaning: "to remain; to be left",
        note: "動詞「残る」の「〜ている」形。",
      },
      高松市: { reading: "たかまつし", pos: "固有名詞", meaning: "Takamatsu City (Kagawa's capital)" },
      一店舗: { reading: "いってんぽ", pos: "名詞", meaning: "one shop / branch" },
      兵庫県: { reading: "ひょうごけん", pos: "固有名詞", meaning: "Hyogo Prefecture" },
      加古川市: { reading: "かこがわし", pos: "固有名詞", meaning: "Kakogawa City (in Hyogo)" },
      創業: {
        reading: "そうぎょう",
        pos: "名詞・する動詞",
        meaning: "founding (of a company)",
      },
      トリドール: { pos: "固有名詞", meaning: "Toridoll (parent company)" },
      粟田貴也: { reading: "あわた たかや", pos: "固有名詞", meaning: "Awata Takaya (Toridoll's founder)" },
      社長: { reading: "しゃちょう", pos: "名詞", meaning: "company president" },
      訪れて: {
        reading: "おとずれて",
        pos: "動詞",
        meaning: "to visit (formal)",
        note: "動詞「訪れる」のて形。",
      },
      並ぶ: { reading: "ならぶ", pos: "動詞", meaning: "to line up; to stand in a queue" },
      列: { reading: "れつ", pos: "名詞", meaning: "row; line; queue" },
      待つ: { reading: "まつ", pos: "動詞", meaning: "to wait" },
      讃岐: {
        reading: "さぬき",
        pos: "固有名詞",
        meaning: "Sanuki (old name for Kagawa)",
        note: "「讃岐うどん」は香川県の名物。",
      },
      文化: { reading: "ぶんか", pos: "名詞", meaning: "culture" },
      広めたい: {
        reading: "ひろめたい",
        pos: "動詞",
        meaning: "want to spread / popularize",
      },
      父親: { reading: "ちちおや", pos: "名詞", meaning: "father" },
      坂出市: { reading: "さかいでし", pos: "固有名詞", meaning: "Sakaide City (in Kagawa)" },
      出身: { reading: "しゅっしん", pos: "名詞", meaning: "hometown; place one is from" },
      身近: {
        reading: "みぢか",
        pos: "形容動詞",
        meaning: "close; familiar; near at hand",
      },
      地元: { reading: "じもと", pos: "名詞", meaning: "local; the local area" },
      特徴: { reading: "とくちょう", pos: "名詞", meaning: "characteristic; feature" },
      店内: { reading: "てんない", pos: "名詞", meaning: "inside the store" },
      麺: { reading: "めん", pos: "名詞", meaning: "noodles" },
      国産: { reading: "こくさん", pos: "名詞", meaning: "domestically produced" },
      小麦: { reading: "こむぎ", pos: "名詞", meaning: "wheat" },
      注文: {
        reading: "ちゅうもん",
        pos: "名詞・する動詞",
        meaning: "order (at a restaurant / shop)",
      },
      茹でる: { reading: "ゆでる", pos: "動詞", meaning: "to boil (in water)" },
      茹でたて: {
        reading: "ゆでたて",
        pos: "名詞",
        meaning: "freshly boiled",
        note: "「Verb-masu＋たて」で「〜したばかり」。例：焼きたて、作りたて。",
      },
      らしくない: {
        reading: "らしくない",
        pos: "文型",
        meaning: "not like ~; unlike a typical ~",
        note: "「〜らしい」の否定形。とびら L5-13。",
      },
      作り方: { reading: "つくりかた", pos: "名詞", meaning: "way of making; method" },
      言えます: {
        reading: "いえます",
        pos: "動詞",
        meaning: "one can say",
        note: "「言う」の可能形。",
      },
      値段: { reading: "ねだん", pos: "名詞", meaning: "price" },
      一杯: {
        reading: "いっぱい",
        pos: "名詞",
        meaning: "one bowl; one cup",
        note: "「杯」はどんぶりやカップの助数詞。",
      },
      安く: { reading: "やすく", pos: "形容詞", meaning: "cheaply", note: "形容詞「安い」の連用形。" },
      便利: { reading: "べんり", pos: "形容動詞", meaning: "convenient" },
      若者: { reading: "わかもの", pos: "名詞", meaning: "young people; youth" },
      中心: {
        reading: "ちゅうしん",
        pos: "名詞",
        meaning: "center; centered on",
        note: "「〜を中心に」で「〜を中心として」。",
      },
      消費者: { reading: "しょうひしゃ", pos: "名詞", meaning: "consumer" },
      人気: { reading: "にんき", pos: "名詞", meaning: "popularity" },
      集めました: {
        reading: "あつめました",
        pos: "動詞",
        meaning: "gathered (past)",
        note: "「人気を集める」で「人気を得る」。",
      },
      トッピング: { pos: "名詞", meaning: "toppings" },
      種類: { reading: "しゅるい", pos: "名詞", meaning: "kind; variety; type" },
      豊富: { reading: "ほうふ", pos: "形容動詞", meaning: "abundant; rich (in variety)" },
      本場: {
        reading: "ほんば",
        pos: "名詞",
        meaning: "the home / authentic origin",
        note: "「讃岐うどんの本場」＝「本物の讃岐うどんが作られる所」。",
      },
      近い: { reading: "ちかい", pos: "形容詞", meaning: "close; near" },
      味: { reading: "あじ", pos: "名詞", meaning: "taste; flavor" },
      時期: { reading: "じき", pos: "名詞", meaning: "time; period" },
      はなまるうどん: {
        pos: "固有名詞",
        meaning: "Hanamaru Udon (rival chain, also founded 2000)",
      },
      競争: { reading: "きょうそう", pos: "名詞・する動詞", meaning: "competition" },
      都道府県: {
        reading: "とどうふけん",
        pos: "名詞",
        meaning: "prefectures (Japan has 47)",
      },
      出店しました: {
        reading: "しゅってんしました",
        pos: "動詞",
        meaning: "opened a store (past)",
      },
      海外: { reading: "かいがい", pos: "名詞", meaning: "overseas; abroad" },
      進出: {
        reading: "しんしゅつ",
        pos: "名詞・する動詞",
        meaning: "advancing into; expansion (into a market)",
      },
      積極的: { reading: "せっきょくてき", pos: "形容動詞", meaning: "proactive; active" },
      ワイキキ: { pos: "固有名詞", meaning: "Waikiki (Hawaii)" },
      続いて: {
        reading: "つづいて",
        pos: "接続詞",
        meaning: "next; following that",
        note: "動詞「続く」のて形。",
      },
      インドネシア: { pos: "固有名詞", meaning: "Indonesia" },
      をはじめ: {
        pos: "文型",
        meaning: "starting with ~; including ~",
        note: "「Nをはじめ」で「Nを代表として」。とびら L5-4。",
      },
      東南: { reading: "とうなん", pos: "名詞", meaning: "southeast" },
      各国: { reading: "かっこく", pos: "名詞", meaning: "each country; every country" },
      広がっていきました: {
        reading: "ひろがっていきました",
        pos: "動詞",
        meaning: "spread out (past, gradually)",
        note: "「広がる」＋「ていく」。とびら L3-9「〜ていく」。",
      },
      店舗数: { reading: "てんぽすう", pos: "名詞", meaning: "number of stores" },
      以上: {
        reading: "いじょう",
        pos: "名詞",
        meaning: "or more; the above",
        note: "「1000店以上」で「1000店を含めてそれ以上」。とびら L5-5。",
      },
      国内: { reading: "こくない", pos: "名詞", meaning: "domestic; within the country" },
      "グローバル化": {
        reading: "グローバルか",
        pos: "名詞・する動詞",
        meaning: "globalization",
        note: "接尾語「〜化」でXになる（例：現代化、機械化）。とびら L5-8。",
      },
      企業: { reading: "きぎょう", pos: "名詞", meaning: "enterprise; corporation" },
      成長: { reading: "せいちょう", pos: "名詞・する動詞", meaning: "growth" },
      最も: { reading: "もっとも", pos: "副詞", meaning: "most (of all)" },
      売れている: {
        reading: "うれている",
        pos: "動詞",
        meaning: "is selling (well)",
        note: "動詞「売れる」の「〜ている」。",
      },
      成功: { reading: "せいこう", pos: "名詞・する動詞", meaning: "success" },
      一方: {
        reading: "いっぽう",
        pos: "接続詞",
        meaning: "on the other hand; meanwhile",
      },
      大切: { reading: "たいせつ", pos: "形容動詞", meaning: "important; valued" },
      批判: { reading: "ひはん", pos: "名詞・する動詞", meaning: "criticism" },
      敬意: { reading: "けいい", pos: "名詞", meaning: "respect" },
      足りない: {
        reading: "たりない",
        pos: "動詞",
        meaning: "insufficient; not enough",
        note: "動詞「足りる」の否定形。",
      },
      意見: { reading: "いけん", pos: "名詞", meaning: "opinion" },
      法律上: {
        reading: "ほうりつじょう",
        pos: "名詞",
        meaning: "legally; in terms of the law",
      },
      発祥地: { reading: "はっしょうち", pos: "名詞", meaning: "place of origin; birthplace" },
      言葉: { reading: "ことば", pos: "名詞", meaning: "word; language" },
      説明しています: {
        reading: "せつめいしています",
        pos: "動詞",
        meaning: "is explaining",
      },
    },
    translations: {
      "「丸亀製麺」というチェーン店を知っていますか。":
        "Have you heard of the chain called \"Marugame Seimen\"?",
      "名前を聞くと、香川県の丸亀市にあるお店だと思うに違いありません。":
        "When you hear the name, you must think it's a shop in Marugame City in Kagawa Prefecture.",
      "しかし実は、1号店ができたのは、2000年11月、兵庫県の加古川市でした。":
        "But actually, the first store opened in November 2000, in Kakogawa City, Hyogo Prefecture.",
      "現在、香川県内に残っている丸亀製麺は、高松市に一店舗だけです。":
        "Today, the only Marugame Seimen remaining in Kagawa Prefecture is a single shop in Takamatsu City.",
      "創業したのは、トリドールの粟田貴也社長です。":
        "The founder was Awata Takaya, president of Toridoll.",
      "粟田社長は2000年に初めて丸亀市を訪れて、うどん店に並ぶ長い列で待つお客さんを見ました。":
        "In 2000, President Awata visited Marugame City for the first time and saw customers waiting in the long line at an udon shop.",
      "そこで「讃岐うどんの文化をもっと広めたい」と考えたそうです。":
        "There, it's said, he thought, \"I want to spread Sanuki udon culture more widely.\"",
      "父親が香川県坂出市の出身なので、讃岐うどんは身近な食べ物でした。":
        "Because his father was from Sakaide City in Kagawa, Sanuki udon was already a familiar food to him.",
      "ただし、「丸亀」という名前をつけた時、地元に同じ名前の会社があることは知らなかったと言われています。":
        "However, it's said that when he chose the name \"Marugame,\" he didn't know that a local company was already using the same name.",
      "丸亀製麺の一番の特徴は、店内で麺を作ることです。":
        "Marugame Seimen's biggest distinguishing feature is that they make the noodles in-store.",
      "麺は100%国産の小麦から作ります。": "The noodles are made from 100% domestic wheat.",
      "注文を受けてから茹でるので、いつも茹でたてです。":
        "Because they only boil the noodles after receiving your order, they're always freshly boiled.",
      "これはチェーン店らしくない作り方だと言えます。":
        "You could say this is a way of making them that isn't like a chain restaurant.",
      "値段も一杯300円台からと安く、便利で早いので、若者を中心に消費者から人気を集めました。":
        "The price is also cheap, starting from around 300 yen a bowl — and because it's convenient and fast, it gained popularity with consumers, especially young people.",
      "トッピングの種類も豊富で、本場の讃岐うどんに近い味を安く食べられます。":
        "The variety of toppings is also broad, and you can eat a flavor close to authentic Sanuki udon at a low price.",
      "同じ時期にできた「はなまるうどん」との競争もあり、2011年には、うどんチェーンとして初めて47都道府県すべてに出店しました。":
        "With competition from \"Hanamaru Udon,\" which was founded around the same time, by 2011 Marugame Seimen became the first udon chain to have shops in all 47 prefectures.",
      "海外にも積極的です。": "They're also active overseas.",
      "同じ2011年、ハワイのワイキキに海外1号店をオープンしました。":
        "In the same year, 2011, they opened their first overseas store in Waikiki, Hawaii.",
      "続いてタイ、インドネシアをはじめ、東南アジア各国にも広がっていきました。":
        "After that, they spread to Southeast Asian countries starting with Thailand and Indonesia.",
      "2018年には世界の店舗数が1000店以上になり、国内のうどんチェーンから、グローバル化した企業へと成長しました。":
        "By 2018 the worldwide store count passed 1,000, and it grew from a domestic udon chain into a globalized enterprise.",
      "特にハワイのワイキキ店は、世界で最も売れている店だそうです。":
        "The Waikiki store in Hawaii, in particular, is said to be the best-selling shop in the world.",
      "この成功の一方で、「丸亀」という名前を使いながら丸亀市に店がないことについては、讃岐うどん文化を大切にする人から批判の声もあります。":
        "Alongside this success, there is also criticism from people who value Sanuki udon culture — over the fact that the chain uses the name \"Marugame\" while having no store in Marugame City.",
      "「讃岐うどんへの敬意が足りない」という意見です。":
        "Their view is that \"there isn't enough respect for Sanuki udon.\"",
      "ただし、会社は「本場」や「発祥地」という言葉を使っていないので、法律上は問題ないと説明しています。":
        "However, the company explains that because they don't use words like \"authentic\" or \"birthplace,\" there is no legal problem.",
    },
    quiz: {
      cloze: [
        {
          before: "値段も一杯300円台からと",
          after: "、便利で早いので、若者を中心に消費者から人気を集めました。",
          options: ["安く", "悪く", "高く", "貧乏で"],
          answer: 0,
          explanation: "文脈は「安くて便利」。形容詞「安い」の連用形「安く」を接続に使う。",
        },
        {
          before: "トッピングの",
          after: "も豊富で、本場の讃岐うどんに近い味を安く食べられます。",
          options: ["種類", "商品", "消費", "違い"],
          answer: 0,
          explanation: "「トッピングの種類」で「バリエーション」の意味。",
        },
        {
          before: "同じ時期にできた「はなまるうどん」との",
          after: "もあり、2011年には全国に出店しました。",
          options: ["競争", "相談", "成功", "発明"],
          answer: 0,
          explanation: "他社との「競争」。似た時期に始まった二つのチェーンが張り合った。",
        },
        {
          before: "続いてタイ、インドネシア",
          after: "、東南アジア各国にも広がっていきました。",
          options: ["をはじめ", "をもとに", "として", "によって"],
          answer: 0,
          explanation: "「Nをはじめ」で「Nを代表として」。とびら L5-4。",
        },
        {
          before: "2018年には世界の店舗数が1000店",
          after: "になり、国内のうどんチェーンから成長しました。",
          options: ["以上", "以下", "以外", "未満"],
          answer: 0,
          explanation: "「1000店以上」で「1000店を含めてそれ以上」。とびら L5-5。",
        },
        {
          before: "国内のうどんチェーンから、グローバル",
          after: "した企業へと成長しました。",
          options: ["化", "的", "性", "型"],
          answer: 0,
          explanation: "接尾語「〜化」でXになる（例：現代化、機械化）。とびら L5-8。",
        },
      ],
      rearrange: [
        {
          translation: "Marugame Seimen spread to Southeast Asian countries, starting with Thailand and Indonesia.",
          chunks: ["丸亀製麺は", "タイ、インドネシアを", "はじめ", "東南アジア各国に", "広がっていきました"],
          grammarKey: "tobira-5-4",
          hint: "「Nをはじめ」を使って",
        },
        {
          translation: "This is a way of making them that isn't like a chain restaurant.",
          chunks: ["これは", "チェーン店", "らしくない", "作り方だと", "言えます"],
          grammarKey: "tobira-5-13",
          hint: "「〜らしくない」を使って",
        },
        {
          translation: "By 2018, the worldwide store count grew to over 1,000.",
          chunks: ["2018年には", "世界の店舗数が", "1000店", "以上に", "なりました"],
          grammarKey: "tobira-5-5",
          hint: "「〜以上」を使って",
        },
        {
          translation: "When you hear the name, you must think it's a store in Marugame City in Kagawa Prefecture.",
          chunks: ["名前を聞くと", "香川県の丸亀市に", "あるお店だと", "思うに", "違いありません"],
          grammarKey: "tobira-5-10",
          hint: "「〜に違いない／違いありません」を使って",
        },
      ],
      reading: [
        {
          question: "丸亀製麺の1号店は、いつ、どこにできましたか？",
          answer:
            "2000年11月に、兵庫県の加古川市にできました。香川県の丸亀市ではありません。",
          hints: ["2000年", "兵庫県", "加古川市"],
        },
        {
          question: "粟田社長が「丸亀」という名前をつけた理由は何ですか？",
          answer:
            "2000年に初めて丸亀市を訪れて、うどん店に並ぶ長い列で待つお客さんを見て、「讃岐うどんの文化をもっと広めたい」と考えたからです。",
          hints: ["丸亀市", "うどん店", "長い列", "讃岐うどん", "文化", "広めたい"],
        },
        {
          question: "丸亀製麺の特徴を三つ、記事の中から挙げてください。",
          answer:
            "①店内で麺を作ること、②100%国産の小麦から作ること、③注文を受けてから茹でるので、いつも茹でたてで食べられること、などがあります。",
          hints: ["店内", "国産", "小麦", "注文", "茹でたて"],
        },
        {
          question: "「丸亀」という名前について、どんな批判がありますか？会社はどう答えていますか？",
          answer:
            "讃岐うどん文化を大切にする人から、「讃岐うどんへの敬意が足りない」という批判があります。会社は「本場」や「発祥地」という言葉を使っていないので、法律上は問題ないと説明しています。",
          hints: ["敬意", "足りない", "本場", "発祥地", "法律上"],
        },
      ],
    },
  },
];
