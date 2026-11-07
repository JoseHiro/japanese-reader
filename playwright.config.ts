import { defineConfig, devices } from "@playwright/test";

// End-to-end tests (e2e/*.spec.ts) against the Vite dev server.
// Unit tests stay in vitest (`npm test`); see `test.include` in vite.config.ts.
// E2E_PORT lets the suite run beside a dev server already using 5173.
const port = Number(process.env.E2E_PORT ?? 5173);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["github"]] : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // copy-dict puts the kuromoji dictionary in public/dict (gitignored).
    command: `npm run copy-dict && npm run dev -- --port ${port} --strictPort`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
