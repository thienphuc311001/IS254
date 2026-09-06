import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

/**
 * Point the suite at an already-running app (e.g. `npm run dev` on port 3000) with
 *   PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e
 * Otherwise Playwright builds and starts a production server on PORT.
 * A production server is used because Next.js 16 allows only one `next dev` per project,
 * and a second one would refuse to start while yours is running.
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: `npx next build && npx next start -p ${PORT}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
