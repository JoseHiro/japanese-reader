import { test, expect, signIn } from "./fixtures";

// kuromoji misreads these words, so the articles pin their readings.

test("pinned readings show in the article and the word list", async ({ page }) => {
  await signIn(page, "shaun");
  await page.goto("/#/a/pod101-li5-01");
  const friend = page.locator("ruby", { hasText: "女友達" });
  await expect(friend.locator("rt")).toHaveText("おんなともだち");

  await page.locator(".tab-rail .tab-label", { hasText: "単語リスト" }).click();
  const row = page.locator("tr", { has: page.locator(".wl-reading", { hasText: "おんなともだち" }) });
  await expect(row.locator(".wl-word")).toContainText("女友達");
});

test("今日中 reads きょうじゅう", async ({ page }) => {
  await signIn(page, "shaun");
  await page.goto("/#/a/pod101-li5-03");
  await expect(page.locator("ruby", { hasText: "今日中" }).locator("rt")).toHaveText("きょうじゅう");
});
