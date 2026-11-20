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

test("dominik: 今回の文法 box and matching highlights in the body", async ({ page }) => {
  await signIn(page, "dominik");
  await page.goto("/#/a/tabi-hakone-onsen");
  const box = page.getByRole("region", { name: "今回の文法" });
  await expect(box.locator(".fg-label")).toHaveText(["〜ものの", "〜からといって", "〜ざるを得ない"]);
  // Labels stack above their content, with 違い between 注意 and 例.
  const first = box.locator(".fg-item").first();
  await expect(first.locator(".fg-rows dt")).toHaveText(["形", "意味", "注意", "違い", "例"]);
  const [dt, dd] = await Promise.all([
    first.locator(".fg-rows dt").first().boundingBox(),
    first.locator(".fg-rows dd").first().boundingBox(),
  ]);
  expect(dd!.y).toBeGreaterThanOrEqual(dt!.y + dt!.height - 1);
  expect(Math.round(dd!.x)).toBe(Math.round(dt!.x));
  for (const [i, n] of [2, 3, 4].entries()) {
    await expect(box.locator(".fg-item").nth(i).locator(".fg-diffs li")).toHaveCount(n);
  }

  // Each highlight run in the body, as "index:text" (furigana excluded).
  const runs = () =>
    page.evaluate(() => {
      const out: string[] = [];
      for (const sent of document.querySelectorAll(".reader .para .sentence")) {
        let cur: { i: string; t: string } | null = null;
        for (const el of sent.children) {
          const m = el.className.match(/gram-(\d)/);
          const clone = el.cloneNode(true) as HTMLElement;
          clone.querySelectorAll("rt").forEach((rt) => rt.remove());
          if (m && cur?.i === m[1]) cur.t += clone.textContent;
          else {
            if (cur) out.push(`${cur.i}:${cur.t}`);
            cur = m ? { i: m[1], t: clone.textContent ?? "" } : null;
          }
        }
        if (cur) out.push(`${cur.i}:${cur.t}`);
      }
      return out;
    });
  await expect.poll(runs).toEqual([
    "0:ものの",
    "2:守らざるを得ない",
    "1:からといって",
    "1:からといって",
    "0:ものの",
    "2:帰らざるを得なかった",
  ]);

  // Sections: 今回の文法, then 本文 with its scene headings.
  await expect(page.locator(".section-title")).toHaveText(["今回の文法", "本文"]);
  const headings = await page.locator(".reader .para.heading").evaluateAll((els) =>
    els.map((el) => {
      const c = el.cloneNode(true) as HTMLElement;
      c.querySelectorAll("rt").forEach((rt) => rt.remove());
      return c.textContent?.trim();
    }),
  );
  expect(headings).toEqual(["チェックイン", "露天風呂で", "帰る日"]);
  // The scene headings have no play / translation buttons; the sentences do.
  await expect(page.locator(".reader .para.heading .sent-tools")).toHaveCount(0);
  await expect(page.locator(".reader .tr-btn")).toHaveCount(11);

  // The grammar color differs from the blue vocab underline, and matches the box.
  const colors = await page.evaluate(() => {
    const c = (sel: string) => getComputedStyle(document.querySelector(sel)!).color;
    return {
      vocab: c(".reader .para .word.annotated:not(.gram)"),
      body: c(".reader .para .gram-1"),
      box: c(".fg-item.gram-1 .fg-label"),
    };
  });
  expect(colors.body).toBe(colors.box);
  expect(colors.body).not.toBe(colors.vocab);

  // Word popups still open on highlighted words.
  await page.locator(".reader .para .word.gram-0").first().click();
  await expect(page.locator(".popup")).toContainText("although");

  // The toggle turns the body highlights off and on.
  const toggle = box.getByRole("button", { name: /文法ハイライト/ });
  await toggle.click();
  await expect(page.locator(".reader .para .gram")).toHaveCount(0);
  await toggle.click();
  await expect(page.locator(".reader .para .gram-0")).not.toHaveCount(0);
});
