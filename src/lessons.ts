// Practice-mode lesson data: a conversation between an interlocutor and
// the student (Andy, Dominik, ...), with (        ) blanks on the student's
// turns. Each blank carries the
// intent, optional grammar/vocab constraints, and sample answers.

/**
 * Constraint attached to a blank:
 *  - message: what content the answer must convey
 *  - grammar: specific grammar patterns to use
 *  - vocab:   specific words that should appear
 *  - avoid:   words that must NOT be used (forces circumlocution)
 */
export type RuleKind = "message" | "grammar" | "vocab" | "avoid";

export interface Rule {
  kind: RuleKind;
  items: string[];
  /**
   * Optional parallel English translations for each item (same order/length).
   * Useful for message rules so the student can see the task requirements in
   * English before producing Japanese.
   */
  itemsEn?: string[];
}

/** Fillable blank on a student turn. */
export interface Blank {
  id: string;
  /** One-line summary of what the student needs to say. */
  intent: string;
  /** English translation of the intent (shown as a subtitle). */
  intentEn?: string;
  rules?: Rule[];
  /** Model answers; first one is the primary sample. */
  samples: string[];
  teacherNote?: string;
}

export type DialogueTurn =
  | { speaker: "them"; text: string; who?: string }
  | { speaker: "student"; blank: Blank };

/** Optional warm-up shown above the dialogue. */
export interface Warmup {
  vocab?: string[];
  grammar?: string[];
  tip?: string;
}

/** Extra open-ended challenge referring back to a specific blank. */
export interface Challenge {
  id: string;
  title: string;
  titleEn?: string;
  /** Free text description of the challenge. */
  prompt: string;
  promptEn?: string;
  /** Optional links to a specific blank id so the teacher can jump back. */
  refBlankId?: string;
  rules?: Rule[];
  samples: string[];
}

export interface Lesson {
  id: string;
  title: string;
  titleEn?: string;
  /** Short label for the sidebar (defaults to title). */
  shortTitle?: string;
  /** Short English label used in the sidebar parens. */
  shortTitleEn?: string;
  situation: string;
  situationEn?: string;
  goal: string;
  goalEn?: string;
  /**
   * One line on the setting and its register (話し言葉／丁寧な会話／書き言葉),
   * shown first so the student learns where each form belongs.
   */
  register?: string;
  registerEn?: string;
  intent?: string;
  intentEn?: string;
  warmup?: Warmup;
  /** Label for the interlocutor across the dialogue (e.g., "配達員"). */
  interlocutorLabel?: string;
  /** Dialogue; may be empty for a writing-only lesson (tasks as challenges). */
  turns: DialogueTurn[];
  /**
   * Sections of a grouped lesson. Each is a full lesson, listed in the
   * right-hand rail by its `sectionLabel`; the group itself has no turns.
   */
  parts?: Lesson[];
  /** Rail label when this lesson is a section of a group, e.g. "1. フロント". */
  sectionLabel?: string;
  /** Target grammar shown with the register note, e.g. "〜からといって". */
  target?: string;
  challenges?: Challenge[];
  /**
   * Furigana fixes for words kuromoji misreads in this lesson, as
   * `{ surface: reading }` (same as an article's readingOnly annotations).
   */
  readings?: Record<string, string>;
}

const deliveryRedelivery: Lesson = {
  id: "delivery-redelivery",
  title: "宅配便の再配達を電話で依頼する",
  titleEn: "Arrange a package redelivery over the phone",
  shortTitle: "宅配便の再配達",
  shortTitleEn: "Package redelivery",
  situation:
    "オートロック付きマンション（501号室）に住む Andy。ヤマト運輸から不在票が入っていた。電話で再配達を依頼する。",
  situationEn:
    "Andy lives in an auto-lock apartment (Unit 501). A Yamato delivery notice was left in his mailbox. Call the depot to arrange a redelivery.",
  goal: "複数の条件と代替案を含む依頼を、電話で最後まで日本語だけでやり切る。",
  goalEn:
    "Handle the whole call in Japanese only, including multiple conditions and a backup plan.",
  intent:
    "N4 の依頼構文と時間表現を総復習しつつ、〜てもよろしいでしょうか、〜させていただく、〜ではなく など N3 への足がかりを1〜2個ずつ混ぜる。「知らない語を言い換える」訓練を最後のチャレンジで矯正する。",
  intentEn:
    "Review N4 request patterns and time expressions, sprinkling in 1–2 N3 stretches per turn (〜てもよろしいでしょうか, 〜させていただく, 〜ではなく). The final challenge trains the 'paraphrase an unknown word' skill so Andy doesn't fall back on English.",
  warmup: {
    vocab: ["再配達", "追跡番号", "宅配ボックス", "時間帯", "オートロック"],
    grammar: [
      "〜てもらえませんか",
      "〜てもよろしいでしょうか（N3）",
      "〜ではなく",
      "もし〜たら",
      "〜てしまう",
    ],
    tip: "電話は敬語のシャワー。詰まったら「あの、…」「実は…」でクッションを置いてよい。",
  },
  interlocutorLabel: "配達員",
  turns: [
    { speaker: "them", text: "はい、ヤマト運輸〇〇センターです。" },
    {
      speaker: "student",
      blank: {
        id: "b1",
        intent: "用件を切り出す（再配達依頼＋追跡番号紛失、名前と住所で対応可能か）",
        intentEn:
          "Open the call: ask for a redelivery, mention that you lost the tracking number, and check whether name + address is enough.",
        rules: [
          { kind: "vocab", items: ["再配達"] },
          { kind: "grammar", items: ["〜てもらえませんか", "〜てしまう"] },
        ],
        samples: [
          "あの、再配達をお願いしたいんですが。実は追跡番号を紛失してしまったので、名前と住所でも大丈夫でしょうか。",
          "すみません、再配達をお願いします。追跡番号を失くしてしまいまして、名前と住所からお願いできますか。",
        ],
        teacherNote: "電話の第一声。「あの、…」「実は…」など会話のクッションを最初に置く練習。",
      },
    },
    { speaker: "them", text: "ご住所とお名前をお願いいたします。" },
    {
      speaker: "student",
      blank: {
        id: "b2",
        intent: "住所（オートロック付き501号室）と名前を伝える",
        intentEn:
          "Give the address (auto-lock building, Unit 501) and your name.",
        rules: [
          {
            kind: "message",
            items: ["住所", "部屋番号", "オートロック情報", "名前"],
            itemsEn: [
              "your address",
              "unit number",
              "mention the auto-lock",
              "your name",
            ],
          },
        ],
        samples: [
          "住所は東京都〇〇区〇〇1-2-3、シャロンハイツ501号室です。オートロック付きのマンションです。名前は Andy Smith です。",
          "〇〇区〇〇1丁目2-3、シャロンハイツの501号室、Andy Smithです。マンションはオートロックです。",
        ],
      },
    },
    { speaker: "them", text: "承知いたしました。ご希望のお日にちとお時間帯はございますか？" },
    {
      speaker: "student",
      blank: {
        id: "b3",
        intent: "第一希望と代替案を伝える",
        intentEn: "State your preferred time slot AND a backup option.",
        rules: [
          {
            kind: "message",
            items: ["明日18-20時", "代替：明後日の同時間帯"],
            itemsEn: [
              "first choice: tomorrow 18-20",
              "backup: same slot the day after tomorrow",
            ],
          },
          { kind: "vocab", items: ["時間帯"] },
        ],
        samples: [
          "明日の18時から20時の間でお願いできますか。もし明日が難しければ、明後日の同じ時間帯でも大丈夫です。",
          "明日の18-20時の時間帯を希望します。もしその時間がだめなら、明後日の18-20時でお願いします。",
        ],
      },
    },
    { speaker: "them", text: "はい、明日の18-20時ですね。玄関先までお持ちしましょうか？" },
    {
      speaker: "student",
      blank: {
        id: "b4",
        intent: "理由を添えて「玄関前ではなく宅配ボックス」を希望する",
        intentEn:
          "Add a reason, then ask for the parcel in the delivery box, not left at the door.",
        rules: [
          { kind: "vocab", items: ["宅配ボックス", "置き配"] },
          { kind: "grammar", items: ["〜ではなく", "〜ので"] },
        ],
        samples: [
          "実はその時間、ちょっと出かけているかもしれないので、玄関前ではなく、宅配ボックスに入れていただけませんか。",
          "その時間は外出しているかもしれないんです。ですので、置き配ではなく宅配ボックスにお願いできますか。",
        ],
        teacherNote: "「A ではなく B に」の対比構文＋依頼を1文で組み立てる練習。",
      },
    },
    {
      speaker: "them",
      text: "宅配ボックスがご利用可能でしたら、そちらに入れさせていただきますが、もし満杯だった場合はいかがいたしましょうか？",
    },
    {
      speaker: "student",
      blank: {
        id: "b5",
        intent: "条件付きの代替案（隣の502号室に預ける）を事前確認",
        intentEn:
          "If the delivery box is full, ask if it can be left with the neighbor in Unit 502 — confirm in advance.",
        rules: [
          {
            kind: "grammar",
            items: ["もし〜たら", "〜てもよろしいでしょうか（N3）"],
          },
        ],
        samples: [
          "もし満杯だった場合、お隣の502号室に預けていただいてもよろしいでしょうか。事前に確認してもらえたら助かります。",
          "宅配ボックスが空いていなかったら、隣の502号室に預けさせていただいてもいいですか。",
        ],
        teacherNote:
          "「〜てもよろしいでしょうか」は N3 で新しく身につける丁寧語。日常より一段丁寧で、電話にちょうど良い。",
      },
    },
    { speaker: "them", text: "かしこまりました。それではそのように手配いたします。" },
    {
      speaker: "student",
      blank: {
        id: "b6",
        intent: "お礼＋電話を切る",
        intentEn: "Thank the operator and end the call politely.",
        samples: [
          "はい、ありがとうございます。それではよろしくお願いいたします。失礼します。",
          "はい、助かります。よろしくお願いします。ありがとうございました。",
        ],
      },
    },
  ],
  challenges: [
    {
      id: "c1",
      title: "「宅配ボックス」が思い出せなかったら？",
      titleEn: "What if you can't remember '宅配ボックス'?",
      prompt:
        "b4 で「宅配ボックス」という言葉が出てこない設定。玄関前ではない別の場所を、この語を使わずに説明して。",
      promptEn:
        "For b4, imagine the word '宅配ボックス' (delivery box) escapes you. Describe another place to leave the parcel without using that word.",
      refBlankId: "b4",
      rules: [{ kind: "avoid", items: ["宅配ボックス"] }],
      samples: [
        "マンションの1階にある、荷物を入れる鍵付きの箱に入れてもらえませんか。",
        "エントランスの近くに、荷物を保管しておく箱があるんですが、そこに入れてもらえますか。",
        "郵便受けの横の、鍵をかけられる収納みたいなところです。",
      ],
    },
    {
      id: "c2",
      title: "もう一段カジュアルで",
      titleEn: "One notch more casual",
      prompt:
        "友だちの家（ホームパーティ用の食材宅配）に届ける想定。b3〜b5 をカジュアル寄りに言い直して。",
      promptEn:
        "Same delivery, but you're arranging groceries for a friend's house party. Redo b3–b5 in a more casual register.",
      samples: [
        "明日の6時から8時の間に来てもらえる？もしダメだったら、明後日の同じ時間で。",
        "その時間ちょっと出てるかも。玄関前じゃなくて、宅配ボックスにお願いしていい？",
        "もし満杯だったら、隣の502号室に置いてもらってもいい？先に聞いてみてほしい。",
      ],
    },
  ],
};

const clinicSymptoms: Lesson = {
  id: "clinic-symptoms",
  title: "病院で症状を説明する（初診・複数症状）",
  titleEn: "Explain your symptoms at a clinic (first visit, multiple symptoms)",
  shortTitle: "病院で症状を説明",
  shortTitleEn: "Explain symptoms at a clinic",
  situation:
    "Andy は数日前から複数の不調が続いており、初めて日本の病院に行く。受付・診察でこれまでの経緯・体質・服用中の薬・アレルギーを日本語で正確に伝える必要がある。",
  situationEn:
    "Andy has had several symptoms for a few days and is visiting a Japanese clinic for the first time. He needs to explain the timeline, his medical background, current medication, and allergies to reception and the doctor — in Japanese.",
  goal: "複数の症状を時系列で整理し、既往症・薬・アレルギーとの関係を医師に伝え、質問に丁寧に答える。",
  goalEn:
    "Organize multiple symptoms in a timeline, explain how they relate to medical history / current medication / allergies, and politely answer the doctor's follow-ups.",
  intent:
    "N4 の「〜てから」「〜ようになる」「〜すぎる」「〜と思う」を復習しつつ、N3 の「〜わけではない」「〜おそれがある」を1〜2個ずつ混ぜる。「症状の言い換え」（じんましん→皮膚の変化）を訓練。",
  intentEn:
    "Review N4 patterns (〜てから, 〜ようになる, 〜すぎる, 〜と思う) while sprinkling in a couple of N3 stretches (〜わけではない, 〜おそれがある). The final challenge trains describing an unknown medical word another way.",
  warmup: {
    vocab: [
      "症状",
      "痛み",
      "めまい",
      "吐き気",
      "鼻水",
      "既往症",
      "服用",
      "副作用",
      "アレルギー",
    ],
    grammar: [
      "〜てから",
      "〜ようになる",
      "〜すぎる",
      "〜みたい",
      "〜と思うんですが",
      "〜わけではない（N3）",
    ],
    tip: "医者には「実は…」「〜んですが」で切り出すと自然。数字と時系列を先に、主観（きつい・だるい）は後に。",
  },
  interlocutorLabel: "受付／医師",
  turns: [
    { speaker: "them", text: "（受付）おはようございます。今日はどうされましたか？" },
    {
      speaker: "student",
      blank: {
        id: "b1",
        intent: "初診の切り出し（数日前から複数症状がある）",
        intentEn:
          "Open the visit (first-time patient) and mention that you've had several symptoms for a few days.",
        rules: [
          { kind: "grammar", items: ["〜てから", "〜んですが"] },
          {
            kind: "message",
            items: ["初めての受診", "数日前から", "症状の大まかな範囲（頭・お腹）"],
            itemsEn: [
              "first visit here",
              "started a few days ago",
              "rough area (head / stomach)",
            ],
          },
        ],
        samples: [
          "実は今日が初めてなんですが、3日前から頭とお腹の調子が悪くて、診ていただきたいんです。",
          "初診なんですが、数日前から頭痛と胃の痛みが続いていて、来ました。",
        ],
        teacherNote:
          "「〜んですが」で背景を先に置き、依頼「診ていただきたい」につなぐ流れ。",
      },
    },
    { speaker: "them", text: "（受付）初めてですね。保険証はお持ちですか？" },
    {
      speaker: "student",
      blank: {
        id: "b2",
        intent: "保険証はまだない。代わりに在留カードで自費で払えるか確認",
        intentEn:
          "You don't have a health insurance card yet. Ask if you can pay out of pocket using your residence card.",
        rules: [
          {
            kind: "message",
            items: ["保険証なし", "在留カードならある", "自費で払えるか確認"],
            itemsEn: [
              "no insurance card",
              "have a residence card",
              "confirm you can pay in full",
            ],
          },
          { kind: "grammar", items: ["〜のですが", "〜ても大丈夫でしょうか"] },
        ],
        samples: [
          "すみません、保険証はまだ作れていないんですが、在留カードならあります。今日は自費で払っても大丈夫でしょうか。",
          "実は保険証がまだなんです。代わりに在留カードをお見せして、全額自費で払わせていただいてもよろしいですか。",
        ],
      },
    },
    { speaker: "them", text: "（受付）ありがとうございます。しばらくお待ちください。" },
    { speaker: "them", text: "（医師）どんな症状ですか？" },
    {
      speaker: "student",
      blank: {
        id: "b3",
        intent: "症状を時系列で説明（月曜=頭痛 → 火曜=胃痛 → 今朝=吐き気）",
        intentEn:
          "Give the symptom timeline: Monday headache, Tuesday stomach pain, this morning nausea.",
        rules: [
          {
            kind: "message",
            items: [
              "月曜から頭痛",
              "火曜から胃痛",
              "今朝から吐き気",
            ],
            itemsEn: [
              "headache since Monday",
              "stomach pain since Tuesday",
              "nausea since this morning",
            ],
          },
          { kind: "grammar", items: ["〜てから", "〜ようになる"] },
        ],
        samples: [
          "月曜から頭が痛くなって、火曜からは胃も痛くなりました。今朝からは吐き気もするようになりました。",
          "実は月曜あたりから頭痛がしていて、次の日から胃の痛みも加わって、今朝からは吐き気がするようになったんです。",
        ],
        teacherNote:
          "時系列を「〜から」で並べる基本。「〜ようになる」で新しい症状の出現を表す。",
      },
    },
    { speaker: "them", text: "（医師）熱は測りましたか？" },
    {
      speaker: "student",
      blank: {
        id: "b4",
        intent: "昨晩は38.2°C、今朝37.4°C。熱は下がったが体はだるい",
        intentEn:
          "Last night 38.2°C, this morning 37.4°C. Fever's down but body still feels heavy.",
        rules: [
          {
            kind: "message",
            items: [
              "昨晩38.2°C",
              "今朝37.4°C",
              "下がったが体はだるい",
            ],
            itemsEn: [
              "38.2°C last night",
              "37.4°C this morning",
              "down but body still feels sluggish",
            ],
          },
          { kind: "grammar", items: ["〜すぎる", "〜みたい"] },
        ],
        samples: [
          "昨日の夜は38.2度で、今朝計ったら37.4度でした。熱は少し下がったんですが、体がだるすぎて起き上がるのがつらいです。",
          "昨晩は38度2分ありました。今朝は37度4分まで下がったみたいですが、体は相変わらずだるくて、動けない感じです。",
        ],
      },
    },
    { speaker: "them", text: "（医師）他に持病や、普段飲んでいる薬はありますか？" },
    {
      speaker: "student",
      blank: {
        id: "b5",
        intent: "花粉症の薬を毎日、時々胃薬。ただし服用中じゃない期間もある",
        intentEn:
          "You take hay-fever medication daily and sometimes a stomach medicine — but there are periods when you don't take either.",
        rules: [
          {
            kind: "message",
            items: [
              "花粉症の薬を毎日",
              "時々胃薬",
              "常に飲んでいるわけではない",
            ],
            itemsEn: [
              "hay-fever medication daily",
              "stomach medicine occasionally",
              "not always taking them",
            ],
          },
          {
            kind: "grammar",
            items: ["〜わけではない（N3）", "〜こともある"],
          },
        ],
        samples: [
          "花粉症の薬は毎日飲んでいます。胃薬は時々ですが、いつも飲んでいるわけではありません。今は花粉のシーズンだけなので、両方毎日というわけでもないです。",
          "普段は花粉症の薬を飲んでいます。胃薬は調子が悪いときに飲むこともありますが、常用しているわけではありません。",
        ],
        teacherNote:
          "「〜わけではない」は N3 で「（全部そうという）わけじゃない」の限定否定。ここで例外を含めた説明を練習。",
      },
    },
    { speaker: "them", text: "（医師）アレルギーはありますか？" },
    {
      speaker: "student",
      blank: {
        id: "b6",
        intent: "ペニシリン系の薬にアレルギーがあり、以前じんましんが出た",
        intentEn:
          "You're allergic to penicillin-type medicines — you got hives once before.",
        rules: [
          {
            kind: "message",
            items: [
              "ペニシリン系にアレルギー",
              "以前じんましんが出た",
            ],
            itemsEn: [
              "allergic to penicillin-type drugs",
              "got hives once before",
            ],
          },
          { kind: "grammar", items: ["〜たことがある"] },
        ],
        samples: [
          "ペニシリン系の薬にアレルギーがあります。子どものときに飲んで、じんましんが出たことがあります。",
          "はい、ペニシリンにアレルギーがあります。以前一度、飲んだ後に全身にじんましんが出たことがあるので、避けていただけると助かります。",
        ],
      },
    },
    {
      speaker: "them",
      text: "（医師）分かりました。風邪と胃腸の疲れが重なっているみたいですね。薬を出します。",
    },
    {
      speaker: "student",
      blank: {
        id: "b7",
        intent: "薬の受け取り方と、副作用が出たときの対処を確認",
        intentEn:
          "Confirm where to pick up the medication and what to do if side effects appear.",
        rules: [
          {
            kind: "message",
            items: [
              "薬はどこで受け取るか",
              "副作用が出たらどうするか",
            ],
            itemsEn: [
              "where to pick up the medication",
              "what to do if side effects show up",
            ],
          },
          { kind: "grammar", items: ["〜たらいい", "〜おそれがある（N3）"] },
        ],
        samples: [
          "ありがとうございます。薬はどちらで受け取ればいいでしょうか。あと、もし副作用が出るおそれがある場合、どうしたらいいですか。",
          "はい、お薬はどこで受け取ればいいですか。それと、もし副作用のような症状が出たら、また来た方がいいですか。",
        ],
        teacherNote:
          "「〜おそれがある」は「〜する可能性がある（悪いこと）」で医療・防災の場面で頻出。",
      },
    },
  ],
  challenges: [
    {
      id: "c1",
      title: "「じんましん」が思い出せなかったら？",
      titleEn: "What if you can't remember 'じんましん'?",
      prompt:
        "b6 で「じんましん」という言葉が出てこない設定。皮膚の変化を、この語を使わずに医師に説明して。",
      promptEn:
        "For b6, imagine you can't recall the word 'じんましん' (hives). Describe the skin reaction to the doctor without using that word.",
      refBlankId: "b6",
      rules: [{ kind: "avoid", items: ["じんましん"] }],
      samples: [
        "体に赤いブツブツがたくさん出て、すごくかゆくなりました。",
        "皮膚に赤い斑点みたいなものが出て、かゆみもありました。",
        "全身が赤くなって、腫れたような感じになったんです。",
      ],
    },
    {
      id: "c2",
      title: "友達にカジュアルに報告",
      titleEn: "Casual update to a friend",
      prompt:
        "①〜④の要旨を、友達に「体調悪くて病院行ってきた」と話す感じでカジュアルに言い直して。",
      promptEn:
        "Retell b1–b4 casually to a friend, as if saying 'I wasn't feeling great so I went to the clinic'.",
      samples: [
        "月曜から頭痛くて、火曜からはお腹も痛くなって、今朝は吐き気まで出たから、病院行ってきたんだ。",
        "初診だったから受付でちょっと手間取ったけど、熱は昨日38度あって、今日は37度4分。体だるすぎて動けない。",
      ],
    },
  ],
};

const salonHaircut: Lesson = {
  id: "salon-haircut",
  title: "美容院で細かい要望を伝える",
  titleEn: "Give specific requests at a salon",
  shortTitle: "美容院で細かい要望",
  shortTitleEn: "Salon requests",
  situation:
    "Andy は初めて行く美容院でカットをしてもらう。今週末の友達の結婚式に合わせて少しだけ雰囲気を変えたいが、「大幅には変えたくない」「レイヤーは今回なし」「追加のトリートメントも見送り」など、細かい希望と丁寧な断りを伝える必要がある。",
  situationEn:
    "Andy is at a new salon for a haircut. A friend's wedding is this weekend, so he wants a small refresh — but with specific asks: keep the overall shape, no layers today, skip the extra treatment. He needs to voice detailed requests and decline suggestions politely.",
  goal: "自分の希望を具体的に伝えつつ、美容師の提案を丁寧に断ったり調整したりする。",
  goalEn:
    "Voice specific preferences and politely decline / adjust the stylist's suggestions.",
  intent:
    "N4 の「〜くらい」「〜すぎない」「〜てもらえますか」を軸に、N3 の「〜すぎない程度に」「〜のもいいですが」「〜ぎみに」「〜おそれがある」を1〜2個ずつ足す。「柔らかく断る／要望を絞り込む」表現の集中訓練。",
  intentEn:
    "Anchor on N4 patterns (〜くらい, 〜すぎない, 〜てもらえますか) and layer in N3 stretches (〜すぎない程度に, 〜のもいいですが, 〜ぎみに, 〜おそれがある). Focused drill on softening a 'no' and narrowing down what you want.",
  warmup: {
    vocab: [
      "カット",
      "前髪",
      "毛先",
      "サイド",
      "トップ",
      "髪質",
      "揃える",
      "短め",
      "長め",
      "軽く",
      "自然",
      "レイヤー",
    ],
    grammar: [
      "〜くらい",
      "〜すぎない程度に（N3）",
      "〜のもいいですが（N3）",
      "〜ぎみに（N3）",
      "もう少し〜",
      "〜てもらえますか",
      "〜おそれがある（N3）",
    ],
    tip: "美容院は「〜たいんですが」「〜てもらえますか」でやわらかく。写真を見せる場合は「参考にしたい写真があるんですが…」の一言があると自然。",
  },
  interlocutorLabel: "美容師",
  turns: [
    { speaker: "them", text: "いらっしゃいませ。今日はどうされますか？" },
    {
      speaker: "student",
      blank: {
        id: "b1",
        intent: "カット希望。全体は大きく変えたくないけど、少しだけ雰囲気を変えたい",
        intentEn:
          "Open with a haircut request: keep the overall look mostly the same but freshen it up a little.",
        rules: [
          {
            kind: "message",
            items: [
              "カットをお願いしたい",
              "全体は大きく変えたくない",
              "少しだけ雰囲気を変えたい",
            ],
            itemsEn: [
              "want a haircut",
              "don't want a big change overall",
              "just a small refresh",
            ],
          },
          { kind: "grammar", items: ["〜たいんですが", "あまり〜たくない"] },
        ],
        samples: [
          "カットをお願いしたいんですが、全体はあまり変えたくなくて、少しだけ雰囲気を変えられたらと思っています。",
          "今日はカットでお願いします。大きくは変えたくないんですが、ちょっとだけ変化を付けてもらえるとうれしいです。",
        ],
        teacherNote:
          "「変えたくない＋少しだけ変化」を1文で組み立てる練習。「〜てもらえるとうれしい」も柔らかい依頼。",
      },
    },
    { speaker: "them", text: "かしこまりました。長さはどれくらいにしましょうか？" },
    {
      speaker: "student",
      blank: {
        id: "b2",
        intent: "サイドは短め（ツーブロック寄り）、トップは動きが出るように少し長め",
        intentEn:
          "Sides short (undercut-ish), top a bit longer so it can have some movement.",
        rules: [
          {
            kind: "message",
            items: [
              "サイドは短め",
              "ツーブロック寄り",
              "トップは少し長め",
              "動きが出るように",
            ],
            itemsEn: [
              "sides shorter",
              "undercut style",
              "keep the top a bit longer",
              "so it has some movement",
            ],
          },
          { kind: "grammar", items: ["〜くらい", "〜ように"] },
        ],
        samples: [
          "サイドは短めで、ツーブロックくらいでお願いします。トップは動きが出るように、少し長めに残してもらえますか。",
          "サイドは思い切って短くしてもらって、ツーブロック寄りにしたいです。トップは動かせるくらいの長さを残しておきたいです。",
        ],
      },
    },
    { speaker: "them", text: "前髪はどうされますか？" },
    {
      speaker: "student",
      blank: {
        id: "b3",
        intent: "前髪はアップバング寄りに、量を少し軽くしたい（自然な感じで）",
        intentEn:
          "Bangs pushed up (up-bang) and thinned out a bit — going for a natural finish.",
        rules: [
          {
            kind: "message",
            items: [
              "前髪はアップバング寄り",
              "量を少し軽く",
              "自然な感じで",
            ],
            itemsEn: [
              "bangs up-bang style",
              "thin them out a bit",
              "keep it looking natural",
            ],
          },
          { kind: "grammar", items: ["〜ぎみに（N3）", "〜すぎない程度に"] },
        ],
        samples: [
          "前髪はアップバングぎみにしたいです。ただ、量が多く見えすぎない程度に、少し軽くしてもらえますか。",
          "前髪はアップバング寄りで、あまり重く見えないように軽くしてほしいです。全体的に自然な感じでお願いします。",
        ],
        teacherNote:
          "「〜ぎみに」は N3 で「少し〜の方向に」の意味。「〜すぎない程度に」で量の加減を伝える練習。",
      },
    },
    {
      speaker: "them",
      text: "レイヤーはどうしますか？入れると動きが出て、若く見えますよ。",
    },
    {
      speaker: "student",
      blank: {
        id: "b4",
        intent: "提案は素敵だけど今回はレイヤーなしで、次回試したい（丁寧に断る）",
        intentEn:
          "The idea sounds great, but skip the layers this time — you'd rather try it next visit.",
        rules: [
          {
            kind: "message",
            items: [
              "提案はいいと思う",
              "今回はレイヤーなし",
              "次回試したい",
            ],
            itemsEn: [
              "the suggestion sounds nice",
              "skip layers this time",
              "would like to try it next time",
            ],
          },
          {
            kind: "grammar",
            items: ["〜のもいいですが（N3）", "〜てもらえますか"],
          },
        ],
        samples: [
          "うーん、レイヤーを入れるのもいいですが、今回はまずベースを整えるだけにしてもらえますか。次回、雰囲気に慣れたら試してみたいです。",
          "レイヤーも気になるんですが、今日はワンレングスに近い感じでお願いします。またその次に相談させてください。",
        ],
        teacherNote:
          "「〜のもいいですが、〜」は N3 で柔らかく断る定番。「今回は〜」で範囲を限定する言い方。",
      },
    },
    { speaker: "them", text: "仕上げにトリートメントもいかがですか？" },
    {
      speaker: "student",
      blank: {
        id: "b5",
        intent: "予算オーバーになりそうなので今回は見送り、次回ぜひ試したい",
        intentEn:
          "Might blow the budget today — skip this time, but you'd love to try it next visit.",
        rules: [
          {
            kind: "message",
            items: [
              "予算オーバーになりそう",
              "今回は見送り",
              "次回ぜひ試したい",
            ],
            itemsEn: [
              "might go over budget",
              "skip today",
              "would love to try next time",
            ],
          },
          {
            kind: "grammar",
            items: ["〜おそれがある（N3）", "〜ておく"],
          },
        ],
        samples: [
          "気になるんですが、今日は予算オーバーになるおそれがあるので、次回にしておこうかなと思います。次はぜひお願いします。",
          "ぜひ試したいんですけど、今回はちょっと予算的に厳しくて…次回のお楽しみにさせてください。",
        ],
        teacherNote:
          "「〜おそれがある」で控えめに理由を出しつつ、「次回」を提示して関係を保つ言い方。",
      },
    },
    {
      speaker: "them",
      text: "ありがとうございました。次回のご予約は？",
    },
    {
      speaker: "student",
      blank: {
        id: "b6",
        intent: "次回は月末の週末か平日夜がいい。候補が複数あるので合わせやすい方で",
        intentEn:
          "Next appointment: end of the month, weekend or a weekday evening — you have several options so pick what works.",
        rules: [
          {
            kind: "message",
            items: [
              "月末あたり",
              "週末か平日の夜",
              "候補が複数あるので合わせやすい方で",
            ],
            itemsEn: [
              "around end of the month",
              "weekend or a weekday evening",
              "several options — pick what works",
            ],
          },
          { kind: "grammar", items: ["〜だと助かる", "〜ていただけますか"] },
        ],
        samples: [
          "月末あたりで予約したいです。週末か、平日の夜がいくつか候補としてあるので、空いている時間に合わせていただけると助かります。",
          "月末の週末か、平日の夜だとうれしいです。複数候補あるので、そちらの都合のいい日にちで大丈夫です。",
        ],
      },
    },
  ],
  challenges: [
    {
      id: "c1",
      title: "「レイヤー」が思い出せなかったら？",
      titleEn: "What if you can't remember 'レイヤー'?",
      prompt:
        "b4 で「レイヤー」という言葉が出てこない設定。髪の量・重さ・動きの言い方で言い換えて、断ってみて。",
      promptEn:
        "For b4, imagine you can't recall the word 'レイヤー' (layers). Describe the effect using words for hair volume, weight, or movement — and still decline politely.",
      refBlankId: "b4",
      rules: [{ kind: "avoid", items: ["レイヤー"] }],
      samples: [
        "毛先に動きを出すような入れ方も気になるんですが、今回はワンレングスのままでお願いします。",
        "重さを削って軽く見せるやり方もいいんですけど、今日は全体の長さをそろえてもらう方向で。",
        "髪の量を段階的に減らす感じですよね？次回試してみたいです。今回はストレートにお願いします。",
      ],
    },
    {
      id: "c2",
      title: "友達に切ってもらう時のカジュアル版",
      titleEn: "Casual version — a friend's cutting your hair",
      prompt:
        "①〜③を、大学の友達に「サイド刈って、トップ残して、前髪はアップバング」と頼む感じでカジュアルに言い直して。",
      promptEn:
        "Redo b1–b3 casually — you're asking a college friend to give you an undercut with the top left long and up-bang bangs.",
      samples: [
        "サイドはガッツリ短くしていいから、トップだけ残して。前髪はアップバングにしたい。",
        "全体はあんまり変えたくないけど、サイド刈って、トップ長めに残しといて。前髪は上げる感じで軽くして。",
      ],
    },
  ],
};

// Dominik (N2 track), 「Dominikの日本旅」 #1 箱根. Three practice parts that
// put each N2 form of the article where a native speaker would use it:
//   会話（話し言葉）     → 〜からといって
//   丁寧な電話（報告）   → 〜ざるを得ない
//   口コミ（書き言葉）   → 〜ものの（＋ざるを得ない 1回まで）
const ryokanReservation: Lesson = {
  id: "ryokan-reservation",
  title: "会話：旅館のフロントで「予約が見つからない」",
  titleEn: "Conversation: \"We can't find your reservation\" at the ryokan",
  shortTitle: "① 会話：旅館のフロント",
  shortTitleEn: "Front desk talk",
  sectionLabel: "1. フロント",
  target: "〜からといって",
  register:
    "話し言葉（丁寧な会話）：旅館のフロントでスタッフと話す。「〜んですけど」「〜しかないですね」のような自然な話し言葉で。〜ものの／〜ざるを得ない はかたいので、ここでは使わない。",
  registerEn:
    "Spoken, casual-polite: talking to staff at a ryokan front desk. Use natural speech (〜んですけど, 〜しかないですね). 〜ものの / 〜ざるを得ない are too stiff here.",
  situation:
    "夜7時、Dominik は箱根の旅館に着いた。2週間前にネットで予約したのに、フロントで名前が見つからないと言われる。もう電車やバスはほとんどなく、温泉も楽しみにしていた。先生は旅館のスタッフ役（今夜は本館が満室。別館に小さな和室が一つだけ空いているが、別館にはお風呂がなく、外を歩いて本館まで行く必要がある。夕食の時間ももう終わっている）。",
  goal: "困った状況を自然な話し言葉で説明し、相手の提案を受け入れながら交渉する。〜からといって を会話の中で自然に使う。",
  intent:
    "N2 の目標は「〜からといって」だけ（③⑤）。気づき（〜からといって〜とは限らないんですね）と、やわらかい気づかい（〜からといって、全然気にしないですよ）の2つの自然な場面で使う。ほかの空欄は話し言葉の練習。先生メモの「書くなら／かたく言うと」で、〜ものの・〜ざるを得ない との使い分けをその場で示す。",
  intentEn:
    "The only N2 target here is 〜からといって (③⑤): once as a realisation (〜からといって〜とは限らないんですね) and once as a gentle reassurance (〜からといって、全然気にしないですよ). The other blanks practise natural speech. Use the teacher notes (書くなら／かたく言うと) to point out on the spot where 〜ものの / 〜ざるを得ない would belong instead.",
  warmup: {
    vocab: ["予約", "確認メール", "満室", "別館", "本館", "和室", "夕食"],
    grammar: ["〜からといって（N2）", "〜んですけど", "〜しかない"],
    tip: "困ったときほど、まず「あの、…」「実は…」でクッションを置く。言いたいことは「事実 → 困っている理由 → お願い」の順に。",
  },
  interlocutorLabel: "旅館のスタッフ",
  readings: { 一泊: "いっぱく", 日本: "にほん", 入れます: "はいれます", 一言: "ひとこと" },
  turns: [
    { speaker: "them", text: "いらっしゃいませ。遠いところをお疲れさまでした。お名前を伺ってもよろしいでしょうか。" },
    {
      speaker: "student",
      blank: {
        id: "b1",
        intent: "名前を言い、2週間前にネットで今夜一泊の予約をしたと伝える",
        intentEn: "Give your name and say you booked one night, tonight, online two weeks ago.",
        rules: [
          {
            kind: "message",
            items: ["名前", "2週間前にネットで予約", "今夜一泊"],
            itemsEn: ["your name", "booked online two weeks ago", "one night, tonight"],
          },
        ],
        samples: [
          "ドミニクです。2週間前にネットで、今夜一泊で予約してるんですけど。",
          "ドミニクと申します。ネットで今日一泊、予約してあるんですが。",
        ],
        teacherNote:
          "「〜んですけど／〜んですが」で言いさすと、フロントでの切り出しとして自然。",
      },
    },
    {
      speaker: "them",
      text: "ドミニク様ですね。少々お待ちください。……大変申し訳ございません。本日のご予約の中に、お名前が見当たらないのですが……。",
    },
    {
      speaker: "student",
      blank: {
        id: "b2",
        intent: "驚きを見せ、確認メールも来ていると言って画面を見せる",
        intentEn: "Show your surprise, say you even got a confirmation email, and show the screen.",
        rules: [
          { kind: "message", items: ["驚き", "確認メールが来ている", "画面を見せる"], itemsEn: ["surprise", "you got a confirmation email", "show the screen"] },
        ],
        samples: [
          "えっ、本当ですか？ 確認メールも来てるんですけど……。これです。",
          "え、そうなんですか。ちゃんと予約したんですけど……。メール、見ていただけますか。",
        ],
        teacherNote:
          "使い分けメモ：会話の「予約したんですけど、名前がない」は、書くなら「予約したものの、名前がなかった」。ここで「ものの」は言わない。",
      },
    },
    {
      speaker: "them",
      text: "拝見いたします。……あ、日付が来月になっているようです。あいにく本日は満室でございまして……。",
    },
    {
      speaker: "student",
      blank: {
        id: "b3",
        intent: "日付の間違いに気づき、「ネットで予約できたからといって、取れているとは限らない」と自分の反省として言う",
        intentEn:
          "Realise the date mistake and say, as a lesson to yourself, that just because the online booking went through doesn't mean you actually got the room you wanted.",
        rules: [
          { kind: "grammar", items: ["〜からといって〜とは限らない"] },
          { kind: "message", items: ["日付の間違いに気づく", "自分の反省"], itemsEn: ["notice the wrong date", "a lesson for yourself"] },
        ],
        samples: [
          "あ、本当だ、来月になってる……。ネットで予約できたからといって、ちゃんと取れているとは限らないんですね。気をつけます。",
          "すみません、私の間違いですね。メールが来たからといって、日付が合っているとは限らないんですね……。",
        ],
        teacherNote:
          "聞くところ：後ろが「〜とは限らない」の否定になっているか。相手を責める言い方ではなく、自分への気づきとして言えているか。",
      },
    },
    {
      speaker: "student",
      blank: {
        id: "b4",
        intent: "電車もバスももうほとんどないと伝え、どんな部屋でもいいので何とかならないか頼む",
        intentEn: "Say there are hardly any trains or buses left, and ask if anything at all can be done, any room is fine.",
        rules: [
          { kind: "message", items: ["電車もバスもほとんどない", "どんな部屋でもいい", "何とかならないか"], itemsEn: ["hardly any trains or buses left", "any room is fine", "can anything be done"] },
        ],
        samples: [
          "どうしよう……。もう電車もバスもほとんどないんですよね。どんな部屋でもいいので、何とかなりませんか。",
          "今から帰るのはちょっと難しくて……。狭い部屋でもかまわないので、空いていませんか。",
        ],
        teacherNote: "「〜んですよね」「〜て……」の言いさしで、困っている気持ちを自然に出せているか。",
      },
    },
    {
      speaker: "them",
      text: "本館は満室なんですが、別館でしたら小さな和室が一つだけ空いております。ただ、別館にはお風呂がございませんので、お風呂は一度、外に出て、本館まで歩いていただくことになりますが……。",
    },
    {
      speaker: "student",
      blank: {
        id: "b5",
        intent: "申し訳なさそうなスタッフに「お風呂が別館にないからといって、全然気にしない」と気づかい、その部屋を頼む",
        intentEn:
          "Reassure the apologetic staff that the annex having no bath doesn't bother you at all (〜からといって), and take the room.",
        rules: [
          { kind: "grammar", items: ["〜からといって（後ろは否定）"] },
          { kind: "message", items: ["気にしないと伝える", "その部屋をお願いする"], itemsEn: ["say it doesn't bother you", "ask for that room"] },
        ],
        samples: [
          "全然大丈夫です！ お風呂が別館にないからといって、全然気にしないですよ。泊まれるだけでありがたいです。その部屋でお願いします。",
          "ありがとうございます。外を少し歩くからといって、困ることはないです。ぜひその和室でお願いします。",
        ],
        teacherNote:
          "聞くところ：「〜からといって」の後ろが否定（気にしない／困ることはない）になっているか。相手の心配を打ち消す、やわらかい使い方。",
      },
    },
    {
      speaker: "them",
      text: "かしこまりました。それから、大変申し訳ないのですが、夕食のお時間はもう終わってしまいまして……。",
    },
    {
      speaker: "student",
      blank: {
        id: "b6",
        intent: "仕方ないので今夜はコンビニで買うしかないと言い、近くにあるか聞く",
        intentEn: "Say you'll just have to buy something at a convenience store tonight, and ask if there's one nearby.",
        rules: [
          { kind: "message", items: ["コンビニで買うしかない", "近くにあるか聞く"], itemsEn: ["you'll have to use a convenience store", "ask if one is nearby"] },
        ],
        samples: [
          "そうですよね、こんな時間ですもんね。じゃあ、今夜はコンビニで買うしかないですね。近くにありますか？",
          "遅く着いたのは私なので、大丈夫です。コンビニで何か買います。この近くにありますか？",
        ],
        teacherNote:
          "使い分けメモ：会話の「〜しかない」は、かたく言うと「〜ざるを得ない」（報告や書き言葉で：コンビニで済ませざるを得なかった）。フロントでの会話では「しかない」が自然。",
      },
    },
    {
      speaker: "them",
      text: "歩いて5分ほどのところにコンビニがございます。本館のお風呂は夜12時までご利用いただけますので、ごゆっくりどうぞ。",
    },
    {
      speaker: "student",
      blank: {
        id: "b7",
        intent: "お礼を言い、予約の日付は自分でも確認しておくと言って締める",
        intentEn: "Thank the staff, say you'll double-check your booking dates, and close.",
        rules: [
          { kind: "message", items: ["お礼", "日付を確認しておく"], itemsEn: ["thank them", "you'll check the dates"] },
        ],
        samples: [
          "本当に助かりました。ありがとうございます。来月の予約も、ちゃんと確認しておきます。",
          "無理を言ってすみませんでした。おかげで温泉に入れます。ありがとうございました。",
        ],
        teacherNote: "お礼のあとに、次にすること（日付を確認する）を一言添えると自然。",
      },
    },
  ],
};

const travelAgencyCancel: Lesson = {
  id: "travel-agency-cancel",
  title: "丁寧な電話：旅行会社に2泊目のキャンセルを伝える",
  titleEn: "Polite phone call: cancel the second night with the travel agency",
  shortTitle: "② 丁寧な電話：キャンセル",
  shortTitleEn: "Cancellation call",
  sectionLabel: "2. 電話",
  target: "〜ざるを得ない",
  register:
    "丁寧な会話（ビジネスの電話）：旅行会社の担当者に、事情を報告してキャンセルをお願いする。こういう丁寧な報告では「〜ざるを得ない」が自然に使える。",
  registerEn:
    "Polite / business phone call: reporting your situation to a travel agent and asking to cancel. In polite reporting like this, 〜ざるを得ない sounds natural.",
  situation:
    "Dominik は旅行会社「さくら旅行」で、箱根の旅館を2泊予約していた。1泊目の翌朝、急に仕事が入り、今日中に東京に戻らなければならなくなった。旅行会社に電話して、今夜（2泊目）のキャンセルを伝える。先生は旅行会社の担当者役（当日のキャンセルなので、キャンセル料は宿泊料金の50%）。",
  goal: "事情を丁寧に報告し、キャンセルと料金の確認をして、電話をきちんと終える。",
  intent:
    "N2 の目標は「〜ざるを得ない」（②④）。仕事の事情を報告する、丁寧な電話の場面で使う。する動詞は「せざるを得ない」、丁寧には「〜ざるを得ません／〜ざるを得なくなりました」。ほかの空欄は丁寧な電話の決まった言い方の練習。",
  intentEn:
    "The N2 target is 〜ざるを得ない (②④), used where it's natural: politely reporting a work situation on the phone. Note する → せざるを得ない and the polite forms 〜ざるを得ません / 〜ざるを得なくなりました. The other blanks practise set phrases for polite calls.",
  warmup: {
    vocab: ["予約", "キャンセル", "キャンセル料", "宿泊料金", "当日", "担当"],
    grammar: ["〜ざるを得ない（N2）", "〜ざるを得なくなりました", "〜まして（丁寧な理由）"],
    tip: "電話の最初は「お世話になっております」、最後は「失礼いたします」。理由は「〜まして、」でつなぐと丁寧。",
  },
  interlocutorLabel: "旅行会社の担当者",
  readings: { 一泊: "いっぱく", 日本: "にほん", 今日中: "きょうじゅう", ない形: "ないけい", 丁寧形: "ていねいけい" },
  turns: [
    { speaker: "them", text: "お電話ありがとうございます。さくら旅行、予約センターの山田でございます。" },
    {
      speaker: "student",
      blank: {
        id: "b1",
        intent: "あいさつして名前を言い、箱根の旅館を2泊で予約していると伝える",
        intentEn: "Greet the agent, give your name, and say you have a two-night booking at a Hakone ryokan.",
        rules: [
          { kind: "message", items: ["あいさつ", "名前", "箱根の旅館を2泊で予約"], itemsEn: ["greeting", "your name", "two-night booking at a Hakone ryokan"] },
        ],
        samples: [
          "お世話になっております。ドミニクと申します。箱根の旅館を2泊で予約している者なんですが。",
          "お世話になります。ドミニクです。そちらで箱根の旅館を、昨日から2泊で予約しているんですが。",
        ],
        teacherNote: "「〜している者なんですが」は電話で自分の立場を伝える決まった言い方。",
      },
    },
    {
      speaker: "them",
      text: "ドミニク様ですね。ご予約を確認いたします。……はい、昨日から2泊のご予約でございますね。本日はどのようなご用件でしょうか。",
    },
    {
      speaker: "student",
      blank: {
        id: "b2",
        intent: "急に仕事が入ったので、2泊目（今夜）をキャンセルせ「ざるを得なくなった」と報告する",
        intentEn: "Report that because work came up suddenly, you've had no choice but to cancel the second night, tonight (〜ざるを得なくなりました).",
        rules: [
          { kind: "grammar", items: ["〜ざるを得ない（する → せざるを得ない）"] },
          { kind: "message", items: ["急に仕事が入った", "2泊目をキャンセル"], itemsEn: ["work came up suddenly", "cancel the second night"] },
        ],
        samples: [
          "実は、急に仕事が入りまして、2泊目はキャンセルせざるを得なくなりました。",
          "申し訳ないのですが、急な仕事で、今夜の宿泊はキャンセルせざるを得なくなってしまいまして……。",
        ],
        teacherNote:
          "聞くところ：「キャンセルする」→「キャンセルせざるを得ない」（×しざるを得ない）。報告なので「〜なりました」の形が自然。理由は「〜まして、」で。",
      },
    },
    {
      speaker: "them",
      text: "さようでございますか。それは大変でございますね。本日の夜、2泊目の分のキャンセルでよろしいでしょうか。",
    },
    {
      speaker: "student",
      blank: {
        id: "b3",
        intent: "今夜の分でいいと答え、キャンセル料がかかるか聞く",
        intentEn: "Confirm it's tonight's night, and ask whether there's a cancellation fee.",
        rules: [
          { kind: "message", items: ["今夜の分で合っている", "キャンセル料を聞く"], itemsEn: ["yes, tonight", "ask about the fee"] },
        ],
        samples: [
          "はい、今夜の分でお願いします。キャンセル料はかかりますでしょうか。",
          "はい、それでお願いいたします。あの、キャンセル料はどのくらいかかりますか。",
        ],
        teacherNote: "「〜でしょうか」で丁寧に聞けているか。",
      },
    },
    {
      speaker: "them",
      text: "当日のキャンセルとなりますので、宿泊料金の50%をキャンセル料としていただくことになりますが、よろしいでしょうか。",
    },
    {
      speaker: "student",
      blank: {
        id: "b4",
        intent: "残念だが、今日中に東京に戻ら「ざるを得ない」ので、キャンセル料を受け入れる",
        intentEn: "It's a shame, but since you have no choice but to be back in Tokyo today (〜ざるを得ません), accept the fee.",
        rules: [
          { kind: "grammar", items: ["〜ざるを得ない（丁寧形：〜ざるを得ません）"] },
          { kind: "message", items: ["今日中に東京に戻る", "キャンセル料を受け入れる"], itemsEn: ["back in Tokyo today", "accept the fee"] },
        ],
        samples: [
          "そうですか……。残念ですが、本日中に東京に戻らざるを得ませんので、それでお願いします。",
          "わかりました。仕事の都合で、今日中に帰らざるを得ないので、仕方ありません。キャンセルをお願いいたします。",
        ],
        teacherNote:
          "聞くところ：ない形の語幹＋ざるを得ない（戻ら＋ざるを得ません）。本当はしたくないが仕方ない、という場面で使えているか。友だちとの会話なら「帰るしかない」。",
      },
    },
    {
      speaker: "them",
      text: "かしこまりました。では、本日の分をキャンセルいたします。旅館には、こちらからご連絡しておきます。",
    },
    {
      speaker: "student",
      blank: {
        id: "b5",
        intent: "お礼とおわびを言って、電話を切る",
        intentEn: "Thank the agent, apologise for the short notice, and end the call.",
        rules: [
          { kind: "message", items: ["お礼", "急なことへのおわび", "電話を切るあいさつ"], itemsEn: ["thanks", "sorry for the short notice", "closing the call"] },
        ],
        samples: [
          "ありがとうございます。急なことで申し訳ありません。よろしくお願いいたします。失礼いたします。",
          "助かります。急なお願いですみませんでした。では、失礼いたします。",
        ],
        teacherNote: "電話の最後は「失礼いたします」。",
      },
    },
  ],
};

const ryokanReview: Lesson = {
  id: "ryokan-review",
  title: "書く：予約サイトに旅館の口コミを書く",
  titleEn: "Writing: post a review of the ryokan on a booking site",
  shortTitle: "③ 書く：旅館の口コミ",
  shortTitleEn: "Ryokan review",
  sectionLabel: "3. 口コミ",
  target: "〜ものの（〜ざるを得ない は1回まで）",
  register:
    "書き言葉：予約サイトの口コミ。です・ます体でよいが、話し言葉の「〜けど」「〜しかない」ではなく、書き言葉の「〜ものの」「〜ざるを得ない」が合う。",
  registerEn:
    "Written: a review on a booking site. です・ます style is fine, but written forms fit better than spoken ones: 〜ものの rather than 〜けど, 〜ざるを得ない rather than 〜しかない.",
  situation:
    "東京に戻った Dominik は、予約サイトに箱根の旅館の口コミを書く。部屋は小さかったが、女将さんの対応は丁寧で、露天風呂もよかった。急な仕事で1泊で帰ることになったのが残念だった。",
  goal: "よかった点と残念だった点を、書き言葉で4〜6文の口コミにまとめる。",
  intent:
    "N2 の目標は「〜ものの」（2回以上）。「AものののB」で、期待と違った点・よかった点を対比させる。「〜ざるを得ない」は1回まで（急な仕事で帰らざるを得なかった）。書いたあと、先生と一緒に「話すならどう言うか（〜けど／〜しかない）」も確認する。",
  intentEn:
    "The N2 target is 〜ものの (at least twice), contrasting expectations with what happened. 〜ざるを得ない may appear once (急な仕事で帰らざるを得なかった). Afterwards, check together how each sentence would sound in speech (〜けど / 〜しかない).",
  warmup: {
    vocab: ["口コミ", "清潔", "対応", "景色", "設備", "残念"],
    grammar: ["〜ものの（N2・書き言葉）", "〜ざるを得ない（N2・1回まで）"],
    tip: "口コミは「全体の印象 → よかった点 → 残念だった点 → また行きたいか」の順にすると読みやすい。",
  },
  readings: { 一泊: "いっぱく", "1泊": "いっぱく", 日本: "にほん" },
  turns: [],
  challenges: [
    {
      id: "c1",
      title: "口コミを書く（4〜6文）",
      titleEn: "Write the review (4–6 sentences)",
      prompt:
        "箱根の旅館の口コミを4〜6文で書く。入れること：① 部屋や設備　② 女将さん・スタッフの対応　③ 温泉　④ 残念だったこと　⑤ また行きたいか。「〜ものの」を2回以上使う。「〜ざるを得ない」は1回まで使ってよい。",
      promptEn:
        "Write a 4–6 sentence review of the Hakone ryokan. Cover: ① the room and facilities ② the proprietress / staff ③ the onsen ④ what was disappointing ⑤ whether you'd go again. Use 〜ものの at least twice; 〜ざるを得ない at most once.",
      rules: [
        { kind: "grammar", items: ["〜ものの（2回以上）", "〜ざるを得ない（1回まで）"] },
        {
          kind: "message",
          items: ["部屋や設備", "スタッフの対応", "温泉", "残念だったこと", "また行きたいか"],
          itemsEn: ["room and facilities", "staff", "onsen", "what was disappointing", "would you go again"],
        },
      ],
      samples: [
        "部屋は小さかったものの、清潔で、窓からの景色がとてもきれいでした。チェックインのとき、女将さんが館内の決まりを丁寧に説明してくださったので、初めての旅館でも安心して過ごせました。露天風呂は広くはないものの、静かで、ゆっくり入ることができました。急な仕事で1泊で帰らざるを得なかったのが残念です。次は家族と2泊で来たいと思います。",
      ],
    },
  ],
};

const hakoneFollowups: Lesson = {
  id: "hakone-followups",
  title: "続けて話す・書く",
  titleEn: "Finish the sentence (spoken, polite and written)",
  shortTitle: "4. 続けて話す",
  shortTitleEn: "Finish the sentence",
  sectionLabel: "4. 続けて話す",
  target: "〜からといって／〜ざるを得ない／〜ものの",
  register:
    "文型ごとに場面が違う：〜からといって は会話、〜ざるを得ない は丁寧な報告、〜ものの は書き言葉（日記）。先生が前半を言い、後半を続ける。",
  registerEn:
    "Each form has its own setting: 〜からといって in conversation, 〜ざるを得ない in a polite report, 〜ものの in writing (a diary). The teacher says the first half; you finish it.",
  situation: "1〜3 の場面で使った文型を、別の話題で短く使ってみる。",
  goal: "場面に合った文型で、文の後半をすぐに言える・書けるようにする。",
  readings: { 日本: "にほん" },
  turns: [],
  challenges: [
    {
      id: "f1",
      title: "続けて話す：〜からといって",
      titleEn: "Finish the sentence: 〜からといって",
      prompt:
        "先生が前半を言うので、後半を続けて言う。① 日本に住んでいるからといって、…　② 値段が高いからといって、…",
      promptEn:
        "The teacher says the first half; you finish it. ① 日本に住んでいるからといって、…　② 値段が高いからといって、…",
      rules: [{ kind: "grammar", items: ["〜からといって〜わけではない", "〜からといって〜とは限らない"] }],
      samples: [
        "① 日本に住んでいるからといって、毎日和食を食べているわけではないですよ。",
        "② 値段が高いからといって、おいしいとは限らないですよね。",
      ],
    },
    {
      id: "f2",
      title: "続けて言う（丁寧な報告）：〜ざるを得ない",
      titleEn: "Finish the sentence (polite report): 〜ざるを得ない",
      prompt:
        "上司やお客様への丁寧な報告として、後半を続けて言う。① （上司に電話で）台風で新幹線が止まってしまったので、本日の会議は…　② （お客様に）講師が急に体調を崩しまして、明日の授業は…",
      promptEn:
        "As a polite report to your boss or a customer, finish the sentence. ① （上司に電話で）台風で新幹線が止まってしまったので、本日の会議は…　② （お客様に）講師が急に体調を崩しまして、明日の授業は…",
      rules: [{ kind: "grammar", items: ["〜ざるを得ない", "する → せざるを得ない"] }],
      samples: [
        "① 本日の会議は欠席せざるを得ません。申し訳ありません。",
        "② 明日の授業は中止せざるを得なくなりました。ご迷惑をおかけして申し訳ございません。",
      ],
    },
    {
      id: "f3",
      title: "続けて書く（日記）：〜ものの",
      titleEn: "Finish the sentence (diary): 〜ものの",
      prompt: "日記に書く文として、後半を続けて書く。① 温泉に行こうと思った…　② 説明書を読んだ…",
      promptEn: "Finish these as diary sentences. ① 温泉に行こうと思った…　② 説明書を読んだ…",
      rules: [{ kind: "grammar", items: ["〜ものの（後ろに意志・依頼は×）"] }],
      samples: [
        "① 温泉に行こうと思ったものの、どこも予約がいっぱいだった。",
        "② 説明書を読んだものの、使い方がよく分からなかった。",
      ],
    },
    {
      id: "f4",
      title: "言い換え：話し言葉 → 書き言葉",
      titleEn: "Rephrase: spoken → written",
      prompt:
        "先生が話し言葉で言った文を、日記や口コミに書く文に言い換える。① 予約したんだけど、名前がなかった。　② 夕食が終わってたから、コンビニで買うしかなかった。",
      promptEn:
        "Turn the teacher's spoken sentences into ones you'd write in a diary or review. ① 予約したんだけど、名前がなかった。　② 夕食が終わってたから、コンビニで買うしかなかった。",
      rules: [{ kind: "grammar", items: ["〜ものの（書き言葉）", "〜ざるを得ない（書き言葉）"] }],
      samples: [
        "① 予約したものの、名前がなかった。",
        "② 夕食の時間が終わっていたので、コンビニで済ませざるを得なかった。",
      ],
    },
  ],
};

const hakoneCulture: Lesson = {
  id: "hakone-culture",
  title: "文化の質問",
  titleEn: "Culture questions",
  shortTitle: "5. 文化の質問",
  shortTitleEn: "Culture questions",
  sectionLabel: "5. 文化の質問",
  target: "〜からといって／〜ざるを得ない／〜ものの",
  register:
    "質問ごとに場面が違う：温泉のルールは会話（〜からといって）、予定の変更は丁寧な報告（〜ざるを得ない）、マナーは旅行ブログ（〜ものの）。",
  registerEn:
    "Each question has its own setting: onsen rules in conversation (〜からといって), a change of plans as a polite report (〜ざるを得ない), manners as a travel-blog post (〜ものの).",
  situation: "温泉や旅行のマナーについて、自分の経験や意見を話したり書いたりする。",
  goal: "文化の違いについて、場面に合った文型で自分の意見を言う。",
  readings: { 一泊: "いっぱく", 日本: "にほん" },
  turns: [],
  challenges: [
    {
      id: "k1",
      title: "話し合い：温泉のルール",
      titleEn: "Discuss: onsen rules",
      prompt:
        "日本の温泉のルールで、あなたの国にはない習慣は？ ルールが多いからといって、堅苦しいと思いますか。",
      promptEn:
        "Which Japanese onsen rules don't exist in your country? Does having a lot of rules make it feel stiff?",
      rules: [{ kind: "grammar", items: ["〜からといって"] }],
      samples: [
        "体を洗ってから湯船に入るのは、私の国にはない習慣です。でも、ルールが多いからといって、堅苦しいとは思わないです。みんなが気持ちよく使えるからだと思います。",
      ],
    },
    {
      id: "k2",
      title: "話してみよう：予定を変えざるを得なかったこと",
      titleEn: "Talk: a time you had to change plans",
      prompt:
        "旅行中に予定を変えざるを得なかったことはありますか。旅行会社や上司に報告するつもりで、丁寧に話してみる。",
      promptEn:
        "Have you ever had no choice but to change your plans on a trip? Tell it politely, as if reporting to a travel agency or your boss.",
      rules: [{ kind: "grammar", items: ["〜ざるを得ない"] }],
      samples: [
        "昨年、北海道で大雪になりまして、飛行機が欠航になったため、もう一泊せざるを得ませんでした。翌日の会議にも出られず、オンラインで参加させていただきました。",
      ],
    },
    {
      id: "k3",
      title: "旅行ブログに書く：分かっていたものの",
      titleEn: "Travel blog: you knew, but…",
      prompt:
        "旅行先で、マナーだと分かっていたものの、守るのが難しかったことを、旅行ブログに2〜3文で書く。",
      promptEn:
        "In 2–3 sentences for a travel blog, write about a manner you knew about on a trip but still found hard to follow.",
      rules: [{ kind: "grammar", items: ["〜ものの"] }],
      samples: [
        "電車の中では電話に出ないのがマナーだと分かっていたものの、母から電話が来たとき、つい出てしまった。小さい声で話したものの、周りの人の目が気になった。",
      ],
    },
  ],
};

/**
 * Dominik's 箱根 practice: one lesson whose sections (shown in the right-hand
 * rail) each put one N2 form in the register where it is natural.
 */
const hakonePractice: Lesson = {
  id: "hakone-practice",
  title: "箱根の練習：旅館とその後",
  titleEn: "Hakone practice: at the ryokan and after",
  shortTitle: "箱根の練習",
  shortTitleEn: "Hakone practice",
  situation: "記事「箱根の温泉で」の N2 文型を、それぞれ自然な場面で使う。",
  goal: "〜からといって は会話で、〜ざるを得ない は丁寧な報告で、〜ものの は書き言葉で使えるようにする。",
  turns: [],
  parts: [ryokanReservation, travelAgencyCancel, ryokanReview, hakoneFollowups, hakoneCulture],
};

export const LESSONS: Lesson[] = [
  deliveryRedelivery,
  clinicSymptoms,
  salonHaircut,
  hakonePractice,
];

/** A lesson by id, including the sections of grouped lessons. */
export function findLesson(id: string): Lesson | undefined {
  for (const l of LESSONS) {
    if (l.id === id) return l;
    const part = l.parts?.find((p) => p.id === id);
    if (part) return part;
  }
  return undefined;
}

/** Sidebar / list meta line, e.g. "6 空欄 ・ チャレンジ 2" (no "0 空欄"). */
export function lessonMeta(l: Lesson): string {
  if (l.parts?.length) return `${l.parts.length} セクション`;
  const blanks = l.turns.filter((t) => t.speaker === "student").length;
  const parts: string[] = [];
  if (blanks > 0) parts.push(`${blanks} 空欄`);
  if (l.challenges?.length) parts.push(`${blanks > 0 ? "チャレンジ" : "課題"} ${l.challenges.length}`);
  return parts.join(" ・ ");
}

export const RULE_LABEL: Record<RuleKind, string> = {
  message: "伝えること",
  grammar: "使う文法",
  vocab: "使う単語",
  avoid: "使えない単語",
};

export const RULE_ICON: Record<RuleKind, string> = {
  message: "📝",
  grammar: "📐",
  vocab: "🔤",
  avoid: "🚫",
};
