import { useEffect, useMemo, useRef, useState } from "react";
import { loadTokenizer, toTokens, type Token } from "./tokenizer";
import { buildUnits, type Unit } from "./units";
import type { Annotation, Article } from "./content";
import { lookupGlosses, loadDictionary } from "./dictionary";
import { Furigana } from "./shared/Furigana";
import { TabRail, type TabDef, type TabGroup } from "./shared/TabRail";
import {
  CONTENT_POS,
  isBasicWord,
  isKatakanaOnly,
  isLatinOnly,
  isTrivialToken,
} from "./shared/vocabFilter";
import {
  IconArticle,
  IconWordList,
  IconVocabQuiz,
  IconReadingQuiz,
  IconSun,
  IconMoon,
  IconLogout,
  IconTranslate,
  IconChevronLeft,
  IconChevronRight,
  IconHelp,
  IconGrammarQuiz,
  IconFlashcards,
  IconGrammarBook,
} from "./shared/icons";
import { findUser, articlesForUser, lessonsForUser, vocabForUser, type User } from "./users";
import { SignIn } from "./SignIn";
import { Practice } from "./Practice";
import { ArticleTranslate } from "./ArticleTranslate";
import { GrammarQuiz } from "./GrammarQuiz";
import { Flashcards } from "./Flashcards";
import { GrammarReference } from "./GrammarReference";
import { parseHash, formatArticleHash, formatLessonHash } from "./route";

interface Sentence {
  units: Unit[];
  text: string;
  translation?: string;
}
type Paragraph = Sentence[];

const SENTENCE_ENDERS = new Set(["。", "！", "？", "!", "?"]);

function splitIntoSentences(tokens: Token[]): { tokens: Token[]; text: string }[] {
  const sentences: { tokens: Token[]; text: string }[] = [];
  let current: Token[] = [];
  let quoteDepth = 0;
  const flush = () => {
    if (current.length) {
      sentences.push({ tokens: current, text: current.map((x) => x.surface).join("") });
      current = [];
    }
  };
  for (const t of tokens) {
    current.push(t);
    if (t.surface === "「" || t.surface === "『") quoteDepth++;
    else if (t.surface === "」" || t.surface === "』") quoteDepth = Math.max(0, quoteDepth - 1);
    // Only end a sentence on 。！？ when not inside quotes, so lines like
    // 「今年もやりきった！」 stay in one sentence.
    else if (quoteDepth === 0 && SENTENCE_ENDERS.has(t.surface)) flush();
  }
  flush();
  return sentences;
}

function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP";
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

function unitReading(unit: Unit): string {
  if (unit.annotation?.reading) return unit.annotation.reading;
  return unit.tokens.map((t) => t.reading).join("");
}

interface PopupState {
  unit: Unit;
  left: number;
  top: number;
}

const BASE_TABS: TabDef[] = [
  { id: "article", label: "記事", icon: <IconArticle /> },
  { id: "wordlist", label: "単語リスト", icon: <IconWordList /> },
  { id: "translate", label: "翻訳練習", icon: <IconTranslate /> },
  { id: "vocabQuiz", label: "単語クイズ", icon: <IconVocabQuiz /> },
  { id: "readingQuiz", label: "読解クイズ", icon: <IconReadingQuiz /> },
];

const PRACTICE_TAB: TabDef = {
  id: "practice",
  label: "練習",
  icon: <IconVocabQuiz />,
};

// Tabs added for a user who has a Tobira grammar assignment and/or a
// vocabulary pool set on their profile (currently just Artem).
const GRAMMAR_QUIZ_TAB: TabDef = {
  id: "grammarQuiz",
  label: "文法クイズ",
  icon: <IconGrammarQuiz />,
};
const FLASHCARDS_TAB: TabDef = {
  id: "flashcards",
  label: "単語練習",
  icon: <IconFlashcards />,
};
const GRAMMAR_REF_TAB: TabDef = {
  id: "grammarRef",
  label: "文法帳",
  icon: <IconGrammarBook />,
};

const LESSON_TABS: TabDef[] = [
  { id: "lesson", label: "レッスン", icon: <IconArticle /> },
  { id: "vocab", label: "単語リスト", icon: <IconWordList /> },
];

function tabGroupsForUser(u: User): TabGroup[] {
  if (u.id === "andy") {
    // Lesson-mode users don't render this rail (the app falls back to
    // LESSON_TABS), but return something sensible just in case.
    return [{ id: "main", tabs: [...BASE_TABS, PRACTICE_TAB] }];
  }
  // Main / reference tabs — the things a learner does most often when
  // just visiting an article. 文法帳 sits with them since it is browsed,
  // not practiced.
  const main: TabDef[] = [
    BASE_TABS[0], // 記事
    BASE_TABS[1], // 単語リスト
  ];
  if (u.tobiraCurrent !== undefined) main.push(GRAMMAR_REF_TAB); // 文法帳

  // Practice tabs — grouped and collapsible so the rail can shrink when
  // the learner is just reading. 翻訳練習 sits after 読解クイズ so
  // comprehension precedes production.
  const practice: TabDef[] = [
    BASE_TABS[3], // 単語クイズ
  ];
  if (u.tobiraCurrent !== undefined) practice.push(GRAMMAR_QUIZ_TAB);
  practice.push(BASE_TABS[4]); // 読解クイズ
  practice.push(BASE_TABS[2]); // 翻訳練習
  if (u.vocabPoolId) practice.push(FLASHCARDS_TAB);

  return [
    { id: "main", tabs: main },
    { id: "practice", label: "練習", collapsible: true, tabs: practice },
  ];
}

function sortArticles(list: readonly Article[]): Article[] {
  return [...list].sort((a, b) =>
    (b.date ?? "").localeCompare(a.date ?? ""),
  );
}

const USER_STORAGE_KEY = "yomu-user";

// Tabs whose completion state is per user (no article context) rather than
// per (user, article). Currently only 単語練習, which draws from a shared
// vocab pool rather than the currently-open article.
const USER_SCOPED_DONE_TABS = new Set(["flashcards"]);

function articleDoneKey(userId: string, articleId: string): string {
  return `yomu-tab-done:${userId}:article:${articleId}`;
}
function userDoneKey(userId: string): string {
  return `yomu-tab-done:${userId}:user`;
}
function legacyVocabDoneKey(userId: string, articleId: string): string {
  return `yomu-quiz-done:${userId}:${articleId}:vocab`;
}
function missedKey(
  userId: string,
  articleId: string,
  kind: "cloze" | "rearrange",
): string {
  return `yomu-quiz-missed:${userId}:${articleId}:${kind}`;
}

function loadStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as User;
    // Prefer the current library definition (article list may have changed).
    return findUser(parsed.id) ?? parsed;
  } catch {
    return null;
  }
}

function formatDate(d: string): string {
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString("ja-JP");
}

type Theme = "light" | "dark";

function initialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem("yomu-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function App() {
  const [user, setUser] = useState<User | null>(loadStoredUser);
  const [article, setArticle] = useState<Article | null>(null);
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("yomu-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }, [user]);

  const sortedArticles = useMemo(
    () => sortArticles(user ? articlesForUser(user) : []),
    [user],
  );

  const userLessons = useMemo(() => (user ? lessonsForUser(user) : []), [user]);
  const isLessonMode = userLessons.length > 0;
  const [openLessonId, setOpenLessonId] = useState<string | null>(null);
  const [lessonTab, setLessonTab] = useState<string>("lesson");

  function signOut() {
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    setArticle(null);
    setParagraphs([]);
    if (typeof window !== "undefined" && window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    wroteInitialHashRef.current = false;
  }
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [showFurigana, setShowFurigana] = useState(true);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<PopupState | null>(null);
  const [glosses, setGlosses] = useState<"loading" | string[] | null>(null);
  const lookupSeq = useRef(0);
  const [shownTr, setShownTr] = useState<Set<string>>(new Set());
  const [headings, setHeadings] = useState<Set<string>>(new Set());
  const [clozePick, setClozePick] = useState<Record<number, number>>({});
  const [readReveal, setReadReveal] = useState<Set<number>>(new Set());
  const [hintReveal, setHintReveal] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState("article");
  const [listGlosses, setListGlosses] = useState<Record<string, string[]>>({});
  const [wordQuery, setWordQuery] = useState("");
  const [showBasic, setShowBasic] = useState(false);
  const [showArticleRef, setShowArticleRef] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("yomu-sidebar-collapsed") === "1";
  });
  // Per-(user, article) set of completed practice tab ids. Populated by
  // objective auto-mark (vocabQuiz, grammarQuiz once all answered) and by
  // the manual 完了 button (readingQuiz, translate).
  const [articleTabDone, setArticleTabDone] = useState<Set<string>>(new Set());
  // Per-user set of completed practice tab ids (currently only flashcards).
  const [userTabDone, setUserTabDone] = useState<Set<string>>(new Set());
  // Per-(user, article) indices of missed questions in the objective
  // quizzes, so the learner can review just what they got wrong.
  const [clozeMissed, setClozeMissed] = useState<Set<number>>(new Set());
  const [rearrangeMissed, setRearrangeMissed] = useState<Set<number>>(new Set());
  // Session-only: are we currently showing just the missed set?
  const [clozeReview, setClozeReview] = useState(false);
  const [rearrangeReview, setRearrangeReview] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      "yomu-sidebar-collapsed",
      sidebarCollapsed ? "1" : "0",
    );
  }, [sidebarCollapsed]);

  // Load user-scoped completion set on user change.
  useEffect(() => {
    if (!user) {
      setUserTabDone(new Set());
      return;
    }
    try {
      const raw = localStorage.getItem(userDoneKey(user.id));
      setUserTabDone(new Set(raw ? (JSON.parse(raw) as string[]) : []));
    } catch {
      setUserTabDone(new Set());
    }
  }, [user?.id]);

  // Load article-scoped completion set on user/article change; migrate the
  // legacy `yomu-quiz-done:<u>:<a>:vocab` flag into the new set.
  useEffect(() => {
    if (!user || !article) {
      setArticleTabDone(new Set());
      return;
    }
    try {
      const raw = localStorage.getItem(articleDoneKey(user.id, article.id));
      const set = new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
      if (localStorage.getItem(legacyVocabDoneKey(user.id, article.id)) === "1") {
        set.add("vocabQuiz");
      }
      setArticleTabDone(set);
    } catch {
      setArticleTabDone(new Set());
    }
  }, [user?.id, article?.id]);

  // Load / clear the missed-question sets on user or article change and
  // drop any lingering "review-only" mode from the previous article.
  useEffect(() => {
    if (!user || !article) {
      setClozeMissed(new Set());
      setRearrangeMissed(new Set());
      setClozeReview(false);
      setRearrangeReview(false);
      return;
    }
    const load = (kind: "cloze" | "rearrange"): Set<number> => {
      try {
        const raw = localStorage.getItem(missedKey(user.id, article.id, kind));
        return new Set(raw ? (JSON.parse(raw) as number[]) : []);
      } catch {
        return new Set();
      }
    };
    setClozeMissed(load("cloze"));
    setRearrangeMissed(load("rearrange"));
    setClozeReview(false);
    setRearrangeReview(false);
  }, [user?.id, article?.id]);

  function updateMissed(
    kind: "cloze" | "rearrange",
    index: number,
    correct: boolean,
  ) {
    if (!user || !article) return;
    const setter = kind === "cloze" ? setClozeMissed : setRearrangeMissed;
    const storageKey = missedKey(user.id, article.id, kind);
    setter((prev) => {
      const has = prev.has(index);
      if (correct === !has) return prev; // no change needed
      const next = new Set(prev);
      if (correct) next.delete(index);
      else next.add(index);
      try {
        localStorage.setItem(storageKey, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }

  function enterClozeReview() {
    // Clear picks on the missed questions so the learner can re-answer.
    setClozePick((prev) => {
      const next = { ...prev };
      for (const idx of clozeMissed) delete next[idx];
      return next;
    });
    setClozeReview(true);
  }

  function isTabDone(tabId: string): boolean {
    return USER_SCOPED_DONE_TABS.has(tabId)
      ? userTabDone.has(tabId)
      : articleTabDone.has(tabId);
  }

  function markTabDone(tabId: string, done: boolean) {
    if (!user) return;
    const userScoped = USER_SCOPED_DONE_TABS.has(tabId);
    if (!userScoped && !article) return;
    const [setState, storageKey] = userScoped
      ? [setUserTabDone, userDoneKey(user.id)]
      : [setArticleTabDone, articleDoneKey(user.id, article!.id)];
    setState((prev) => {
      const has = prev.has(tabId);
      if (has === done) return prev;
      const next = new Set(prev);
      if (done) next.add(tabId);
      else next.delete(tabId);
      try {
        localStorage.setItem(storageKey, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }

  function toggleTabDone(tabId: string) {
    markTabDone(tabId, !isTabDone(tabId));
  }

  // Auto-mark 単語クイズ once every cloze question in the current article
  // has been answered in this session.
  const clozeTotal = article?.quiz?.cloze?.length ?? 0;
  const clozeAnswered = Object.keys(clozePick).length;
  useEffect(() => {
    if (!user || !article) return;
    if (clozeTotal === 0 || clozeAnswered < clozeTotal) return;
    if (articleTabDone.has("vocabQuiz")) return;
    markTabDone("vocabQuiz", true);
    // markTabDone is stable enough for this loop; adding it as a dep would
    // require a useCallback cascade for no gain.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, article?.id, clozeTotal, clozeAnswered, articleTabDone]);

  // Close the article reference overlay when the user hits Escape.
  useEffect(() => {
    if (!showArticleRef) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowArticleRef(false);
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [showArticleRef]);

  // Same Escape shortcut for the help popover.
  useEffect(() => {
    if (!helpOpen) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHelpOpen(false);
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [helpOpen]);

  // Auto-collapse the sidebar when the viewport gets narrow enough that
  // the article column would be squeezed. Manual expand still works;
  // widening past the breakpoint doesn't force it open again (respecting
  // whatever state the user left it in).
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 1024px)");
    const handle = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) setSidebarCollapsed(true);
    };
    handle(mq);
    mq.addEventListener("change", handle);
    return () => mq.removeEventListener("change", handle);
  }, []);
  const readerRef = useRef<HTMLDivElement>(null);

  function wordMeaning(u: Unit): string {
    return u.annotation
      ? u.annotation.meaning
      : listGlosses[u.key]?.join("; ") ?? "";
  }

  // Unique clickable words in the current article, for the word-list tab.
  const uniqueWords = useMemo(() => {
    const seen = new Set<string>();
    const list: Unit[] = [];
    for (const u of paragraphs.flat().flatMap((s) => s.units)) {
      if (!u.clickable || seen.has(u.key)) continue;
      seen.add(u.key);
      list.push(u);
    }
    return list;
  }, [paragraphs]);

  // Words visible before the search filter is applied. Annotated
  // (hand-authored) words always show; other tokens are hidden when they
  // are N5-ish basics or non-content POS, unless the user opts in.
  const visibleWords = useMemo(() => {
    return uniqueWords.filter((u) => {
      // Grammatical fragments (numbers, single kana, aux stems) never
      // belong in a study list, even when "基本語も表示" is on.
      if (isTrivialToken(u.surface, u.key, u.pos)) return false;
      // Proper nouns (people, places, product names) and pure-katakana
      // surfaces are almost always names or English loanwords the learner
      // already knows; drop them from the list even when an annotation is
      // present. The annotation still drives the popup / furigana fix.
      if (u.pos.includes("固有名詞")) return false;
      if (isLatinOnly(u.surface)) return false;
      if (!showBasic && isKatakanaOnly(u.surface)) return false;
      if (u.annotation) return true;
      if (showBasic) return true;
      if (!CONTENT_POS.has(u.pos)) return false;
      if (isBasicWord(u.key, u.surface)) return false;
      return true;
    });
  }, [uniqueWords, showBasic]);

  const filteredWords = useMemo(() => {
    const q = wordQuery.trim().toLowerCase();
    if (!q) return visibleWords;
    return visibleWords.filter((u) => {
      const meaning = wordMeaning(u).toLowerCase();
      return (
        u.surface.includes(q) ||
        u.key.includes(q) ||
        unitReading(u).includes(q) ||
        meaning.includes(q)
      );
    });
    // wordMeaning depends on listGlosses; recompute when either changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleWords, wordQuery, listGlosses]);

  // When the word-list tab is open, load the dictionary once and resolve
  // glosses for words that don't have an authored annotation.
  useEffect(() => {
    if (activeTab !== "wordlist") return;
    let alive = true;
    loadDictionary()
      .then((dict) => {
        if (!alive) return;
        const m: Record<string, string[]> = {};
        for (const u of uniqueWords) {
          if (u.annotation) continue;
          const r = unitReading(u);
          const g = dict[u.key] ?? dict[u.surface] ?? (r ? dict[r] : undefined);
          if (g) m[u.key] = g;
        }
        setListGlosses(m);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [activeTab, uniqueWords]);

  function toggleTranslation(key: string) {
    setShownTr((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const counts = useMemo(() => {
    const units = paragraphs.flat().flatMap((s) => s.units);
    return {
      words: units.filter((u) => u.clickable).length,
      annotated: units.filter((u) => u.annotation).length,
    };
  }, [paragraphs]);

  async function analyze(
    text: string,
    annotations: Record<string, Annotation>,
    translations?: Record<string, string>,
  ) {
    setLoading(true);
    setPopup(null);
    setShownTr(new Set());
    try {
      const tokenizer = await loadTokenizer();
      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const result: Paragraph[] = lines.map((line) =>
        splitIntoSentences(toTokens(tokenizer.tokenize(line))).map((s) => ({
          units: buildUnits(s.tokens, annotations),
          text: s.text,
          translation: translations?.[s.text],
        })),
      );
      setParagraphs(result);
    } catch (e) {
      console.error("tokenize failed", e);
      alert("解析に失敗しました。コンソールを確認してください。");
    } finally {
      setLoading(false);
    }
  }

  function resetQuiz() {
    setClozePick({});
    setReadReveal(new Set());
  }

  function loadArticle(a: Article, tab: string = "article") {
    setArticle(a);
    setHeadings(new Set(a.headings ?? []));
    setActiveTab(tab);
    setListGlosses({});
    setWordQuery("");
    resetQuiz();
    analyze(a.text, a.annotations, a.translations);
  }

  // Lesson-mode users (Andy today): jump straight to the Practice tab and
  // pre-open the first lesson (or the one referenced by the URL hash on
  // first load). Reads the URL directly each time so StrictMode's double
  // effect-invocation stays a no-op.
  useEffect(() => {
    if (!isLessonMode) return;
    const r = parseHash();
    const target =
      r.kind === "lesson"
        ? userLessons.find((l) => l.id === r.lessonId)
        : undefined;
    setActiveTab("practice");
    if (target) {
      setOpenLessonId(target.id);
      if (r.lessonTab) setLessonTab(r.lessonTab);
    } else if (!openLessonId && userLessons[0]) {
      setOpenLessonId(userLessons[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isLessonMode]);

  // Switching to a different lesson resets the sub-tab back to the main
  // lesson view. Detect real openLessonId transitions via a ref so the
  // initial null→id set on mount doesn't clobber a URL-provided sub-tab.
  const prevLessonIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (prevLessonIdRef.current !== null && prevLessonIdRef.current !== openLessonId) {
      setLessonTab("lesson");
    }
    prevLessonIdRef.current = openLessonId;
  }, [openLessonId]);

  // Open the article referenced by the URL hash if it belongs to this
  // user's library, otherwise fall back to the newest one. Runs on user
  // change and reads the URL directly so StrictMode's double-invoke
  // stays idempotent.
  useEffect(() => {
    if (isLessonMode) return;
    const r = parseHash();
    const target =
      r.kind === "article"
        ? sortedArticles.find((a) => a.id === r.articleId)
        : undefined;
    if (target) loadArticle(target, r.articleTab ?? "article");
    else if (sortedArticles[0]) loadArticle(sortedArticles[0]);
    else {
      setArticle(null);
      setParagraphs([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Mirror (article, tab) or (lesson, sub-tab) into the URL hash. First
  // write uses replaceState so we don't push an extra history entry on
  // load; subsequent writes push so back/forward navigate between views.
  const wroteInitialHashRef = useRef(false);
  useEffect(() => {
    if (!user) return;
    let hash = "";
    if (isLessonMode && openLessonId) {
      hash = formatLessonHash(openLessonId, lessonTab);
    } else if (article) {
      hash = formatArticleHash(article.id, activeTab);
    }
    if (!hash) return;
    if (window.location.hash === hash) return;
    if (!wroteInitialHashRef.current) {
      window.history.replaceState(null, "", hash);
      wroteInitialHashRef.current = true;
    } else {
      window.history.pushState(null, "", hash);
    }
  }, [user, isLessonMode, article?.id, activeTab, openLessonId, lessonTab]);

  // Browser back/forward: parse the new hash and reconcile state. Writes
  // via history.replaceState/pushState above don't fire hashchange, so
  // this only runs for real user navigation.
  useEffect(() => {
    function handle() {
      const r = parseHash();
      if (r.kind === "article" && r.articleId) {
        const target = sortedArticles.find((a) => a.id === r.articleId);
        if (target) {
          if (article?.id !== target.id) loadArticle(target, r.articleTab ?? "article");
          else if (r.articleTab && r.articleTab !== activeTab) setActiveTab(r.articleTab);
        }
      } else if (r.kind === "lesson" && r.lessonId) {
        if (userLessons.some((l) => l.id === r.lessonId)) {
          if (openLessonId !== r.lessonId) setOpenLessonId(r.lessonId);
          if (r.lessonTab && r.lessonTab !== lessonTab) setLessonTab(r.lessonTab);
        }
      }
    }
    window.addEventListener("hashchange", handle);
    return () => window.removeEventListener("hashchange", handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedArticles, userLessons, article?.id, activeTab, openLessonId, lessonTab]);

  function openPopup(unit: Unit, el: HTMLElement) {
    const container = readerRef.current;
    if (!container) return;
    const cr = container.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    const width = 268;
    let left = er.left - cr.left + container.scrollLeft;
    left = Math.min(left, container.clientWidth - width);
    if (left < 0) left = 0;
    setPopup({ unit, left, top: er.bottom - cr.top + container.scrollTop + 6 });

    // Authored words show their annotation; look up everything else in JMdict.
    const seq = ++lookupSeq.current;
    if (unit.annotation) {
      setGlosses(null);
      return;
    }
    setGlosses("loading");
    lookupGlosses(unit.key, unit.surface, unitReading(unit))
      .then((g) => {
        if (lookupSeq.current === seq) setGlosses(g);
      })
      .catch(() => {
        if (lookupSeq.current === seq) setGlosses(null);
      });
  }

  const renderTokens = (tokens: Token[]) =>
    tokens.map((t, k) =>
      showFurigana && t.hasKanji && t.reading ? (
        <ruby key={k}>
          {t.surface}
          <rt>{t.reading}</rt>
        </ruby>
      ) : (
        <span key={k}>{t.surface}</span>
      ),
    );

  // Render a unit's tokens, preferring the annotation's reading as one
  // whole ruby span when the annotation key exactly matches the surface.
  // This lets authored entries fix cases where kuromoji misreads a name
  // or compound (e.g. 錦織 → にしきおり; correct: にしこり).
  const renderUnit = (u: Unit) => {
    if (
      showFurigana &&
      u.annotation?.reading &&
      u.key === u.surface &&
      /[一-鿿]/.test(u.surface)
    ) {
      return (
        <ruby>
          {u.surface}
          <rt>{u.annotation.reading}</rt>
        </ruby>
      );
    }
    return renderTokens(u.tokens);
  };

  if (!user) return <SignIn onSignIn={setUser} />;

  return (
    <div
      className="page"
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest(".popup, .word")) setPopup(null);
      }}
    >
      <header className="site-header">
        <div className="header-inner">
          <div className="brand">
            <span className="logo">読</span>
            <div>
              <h1>Yomu</h1>
              <p>日本語リーダー</p>
            </div>
          </div>
          <div className="header-tools">
            <label className="toggle">
              振り仮名
              <input
                type="checkbox"
                checked={showFurigana}
                onChange={(e) => setShowFurigana(e.target.checked)}
              />
              <span className="switch" aria-hidden />
            </label>
            <button
              className="theme-btn"
              type="button"
              aria-label={theme === "dark" ? "ライトモードに切り替え" : "ダークモードに切り替え"}
              title={theme === "dark" ? "ライトモード" : "ダークモード"}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <IconSun /> : <IconMoon />}
            </button>
            <div className="user-pill">
              <span className="up-avatar">{user.displayName.slice(0, 1)}</span>
              <span className="up-name">{user.displayName}</span>
              <button
                className="up-signout"
                type="button"
                aria-label="サインアウト"
                title="サインアウト"
                onClick={signOut}
              >
                <IconLogout />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="app">
      <div className={"layout" + (sidebarCollapsed ? " sidebar-collapsed" : "")}>
      <aside className={"sidebar" + (sidebarCollapsed ? " collapsed" : "")}>
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed((v) => !v)}
          title={sidebarCollapsed ? "サイドバーを開く" : "サイドバーを閉じる"}
          aria-label={sidebarCollapsed ? "サイドバーを開く" : "サイドバーを閉じる"}
          aria-expanded={!sidebarCollapsed}
        >
          {sidebarCollapsed ? <IconChevronRight /> : <IconChevronLeft />}
        </button>
        {!sidebarCollapsed && (isLessonMode ? (
          <nav className="article-list">
            <span className="list-label">レッスン</span>
            {userLessons.map((l) => (
              <button
                key={l.id}
                className={
                  "article-item" + (openLessonId === l.id ? " active" : "")
                }
                onClick={() => {
                  setActiveTab("practice");
                  setOpenLessonId(l.id);
                }}
              >
                <span className="ai-title">
                  {l.shortTitle ?? l.title}
                </span>
                {(l.shortTitleEn ?? l.titleEn) && (
                  <span className="ai-sub">
                    ({l.shortTitleEn ?? l.titleEn})
                  </span>
                )}
                <span className="ai-date">
                  {l.turns.filter((t) => t.speaker === "andy").length} 空欄
                  {l.challenges && ` ・ チャレンジ ${l.challenges.length}`}
                </span>
              </button>
            ))}
          </nav>
        ) : (
          <nav className="article-list">
            <span className="list-label">記事</span>
            {sortedArticles.length === 0 && (
              <p className="empty-library">
                {user.displayName} さんの記事はまだありません。
              </p>
            )}
            {sortedArticles.map((a) => (
              <button
                key={a.id}
                className={"article-item" + (article?.id === a.id ? " active" : "")}
                onClick={() => loadArticle(a)}
              >
                <span className="ai-title">
                  {a.title}
                </span>
                {a.subtitle && <span className="ai-sub">{a.subtitle}</span>}
                {a.date && <span className="ai-date">{formatDate(a.date)}</span>}
              </button>
            ))}
          </nav>
        ))}
      </aside>

      {!isLessonMode && (article || user.vocabPoolId || user.tobiraCurrent !== undefined) && (
        <TabRail
          groups={tabGroupsForUser(user).map((g) => ({
            ...g,
            tabs: g.tabs.map((t) =>
              isTabDone(t.id) ? { ...t, done: true } : t,
            ),
          }))}
          active={activeTab}
          onChange={setActiveTab}
        />
      )}
      {isLessonMode && openLessonId && (
        <TabRail
          groups={[{ id: "lesson", tabs: LESSON_TABS }]}
          active={lessonTab}
          onChange={setLessonTab}
        />
      )}

      <main className="main">
        {article && activeTab !== "practice" && (
          <div className="article-head">
            <div className="ah-titles">
              <h2>{article.title}</h2>
              {article.subtitle && <p>{article.subtitle}</p>}
              {activeTab === "article" && counts.words > 0 && (
                <span className="meta">
                  {counts.words} 語
                  {counts.annotated > 0 && ` ・ 注釈 ${counts.annotated}`}
                </span>
              )}
            </div>
            {(activeTab === "readingQuiz" ||
              activeTab === "translate" ||
              activeTab === "flashcards") && (
              <button
                className={"done-toggle" + (isTabDone(activeTab) ? " done" : "")}
                onClick={() => toggleTabDone(activeTab)}
                aria-pressed={isTabDone(activeTab)}
              >
                {isTabDone(activeTab) ? "✓ 完了" : "完了にする"}
              </button>
            )}
            {activeTab === "vocabQuiz" &&
              (clozeMissed.size > 0 || clozeReview) && (
                <button
                  className={"review-btn review-btn-sm" + (clozeReview ? " on" : "")}
                  onClick={() =>
                    clozeReview ? setClozeReview(false) : enterClozeReview()
                  }
                >
                  {clozeReview ? "全問に戻す" : `🔁 間違い ${clozeMissed.size} 問`}
                </button>
              )}
            {activeTab === "grammarQuiz" &&
              (rearrangeMissed.size > 0 || rearrangeReview) && (
                <button
                  className={"review-btn review-btn-sm" + (rearrangeReview ? " on" : "")}
                  onClick={() => setRearrangeReview((v) => !v)}
                >
                  {rearrangeReview
                    ? "全問に戻す"
                    : `🔁 間違い ${rearrangeMissed.size} 問`}
                </button>
              )}
          </div>
        )}

      {activeTab === "article" && (
      <div className="reader" ref={readerRef}>
        {paragraphs.map((sents, pi) => {
          const paraText = sents.map((s) => s.text).join("");
          const isHeading = headings.has(paraText);
          return (
            <p className={"para" + (isHeading ? " heading" : "")} key={pi}>
              {sents.map((s, i) => {
                const trKey = `${pi}:${i}`;
                const trShown = shownTr.has(trKey);
                return (
                  <span className="sentence" key={i}>
                    {s.units.map((u, j) =>
                      u.clickable ? (
                        <span
                          className={"word" + (u.annotation ? " annotated" : "")}
                          key={j}
                          onClick={(e) => openPopup(u, e.currentTarget)}
                        >
                          {renderUnit(u)}
                        </span>
                      ) : (
                        <span key={j}>{renderUnit(u)}</span>
                      ),
                    )}
                    {!isHeading && (
                      <span className="sent-tools">
                        <button
                          className="speak-btn"
                          title="読み上げ"
                          aria-label="この文を読み上げる"
                          onClick={() => speak(s.text)}
                        >
                          ▶
                        </button>
                        {s.translation && (
                          <button
                            className={"tr-btn" + (trShown ? " on" : "")}
                            title="英訳"
                            aria-label="この文の英訳を表示"
                            aria-pressed={trShown}
                            onClick={() => toggleTranslation(trKey)}
                          >
                            訳
                          </button>
                        )}
                      </span>
                    )}{" "}
                    {s.translation && trShown && (
                      <span className="translation">{s.translation}</span>
                    )}
                  </span>
                );
              })}
            </p>
          );
        })}
        {loading && <p className="hint">解析中…</p>}
        {paragraphs.length === 0 && !loading && (
          <p className="hint">左の記事を選ぶと、単語ごとに解析されます。</p>
        )}

        {popup && (
          <div className="popup" style={{ left: popup.left, top: popup.top }}>
            <div className={"popup-head" + (popup.unit.annotation ? " authored" : "")}>
              <span className="popup-tag">
                {popup.unit.annotation ? "解説" : "辞書"}
              </span>
              <button className="popup-close" aria-label="閉じる" onClick={() => setPopup(null)}>
                ×
              </button>
            </div>
            <div className="popup-body">
              <div className="popup-word">
                <span className="pw">{popup.unit.key}</span>
                {unitReading(popup.unit) && (
                  <span className="pr">{unitReading(popup.unit)}</span>
                )}
              </div>
              <p className="pos">{popup.unit.pos}</p>

              {popup.unit.annotation ? (
                <>
                  <p className="meaning">{popup.unit.annotation.meaning}</p>
                  {popup.unit.annotation.note && (
                    <p className="note">{popup.unit.annotation.note}</p>
                  )}
                  {popup.unit.annotation.examples?.map((ex, k) => (
                    <p className="example" key={k}>
                      <span className="ex-ja">{ex.ja}</span>
                      <span className="ex-en">{ex.en}</span>
                    </p>
                  ))}
                </>
              ) : glosses === "loading" ? (
                <p className="meaning dim">辞書を読み込み中…</p>
              ) : glosses && glosses.length ? (
                <p className="meaning">{glosses.join("; ")}</p>
              ) : (
                <p className="meaning dim">辞書に登録がありません</p>
              )}

              <div className="popup-actions">
                <button onClick={() => speak(popup.unit.surface)}>▶ 読み上げ</button>
                <a
                  href={`https://jisho.org/search/${encodeURIComponent(popup.unit.key)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Jisho で見る
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
      )}

      {activeTab === "wordlist" && (
        <div className="wordlist">
          <div className="wl-toolbar">
            <div className="wl-search">
              <input
                type="search"
                value={wordQuery}
                onChange={(e) => setWordQuery(e.target.value)}
                placeholder="単語・読み・意味で検索…"
                aria-label="単語を検索"
              />
            </div>
            <label className="pr-vocab-toggle">
              <input
                type="checkbox"
                checked={showBasic}
                onChange={(e) => setShowBasic(e.target.checked)}
              />
              基本語も表示
            </label>
            <span className="wl-count">
              {filteredWords.length} / {visibleWords.length} 語
            </span>
          </div>
          {visibleWords.length === 0 ? (
            <p className="hint">単語がありません。</p>
          ) : filteredWords.length === 0 ? (
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
                {filteredWords.map((u, i) => (
                  <tr key={i}>
                    <td className={"wl-word" + (u.annotation ? " annotated" : "")}>
                      <Furigana text={u.key || u.surface} show={showFurigana} />
                    </td>
                    <td className="wl-reading">{unitReading(u)}</td>
                    <td className="wl-meaning">{wordMeaning(u) || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "vocabQuiz" && (
        <section className="quiz">
          {article && article.quiz?.cloze && article.quiz.cloze.length > 0 && (
            <div className="quiz-toolbar">
              <button
                className="ref-toggle-btn"
                onClick={() => setShowArticleRef(true)}
                title="記事を横に開いて参照する"
              >
                📖 記事を見る
              </button>
            </div>
          )}
          {article?.quiz?.cloze && article.quiz.cloze.length > 0 ? (
            (() => {
              const visible = article.quiz.cloze
                .map((q, qi) => ({ q, qi }))
                .filter(({ qi }) => !clozeReview || clozeMissed.has(qi));
              if (clozeReview && visible.length === 0) {
                return (
                  <p className="hint review-empty">
                    🎉 復習すべき間違いはありません。「全問に戻す」で通常表示に切り替えられます。
                  </p>
                );
              }
              return (
                <div className="quiz-block">
                  <span className="q-badge">
                    {clozeReview ? "復習 (間違い直し)" : "穴埋め単語"}
                  </span>
                  {visible.map(({ q, qi }) => {
                    const picked = clozePick[qi];
                    const answered = picked !== undefined;
                    return (
                      <div className="quiz-card" key={qi}>
                        <p className="cloze-sentence">
                          <Furigana text={q.before} show={showFurigana} />
                          <span className="blank">
                            {answered ? (
                              <Furigana text={q.options[q.answer]} show={showFurigana} />
                            ) : (
                              "＿＿"
                            )}
                          </span>
                          <Furigana text={q.after} show={showFurigana} />
                        </p>
                        <div className="opts">
                          {q.options.map((opt, oi) => {
                            let cls = "opt";
                            if (answered && oi === q.answer) cls += " correct";
                            else if (answered && oi === picked) cls += " wrong";
                            // Review mode lets learners keep retrying until
                            // they land on the correct answer; normal mode
                            // locks the choice after the first pick.
                            const locked = clozeReview
                              ? answered && picked === q.answer
                              : answered;
                            return (
                              <button
                                key={oi}
                                className={cls}
                                disabled={locked}
                                onClick={() => {
                                  setClozePick((p) => ({ ...p, [qi]: oi }));
                                  updateMissed("cloze", qi, oi === q.answer);
                                }}
                              >
                                <Furigana text={opt} show={showFurigana} />
                              </button>
                            );
                          })}
                        </div>
                        {answered && q.explanation && (
                          <p className="explain">
                            <Furigana text={q.explanation} show={showFurigana} />
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()
          ) : (
            <p className="hint">この記事にはまだ単語クイズがありません。</p>
          )}
        </section>
      )}

      {activeTab === "readingQuiz" && (
        <section className="quiz">
          {article && article.quiz?.reading && article.quiz.reading.length > 0 && (
            <div className="quiz-toolbar">
              <button
                className="ref-toggle-btn"
                onClick={() => setShowArticleRef(true)}
                title="記事を横に開いて参照する"
              >
                📖 記事を見る
              </button>
            </div>
          )}
          {article?.quiz?.reading && article.quiz.reading.length > 0 ? (
            <div className="quiz-block">
              <span className="q-badge">読解</span>
              {article.quiz.reading.map((q, qi) => {
                const shown = readReveal.has(qi);
                const hintShown = hintReveal.has(qi);
                const hasHints = q.hints && q.hints.length > 0;
                return (
                  <div className="quiz-card" key={qi}>
                    <p className="q-text">
                      <Furigana text={q.question} show={showFurigana} />
                    </p>
                    <div className="quiz-actions">
                      {hasHints && (
                        <button
                          className="hint-btn"
                          aria-expanded={hintShown}
                          onClick={() =>
                            setHintReveal((s) => {
                              const n = new Set(s);
                              if (n.has(qi)) n.delete(qi);
                              else n.add(qi);
                              return n;
                            })
                          }
                        >
                          {hintShown ? "▾ 単語ヒント" : "💡 単語ヒント"}
                        </button>
                      )}
                      <button
                        className="reveal-btn"
                        aria-expanded={shown}
                        onClick={() =>
                          setReadReveal((s) => {
                            const n = new Set(s);
                            if (n.has(qi)) n.delete(qi);
                            else n.add(qi);
                            return n;
                          })
                        }
                      >
                        {shown ? "隠す" : "回答"}
                      </button>
                    </div>
                    {hasHints && hintShown && (
                      <div className="hint-chips" role="list">
                        {q.hints!.map((h, hi) => (
                          <span className="hint-chip" role="listitem" key={hi}>
                            <Furigana text={h} show={showFurigana} />
                          </span>
                        ))}
                      </div>
                    )}
                    {shown && (
                      <p className="model-answer">
                        <Furigana text={q.answer} show={showFurigana} />
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="hint">この記事にはまだ読解クイズがありません。</p>
          )}
        </section>
      )}

      {activeTab === "translate" && (
        <ArticleTranslate
          paragraphs={paragraphs}
          showFurigana={showFurigana}
          curated={article?.translationPractice}
        />
      )}

      {activeTab === "grammarQuiz" && (() => {
        const allRearrange = article?.quiz?.rearrange ?? [];
        const visibleIndices = rearrangeReview
          ? allRearrange.map((_, i) => i).filter((i) => rearrangeMissed.has(i))
          : allRearrange.map((_, i) => i);
        const visible = visibleIndices.map((i) => allRearrange[i]);
        return (
          <section className="quiz">
            {allRearrange.length > 0 && (
              <div className="quiz-toolbar">
                <button
                  className="ref-toggle-btn"
                  onClick={() => setShowArticleRef(true)}
                  title="記事を横に開いて参照する"
                >
                  📖 記事を見る
                </button>
              </div>
            )}
            {rearrangeReview && visible.length === 0 ? (
              <p className="hint review-empty">
                🎉 復習すべき間違いはありません。「全問に戻す」で通常表示に切り替えられます。
              </p>
            ) : (
              <GrammarQuiz
                // key change forces card state to reset on review toggle
                key={rearrangeReview ? "review" : "normal"}
                questions={visible}
                showFurigana={showFurigana}
                onAllComplete={
                  rearrangeReview
                    ? undefined
                    : () => markTabDone("grammarQuiz", true)
                }
                onResult={(posIdx, correct) => {
                  const original = visibleIndices[posIdx];
                  if (original !== undefined) {
                    updateMissed("rearrange", original, correct);
                  }
                }}
                badgeLabel={rearrangeReview ? "復習 (間違い直し)" : undefined}
              />
            )}
          </section>
        );
      })()}

      {activeTab === "flashcards" && (
        <section className="quiz">
          <Flashcards pool={vocabForUser(user)} showFurigana={showFurigana} />
        </section>
      )}

      {activeTab === "grammarRef" && (
        <section className="quiz">
          <GrammarReference currentLesson={user.tobiraCurrent} />
        </section>
      )}

      {activeTab === "practice" && (
        <Practice
          user={user}
          openLessonId={openLessonId}
          onOpenLesson={setOpenLessonId}
          showFurigana={showFurigana}
          lessonTab={lessonTab}
        />
      )}

        <footer className="footer">
          単語をクリックで詳細・文末の ▶ で読み上げ・訳。色の濃い単語には解説、記事にはクイズが付きます。
        </footer>
      </main>

      <button
        className="help-fab"
        onClick={() => setHelpOpen(true)}
        aria-label="Help / interface guide"
        title="Help / interface guide"
      >
        <IconHelp />
      </button>

      {helpOpen && (
        <>
          <div
            className="help-backdrop"
            onClick={() => setHelpOpen(false)}
            aria-hidden
          />
          <aside
            className="help-panel"
            role="dialog"
            aria-label="Interface guide"
          >
            <div className="help-head">
              <strong>Interface guide</strong>
              <button
                className="ref-close"
                onClick={() => setHelpOpen(false)}
                aria-label="Close help"
              >
                ×
              </button>
            </div>
            <div className="help-body">
              <section>
                <h4>Top bar</h4>
                <dl>
                  <dt>振り仮名</dt>
                  <dd>Toggle furigana (kana readings above kanji).</dd>
                  <dt>☀ / ☾</dt>
                  <dd>Switch between light and dark theme.</dd>
                  <dt>Your name → arrow</dt>
                  <dd>Sign out and switch users.</dd>
                </dl>
              </section>

              <section>
                <h4>Left column</h4>
                <dl>
                  <dt>記事 list</dt>
                  <dd>Your library of articles. Click one to open it.</dd>
                  <dt>‹ / › on the edge</dt>
                  <dd>
                    Collapse or expand the article list. Auto-collapses on
                    narrow windows so the article gets more room.
                  </dd>
                </dl>
              </section>

              <section>
                <h4>Right tab rail</h4>
                <dl>
                  <dt>記事</dt>
                  <dd>Read the article. Every meaningful word is clickable.</dd>
                  <dt>単語リスト</dt>
                  <dd>
                    All meaningful vocabulary. Hidden by default: N5 basics,
                    numbers, particles. Toggle "基本語も表示" to see them.
                  </dd>
                  <dt>翻訳練習</dt>
                  <dd>Sentence-by-sentence translation practice.</dd>
                  <dt>単語クイズ</dt>
                  <dd>Fill-in-the-blank vocabulary quiz (4 choices).</dd>
                  <dt>文法クイズ</dt>
                  <dd>
                    Sentence rearrangement. Pick chunks in order; expand
                    the 文法 button to see the Tobira explanation.
                  </dd>
                  <dt>読解クイズ</dt>
                  <dd>
                    Reading comprehension questions with a click-to-reveal
                    model answer.
                  </dd>
                  <dt>単語練習</dt>
                  <dd>
                    English → Japanese flashcards from your monthly vocab
                    pool. Self-grade each card with ◯ / △ / ×, then retry
                    just the ones you missed.
                  </dd>
                  <dt>文法帳</dt>
                  <dd>
                    Browsable reference of every grammar point in Tobira,
                    with search across all 15 chapters.
                  </dd>
                </dl>
              </section>

              <section>
                <h4>While reading</h4>
                <dl>
                  <dt>Click a word</dt>
                  <dd>
                    Pop up its meaning, reading, and examples. Words shown in
                    a stronger color have hand-written notes; the rest fall
                    back to the built-in dictionary.
                  </dd>
                  <dt>▶ at end of a sentence</dt>
                  <dd>Read the sentence out loud.</dd>
                  <dt>訳 at end of a sentence</dt>
                  <dd>Show the English translation for that sentence.</dd>
                </dl>
              </section>

              <section>
                <h4>On quiz tabs</h4>
                <dl>
                  <dt>📖 記事を見る</dt>
                  <dd>
                    Slide the article in from the left so you can look at it
                    while you answer. On a wide screen the quiz stays fully
                    interactive; on a narrow screen it opens as a modal —
                    close via ×, click outside, or the Esc key.
                  </dd>
                </dl>
              </section>
            </div>
          </aside>
        </>
      )}

      {showArticleRef && article && (
        <>
          <div
            className="ref-backdrop"
            onClick={() => setShowArticleRef(false)}
            aria-hidden
          />
          <aside
            className="article-ref"
            role="dialog"
            aria-label={`${article.title} — 参照`}
          >
            <div className="ref-head">
              <div className="ref-title">
                <span className="ref-label">📖 参照中</span>
                <strong>{article.title}</strong>
              </div>
              <button
                className="ref-close"
                onClick={() => setShowArticleRef(false)}
                aria-label="記事を閉じる"
              >
                ×
              </button>
            </div>
            <div className="ref-body">
              {paragraphs.map((sents, pi) => {
                const paraText = sents.map((s) => s.text).join("");
                const isHeading = headings.has(paraText);
                return (
                  <p className={"para" + (isHeading ? " heading" : "")} key={pi}>
                    {sents.map((s, i) => (
                      <span className="sentence" key={i}>
                        {s.units.map((u, j) =>
                          u.clickable ? (
                            <span
                              className={
                                "word" + (u.annotation ? " annotated" : "")
                              }
                              key={j}
                              onClick={(e) => openPopup(u, e.currentTarget)}
                            >
                              {renderUnit(u)}
                            </span>
                          ) : (
                            <span key={j}>{renderUnit(u)}</span>
                          ),
                        )}
                      </span>
                    ))}
                  </p>
                );
              })}
              {paragraphs.length === 0 && (
                <p className="hint">記事を先に開いてください。</p>
              )}
            </div>
          </aside>
        </>
      )}
      </div>
      </div>
    </div>
  );
}
