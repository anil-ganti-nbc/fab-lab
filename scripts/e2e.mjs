#!/usr/bin/env node
/**
 * Browser E2E for Fab Lab standalone: ?practice=demo loads the rayleigh module;
 * questions are answered (conceptual grading teaches on wrong answers too);
 * Complete unlocks after the deck; the result panel renders.
 *
 * Usage: node --experimental-strip-types --import ./scripts/register-ts.mjs scripts/e2e.mjs
 */
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const PORT = 8092;
const BASE = `http://localhost:${PORT}/`;

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

async function waitForServer(url, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  fail(`dev server not ready at ${url}`);
}

const vite = spawn("npm", ["run", "dev"], {
  cwd: new URL("..", import.meta.url).pathname,
  stdio: "ignore",
  detached: true,
});

try {
  await waitForServer(BASE);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(String(err?.message || err)));

  await page.goto(`${BASE}?practice=demo`, { waitUntil: "domcontentloaded" });
  await page.getByText("Practice · semi-rayleigh · semi-rayleigh-10").waitFor({ timeout: 15_000 });
  console.log("✔ demo payload rendered into the header");

  // Answer the whole deck. Conceptual grading: any choice advances and teaches.
  const QUESTIONS = 4;
  for (let i = 0; i < QUESTIONS; i += 1) {
    const options = page.locator(".stack .btn");
    await options.first().waitFor({ timeout: 10_000 });
    await options.first().click();
    await page.waitForTimeout(2400); // feedback + advance delay
  }

  const complete = page.getByRole("button", { name: "Complete" });
  if (!(await complete.isEnabled())) fail("Complete did not enable after finishing the deck");
  console.log("✔ deck finished — Complete unlocked");

  await page.getByRole("button", { name: "Locked" }).click();
  await complete.click();
  await page.getByText("Result for DAU").waitFor({ timeout: 5_000 });
  const result = JSON.parse(await page.locator("pre.result").innerText());
  if (result.completed !== true || result.sourceApp !== "fab-lab") fail(`unexpected result: ${JSON.stringify(result)}`);
  console.log("✔ result panel:", JSON.stringify(result).slice(0, 110));

  if (pageErrors.length > 0) console.warn("⚠ page errors:", pageErrors);
  await page.screenshot({ path: "/tmp/opencode/fab-lab-after.png" });
  await browser.close();
  console.log("\n✅ FAB LAB STANDALONE E2E OK");
} finally {
  try {
    process.kill(-vite.pid);
  } catch {}
}
