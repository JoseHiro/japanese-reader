// Practice-mode lesson data: task-based constrained-output exercises
// designed for live class use. See docs in Practice.tsx for the flow.

export type ExerciseType = "short" | "long" | "roleplay" | "paraphrase";

/**
 * Constraint applied to an exercise:
 *  - message: the content to convey is fixed
 *  - grammar: specific grammar patterns must be used
 *  - vocab:   specific words must appear
 *  - avoid:   listed words must NOT be used (forces circumlocution)
 */
export type RuleKind = "message" | "grammar" | "vocab" | "avoid";

export interface Rule {
  kind: RuleKind;
  items: string[];
}

export interface DialogueTurn {
  speaker: "them" | "andy";
  /** For "them": what the counterpart says. For "andy": sample answer (revealed on click). */
  text: string;
  /** Shown before the sample answer for Andy's turns. */
  hint?: string;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  prompt: string;
  rules: Rule[];
  /** Staged hints — one at a time on click. */
  hints?: string[];
  /** Model answers (2+ variants recommended). Optional for roleplay. */
  answers?: string[];
  /** Turn-by-turn dialogue for roleplay exercises. */
  dialogue?: DialogueTurn[];
  teacherNote?: string;
}

export interface Lesson {
  id: string;
  title: string;
  situation: string;
  goal: string;
  /** Broader intent / pedagogy notes shown to the teacher on the lesson intro. */
  intent?: string;
  exercises: Exercise[];
}

const deliveryRedelivery: Lesson = {
  id: "delivery-redelivery",
  title: "宅配便の再配達を電話で依頼する",
  situation:
    "オートロック付きマンション（501号室）に住む Andy。ヤマト運輸から不在票が入っていた。電話で再配達を依頼する。",
  goal: "複数の条件と代替案を含む依頼を、電話で最後まで日本語だけでやり切る。",
  intent:
    "N4 の依頼構文と時間表現を総復習しつつ、〜てもよろしいでしょうか、〜させていただく、〜ではなく など N3 への足がかりを 1〜2 個ずつ混ぜる。「知らない語を言い換える」訓練を1問入れて英語逃げを直接矯正する。",
  exercises: [
    {
      id: "e1",
      type: "short",
      prompt: "「もう一度届けてほしい」を、指定の語で1文にして。",
      rules: [{ kind: "vocab", items: ["再配達", "お願いします"] }],
      hints: ["主語は省略していい", "「〜たいんですが」で控えめに依頼"],
      answers: ["再配達をお願いします。", "再配達をお願いしたいんですが。"],
    },
    {
      id: "e2",
      type: "short",
      prompt: "明日の18-20時に来てもらえないか、丁寧に依頼して。",
      rules: [
        { kind: "grammar", items: ["〜てもらえませんか"] },
        { kind: "vocab", items: ["時間帯"] },
      ],
      hints: [
        "「明日の〜から〜の間」で時間帯を作る",
        "最後に「〜てもらえませんか」を付ける",
      ],
      answers: [
        "明日の18時から20時の間に来てもらえませんか。",
        "明日の18時から20時の時間帯で再配達してもらえませんか。",
      ],
    },
    {
      id: "e3",
      type: "short",
      prompt:
        "「玄関前ではなく宅配ボックスに入れてほしい」を、「〜ではなく」を使って1文で。",
      rules: [
        { kind: "grammar", items: ["〜ではなく"] },
        { kind: "vocab", items: ["置き配", "宅配ボックス"] },
      ],
      hints: ["「A ではなく B に」の構造", "動詞は「入れる」＋依頼形"],
      answers: [
        "置き配ではなく、宅配ボックスに入れてもらえませんか。",
        "玄関の前に置くのではなく、宅配ボックスに入れてもらいたいんですが。",
      ],
    },
    {
      id: "e4",
      type: "long",
      prompt: "③に「その時間は出かける予定だから」を理由として加え、2〜3文で。",
      rules: [
        { kind: "message", items: ["理由（出かける予定）", "宅配ボックス希望"] },
        { kind: "grammar", items: ["〜ので"] },
      ],
      hints: ["理由 → 依頼の順で自然", "「〜ので」を前半に置く"],
      answers: [
        "その時間はちょっと出かける予定なので、置き配ではなく、宅配ボックスに入れてもらえませんか。",
        "実はその時間は外出しているかもしれないんです。ですので、玄関前ではなく宅配ボックスにお願いできますか。",
      ],
    },
    {
      id: "e5",
      type: "long",
      prompt:
        "「もし宅配ボックスが満杯だったら、隣（502号室）に預けてもよいか事前に確認して」と伝える。",
      rules: [
        {
          kind: "message",
          items: ["条件（満杯だった場合）", "代替案（隣に預ける）", "事前確認の要望"],
        },
        { kind: "grammar", items: ["もし〜たら", "〜てもよろしいでしょうか（N3）"] },
      ],
      hints: [
        "「もし〜たら」で条件を作る",
        "N3向けに「〜てもよろしいでしょうか」で敬語を一段上げる",
      ],
      answers: [
        "もし宅配ボックスが満杯だった場合、隣の502号室に預けていただいてもよろしいでしょうか。",
        "宅配ボックスが空いていなかったら、お隣の502号室に預けさせていただいてもいいですか。",
      ],
      teacherNote:
        "「〜てもよろしいでしょうか」は N3 で新しく身につける丁寧語。日常より一段丁寧で、電話の場面にちょうど合う。",
    },
    {
      id: "e6",
      type: "paraphrase",
      prompt: "「宅配ボックス」が思い出せない設定。使わずに説明して。",
      rules: [{ kind: "avoid", items: ["宅配ボックス"] }],
      hints: [
        "場所から言う（マンション1階／エントランスの近く）",
        "見た目（箱・鍵付き）を描写",
        "用途（荷物を入れる／保管する）で説明",
      ],
      answers: [
        "マンションの1階にある、荷物を入れる鍵付きの箱に入れてもらえませんか。",
        "エントランスの近くに、荷物を保管しておく箱があるんですが、そこに入れてもらえますか。",
        "郵便受けの横の、鍵をかけられる収納みたいなものです。",
      ],
      teacherNote:
        "「知らない単語を3方向（場所・見た目・用途）で説明する」練習。英語逃げの直接対策。",
    },
    {
      id: "e7",
      type: "short",
      prompt:
        "追跡番号を紛失したが、住所と名前で対応してほしいと伝えて。",
      rules: [
        { kind: "message", items: ["追跡番号なし", "住所と名前でOKか確認"] },
      ],
      hints: [
        "「〜てしまう」で困った状況を柔らかく",
        "「〜でも大丈夫でしょうか」で確認",
      ],
      answers: [
        "実は追跡番号を紛失してしまったんですが、住所と名前でも大丈夫でしょうか。",
        "追跡番号のメモを失くしてしまいまして、名前と住所からお願いできますか。",
      ],
    },
    {
      id: "e8",
      type: "roleplay",
      prompt:
        "ヤマト運輸の担当者と、以下の会話を交互に。Andy のターンだけ話す。",
      rules: [{ kind: "message", items: ["全条件込みの依頼"] }],
      dialogue: [
        { speaker: "them", text: "はい、ヤマト運輸〇〇センターです。" },
        {
          speaker: "andy",
          hint: "用件を切り出す。再配達＋名前と住所で対応可能か",
          text:
            "あの、再配達をお願いしたいんですが。実は追跡番号を紛失してしまったので、名前と住所でも大丈夫でしょうか。",
        },
        { speaker: "them", text: "ご住所とお名前をお願いいたします。" },
        {
          speaker: "andy",
          hint: "住所＋部屋番号＋オートロック情報＋名前",
          text:
            "住所は東京都〇〇区〇〇1-2-3、シャロンハイツ501号室です。オートロック付きのマンションです。名前は Andy Smith です。",
        },
        {
          speaker: "them",
          text: "承知いたしました。ご希望のお日にちとお時間帯はございますか？",
        },
        {
          speaker: "andy",
          hint: "第一希望＋代替案（明後日）",
          text:
            "明日の18時から20時の間でお願いできますか。もし明日が難しければ、明後日の同じ時間帯でも大丈夫です。",
        },
        {
          speaker: "them",
          text: "はい、明日の18-20時ですね。玄関先までお持ちしましょうか？",
        },
        {
          speaker: "andy",
          hint: "理由（出かける）→ 依頼（宅配ボックス）",
          text:
            "実はその時間、ちょっと出かけているかもしれないので、玄関前ではなく、宅配ボックスに入れていただけませんか。",
        },
        {
          speaker: "them",
          text:
            "宅配ボックスがご利用可能でしたら、そちらに入れさせていただきますが、もし満杯だった場合はいかがいたしましょうか？",
        },
        {
          speaker: "andy",
          hint: "条件 → 代替案（隣の502号室）→ 事前確認の要望",
          text:
            "もし満杯だった場合、お隣の502号室に預けていただいてもよろしいでしょうか。事前に確認してもらえたら助かります。",
        },
        {
          speaker: "them",
          text: "かしこまりました。それではそのように手配いたします。",
        },
        {
          speaker: "andy",
          hint: "お礼＋締め",
          text: "はい、ありがとうございます。それではよろしくお願いいたします。失礼します。",
        },
      ],
      teacherNote:
        "Exercise ①〜⑦ の要素が全部登場する集大成。詰まったら該当の Exercise に戻る。",
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

export const TYPE_LABEL: Record<ExerciseType, string> = {
  short: "短文",
  long: "長文",
  roleplay: "ロールプレイ",
  paraphrase: "言い換え",
};
