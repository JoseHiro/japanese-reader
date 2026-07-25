import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "./users";
import {
  LESSONS,
  RULE_ICON,
  RULE_LABEL,
  TYPE_LABEL,
  type Exercise,
  type Lesson,
} from "./lessons";

// Practice mode. Task-based constrained-output lessons for live class use.
// Flow: lesson list -> lesson intro -> stepped exercises -> done.
// Progress and bookmarks persist in localStorage, scoped per user.

const bookmarkKey = (u: User) => `yomu-practice-${u.id}-bookmarks`;
const seenKey = (u: User) => `yomu-practice-${u.id}-seen`;

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

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  total: number;
  bookmarked: boolean;
  onBookmarkToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
  onExit: () => void;
}

function ExerciseCard(props: ExerciseCardProps) {
  const { exercise, index, total, bookmarked } = props;
  const [hintsShown, setHintsShown] = useState(0);
  const [answersShown, setAnswersShown] = useState(false);
  // For roleplay: number of Andy turns whose sample has been revealed.
  const [turnsRevealed, setTurnsRevealed] = useState(0);

  // Reset reveal state whenever the exercise changes.
  useEffect(() => {
    setHintsShown(0);
    setAnswersShown(false);
    setTurnsRevealed(0);
  }, [exercise.id]);

  const isRoleplay = exercise.type === "roleplay";
  const totalHints = exercise.hints?.length ?? 0;

  // For roleplay, "reveal" advances through Andy turns.
  const andyTurnCount = useMemo(
    () => (exercise.dialogue ?? []).filter((t) => t.speaker === "andy").length,
    [exercise.dialogue],
  );

  const reveal = useCallback(() => {
    if (isRoleplay) {
      if (turnsRevealed < andyTurnCount) setTurnsRevealed((n) => n + 1);
      return;
    }
    if (hintsShown < totalHints) {
      setHintsShown((n) => n + 1);
    } else if (!answersShown) {
      setAnswersShown(true);
    }
  }, [isRoleplay, turnsRevealed, andyTurnCount, hintsShown, totalHints, answersShown]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        reveal();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        props.onNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        props.onPrev();
      } else if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        props.onBookmarkToggle();
      } else if (e.key === "Escape") {
        e.preventDefault();
        props.onExit();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reveal, props]);

  const revealLabel = isRoleplay
    ? turnsRevealed < andyTurnCount
      ? `Andy の発話を表示（${turnsRevealed + 1}/${andyTurnCount}）`
      : "全部表示済み"
    : hintsShown < totalHints
      ? `ヒント ${hintsShown + 1} / ${totalHints} を表示`
      : answersShown
        ? "解答表示済み"
        : "解答を表示";

  return (
    <div className="pr-exercise">
      <div className="pr-toolbar">
        <button className="pr-mini" onClick={props.onExit} title="レッスン一覧に戻る (Esc)">
          ← 戻る
        </button>
        <span className="pr-progress">
          {index + 1} / {total}
        </span>
        <span className="pr-badges">
          <span className="pr-type">{TYPE_LABEL[exercise.type]}</span>
          <button
            className={"pr-bookmark" + (bookmarked ? " on" : "")}
            onClick={props.onBookmarkToggle}
            title="ブックマーク (B)"
            aria-label="ブックマーク"
            aria-pressed={bookmarked}
          >
            {bookmarked ? "★" : "☆"}
          </button>
        </span>
      </div>

      <p className="pr-prompt">{exercise.prompt}</p>

      {exercise.rules.length > 0 && (
        <div className="pr-rules">
          {exercise.rules.map((r, i) => (
            <div className={"pr-rule pr-rule-" + r.kind} key={i}>
              <span className="pr-rule-label">
                {RULE_ICON[r.kind]} {RULE_LABEL[r.kind]}
              </span>
              <span className="pr-rule-items">
                {r.items.map((it, j) => (
                  <span className="pr-chip" key={j}>
                    {it}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
      )}

      {!isRoleplay && hintsShown > 0 && (
        <ul className="pr-hints">
          {exercise.hints?.slice(0, hintsShown).map((h, i) => (
            <li key={i}>💡 {h}</li>
          ))}
        </ul>
      )}

      {!isRoleplay && answersShown && exercise.answers && (
        <div className="pr-answers">
          <span className="pr-answers-label">✅ 模範解答</span>
          <ul>
            {exercise.answers.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {isRoleplay && exercise.dialogue && (
        <div className="pr-dialogue">
          {(() => {
            let andyIdx = 0;
            return exercise.dialogue.map((turn, i) => {
              if (turn.speaker === "them") {
                return (
                  <div className="pr-turn pr-turn-them" key={i}>
                    <span className="pr-turn-who">📞 担当</span>
                    <span className="pr-turn-text">{turn.text}</span>
                  </div>
                );
              }
              const revealed = andyIdx < turnsRevealed;
              const localIdx = andyIdx;
              andyIdx += 1;
              return (
                <div className="pr-turn pr-turn-andy" key={i}>
                  <span className="pr-turn-who">🎤 Andy</span>
                  {!revealed ? (
                    <span className="pr-turn-hint">▶ ヒント：{turn.hint}</span>
                  ) : (
                    <>
                      {turn.hint && (
                        <span className="pr-turn-hint faded">▶ {turn.hint}</span>
                      )}
                      <span className="pr-turn-text">{turn.text}</span>
                    </>
                  )}
                  <span className="pr-turn-num">{localIdx + 1}</span>
                </div>
              );
            });
          })()}
        </div>
      )}

      {exercise.teacherNote && (answersShown || (isRoleplay && turnsRevealed === andyTurnCount)) && (
        <p className="pr-note">📚 先生メモ：{exercise.teacherNote}</p>
      )}

      <div className="pr-controls">
        <button className="pr-nav" onClick={props.onPrev} disabled={index === 0}>
          ← 前
        </button>
        <button className="pr-reveal" onClick={reveal}>
          {revealLabel}
        </button>
        <button className="pr-nav" onClick={props.onNext}>
          {index === total - 1 ? "終了 →" : "次 →"}
        </button>
      </div>

      <p className="pr-keys">
        Space=表示 / ←→=移動 / B=ブックマーク / Esc=戻る
      </p>
    </div>
  );
}

function LessonRunner({
  lesson,
  user,
  onExit,
}: {
  lesson: Lesson;
  user: User;
  onExit: () => void;
}) {
  const [idx, setIdx] = useState<number | "intro">("intro");
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => loadSet(bookmarkKey(user)));
  const [seen, setSeen] = useState<Set<string>>(() => loadSet(seenKey(user)));

  useEffect(() => saveSet(bookmarkKey(user), bookmarks), [bookmarks, user]);
  useEffect(() => saveSet(seenKey(user), seen), [seen, user]);

  function markSeen(exId: string) {
    setSeen((prev) => {
      if (prev.has(exId)) return prev;
      const next = new Set(prev);
      next.add(exId);
      return next;
    });
  }

  function toggleBookmark(exId: string) {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(exId)) next.delete(exId);
      else next.add(exId);
      return next;
    });
  }

  if (idx === "intro") {
    return (
      <div className="pr-intro">
        <div className="pr-toolbar">
          <button className="pr-mini" onClick={onExit}>
            ← レッスン一覧
          </button>
          <span className="pr-progress">
            {lesson.exercises.length} エクササイズ
          </span>
        </div>
        <h2 className="pr-title">{lesson.title}</h2>
        <div className="pr-intro-block">
          <span className="pr-intro-label">📍 場面</span>
          <p>{lesson.situation}</p>
        </div>
        <div className="pr-intro-block">
          <span className="pr-intro-label">🎯 全体ゴール</span>
          <p>{lesson.goal}</p>
        </div>
        {lesson.intent && (
          <div className="pr-intro-block">
            <span className="pr-intro-label">📚 授業の狙い</span>
            <p>{lesson.intent}</p>
          </div>
        )}
        <div className="pr-controls">
          <button
            className="pr-reveal"
            onClick={() => {
              setIdx(0);
              markSeen(lesson.exercises[0].id);
            }}
          >
            開始 →
          </button>
        </div>
      </div>
    );
  }

  const exercise = lesson.exercises[idx];

  function goNext() {
    if (idx === "intro") return;
    const nextIdx = idx + 1;
    if (nextIdx >= lesson.exercises.length) {
      onExit();
      return;
    }
    markSeen(lesson.exercises[nextIdx].id);
    setIdx(nextIdx);
  }
  function goPrev() {
    if (idx === "intro" || idx === 0) return;
    setIdx(idx - 1);
  }

  return (
    <ExerciseCard
      exercise={exercise}
      index={idx}
      total={lesson.exercises.length}
      bookmarked={bookmarks.has(exercise.id)}
      onBookmarkToggle={() => toggleBookmark(exercise.id)}
      onNext={goNext}
      onPrev={goPrev}
      onExit={onExit}
    />
  );
}

export function Practice({ user }: { user: User }) {
  const [openLessonId, setOpenLessonId] = useState<string | null>(null);
  const seen = loadSet(seenKey(user));
  const bookmarks = loadSet(bookmarkKey(user));

  const openLesson = openLessonId
    ? LESSONS.find((l) => l.id === openLessonId)
    : null;

  if (openLesson) {
    return (
      <LessonRunner
        lesson={openLesson}
        user={user}
        onExit={() => setOpenLessonId(null)}
      />
    );
  }

  return (
    <div className="pr-list">
      {LESSONS.map((l) => {
        const doneCount = l.exercises.filter((e) => seen.has(e.id)).length;
        const starCount = l.exercises.filter((e) => bookmarks.has(e.id)).length;
        return (
          <button
            key={l.id}
            className="pr-lesson-card"
            onClick={() => setOpenLessonId(l.id)}
          >
            <span className="pr-lesson-title">{l.title}</span>
            <span className="pr-lesson-goal">🎯 {l.goal}</span>
            <span className="pr-lesson-meta">
              {l.exercises.length} エクササイズ
              {doneCount > 0 && ` ・ 進捗 ${doneCount}/${l.exercises.length}`}
              {starCount > 0 && ` ・ ⭐ ${starCount}`}
            </span>
          </button>
        );
      })}
    </div>
  );
}
