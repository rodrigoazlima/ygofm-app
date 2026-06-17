const { test, expect } = require("@playwright/test");

test.describe("grid", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("#loading", { state: "detached", timeout: 10000 });
    await page.waitForSelector(".cell", { timeout: 10000 });
  });

  test("loads fusion result cards into grid", async ({ page }) => {
    const count = await page.locator(".cell").count();
    expect(count).toBeGreaterThan(0);
  });

  test("header shows card count and type count", async ({ page }) => {
    const text = await page.locator("#hdr-count").textContent();
    expect(text).toMatch(/\d+ cards • \d+ types/);
  });

  test("cards are grouped under type headers", async ({ page }) => {
    const headers = page.locator(".type-hdr");
    expect(await headers.count()).toBeGreaterThan(0);
  });

  test("searching by name filters grid to matching cards only", async ({ page }) => {
    const input = page.locator("#card-search");
    await input.fill("dragon");
    await input.dispatchEvent("input");
    await page.waitForTimeout(300);

    const text = await page.locator("#hdr-count").textContent();
    const num = parseInt(text.match(/(\d+) cards/)[1], 10);
    expect(num).toBeGreaterThan(0);
  });

  test("clearing search restores full card count", async ({ page }) => {
    const input = page.locator("#card-search");

    await input.fill("dragon");
    await input.dispatchEvent("input");
    await page.waitForTimeout(200);
    const filtered = parseInt((await page.locator("#hdr-count").textContent()).match(/(\d+) cards/)[1], 10);

    await input.fill("");
    await input.dispatchEvent("input");
    await page.waitForTimeout(200);
    const restored = parseInt((await page.locator("#hdr-count").textContent()).match(/(\d+) cards/)[1], 10);

    expect(restored).toBeGreaterThan(filtered);
  });

  test("clicking a cell opens the modal for that card", async ({ page }) => {
    await page.locator(".cell").first().click();
    await page.waitForSelector("#overlay.open", { timeout: 5000 });
    await expect(page.locator("#overlay")).toHaveClass(/open/);
    await expect(page.locator("#m-name")).not.toBeEmpty();
  });
});
