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
    id: "kindergarten",
    title: "子どもたちと過ごす日々",
    subtitle: "幼稚園の先生の一日",
    date: "2026-07-09",
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
    date: "2026-07-10",
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
];
