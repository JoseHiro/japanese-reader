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
    articleIds: ["professions-food", "professions-transport", "professions-daily", "growth"],
  },
  {
    id: "andy",
    displayName: "Andy",
    articleIds: [],
    lessonIds: ["salon-haircut", "clinic-symptoms", "delivery-redelivery"],
  },
  {
    id: "artem",
    displayName: "Artem",
    articleIds: ["marugame-seimen"],
    tobiraCurrent: 5,
    tobiraReviewUpTo: 4,
    vocabPoolId: "artem",
  },
];

export function articlesForUser(user: User): Article[] {
  const byId = new Map(ARTICLES.map((a) => [a.id, a]));
  return user.articleIds
    .map((id) => byId.get(id))
    .filter((a): a is Article => !!a);
}

export function lessonsForUser(user: User): Lesson[] {
  if (!user.lessonIds?.length) return [];
  const byId = new Map(LESSONS.map((l) => [l.id, l]));
  return user.lessonIds
    .map((id) => byId.get(id))
    .filter((l): l is Lesson => !!l);
}

export function findUser(id: string): User | undefined {
  return USERS.find((u) => u.id === id);
}

export function vocabForUser(user: User): VocabItem[] {
  return vocabForPool(user.vocabPoolId);
}
