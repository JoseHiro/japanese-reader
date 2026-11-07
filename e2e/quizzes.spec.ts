import { findUser, articlesForUser } from "../src/users";
import { parseParticleText, particleChoices } from "../src/particles";
import { test, expect, signIn } from "./fixtures";

const artem = findUser("artem")!;
const withParticles = articlesForUser(artem).find((a) => a.quiz?.particle?.length)!;
const withHints = articlesForUser(artem).find((a) =>
  a.quiz?.rearrange?.some((q) => q.grammarKey),
)!;

test("助詞クイズ: rapid chip taps fill successive blanks, then 答え合わせ grades", async ({ page }) => {
  const q = withParticles.quiz!.particle![0];
  const { answers } = parseParticleText(q.text);
  const wrong = particleChoices(answers).find((p) => p !== answers[0])!;

  await signIn(page, artem.id);
  await page.goto(`/#/a/${withParticles.id}/particle-quiz`);
  const card = page.locator(".quiz-card").first();
  const blanks = card.locator(".pq-blank");
  const check = card.getByRole("button", { name: "答え合わせ" });
  await expect(blanks).toHaveCount(answers.length);
  await expect(check).toBeDisabled();

  // Tap every right answer in one synchronous burst, faster than React re-renders.
  await card.evaluate((el, answers) => {
    const chips = [...el.querySelectorAll<HTMLButtonElement>(".pq-chip")];
    for (const a of answers) chips.find((c) => c.textContent === a)!.click();
  }, answers);
  for (const [i, a] of answers.entries()) await expect(blanks.nth(i)).toHaveText(a);

  await check.click();
  await expect(card.locator(".rq-verdict")).toHaveText("✓ 正解です");
  await expect(blanks.first()).toHaveClass(/correct/);

  // Retry with a wrong first blank.
  await card.getByRole("button", { name: "もう一度" }).click();
  await expect(check).toBeDisabled();
  await card.locator(".pq-chip", { hasText: new RegExp(`^${wrong}$`) }).click();
  if (answers.length > 1) await expect(check).toBeDisabled();
  for (const a of answers.slice(1)) {
    await card.locator(".pq-chip", { hasText: new RegExp(`^${a}$`) }).click();
  }
  await expect(blanks.first()).toHaveText(wrong);
  await check.click();
  await expect(card.locator(".rq-verdict")).toContainText("残念、1か所違います");
  await expect(blanks.first()).toHaveClass(/wrong/);
});

test("並べ替え: hovering or focusing 💡 shows the Tobira explanation", async ({ page }) => {
  await signIn(page, artem.id);
  await page.goto(`/#/a/${withHints.id}/grammar-quiz`);
  const hint = page.locator(".grammar-hint").first();
  const pop = hint.locator(".grammar-pop");
  await expect(hint).toBeVisible();
  await expect(pop).toBeHidden();

  await hint.hover();
  await expect(pop).toBeVisible();
  await expect(pop.locator(".rq-grammar h4")).not.toBeEmpty();

  await page.mouse.move(0, 0);
  await expect(pop).toBeHidden();
  await hint.focus();
  await expect(pop).toBeVisible();
});

for (const id of ["andy", "chris"]) {
  test(`${id}: loads without errors and no quiz action bar`, async ({ page }) => {
    await signIn(page, id);
    await page.goto("/");
    await expect(page.locator(".user-pill .up-name")).toHaveText(findUser(id)!.displayName);
    await expect(page.locator(".article-list")).toBeVisible();
    await expect(page.locator(".ah-actions")).toHaveCount(0);
  });
}

