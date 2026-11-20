import { ARTICLES } from "./content";
import type { Article } from "./content";
import { LESSONS } from "./lessons";
import type { Lesson } from "./lessons";
import { vocabForPool } from "./vocabulary";
import type { VocabItem } from "./vocabulary";

// A user in the reader. Each user is scoped to their own set of articles;
// other reader state (theme, furigana, quiz answers) stays global.
export interface User {
  id: string;
  displayName: string;
  /** Article ids from ARTICLES that this user can see. */
  articleIds: string[];
  /**
   * JapanesePod101 transcripts (article ids from ARTICLES) this user can
   * see. They get their own sidebar tab and read like articles, but
   * without quiz tabs. Set (even to []) to show the tab.
   */
  podIds?: string[];
  /** Lesson ids from LESSONS that this user can see. */
  lessonIds?: string[];
  /**
   * Chapter of 上級へのとびら the user is currently working through. Articles
   * for this user should center on grammar from this chapter.
   */
  tobiraCurrent?: number;
  /**
   * Last chapter whose grammar is fair game for review in this user's
   * quizzes (typically `tobiraCurrent - 1`).
   */
  tobiraReviewUpTo?: number;
  /**
   * Vocab pool id from `./vocabulary.ts` (currently only "artem"). Drives
   * the flashcard tab and biases cloze distractors.
   */
  vocabPoolId?: string;
}

// Predefined users. Adding a new one here (with the article ids they own)
// puts them in the sign-in picker. Users who sign in with a name that is
// not in this list get an empty library for now.
export const USERS: User[] = [
  {
    id: "shaun",
    displayName: "Shaun",
    articleIds: [
      "professions-law",
      "homestay-scolding",
      "professions-food",
      "professions-transport",
      "professions-daily",
      "growth",
    ],
    podIds: [
      "pod101-li5-01",
      "pod101-li5-02",
      "pod101-li5-03",
      "pod101-li5-04",
      "pod101-li5-05",
      "ramen-ichibanboshi",
    ],
  },
  {
    id: "artem",
    displayName: "Artem",
    articleIds: ["godzilla", "kamakura-jidai", "nishikori-kei", "marugame-seimen"],
    tobiraCurrent: 5,
    tobiraReviewUpTo: 4,
    vocabPoolId: "artem",
  },
  {
    // New student; articles / lessons to be added once the content is decided.
    id: "chris",
    displayName: "Chris",
    articleIds: [],
  },
  {
    // Passed N3; working towards N2 (2027). Grammar in contrasting groups
    // through the travel series 「Dominikの日本旅」: each episode is an
    // article (read + 使い分け quiz) plus a role-play lesson.
    id: "dominik",
    displayName: "Dominik",
    articleIds: ["tabi-hakone-onsen"],
    lessonIds: ["hakone-practice"],
  },
];

function articlesById(ids: string[]): Article[] {
  const byId = new Map(ARTICLES.map((a) => [a.id, a]));
  return ids.map((id) => byId.get(id)).filter((a): a is Article => !!a);
}

export function articlesForUser(user: User): Article[] {
  return articlesById(user.articleIds);
}

export function podsForUser(user: User): Article[] {
  return articlesById(user.podIds ?? []);
}

export function lessonsForUser(user: User): Lesson[] {
  if (!user.lessonIds?.length) return [];
  const byId = new Map(LESSONS.map((l) => [l.id, l]));
  return user.lessonIds
    .map((id) => byId.get(id))
    .filter((l): l is Lesson => !!l);
}

/** Whether any of the user's articles has 文法選択 questions. */
export function hasGrammarChoice(user: User): boolean {
  return articlesForUser(user).some((a) => (a.quiz?.grammarChoice?.length ?? 0) > 0);
}

export function findUser(id: string): User | undefined {
  return USERS.find((u) => u.id === id);
}

export function vocabForUser(user: User): VocabItem[] {
  return vocabForPool(user.vocabPoolId);
}
