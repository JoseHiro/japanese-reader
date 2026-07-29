// Practice-mode lesson data: a conversation between an interlocutor and
// Andy, with (        ) blanks on Andy's turns. Each blank carries the
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
   * Useful for message rules so Andy can see the task requirements in
   * English before producing Japanese.
   */
  itemsEn?: string[];
}

/** Fillable blank on an Andy turn. */
export interface Blank {
  id: string;
  /** One-line summary of what Andy needs to say. */
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
  | { speaker: "andy"; blank: Blank };

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
  intent?: string;
  intentEn?: string;
  warmup?: Warmup;
  /** Label for the interlocutor across the dialogue (e.g., "配達員"). */
  interlocutorLabel?: string;
  turns: DialogueTurn[];
  challenges?: Challenge[];
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
      speaker: "andy",
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
      speaker: "andy",
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
      speaker: "andy",
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
      speaker: "andy",
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
      speaker: "andy",
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
      speaker: "andy",
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
      speaker: "andy",
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
      speaker: "andy",
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
      speaker: "andy",
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
      speaker: "andy",
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
      speaker: "andy",
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
      speaker: "andy",
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
      speaker: "andy",
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
      speaker: "andy",
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
      speaker: "andy",
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
      speaker: "andy",
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
      speaker: "andy",
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
      speaker: "andy",
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
      speaker: "andy",
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

export const LESSONS: Lesson[] = [deliveryRedelivery, clinicSymptoms, salonHaircut];

export function findLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
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
