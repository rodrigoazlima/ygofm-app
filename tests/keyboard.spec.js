const { test, expect } = require("@playwright/test");
const { openCardModal } = require("./helpers");

test.describe("keyboard routing", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("#loading", { state: "detached", timeout: 10000 });
    await page.waitForSelector(".cell", { timeout: 10000 });
  });

  test("printable key when no input focused routes to header search", async ({ page }) => {
    // Click body to ensure no input has focus
    await page.locator("body").click();
    await page.keyboard.press("d");

    const val = await page.locator("#card-search").inputValue();
    expect(val).toBe("d");
  });

  test("printable key does not route when header search already focused", async ({ page }) => {
    const input = page.locator("#card-search");
    await input.focus();
    await page.keyboard.type("ma");

    // Value should be typed normally into the input
    const val = await input.inputValue();
    expect(val).toContain("ma");
  });

  test("printable key when modal open routes to modal filter", async ({ page }) => {
    await openCardModal(page, "Blue-Eyes White Dragon");

    // Click modal title to defocus any input
    await page.locator("#m-name").click();
    await page.keyboard.press("e");

    const val = await page.locator("#m-filter").inputValue();
    expect(val).toContain("e");
  });

  test("printable key does not route when modal filter already focused", async ({ page }) => {
    await openCardModal(page, "Blue-Eyes White Dragon");

    const mFilter = page.locator("#m-filter");
    await mFilter.focus();
    await page.keyboard.type("dr");

    const val = await mFilter.inputValue();
    expect(val).toContain("dr");
  });

  test("Ctrl+key does not route to search input", async ({ page }) => {
    await page.locator("body").click();
    await page.keyboard.press("Control+a");

    const val = await page.locator("#card-search").inputValue();
    expect(val).toBe("");
  });
});
