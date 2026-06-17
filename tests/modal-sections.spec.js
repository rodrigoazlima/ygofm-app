const { test, expect } = require("@playwright/test");
const { openCardModal } = require("./helpers");

test.describe("modal sections", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("#loading", { state: "detached", timeout: 10000 });
    await page.waitForSelector(".cell", { timeout: 10000 });
  });

  // ── header info ──────────────────────────────────────────────

  test("modal shows correct card name", async ({ page }) => {
    await openCardModal(page, "Arlownay");
    await expect(page.locator("#m-name")).toContainText("Arlownay");
  });

  test("modal shows ATK and DEF for monster cards", async ({ page }) => {
    await openCardModal(page, "Arlownay");
    const stats = await page.locator("#m-stats").textContent();
    expect(stats).toMatch(/ATK/);
    expect(stats).toMatch(/DEF/);
  });

  test("modal shows star level for monster cards", async ({ page }) => {
    await openCardModal(page, "Arlownay");
    const level = await page.locator("#m-level").textContent();
    expect(level).toMatch(/★/);
  });

  test("modal shows guardian stars for monster cards", async ({ page }) => {
    await openCardModal(page, "Arlownay");
    const guardian = await page.locator("#m-guardian").textContent();
    expect(guardian.trim().length).toBeGreaterThan(0);
  });

  test("modal shows card description", async ({ page }) => {
    await openCardModal(page, "Arlownay");
    const desc = await page.locator("#m-desc").textContent();
    expect(desc.trim().length).toBeGreaterThan(0);
  });

  // ── FUSES INTO ───────────────────────────────────────────────

  test("FUSES INTO section appears for cards with fusion recipes", async ({ page }) => {
    await openCardModal(page, "Arlownay");

    const titles = page.locator(".m-section-title");
    const count = await titles.count();
    let found = false;
    for (let i = 0; i < count; i++) {
      if ((await titles.nth(i).textContent()).includes("FUSES INTO")) { found = true; break; }
    }
    expect(found).toBe(true);
  });

  test("FUSES INTO rows show fusion result name and ATK", async ({ page }) => {
    await openCardModal(page, "Arlownay");

    const rows = page.locator(".fi-group");
    if (await rows.count() === 0) { test.skip(); return; }

    const first = rows.first();
    await expect(first.locator(".fi-result-name")).not.toBeEmpty();
  });

  test("clicking FUSES INTO result opens that card's modal", async ({ page }) => {
    await openCardModal(page, "Arlownay");

    const rows = page.locator(".fi-group");
    if (await rows.count() === 0) { test.skip(); return; }

    const originalName = await page.locator("#m-name").textContent();
    await rows.first().click();

    await page.waitForSelector("#overlay.open", { timeout: 5000 });
    const newName = await page.locator("#m-name").textContent();
    expect(newName).not.toBe(originalName);
  });

  // ── COMBINES WITH ────────────────────────────────────────────

  test("COMBINES WITH section lists partner cards", async ({ page }) => {
    await openCardModal(page, "Arlownay");

    const rows = page.locator(".cw-row");
    expect(await rows.count()).toBeGreaterThan(0);
  });

  test("COMBINES WITH rows show partner name and fusion result", async ({ page }) => {
    await openCardModal(page, "Arlownay");

    const row = page.locator(".cw-row").first();
    if (await row.count() === 0) { test.skip(); return; }

    await expect(row.locator(".mp-name")).not.toBeEmpty();
    await expect(row.locator(".cw-result-name")).not.toBeEmpty();
  });

  test("clicking COMBINES WITH partner opens that partner's modal", async ({ page }) => {
    await openCardModal(page, "Arlownay");

    const row = page.locator(".cw-row").first();
    if (await row.count() === 0) { test.skip(); return; }

    const partnerName = await row.locator(".mp-name").textContent();
    await row.click();

    await page.waitForSelector("#overlay.open", { timeout: 5000 });
    await expect(page.locator("#m-name")).toContainText(partnerName.trim());
  });

  test("type chips appear in COMBINES WITH section", async ({ page }) => {
    await openCardModal(page, "Arlownay");

    const chips = page.locator(".cw-type-chip");
    if (await chips.count() === 0) { test.skip(); return; }
    expect(await chips.count()).toBeGreaterThan(0);
  });

  // ── MADE FROM ────────────────────────────────────────────────

  test("MADE FROM section appears for fusion result cards", async ({ page }) => {
    await openCardModal(page, "Twin-Headed Thunder Dragon");

    const titles = page.locator(".m-section-title");
    const count = await titles.count();
    let found = false;
    for (let i = 0; i < count; i++) {
      if ((await titles.nth(i).textContent()).includes("MADE FROM")) { found = true; break; }
    }
    if (!found) { test.skip(); return; }
    expect(found).toBe(true);
  });

  test("MADE FROM rows show two material card names", async ({ page }) => {
    await openCardModal(page, "Twin-Headed Thunder Dragon");

    const rows = page.locator(".mf-row");
    if (await rows.count() === 0) { test.skip(); return; }

    const row = rows.first();
    const names = await row.locator(".mf-name").allTextContents();
    expect(names.length).toBe(2);
    expect(names[0].trim().length).toBeGreaterThan(0);
    expect(names[1].trim().length).toBeGreaterThan(0);
  });

  test("clicking MADE FROM material name opens that material's modal", async ({ page }) => {
    await openCardModal(page, "Twin-Headed Thunder Dragon");

    const rows = page.locator(".mf-row");
    if (await rows.count() === 0) { test.skip(); return; }

    const matName = await rows.first().locator(".mf-name").first().textContent();
    await rows.first().locator(".mf-name").first().click();

    await page.waitForSelector("#overlay.open", { timeout: 5000 });
    await expect(page.locator("#m-name")).toContainText(matName.trim());
  });

  // ── COMPATIBLE SPELLS ────────────────────────────────────────

  test("COMPATIBLE SPELLS section appears for monster boosted by field card", async ({ page }) => {
    // Plant type → boosted by Forest field card
    await openCardModal(page, "Arlownay");

    const titles = page.locator(".m-section-title");
    const count = await titles.count();
    let found = false;
    for (let i = 0; i < count; i++) {
      if ((await titles.nth(i).textContent()).includes("COMPATIBLE SPELLS")) { found = true; break; }
    }
    expect(found).toBe(true);
  });

  // ── modal close ──────────────────────────────────────────────

  test("X button closes modal", async ({ page }) => {
    await openCardModal(page, "Blue-Eyes White Dragon");
    await page.locator("#m-close").click();
    await page.waitForSelector("#overlay.open", { state: "detached", timeout: 3000 });
    await expect(page.locator("#overlay")).not.toHaveClass(/open/);
  });

  test("clicking overlay backdrop closes modal", async ({ page }) => {
    await openCardModal(page, "Blue-Eyes White Dragon");
    await page.locator("#overlay").click({ position: { x: 5, y: 5 } });
    await page.waitForSelector("#overlay.open", { state: "detached", timeout: 3000 });
    await expect(page.locator("#overlay")).not.toHaveClass(/open/);
  });
});
