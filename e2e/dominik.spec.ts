import { test, expect, signIn } from "./fixtures";

// Dominik has both an article and a lesson, switched with the sidebar tabs.

test("dominik: 箱根 article with its quizzes, then the ryokan lesson", async ({ page }) => {
  await signIn(page, "dominik");
  await page.goto("/");
  await expect(page).toHaveURL(/#\/a\/tabi-hakone-onsen$/);
  await expect(page.locator(".article-head h2")).toHaveText("箱根の温泉で");
  // Pinned readings.
  await expect(page.locator("ruby", { hasText: "一人" }).first().locator("rt")).toHaveText("ひとり");
  await expect(page.locator("ruby", { hasText: "入れない" }).first().locator("rt")).toHaveText("はいれない");

  const rail = page.locator(".tab-rail");
  await rail.getByRole("button", { name: "文法選択" }).click();
  await expect(page.locator(".quiz-card")).toHaveCount(10);
  await rail.getByRole("button", { name: "翻訳練習" }).click();
  await expect(page.locator(".tr-card")).toHaveCount(5);

  const tabs = page.getByRole("tablist", { name: "ライブラリ" });
  await tabs.getByRole("tab", { name: "レッスン" }).click();
  await expect(page).toHaveURL(/#\/l\/ryokan-reservation$/);
  await expect(page.locator(".pr-title-en")).toContainText("We can't find your reservation");
  await expect(page.locator(".pr-script-who-student").first()).toContainText("Dominik");
  await expect(page.locator(".pr-challenge")).toHaveCount(6);

  await tabs.getByRole("tab", { name: "記事" }).click();
  await expect(page).toHaveURL(/#\/a\/tabi-hakone-onsen$/);
  await expect(page.locator(".article-head h2")).toHaveText("箱根の温泉で");
});

test("dominik: a lesson URL opens the lesson directly", async ({ page }) => {
  await signIn(page, "dominik");
  await page.goto("/#/l/ryokan-reservation");
  await expect(page.locator(".pr-title-en")).toContainText("We can't find your reservation");
  await expect(
    page.getByRole("tablist", { name: "ライブラリ" }).getByRole("tab", { name: "レッスン" }),
  ).toHaveAttribute("aria-selected", "true");
});
