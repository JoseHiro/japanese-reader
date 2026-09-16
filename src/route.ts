// URL hash routing. The current view (article + tab, or lesson + sub-tab)
// is mirrored into the URL so pages can be bookmarked and the browser's
// back/forward buttons navigate between them. Hash-based routing keeps the
// static GitHub Pages deploy working without server rewrites.

const TAB_TO_SLUG: Record<string, string> = {
  article: "article",
  wordlist: "wordlist",
  translate: "translate",
  vocabQuiz: "vocab-quiz",
  readingQuiz: "reading-quiz",
  grammarQuiz: "grammar-quiz",
  flashcards: "flashcards",
  grammarRef: "grammar",
};

const SLUG_TO_TAB: Record<string, string> = Object.fromEntries(
  Object.entries(TAB_TO_SLUG).map(([k, v]) => [v, k]),
);

export type RouteKind = "root" | "article" | "lesson";

export interface Route {
  kind: RouteKind;
  articleId?: string;
  articleTab?: string;
  lessonId?: string;
  lessonTab?: string;
}

export function parseHash(hash?: string): Route {
  const raw = hash ?? (typeof window === "undefined" ? "" : window.location.hash);
  const parts = raw.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (parts[0] === "a" && parts[1]) {
    const slug = parts[2];
    const tab = slug ? SLUG_TO_TAB[slug] ?? "article" : "article";
    return { kind: "article", articleId: decodeURIComponent(parts[1]), articleTab: tab };
  }
  if (parts[0] === "l" && parts[1]) {
    const sub = parts[2];
    return {
      kind: "lesson",
      lessonId: decodeURIComponent(parts[1]),
      lessonTab: sub === "vocab" ? "vocab" : "lesson",
    };
  }
  return { kind: "root" };
}

export function formatArticleHash(articleId: string, tab: string): string {
  const slug = TAB_TO_SLUG[tab] ?? "article";
  const id = encodeURIComponent(articleId);
  return slug === "article" ? `#/a/${id}` : `#/a/${id}/${slug}`;
}

export function formatLessonHash(lessonId: string, tab: string): string {
  const id = encodeURIComponent(lessonId);
  return tab === "vocab" ? `#/l/${id}/vocab` : `#/l/${id}`;
}
