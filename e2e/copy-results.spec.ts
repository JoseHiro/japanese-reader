import { USERS, articlesForUser } from "../src/users";
import { REPORT_LABELS, type ReportKind } from "../src/quizReport";
import { test, expect, signIn, copiedText } from "./fixtures";

// For every user with articles, every article they own and every quiz tab in
// their rail: the action bar shows "Article" + "Copy results" only when the
// tab has questions, the copied report matches what is on screen, and the
// "Copied" state never carries over to the next tab.

const QUIZ_TABS: { slug: string; label: string; kind: ReportKind }[] = [
  { slug: "vocab-quiz", label: "単語クイズ", kind: "cloze" },
  { slug: "grammar-choice", label: "文法選択", kind: "grammarChoice" },
  { slug: "particle-quiz", label: "助詞クイズ", kind: "particle" },
  { slug: "grammar-quiz", label: "文法クイズ", kind: "rearrange" },
  { slug: "reading-quiz", label: "読解クイズ", kind: "reading" },
];
// Tabs where answering question 1 is a single click.
const ANSWER_FIRST = new Set<ReportKind>(["cloze", "grammarChoice"]);

for (const user of USERS) {
  const articles = articlesForUser(user);
  if (!articles.length) continue;
  // Matches tabGroupsForUser in App.tsx: the grammar quizzes need a Tobira chapter.
  const tabs = QUIZ_TABS.filter(
    (t) => user.tobiraCurrent !== undefined || t.kind === "cloze" || t.kind === "reading",
  );

  for (const article of articles) {
    test(`${user.id} / ${article.id}: action bar and Copy results`, async ({ page }) => {
      await signIn(page, user.id);
      await page.goto(`/#/a/${article.id}/${tabs[0].slug}`);
      await expect(page.locator(".article-head h2")).toHaveText(article.title);

      const rail = page.locator(".tab-rail");
      for (const t of QUIZ_TABS) {
        await expect(rail.getByRole("button", { name: t.label })).toHaveCount(
          tabs.includes(t) ? 1 : 0,
        );
      }

      const actions = page.locator(".ah-actions");
      const articleBtn = actions.getByRole("button", { name: "Article", exact: true });
      const copyBtn = actions.getByRole("button", { name: "Copy results" });
      const copiedBtn = actions.getByRole("button", { name: "Copied" });

      for (const [i, t] of tabs.entries()) {
        if (i > 0) await rail.getByRole("button", { name: t.label }).click();
        await expect(page).toHaveURL(new RegExp(`#/a/${article.id}/${t.slug}$`));

        const count = article.quiz?.[t.kind]?.length ?? 0;
        const cards = page.locator(".quiz-card");
        await expect(cards).toHaveCount(count);
        if (!count) {
          await expect(articleBtn).toHaveCount(0);
          await expect(copyBtn).toHaveCount(0);
          continue;
        }

        await expect(articleBtn).toBeVisible();
        // Regression: "Copied" from the previous tab must not carry over.
        // Checked once, not retried: a retrying assertion would just wait
        // out the button's 2 s reset and pass anyway.
        expect(await copiedBtn.count()).toBe(0);
        await expect(copyBtn).toBeVisible();

        if (ANSWER_FIRST.has(t.kind)) await cards.first().locator(".choice").first().click();
        await copyBtn.click();
        await expect(copiedBtn).toBeVisible();

        const text = (await copiedText(page)) ?? "";
        expect(text.startsWith(`${article.title}｜${REPORT_LABELS[t.kind]}\n`)).toBe(true);
        expect(text).toContain(user.displayName);
        expect(text.match(/^\d+\. /gm)?.length).toBe(count);
        if (ANSWER_FIRST.has(t.kind)) {
          const q1 = text.split(/^2\. /m)[0].split(/^1\. /m)[1];
          expect(q1).toMatch(/[✓✗]/);
        }
      }
    });
  }
}
