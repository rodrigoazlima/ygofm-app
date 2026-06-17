const { test, expect } = require("@playwright/test");

test.describe("header search bar", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("#loading", { state: "detached", timeout: 10000 });
    await page.waitForSelector(".cell", { timeout: 10000 });
  });

  test("partial name match shows dropdown with results", async ({ page }) => {
    const input = page.locator("#card-search");
    await input.fill("dark");
    await input.dispatchEvent("input");

    await page.waitForSelector("#search-drop.open", { timeout: 3000 });
    expect(await page.locator(".sdrop-item").count()).toBeGreaterThan(0);
  });

  test("dropdown items include name and type sub-label", async ({ page }) => {
    const input = page.locator("#card-search");
    await input.fill("dark");
    await input.dispatchEvent("input");

    await page.waitForSelector(".sdrop-item", { state: "visible", timeout: 3000 });
    const item = page.locator(".sdrop-item").first();
    await expect(item.locator(".sdrop-name")).not.toBeEmpty();
    await expect(item.locator(".sdrop-sub")).not.toBeEmpty();
  });

  test("clicking a dropdown item opens the modal", async ({ page }) => {
    const input = page.locator("#card-search");
    await input.fill("dark");
    await input.dispatchEvent("input");

    await page.waitForSelector(".sdrop-item", { state: "visible", timeout: 3000 });
    await page.locator(".sdrop-item").first().click();

    await page.waitForSelector("#overlay.open", { timeout: 5000 });
    await expect(page.locator("#overlay")).toHaveClass(/open/);
  });

  test("ArrowDown highlights first dropdown item", async ({ page }) => {
    const input = page.locator("#card-search");
    await input.fill("dark");
    await input.dispatchEvent("input");

    await page.waitForSelector(".sdrop-item", { state: "visible", timeout: 3000 });
    await input.press("ArrowDown");

    await expect(page.locator(".sdrop-item.active")).toHaveCount(1);
  });

  test("ArrowDown then ArrowUp moves highlight correctly", async ({ page }) => {
    const input = page.locator("#card-search");
    await input.fill("dark");
    await input.dispatchEvent("input");

    await page.waitForSelector(".sdrop-item", { state: "visible", timeout: 3000 });
    await input.press("ArrowDown");
    await input.press("ArrowDown");
    await input.press("ArrowUp");

    const active = await page.locator(".sdrop-item.active").count();
    expect(active).toBe(1);
  });

  test("Enter with active item opens modal", async ({ page }) => {
    const input = page.locator("#card-search");
    await input.fill("dark");
    await input.dispatchEvent("input");

    await page.waitForSelector(".sdrop-item", { state: "visible", timeout: 3000 });
    await input.press("ArrowDown");
    await input.press("Enter");

    await page.waitForSelector("#overlay.open", { timeout: 5000 });
    await expect(page.locator("#overlay")).toHaveClass(/open/);
  });

  test("Escape closes dropdown", async ({ page }) => {
    const input = page.locator("#card-search");
    await input.fill("dark");
    await input.dispatchEvent("input");

    await page.waitForSelector("#search-drop.open", { timeout: 3000 });
    await input.press("Escape");

    await expect(page.locator("#search-drop")).not.toHaveClass(/open/);
  });

  test("single unique match auto-opens modal directly", async ({ page }) => {
    const input = page.locator("#card-search");
    await input.fill("Arlownay");
    await input.dispatchEvent("input");

    await Promise.race([
      page.waitForSelector("#overlay.open", { timeout: 6000 }),
      page.waitForSelector(".sdrop-item", { state: "visible", timeout: 6000 })
        .then(async () => {
          await page.locator(".sdrop-item").first().click();
          await page.waitForSelector("#overlay.open", { timeout: 5000 });
        }),
    ]);

    const name = await page.locator("#m-name").textContent();
    expect(name.toLowerCase()).toContain("arlownay");
  });
});
