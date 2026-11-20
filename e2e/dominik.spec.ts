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
  await expect(page).toHaveURL(/#\/l\/hakone-practice$/);
  // One lesson in the sidebar; its sections are in the right-hand rail.
  await expect(page.locator(".article-item")).toHaveCount(1);
  const rail2 = page.locator(".tab-rail");
  await expect(rail2.locator(".tab-label")).toHaveText([
    "1. フロント",
    "2. 電話",
    "3. 口コミ",
    "4. 続けて話す",
    "5. 文化の質問",
    "単語リスト",
    "文法リスト N2",
  ]);
  // The first section is shown by default.
  await expect(page.locator(".pr-title")).toContainText("フロント");
  // Japanese only: no English subtitle, labels without " · English".
  await expect(page.locator(".pr-title-en")).toHaveCount(0);
  await expect(page.locator(".pr-intro-label").first()).toHaveText("🗣 場面とことば");
  await expect(page.locator(".pr-drill-intent-en")).toHaveCount(0);
  await expect(page.locator(".pr-intro-card-teacher")).toHaveCount(0);
  await expect(page.locator(".pr-intro-card-register")).toContainText("〜からといって");
  await expect(page.locator(".pr-script-who-student").first()).toContainText("Dominik");
  await expect(page.locator(".pr-challenge")).toHaveCount(0);

  await rail2.getByRole("button", { name: "2. 電話" }).click();
  await expect(page).toHaveURL(/#\/l\/hakone-practice\/travel-agency-cancel$/);
  await expect(page.locator(".pr-intro-card-register .pr-target")).toContainText("〜ざるを");
  await expect(page.locator(".pr-script-who-them").first()).toContainText("旅行会社の担当者");

  await rail2.getByRole("button", { name: "3. 口コミ" }).click();
  await expect(page.locator(".pr-intro-card-register")).toContainText("書き言葉");
  await expect(page.locator(".pr-script")).toHaveCount(0);
  await expect(page.locator(".pr-challenge")).toHaveCount(1);
  await expect(page.locator(".pr-progress")).toHaveText("課題 1");

  await rail2.getByRole("button", { name: "4. 続けて話す" }).click();
  await expect(page.locator(".pr-challenge")).toHaveCount(4);
  await rail2.getByRole("button", { name: "5. 文化の質問" }).click();
  await expect(page.locator(".pr-challenge")).toHaveCount(3);

  // Back / forward move between sections.
  await page.goBack();
  await expect(page).toHaveURL(/#\/l\/hakone-practice\/hakone-followups$/);
  await expect(page.locator(".pr-challenge")).toHaveCount(4);

  await tabs.getByRole("tab", { name: "記事" }).click();
  await expect(page).toHaveURL(/#\/a\/tabi-hakone-onsen$/);
  await expect(page.locator(".article-head h2")).toHaveText("箱根の温泉で");
});

test("dominik: a section URL opens that section directly", async ({ page }) => {
  await signIn(page, "dominik");
  await page.goto("/#/l/hakone-practice/ryokan-review");
  await expect(page.locator(".pr-title")).toContainText("口コミ");
  await expect(
    page.getByRole("tablist", { name: "ライブラリ" }).getByRole("tab", { name: "レッスン" }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(".tab-rail .tab-btn.active")).toContainText("3. 口コミ");
});

test("dominik: 今回の文法 box and matching highlights in the body", async ({ page }) => {
  await signIn(page, "dominik");
  await page.goto("/#/a/tabi-hakone-onsen");
  const box = page.getByRole("region", { name: "今回の文法" });
  // One card at a time, behind tabs; the first tab is open by default.
  const tabs = box.getByRole("tab");
  await expect(tabs.locator(".fg-label")).toHaveText(["〜ものの", "〜からといって", "〜ざるを得ない"]);
  await expect(tabs.locator(".fg-level")).toHaveText(["N2", "N2", "N2"]);
  await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");
  const panel = box.getByRole("tabpanel");
  await expect(panel).toHaveCount(1);
  await expect(panel.locator(".fg-en")).toContainText("although");
  // Labels stack above their content, with 違い between 注意 and 例.
  const first = panel;
  await expect(first.locator(".fg-rows dt")).toHaveText(["形", "意味", "注意", "違い", "例"]);
  const [dt, dd] = await Promise.all([
    first.locator(".fg-rows dt").first().boundingBox(),
    first.locator(".fg-rows dd").first().boundingBox(),
  ]);
  expect(dd!.y).toBeGreaterThanOrEqual(dt!.y + dt!.height - 1);
  expect(Math.round(dd!.x)).toBe(Math.round(dt!.x));
  for (const [i, n] of [2, 3, 4].entries()) {
    await tabs.nth(i).click();
    await expect(tabs.nth(i)).toHaveAttribute("aria-selected", "true");
    await expect(panel.locator(".fg-diffs li")).toHaveCount(n);
  }
  await expect(panel.locator(".fg-en")).toContainText("have no choice but to");

  // Arrow keys move between tabs (wrapping) and select them.
  await tabs.nth(2).focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(0)).toBeFocused();
  await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowLeft");
  await expect(tabs.nth(2)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Home");
  await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");

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
      box: c(".fg-tab.gram-1 .fg-label"),
    };
  });
  expect(colors.body).toBe(colors.box);
  expect(colors.body).not.toBe(colors.vocab);

  // Word popups still open on highlighted words, and clicking a highlight
  // opens that grammar's tab.
  await page.locator(".reader .para .word.gram-1").first().click();
  await expect(page.locator(".popup")).toContainText("just because");
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await page.locator(".reader .para .word.gram-0").first().click();
  await expect(page.locator(".popup")).toContainText("although");
  await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");

  // The toggle turns the body highlights off and on.
  const toggle = box.getByRole("button", { name: /文法ハイライト/ });
  await toggle.click();
  await expect(page.locator(".reader .para .gram")).toHaveCount(0);
  await toggle.click();
  await expect(page.locator(".reader .para .gram-0")).not.toHaveCount(0);
});

test("dominik: small 文法リスト N2 item at the bottom of the rail", async ({ page }) => {
  await signIn(page, "dominik");
  await page.goto("/#/a/tabi-hakone-onsen");
  const rail = page.locator(".tab-rail");
  // Pinned last, in its own muted group below 練習.
  const item = rail.locator(".tab-group-foot .tab-btn");
  await expect(item).toHaveText("文法リスト N2");
  await expect(rail.locator(".tab-group").last()).toHaveClass(/tab-group-foot/);

  await item.click();
  await expect(page).toHaveURL(/#\/a\/tabi-hakone-onsen\/jlpt-grammar$/);
  await expect(page.locator(".jlpt-list .gr-hits")).toContainText("N2");
  // The article's focus grammar is marked 今回.
  await expect(page.locator(".jlpt-current")).toHaveCount(3);
  await expect(page.locator(".jlpt-source a")).toHaveText("JLPT Grammar List");

  await page.getByRole("textbox", { name: "N2 の文法を検索" }).fill("からといって");
  await expect(page.locator(".jlpt-list .gr-item")).toHaveCount(1);
  await expect(page.locator(".jlpt-list .gr-item")).toContainText("just because");
  await expect(page.locator(".jlpt-list .jlpt-now")).toHaveText("今回");

  // The same item is on the lesson page's rail.
  await page.getByRole("tablist", { name: "ライブラリ" }).getByRole("tab", { name: "レッスン" }).click();
  await rail.locator(".tab-group-foot .tab-btn").click();
  await expect(page).toHaveURL(/#\/l\/hakone-practice\/jlptGrammar$/);
  await expect(page.locator(".jlpt-list")).toBeVisible();
  await expect(page.locator(".pr-page")).toHaveCount(0);
});

test("shaun: no JLPT grammar list item", async ({ page }) => {
  await signIn(page, "shaun");
  await page.goto("/");
  await expect(page.locator(".tab-rail .tab-btn").first()).toBeVisible();
  await expect(page.locator(".tab-group-foot")).toHaveCount(0);
});
