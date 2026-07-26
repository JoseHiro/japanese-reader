import { useEffect, useState } from "react";
import type { User } from "./users";
import {
  LESSONS,
  RULE_ICON,
  RULE_LABEL,
  type Blank,
  type Challenge,
  type Lesson,
} from "./lessons";

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
}: {
  rules?: {
    kind: keyof typeof RULE_LABEL;
    items: string[];
    itemsEn?: string[];
  }[];
}) {
  if (!rules?.length) return null;
  return (
    <div className="pr-rules">
      {rules.map((r, i) => {
        // Message rules with English: render as a bulleted checklist so
        // the task requirements are obvious. Others stay compact chips.
        if (r.kind === "message" && r.itemsEn?.length === r.items.length) {
          return (
            <div className={"pr-rule pr-rule-" + r.kind + " pr-rule-list"} key={i}>
              <span className="pr-rule-label">
                {RULE_ICON[r.kind]} {RULE_LABEL[r.kind]} · Must include
              </span>
              <ul className="pr-checklist">
                {r.items.map((it, j) => (
                  <li key={j}>
                    <span className="pr-check-ja">{it}</span>
                    <span className="pr-check-en">{r.itemsEn![j]}</span>
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
                  {it}
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
          <span className="pr-drill-intent">{blank.intent}</span>
          {blank.intentEn && <span className="pr-en">{blank.intentEn}</span>}
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

      <RuleChips rules={blank.rules} />

      <div className="pr-blank-controls">
        <button className="pr-reveal-sm" onClick={onToggle}>
          {revealed ? "解答を隠す" : "解答を表示"}
        </button>
      </div>

      {revealed && (
        <div className="pr-drill-answers">
          <p className="pr-drill-main">{blank.samples[0]}</p>
          {blank.samples.length > 1 && (
            <details className="pr-alt">
              <summary>別解 {blank.samples.length - 1} 件</summary>
              <ul>
                {blank.samples.slice(1).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </details>
          )}
          {blank.teacherNote && (
            <p className="pr-note">📚 先生メモ：{blank.teacherNote}</p>
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
          <span className="pr-challenge-title">{challenge.title}</span>
          {challenge.titleEn && <span className="pr-en">{challenge.titleEn}</span>}
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
      <p className="pr-challenge-prompt">{challenge.prompt}</p>
      {challenge.promptEn && <p className="pr-en pr-challenge-en">{challenge.promptEn}</p>}
      <RuleChips rules={challenge.rules} />
      <div className="pr-blank-controls">
        <button className="pr-reveal-sm" onClick={() => setRevealed((v) => !v)}>
          {revealed ? "解答例を隠す" : "解答例を表示"}
        </button>
      </div>
      {revealed && (
        <ul className="pr-challenge-samples">
          {challenge.samples.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LessonPage({
  lesson,
  user,
  onExit,
}: {
  lesson: Lesson;
  user: User;
  onExit: () => void;
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

      <h2 className="pr-title">{lesson.title}</h2>
      {lesson.titleEn && <p className="pr-title-en">{lesson.titleEn}</p>}

      <div className="pr-intro-cards">
        <div className="pr-intro-card">
          <span className="pr-intro-label">📍 場面 · Situation</span>
          <p>{lesson.situation}</p>
          {lesson.situationEn && <p className="pr-en">{lesson.situationEn}</p>}
        </div>
        <div className="pr-intro-card">
          <span className="pr-intro-label">🎯 全体ゴール · Goal</span>
          <p>{lesson.goal}</p>
          {lesson.goalEn && <p className="pr-en">{lesson.goalEn}</p>}
        </div>
        {lesson.intent && (
          <details className="pr-intro-card pr-intro-card-teacher">
            <summary className="pr-intro-label">📚 授業の狙い · Teacher intent</summary>
            <p>{lesson.intent}</p>
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
                  <span className="pr-chip" key={i}>{v}</span>
                ))}
              </span>
            </div>
          )}
          {lesson.warmup.grammar && (
            <div className="pr-warmup-row">
              <span className="pr-warmup-label">📐 文法</span>
              <span className="pr-rule-items">
                {lesson.warmup.grammar.map((g, i) => (
                  <span className="pr-chip pr-chip-accent" key={i}>{g}</span>
                ))}
              </span>
            </div>
          )}
          {lesson.warmup.tip && (
            <p className="pr-warmup-tip">💡 {lesson.warmup.tip}</p>
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
                <span className="pr-script-text">{turn.text}</span>
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
                  <span className="pr-script-text">{turn.blank.samples[0]}</span>
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

      <p className="pr-keys">Esc でレッスン一覧に戻る</p>
    </div>
  );
}

export function Practice({
  user,
  openLessonId: openLessonIdProp,
  onOpenLesson,
}: {
  user: User;
  openLessonId?: string | null;
  onOpenLesson?: (id: string | null) => void;
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
      <LessonPage
        lesson={openLesson}
        user={user}
        onExit={() => setOpenLessonId(null)}
      />
    );
  }

  return (
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
            <span className="pr-lesson-title">{l.title}</span>
            <span className="pr-lesson-goal">🎯 {l.goal}</span>
            <span className="pr-lesson-meta">
              {blankCount} 空欄
              {l.challenges && ` ・ チャレンジ ${l.challenges.length}`}
              {starCount > 0 && ` ・ ⭐ ${starCount}`}
            </span>
          </button>
        );
      })}
    </div>
  );
}
