import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "./users";
import {
  LESSONS,
  RULE_ICON,
  RULE_LABEL,
  type Blank,
  type Challenge,
  type Lesson,
} from "./lessons";
import { Furigana } from "./shared/Furigana";
import { loadTokenizer, toTokens } from "./tokenizer";
import { loadDictionary } from "./dictionary";

// showFurigana is available anywhere inside Practice via context so we
// don't have to thread it through every sub-component.
const FuriCtx = createContext(true);

function J({ text }: { text: string }) {
  const show = useContext(FuriCtx);
  return <Furigana text={text} show={show} />;
}

// Practice mode. Compact dialogue "script" on top with numbered blanks
// (①②③...) for Andy's turns; clicking a number scrolls to the numbered
// drill below and reveals the answer there. Revealing an answer also
// inlines it into the script so the whole conversation can be re-read.

const bookmarkKey = (u: User) => `yomu-practice-${u.id}-bookmarks`;

function loadSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveSet(key: string, set: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...set]));
}

const CIRCLED = ["", "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩", "⑪", "⑫"];
function circled(n: number): string {
  return CIRCLED[n] ?? "(" + n + ")";
}

function drillDomId(blankId: string) {
  return "drill-" + blankId;
}

function scrollToDrill(blankId: string) {
  const el = document.getElementById(drillDomId(blankId));
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("pr-drill-flash");
  setTimeout(() => el.classList.remove("pr-drill-flash"), 900);
}

function RuleChips({
  rules,
  revealed,
}: {
  rules?: {
    kind: keyof typeof RULE_LABEL;
    items: string[];
    itemsEn?: string[];
  }[];
  /** When false, hide Japanese in message rules (to avoid spoiling the answer). */
  revealed?: boolean;
}) {
  if (!rules?.length) return null;
  return (
    <div className="pr-rules">
      {rules.map((r, i) => {
        // Message rules with English: render as a bulleted checklist. Japanese
        // is hidden until the answer is revealed so it doesn't spoil the target
        // sentence.
        if (r.kind === "message" && r.itemsEn?.length === r.items.length) {
          return (
            <div className={"pr-rule pr-rule-" + r.kind + " pr-rule-list"} key={i}>
              <span className="pr-rule-label">
                {RULE_ICON[r.kind]} {RULE_LABEL[r.kind]} · Must include
              </span>
              <ul className="pr-checklist">
                {r.items.map((it, j) => (
                  <li key={j}>
                    <span className="pr-check-en pr-check-en-primary">
                      {r.itemsEn![j]}
                    </span>
                    {revealed && (
                      <span className="pr-check-ja"><J text={it} /></span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        }
        return (
          <div className={"pr-rule pr-rule-" + r.kind} key={i}>
            <span className="pr-rule-label">
              {RULE_ICON[r.kind]} {RULE_LABEL[r.kind]}
            </span>
            <span className="pr-rule-items">
              {r.items.map((it, j) => (
                <span className="pr-chip" key={j} title={r.itemsEn?.[j]}>
                  <J text={it} />
                </span>
              ))}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DrillCard({
  blank,
  number,
  revealed,
  onToggle,
  bookmarked,
  onBookmarkToggle,
}: {
  blank: Blank;
  number: number;
  revealed: boolean;
  onToggle: () => void;
  bookmarked: boolean;
  onBookmarkToggle: () => void;
}) {
  return (
    <div className="pr-drill" id={drillDomId(blank.id)}>
      <div className="pr-drill-head">
        <span className="pr-drill-num">{circled(number)}</span>
        <div className="pr-drill-title">
          {blank.intentEn ? (
            <>
              <span className="pr-drill-intent-en">{blank.intentEn}</span>
              {revealed && (
                <span className="pr-en"><J text={blank.intent} /></span>
              )}
            </>
          ) : (
            <span className="pr-drill-intent"><J text={blank.intent} /></span>
          )}
        </div>
        <button
          className={"pr-bookmark" + (bookmarked ? " on" : "")}
          onClick={onBookmarkToggle}
          title="ブックマーク"
          aria-pressed={bookmarked}
        >
          {bookmarked ? "★" : "☆"}
        </button>
      </div>

      <RuleChips rules={blank.rules} revealed={revealed} />

      <div className="pr-blank-controls">
        <button className="pr-reveal-sm" onClick={onToggle}>
          {revealed ? "解答を隠す" : "解答を表示"}
        </button>
      </div>

      {revealed && (
        <div className="pr-drill-answers">
          <p className="pr-drill-main"><J text={blank.samples[0]} /></p>
          {blank.samples.length > 1 && (
            <details className="pr-alt">
              <summary>別解 {blank.samples.length - 1} 件</summary>
              <ul>
                {blank.samples.slice(1).map((s, i) => (
                  <li key={i}><J text={s} /></li>
                ))}
              </ul>
            </details>
          )}
          {blank.teacherNote && (
            <p className="pr-note">📚 先生メモ：<J text={blank.teacherNote} /></p>
          )}
        </div>
      )}
    </div>
  );
}

function ChallengeCard({
  challenge,
  bookmarked,
  onBookmarkToggle,
}: {
  challenge: Challenge;
  bookmarked: boolean;
  onBookmarkToggle: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="pr-challenge" id={"drill-" + challenge.id}>
      <div className="pr-challenge-head">
        <span className="pr-challenge-badge">チャレンジ</span>
        <div className="pr-drill-title">
          {challenge.titleEn ? (
            <>
              <span className="pr-challenge-title pr-challenge-title-en">
                {challenge.titleEn}
              </span>
              {revealed && (
                <span className="pr-en"><J text={challenge.title} /></span>
              )}
            </>
          ) : (
            <span className="pr-challenge-title"><J text={challenge.title} /></span>
          )}
        </div>
        <button
          className={"pr-bookmark" + (bookmarked ? " on" : "")}
          onClick={onBookmarkToggle}
          title="ブックマーク"
          aria-pressed={bookmarked}
        >
          {bookmarked ? "★" : "☆"}
        </button>
      </div>
      {challenge.promptEn ? (
        <>
          <p className="pr-challenge-prompt pr-challenge-prompt-en">
            {challenge.promptEn}
          </p>
          {revealed && (
            <p className="pr-en pr-challenge-en"><J text={challenge.prompt} /></p>
          )}
        </>
      ) : (
        <p className="pr-challenge-prompt"><J text={challenge.prompt} /></p>
      )}
      <RuleChips rules={challenge.rules} revealed={revealed} />
      <div className="pr-blank-controls">
        <button className="pr-reveal-sm" onClick={() => setRevealed((v) => !v)}>
          {revealed ? "解答例を隠す" : "解答例を表示"}
        </button>
      </div>
      {revealed && (
        <ul className="pr-challenge-samples">
          {challenge.samples.map((s, i) => (
            <li key={i}><J text={s} /></li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface LessonWord {
  key: string;      // dictionary form
  surface: string;  // first surface seen
  reading: string;
  pos: string;
  /** From warmup.vocab or a vocab rule. */
  starred: boolean;
}

// Collect every Japanese source string in a lesson (them turns, blank
// samples, intents, rule items, warmup, challenges).
function lessonTexts(lesson: Lesson): string[] {
  const out: string[] = [];
  out.push(lesson.title, lesson.situation, lesson.goal);
  if (lesson.intent) out.push(lesson.intent);
  if (lesson.warmup?.tip) out.push(lesson.warmup.tip);
  for (const t of lesson.turns) {
    if (t.speaker === "them") out.push(t.text);
    else {
      out.push(t.blank.intent);
      out.push(...t.blank.samples);
      if (t.blank.teacherNote) out.push(t.blank.teacherNote);
      for (const r of t.blank.rules ?? []) out.push(...r.items);
    }
  }
  for (const c of lesson.challenges ?? []) {
    out.push(c.title, c.prompt, ...c.samples);
    for (const r of c.rules ?? []) out.push(...r.items);
  }
  return out;
}

// Words explicitly called out as vocabulary targets (warmup + vocab/avoid
// rules across the lesson). These get a "★" marker in the list.
function starredVocab(lesson: Lesson): Set<string> {
  const s = new Set<string>();
  for (const v of lesson.warmup?.vocab ?? []) s.add(v);
  for (const t of lesson.turns) {
    if (t.speaker !== "andy") continue;
    for (const r of t.blank.rules ?? []) {
      if (r.kind === "vocab" || r.kind === "avoid") for (const it of r.items) s.add(it);
    }
  }
  for (const c of lesson.challenges ?? []) {
    for (const r of c.rules ?? []) {
      if (r.kind === "vocab" || r.kind === "avoid") for (const it of r.items) s.add(it);
    }
  }
  return s;
}

const CONTENT_POS = new Set(["名詞", "動詞", "形容詞", "副詞", "連体詞", "感動詞"]);

// Core N5-ish vocabulary — words a learner past Genki 2 definitely knows.
// Hidden by default from the lesson vocab list to reduce noise; can be
// shown via the toolbar toggle. Starred (target) words override this.
const BASIC_WORDS = new Set<string>([
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
  "水", "お茶", "ご飯", "パン",
  // basic adjectives (i)
  "いい", "良い", "悪い", "大きい", "小さい", "新しい", "古い", "多い", "少ない",
  "楽しい", "面白い", "難しい", "易しい", "忙しい",
  "高い", "低い", "長い", "短い", "早い", "速い", "遅い", "近い", "遠い",
  "強い", "弱い", "熱い", "冷たい", "暑い", "寒い", "温かい", "涼しい",
  "美味しい", "まずい", "赤い", "青い", "白い", "黒い", "黄色い",
  // basic adjectives (na) / adjectivalせん
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


function LessonVocab({ lesson }: { lesson: Lesson }) {
  const [words, setWords] = useState<LessonWord[] | null>(null);
  const [glosses, setGlosses] = useState<Record<string, string[]>>({});
  const [query, setQuery] = useState("");
  const [starOnly, setStarOnly] = useState(false);
  const [showBasic, setShowBasic] = useState(false);
  const show = useContext(FuriCtx);

  useEffect(() => {
    let alive = true;
    (async () => {
      const tk = await loadTokenizer();
      const seen = new Map<string, LessonWord>();
      const star = starredVocab(lesson);
      for (const text of lessonTexts(lesson)) {
        const tokens = toTokens(tk.tokenize(text));
        for (const t of tokens) {
          if (!CONTENT_POS.has(t.pos)) continue;
          const key = t.base && t.base !== "*" ? t.base : t.surface;
          if (seen.has(key)) continue;
          seen.set(key, {
            key,
            surface: t.surface,
            reading: t.reading,
            pos: t.pos,
            starred: star.has(key) || star.has(t.surface),
          });
        }
      }
      // Also add any starred words that aren't in tokenized text as-is
      for (const v of star) {
        if (!seen.has(v)) {
          seen.set(v, { key: v, surface: v, reading: "", pos: "", starred: true });
        }
      }
      const list = [...seen.values()].sort(
        (a, b) => Number(b.starred) - Number(a.starred),
      );
      if (alive) setWords(list);
    })();
    return () => {
      alive = false;
    };
  }, [lesson.id]);

  useEffect(() => {
    if (!words) return;
    let alive = true;
    loadDictionary().then((dict) => {
      if (!alive) return;
      const m: Record<string, string[]> = {};
      for (const w of words) {
        const g = dict[w.key] ?? dict[w.surface] ?? (w.reading ? dict[w.reading] : undefined);
        if (g) m[w.key] = g;
      }
      setGlosses(m);
    });
    return () => {
      alive = false;
    };
  }, [words]);

  const filtered = useMemo(() => {
    if (!words) return [];
    const q = query.trim().toLowerCase();
    // Always keep starred (target) words; hide basic ones by default.
    let list = words.filter((w) => {
      if (w.starred) return true;
      if (!showBasic && (BASIC_WORDS.has(w.key) || BASIC_WORDS.has(w.surface))) {
        return false;
      }
      return true;
    });
    if (starOnly) list = list.filter((w) => w.starred);
    if (!q) return list;
    return list.filter((w) => {
      const meaning = (glosses[w.key]?.join("; ") ?? "").toLowerCase();
      return (
        w.surface.includes(q) ||
        w.key.includes(q) ||
        w.reading.includes(q) ||
        meaning.includes(q)
      );
    });
  }, [words, glosses, query, starOnly, showBasic]);

  if (!words) return <p className="hint">語彙を集めています…</p>;

  return (
    <div className="wordlist pr-vocab">
      <div className="wl-toolbar">
        <div className="wl-search">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="単語・読み・意味で検索…"
            aria-label="単語を検索"
          />
        </div>
        <label className="pr-vocab-toggle">
          <input
            type="checkbox"
            checked={starOnly}
            onChange={(e) => setStarOnly(e.target.checked)}
          />
          ★ ターゲット語のみ
        </label>
        <label className="pr-vocab-toggle">
          <input
            type="checkbox"
            checked={showBasic}
            onChange={(e) => setShowBasic(e.target.checked)}
          />
          基本語も表示
        </label>
        <span className="wl-count">
          {filtered.length} / {words.length} 語
        </span>
      </div>
      {filtered.length === 0 ? (
        <p className="hint">該当する単語がありません。</p>
      ) : (
        <table className="wl-table">
          <thead>
            <tr>
              <th className="wl-th-word">単語</th>
              <th className="wl-th-reading">読み</th>
              <th className="wl-th-meaning">意味</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((w, i) => (
              <tr key={i}>
                <td className={"wl-word" + (w.starred ? " annotated" : "")}>
                  {w.starred && <span className="pr-vocab-star">★</span>}
                  <Furigana text={w.surface} show={show} />
                </td>
                <td className="wl-reading">{w.reading}</td>
                <td className="wl-meaning">
                  {glosses[w.key]?.join("; ") || (w.starred ? "（ターゲット語）" : "—")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function LessonPage({
  lesson,
  user,
  onExit,
  subTab = "lesson",
}: {
  lesson: Lesson;
  user: User;
  onExit: () => void;
  subTab?: string;
}) {
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => loadSet(bookmarkKey(user)));
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  useEffect(() => saveSet(bookmarkKey(user), bookmarks), [bookmarks, user]);

  // Reset reveals when the lesson changes.
  useEffect(() => setRevealed(new Set()), [lesson.id]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onExit();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit]);

  function toggleBookmark(id: string) {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleRevealed(id: string) {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const interlocutor = lesson.interlocutorLabel ?? "相手";

  // Number each Andy blank in the order it appears in the dialogue.
  const blanks: { blank: Blank; number: number }[] = [];
  {
    let n = 0;
    for (const t of lesson.turns) {
      if (t.speaker === "andy") {
        n += 1;
        blanks.push({ blank: t.blank, number: n });
      }
    }
  }
  const blankNumberById = new Map(blanks.map(({ blank, number }) => [blank.id, number]));

  return (
    <div className="pr-page">
      <div className="pr-toolbar">
        <button className="pr-mini" onClick={onExit}>
          ← レッスン一覧
        </button>
        <span className="pr-progress">
          {blanks.length} 空欄
          {lesson.challenges && ` ・ チャレンジ ${lesson.challenges.length}`}
        </span>
      </div>

      <h2 className="pr-title"><J text={lesson.title} /></h2>
      {lesson.titleEn && <p className="pr-title-en">{lesson.titleEn}</p>}

      {subTab === "vocab" && <LessonVocab lesson={lesson} />}

      {subTab === "lesson" && (
      <>
      <div className="pr-intro-cards">
        <div className="pr-intro-card">
          <span className="pr-intro-label">📍 場面 · Situation</span>
          <p><J text={lesson.situation} /></p>
          {lesson.situationEn && <p className="pr-en">{lesson.situationEn}</p>}
        </div>
        <div className="pr-intro-card">
          <span className="pr-intro-label">🎯 全体ゴール · Goal</span>
          <p><J text={lesson.goal} /></p>
          {lesson.goalEn && <p className="pr-en">{lesson.goalEn}</p>}
        </div>
        {lesson.intent && (
          <details className="pr-intro-card pr-intro-card-teacher">
            <summary className="pr-intro-label">📚 授業の狙い · Teacher intent</summary>
            <p><J text={lesson.intent} /></p>
            {lesson.intentEn && <p className="pr-en">{lesson.intentEn}</p>}
          </details>
        )}
      </div>

      {lesson.warmup && (
        <details className="pr-warmup" open>
          <summary className="pr-warmup-title">🔥 準備（今日使う語・文法）</summary>
          {lesson.warmup.vocab && (
            <div className="pr-warmup-row">
              <span className="pr-warmup-label">🔤 語</span>
              <span className="pr-rule-items">
                {lesson.warmup.vocab.map((v, i) => (
                  <span className="pr-chip" key={i}><J text={v} /></span>
                ))}
              </span>
            </div>
          )}
          {lesson.warmup.grammar && (
            <div className="pr-warmup-row">
              <span className="pr-warmup-label">📐 文法</span>
              <span className="pr-rule-items">
                {lesson.warmup.grammar.map((g, i) => (
                  <span className="pr-chip pr-chip-accent" key={i}><J text={g} /></span>
                ))}
              </span>
            </div>
          )}
          {lesson.warmup.tip && (
            <p className="pr-warmup-tip">💡 <J text={lesson.warmup.tip} /></p>
          )}
        </details>
      )}

      {/* Script view: compact conversation with numbered blanks */}
      <div className="pr-script">
        {lesson.turns.map((turn, i) => {
          if (turn.speaker === "them") {
            return (
              <p className="pr-script-line" key={i}>
                <span className="pr-script-who pr-script-who-them">
                  📞 {interlocutor}：
                </span>
                <span className="pr-script-text"><J text={turn.text} /></span>
              </p>
            );
          }
          const num = blankNumberById.get(turn.blank.id) ?? 0;
          const isRevealed = revealed.has(turn.blank.id);
          return (
            <p className="pr-script-line" key={i}>
              <span className="pr-script-who pr-script-who-andy">
                🎤 Andy：
              </span>
              {isRevealed ? (
                <span className="pr-script-answer">
                  <button
                    className="pr-slot pr-slot-inline"
                    onClick={() => scrollToDrill(turn.blank.id)}
                    title="下の詳細へジャンプ"
                  >
                    {circled(num)}
                  </button>
                  <span className="pr-script-text"><J text={turn.blank.samples[0]} /></span>
                </span>
              ) : (
                <button
                  className="pr-slot"
                  onClick={() => scrollToDrill(turn.blank.id)}
                  title="下の詳細へジャンプ"
                >
                  （　　{circled(num)}　　）
                </button>
              )}
            </p>
          );
        })}
      </div>

      {/* Drills: numbered detail cards */}
      <div className="pr-drills">
        <h3 className="pr-drills-title">
          練習 · Practice
          <span className="pr-drills-sub">
            各空欄をクリック → 詳しい指示と模範解答へ · Click a blank to jump to its drill
          </span>
        </h3>
        {blanks.map(({ blank, number }) => (
          <DrillCard
            key={blank.id}
            blank={blank}
            number={number}
            revealed={revealed.has(blank.id)}
            onToggle={() => toggleRevealed(blank.id)}
            bookmarked={bookmarks.has(blank.id)}
            onBookmarkToggle={() => toggleBookmark(blank.id)}
          />
        ))}

        {lesson.challenges && lesson.challenges.length > 0 && (
          <>
            <h3 className="pr-drills-title pr-drills-title-sub">
              追加チャレンジ · Bonus challenges
            </h3>
            {lesson.challenges.map((c) => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                bookmarked={bookmarks.has(c.id)}
                onBookmarkToggle={() => toggleBookmark(c.id)}
              />
            ))}
          </>
        )}
      </div>
      </>
      )}

      <p className="pr-keys">Esc でレッスン一覧に戻る</p>
    </div>
  );
}

export function Practice({
  user,
  openLessonId: openLessonIdProp,
  onOpenLesson,
  showFurigana = true,
  lessonTab = "lesson",
}: {
  user: User;
  openLessonId?: string | null;
  onOpenLesson?: (id: string | null) => void;
  showFurigana?: boolean;
  lessonTab?: string;
}) {
  const [internalOpenId, setInternalOpenId] = useState<string | null>(null);
  const openLessonId = openLessonIdProp !== undefined ? openLessonIdProp : internalOpenId;
  const setOpenLessonId = (id: string | null) => {
    setInternalOpenId(id);
    onOpenLesson?.(id);
  };
  const bookmarks = loadSet(bookmarkKey(user));

  const openLesson = openLessonId
    ? LESSONS.find((l) => l.id === openLessonId)
    : null;

  if (openLesson) {
    return (
      <FuriCtx.Provider value={showFurigana}>
        <LessonPage
          lesson={openLesson}
          user={user}
          onExit={() => setOpenLessonId(null)}
          subTab={lessonTab}
        />
      </FuriCtx.Provider>
    );
  }

  return (
    <FuriCtx.Provider value={showFurigana}>
    <div className="pr-list">
      {LESSONS.map((l) => {
        const allIds = [
          ...l.turns.filter((t) => t.speaker === "andy").map((t) => (t as { blank: Blank }).blank.id),
          ...(l.challenges?.map((c) => c.id) ?? []),
        ];
        const starCount = allIds.filter((id) => bookmarks.has(id)).length;
        const blankCount = l.turns.filter((t) => t.speaker === "andy").length;
        return (
          <button
            key={l.id}
            className="pr-lesson-card"
            onClick={() => setOpenLessonId(l.id)}
          >
            <span className="pr-lesson-title"><J text={l.title} /></span>
            <span className="pr-lesson-goal">🎯 <J text={l.goal} /></span>
            <span className="pr-lesson-meta">
              {blankCount} 空欄
              {l.challenges && ` ・ チャレンジ ${l.challenges.length}`}
              {starCount > 0 && ` ・ ⭐ ${starCount}`}
            </span>
          </button>
        );
      })}
    </div>
    </FuriCtx.Provider>
  );
}
