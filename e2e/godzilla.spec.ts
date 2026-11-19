import { test, expect, signIn } from "./fixtures";

test("artem: Godzilla article shows with its pinned readings and quizzes", async ({ page }) => {
  await signIn(page, "artem");
  await page.goto("/");
  await page.locator(".article-item", { hasText: "ゴジラ" }).click();
  await expect(page).toHaveURL(/#\/a\/godzilla$/);
  await expect(page.locator(".article-head h2")).toContainText("ゴジラ");
  await expect(page.locator("ruby", { hasText: "3月" }).first().locator("rt")).toHaveText("さんがつ");
  await expect(page.locator("ruby", { hasText: "手" }).first().locator("rt")).toHaveText("て");

  await page.locator(".tab-rail .tab-label", { hasText: "読解クイズ" }).click();
  await expect(page.locator(".quiz-card")).toHaveCount(6);
  await page.locator(".tab-rail .tab-label", { hasText: "翻訳練習" }).click();
  await expect(page.locator(".tr-card")).toHaveCount(6);
});
