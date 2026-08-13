import { useEffect, useMemo, useRef, useState } from "react";
import { loadTokenizer, toTokens, type Token } from "./tokenizer";
import { buildUnits, type Unit } from "./units";
import type { Annotation, Article } from "./content";
import { lookupGlosses, loadDictionary } from "./dictionary";
import { Furigana } from "./shared/Furigana";
import { TabRail, type TabDef } from "./shared/TabRail";
import { CONTENT_POS, isBasicWord, isTrivialToken } from "./shared/vocabFilter";
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
} from "./shared/icons";
import { findUser, articlesForUser, lessonsForUser, type User } from "./users";
import { SignIn } from "./SignIn";
import { Practice } from "./Practice";
import { ArticleTranslate } from "./ArticleTranslate";

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
  { id: "translate", label: "翻訳練習", icon: <IconTranslate />, badge: "New" },
  { id: "vocabQuiz", label: "単語クイズ", icon: <IconVocabQuiz /> },
  { id: "readingQuiz", label: "読解クイズ", icon: <IconReadingQuiz /> },
];

const PRACTICE_TAB: TabDef = {
  id: "practice",
  label: "練習",
  icon: <IconVocabQuiz />,
  badge: "New",
};

const LESSON_TABS: TabDef[] = [
  { id: "lesson", label: "レッスン", icon: <IconArticle /> },
  { id: "vocab", label: "単語リスト", icon: <IconWordList /> },
];

function tabsForUser(u: User): TabDef[] {
  return u.id === "andy" ? [...BASE_TABS, PRACTICE_TAB] : BASE_TABS;
}

function sortArticles(list: readonly Article[]): Article[] {
  return [...list].sort((a, b) =>
    (b.date ?? "").localeCompare(a.date ?? ""),
  );
}

const USER_STORAGE_KEY = "yomu-user";

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
  const [activeTab, setActiveTab] = useState("article");
  const [listGlosses, setListGlosses] = useState<Record<string, string[]>>({});
  const [wordQuery, setWordQuery] = useState("");
  const [showBasic, setShowBasic] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("yomu-sidebar-collapsed") === "1";
  });

  useEffect(() => {
    localStorage.setItem(
      "yomu-sidebar-collapsed",
      sidebarCollapsed ? "1" : "0",
    );
  }, [sidebarCollapsed]);

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
      if (u.annotation) return true;
      // Grammatical fragments (numbers, single kana, aux stems) never
      // belong in a study list, even when "基本語も表示" is on.
      if (isTrivialToken(u.surface, u.key, u.pos)) return false;
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

  function loadArticle(a: Article) {
    setArticle(a);
    setHeadings(new Set(a.headings ?? []));
    setActiveTab("article");
    setListGlosses({});
    setWordQuery("");
    resetQuiz();
    analyze(a.text, a.annotations, a.translations);
  }

  // Lesson-mode users (Andy today): jump straight to the Practice tab and
  // pre-open the first lesson.
  useEffect(() => {
    if (isLessonMode) {
      setActiveTab("practice");
      if (!openLessonId && userLessons[0]) setOpenLessonId(userLessons[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isLessonMode]);

  // Reset the lesson sub-tab back to the main lesson view whenever the
  // opened lesson changes.
  useEffect(() => {
    setLessonTab("lesson");
  }, [openLessonId]);

  // Open the most recently added article whenever the user changes.
  useEffect(() => {
    if (isLessonMode) return; // lesson-mode users don't need an article
    if (sortedArticles[0]) loadArticle(sortedArticles[0]);
    else {
      setArticle(null);
      setParagraphs([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

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
            {userLessons.map((l, idx) => (
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
                  {idx === 0 && <span className="new-badge">New</span>}
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
            {sortedArticles.map((a, idx) => (
              <button
                key={a.id}
                className={"article-item" + (article?.id === a.id ? " active" : "")}
                onClick={() => loadArticle(a)}
              >
                <span className="ai-title">
                  {a.title}
                  {idx === 0 && <span className="new-badge">New</span>}
                </span>
                {a.subtitle && <span className="ai-sub">{a.subtitle}</span>}
                {a.date && <span className="ai-date">{formatDate(a.date)}</span>}
              </button>
            ))}
          </nav>
        ))}
      </aside>

      {!isLessonMode && article && (
        <TabRail tabs={tabsForUser(user)} active={activeTab} onChange={setActiveTab} />
      )}
      {isLessonMode && openLessonId && (
        <TabRail tabs={LESSON_TABS} active={lessonTab} onChange={setLessonTab} />
      )}

      <main className="main">
        {article && activeTab !== "practice" && (
          <div className="article-head">
            <h2>{article.title}</h2>
            {article.subtitle && <p>{article.subtitle}</p>}
            {activeTab === "article" && counts.words > 0 && (
              <span className="meta">
                {counts.words} 語
                {counts.annotated > 0 && ` ・ 注釈 ${counts.annotated}`}
              </span>
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
                          {renderTokens(u.tokens)}
                        </span>
                      ) : (
                        <span key={j}>{renderTokens(u.tokens)}</span>
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
          {article?.quiz?.cloze && article.quiz.cloze.length > 0 ? (
            <div className="quiz-block">
              <span className="q-badge">穴埋め単語</span>
              {article.quiz.cloze.map((q, qi) => {
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
                        return (
                          <button
                            key={oi}
                            className={cls}
                            disabled={answered}
                            onClick={() => setClozePick((p) => ({ ...p, [qi]: oi }))}
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
          ) : (
            <p className="hint">この記事にはまだ単語クイズがありません。</p>
          )}
        </section>
      )}

      {activeTab === "readingQuiz" && (
        <section className="quiz">
          {article?.quiz?.reading && article.quiz.reading.length > 0 ? (
            <div className="quiz-block">
              <span className="q-badge">読解</span>
              {article.quiz.reading.map((q, qi) => {
                const shown = readReveal.has(qi);
                return (
                  <div className="quiz-card" key={qi}>
                    <p className="q-text">
                      <Furigana text={q.question} show={showFurigana} />
                    </p>
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
                      {shown ? "解答を隠す" : "解答を見る"}
                    </button>
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
        <ArticleTranslate paragraphs={paragraphs} showFurigana={showFurigana} />
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
      </div>
      </div>
    </div>
  );
}
