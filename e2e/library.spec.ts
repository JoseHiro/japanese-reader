import { findUser } from "../src/users";
import { test, expect, signIn } from "./fixtures";

const shaun = findUser("shaun")!;

// Users with `podIds` get a 記事 / JapanesePod101 switch in the sidebar.

test("shaun: sidebar switches between 記事 and JapanesePod101", async ({ page }) => {
  await signIn(page, "shaun");
  await page.goto("/");
  const tabs = page.getByRole("tablist", { name: "ライブラリ" });
  const articles = tabs.getByRole("tab", { name: "記事" });
  const pod = tabs.getByRole("tab", { name: "JapanesePod101" });
  await expect(articles).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(".article-item")).toHaveCount(shaun.articleIds.length);

  await pod.click();
  await expect(pod).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(".article-item")).toHaveCount(shaun.podIds!.length);
  await page.locator(".article-item", { hasText: "一番星" }).click();
  await expect(page).toHaveURL(/#\/a\/ramen-ichibanboshi$/);
  await expect(page.locator(".article-head h2")).toContainText("一番星");
  // Reading tabs only; no quizzes and no quiz action bar.
  await expect(page.locator(".tab-rail .tab-label")).toHaveText(["記事", "単語リスト"]);
  await expect(page.locator(".ah-actions")).toHaveCount(0);

  // A quiz URL for a Pod101 item falls back to the article.
  await page.goto("/#/a/ramen-ichibanboshi/vocab-quiz");
  await expect(page).toHaveURL(/#\/a\/ramen-ichibanboshi$/);
  await expect(pod).toHaveAttribute("aria-selected", "true");

  await articles.click();
  await expect(page.locator(".article-item")).toHaveCount(shaun.articleIds.length);
});

test("artem: no JapanesePod101 switch", async ({ page }) => {
  await signIn(page, "artem");
  await page.goto("/");
  await expect(page.locator(".article-item").first()).toBeVisible();
  await expect(page.getByRole("tablist", { name: "ライブラリ" })).toHaveCount(0);
});
