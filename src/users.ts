import { ARTICLES } from "./content";
import type { Article } from "./content";

// A user in the reader. Each user is scoped to their own set of articles;
// other reader state (theme, furigana, quiz answers) stays global.
export interface User {
  id: string;
  displayName: string;
  /** Article ids from ARTICLES that this user can see. */
  articleIds: string[];
}

// Predefined users. Adding a new one here (with the article ids they own)
// puts them in the sign-in picker. Users who sign in with a name that is
// not in this list get an empty library for now.
export const USERS: User[] = [
  {
    id: "shaun",
    displayName: "Shaun",
    articleIds: ["growth", "mocha", "kindergarten"],
  },
  {
    id: "andy",
    displayName: "Andy",
    articleIds: [],
  },
];

export function articlesForUser(user: User): Article[] {
  const byId = new Map(ARTICLES.map((a) => [a.id, a]));
  return user.articleIds
    .map((id) => byId.get(id))
    .filter((a): a is Article => !!a);
}

export function findUser(id: string): User | undefined {
  return USERS.find((u) => u.id === id);
}
