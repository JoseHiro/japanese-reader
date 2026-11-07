import { test as base, expect, type Page } from "@playwright/test";

// Shared setup for the e2e specs:
// - `signIn(page, userId)` stores the user the same way the sign-in picker does.
// - The clipboard is stubbed so "Copy results" can be read back with `copiedText`.
// - Every test fails if the page logged a console error or threw.

export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });
      page.on("pageerror", (err) => errors.push(String(err)));
      await page.addInitScript(() => {
        const w = window as unknown as { __copied: string[] };
        w.__copied = [];
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: {
            writeText: async (text: string) => {
              w.__copied.push(text);
            },
          },
        });
      });
      await use(errors);
      expect(errors, "console errors").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

export async function signIn(page: Page, userId: string) {
  await page.addInitScript((id) => {
    localStorage.setItem("yomu-user", JSON.stringify({ id }));
  }, userId);
}

/** The most recent text passed to navigator.clipboard.writeText. */
export async function copiedText(page: Page): Promise<string | undefined> {
  return page.evaluate(() => {
    const list = (window as unknown as { __copied: string[] }).__copied;
    return list[list.length - 1];
  });
}
