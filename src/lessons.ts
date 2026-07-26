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

export const LESSONS: Lesson[] = [deliveryRedelivery];

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
