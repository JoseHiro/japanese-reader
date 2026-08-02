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
}

export interface Quiz {
  cloze?: ClozeQuestion[];
  reading?: ReadingQuestion[];
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
            "内科医は、風邪やお腹の痛みなど、体の中の病気を診る医師です。一方、外科医は、手術で病気やけがを治す医師です。同じ「医師」でも、内科医は主に薬などで治療し、外科医は手術で治療する点が違います。",
        },
        {
          question: "看護師はどんな仕事ですか？",
          answer:
            "看護師は、病院で医師のそばで働き、患者さんの世話をする人です。たとえば、注射をしたり、薬を渡したり、患者さんの体調を確認したりします。医師の指示を受けて動くことが多いですが、患者さんに一番近い場所で働く、大切な仕事です。",
        },
        {
          question: "美容師はどんな仕事ですか？",
          answer:
            "美容師は、美容室で髪を切ったり、染めたり、パーマをかけたりする人です。お客さんの希望を聞いて、その人に合うヘアスタイルを作ります。日本で美容師になるには、専門学校で勉強して、国家試験に合格しなければなりません。",
        },
        {
          question: "警察官はどんな仕事ですか？",
          answer:
            "警察官は、町の安全を守る仕事をしています。たとえば、道でパトロールをしたり、事故や事件があった時に現場へ行ったりします。また、道に迷った人に道を教えたり、落し物を預かったりもします。生活の中で困った時に、まず頼りになる存在です。",
        },
        {
          question: "配達員と郵便屋さんは何が違いますか？",
          answer:
            "配達員は、荷物を家まで運ぶ人の全体を指す広い言葉で、宅配便やフードデリバリーの人もふくまれます。一方、郵便屋さんは手紙やはがきなど、郵便を専門に配る人です。正式には「郵便配達員」といいます。",
        },
        {
          question:
            "熱が出て病院に行くとき、どんな職業の人に、どんな順番で会いますか？順を追って説明してください。",
          answer:
            "まず病院に着いたら、受付の人に診察券や保険証を出します。次に、名前を呼ばれて、医師（内科医）に体の様子を話し、診察してもらいます。必要があれば、看護師が熱を測ったり、注射をしたりします。診察が終わったら、会計をして、処方箋をもらいます。最後に、薬局に行き、薬剤師に処方箋を渡して、薬をもらいます。薬剤師が薬の飲み方も説明してくれます。",
        },
        {
          question: "もし町に警察官も消防士もいなかったら、どんなことが起きると思いますか？",
          answer:
            "警察官がいなければ、事件や事故が起きた時に、対応してくれる人がいなくなります。町の安全が守られず、みんなが安心して生活できなくなるでしょう。また、消防士がいなければ、火事が起きた時に火を消す人がいなくなり、家や町が全部燃えてしまう危険があります。さらに、けが人や病人を運ぶ救急車も消防署から出るので、命が助からないこともあるかもしれません。この二つの職業は、私たちの安全な生活のためになくてはならない仕事だと言えます。",
        },
        {
          question: "医師と看護師の仕事は、どんなところが似ていて、どんなところが違いますか？",
          answer:
            "似ているところは、どちらも病院で働き、患者さんの健康を守るために協力している点です。違うところは、まず役割です。医師は病気の診断をしたり、治療の方針を決めたりするのが主な仕事で、看護師は医師の指示を受けて、患者さんの世話や治療の補助をします。また、なるための道も違います。医師になるには医学部で6年間勉強する必要がありますが、看護師は看護学校などで3〜4年勉強します。どちらも国家資格が必要な、大切な仕事です。",
        },
        {
          question:
            "「先生」という言葉は、学校の先生だけでなく、医師や弁護士にも使います。なぜだと思いますか？",
          answer:
            "「先生」は、専門的な知識を持っていて、人に教えたり助けたりする人への敬意を表す言葉だからだと考えられます。学校の先生は勉強を教え、医師は病気の治し方を、弁護士は法律のことを教えたり助けたりします。つまり、自分より知識や経験が上で、頼りになる相手に対して、尊敬の気持ちを込めて「先生」と呼ぶのだと思います。政治家や作家など、他の職業にも同じ理由で使われます。",
        },
      ],
    },
  },
];
