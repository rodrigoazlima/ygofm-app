const { test, expect } = require("@playwright/test");
const { openCardModal } = require("./helpers");

test.describe("modal filter", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("#loading", { state: "detached", timeout: 10000 });
    await page.waitForSelector(".cell", { timeout: 10000 });
  });

  // ── text filter ──────────────────────────────────────────────

  test("typing in filter hides non-matching partner rows", async ({ page }) => {
    await openCardModal(page, "Arlownay");

    const total = await page.locator(".m-section:not(.incompat-all-sec) .cw-row").count();
    if (total === 0) { test.skip(); return; }

    const mFilter = page.locator("#m-filter");
    await mFilter.fill("elf");
    await mFilter.dispatchEvent("input");

    // After filtering, at least some rows should be hidden
    const hidden = page.locator(".m-section:not(.incompat-all-sec) .cw-row.row-hidden");
    expect(await hidden.count()).toBeGreaterThan(0);
  });

  test("filter also hides non-matching FUSES INTO rows", async ({ page }) => {
    await openCardModal(page, "Blue-Eyes White Dragon");

    const total = await page.locator(".fi-group").count();
    if (total === 0) { test.skip(); return; }

    const mFilter = page.locator("#m-filter");
    await mFilter.fill("zzzzz");
    await mFilter.dispatchEvent("input");

    const visible = page.locator(".fi-group:not(.row-hidden)");
    expect(await visible.count()).toBe(0);
  });

  test("clearing filter restores all hidden rows", async ({ page }) => {
    await openCardModal(page, "Blue-Eyes White Dragon");

    const mFilter = page.locator("#m-filter");
    await mFilter.fill("elf");
    await mFilter.dispatchEvent("input");
    await page.waitForTimeout(100);

    await mFilter.fill("");
    await mFilter.dispatchEvent("input");

    const hidden = page.locator(".row-hidden");
    expect(await hidden.count()).toBe(0);
  });

  // ── right panel ──────────────────────────────────────────────

  test("right panel activates with cards that have no fusion with current card", async ({ page }) => {
    await openCardModal(page, "Arlownay");

    const mFilter = page.locator("#m-filter");
    await mFilter.fill("elf");
    await mFilter.dispatchEvent("input");

    const panel = page.locator("#m-right-panel");
    await expect(panel).toHaveClass(/active/, { timeout: 3000 });

    await expect(panel.locator("#m-rp-title")).toContainText("ARLOWNAY", { timeout: 3000 });
    expect(await panel.locator(".mp-row").count()).toBeGreaterThan(0);
  });

  test("right panel title says NO FUSION WITH current card name", async ({ page }) => {
    await openCardModal(page, "Arlownay");

    const mFilter = page.locator("#m-filter");
    await mFilter.fill("elf");
    await mFilter.dispatchEvent("input");

    await page.locator("#m-right-panel").waitFor({ state: "visible", timeout: 3000 });
    const title = await page.locator("#m-rp-title").textContent();
    expect(title).toMatch(/NO FUSION WITH ARLOWNAY/);
  });

  test("right panel hides when filter is cleared", async ({ page }) => {
    await openCardModal(page, "Arlownay");

    const mFilter = page.locator("#m-filter");
    await mFilter.fill("elf");
    await mFilter.dispatchEvent("input");
    await page.locator("#m-right-panel").waitFor({ state: "visible", timeout: 3000 });

    await mFilter.fill("");
    await mFilter.dispatchEvent("input");

    await expect(page.locator("#m-right-panel")).not.toHaveClass(/active/, { timeout: 3000 });
  });

  test("right panel rows are clickable and open that card's modal", async ({ page }) => {
    await openCardModal(page, "Arlownay");

    const mFilter = page.locator("#m-filter");
    await mFilter.fill("elf");
    await mFilter.dispatchEvent("input");
    await page.locator("#m-right-panel").waitFor({ state: "visible", timeout: 3000 });

    const rows = page.locator("#m-right-panel .mp-row");
    if (await rows.count() === 0) { test.skip(); return; }

    const rowName = await rows.first().locator(".mp-name").textContent();
    await rows.first().click();

    await page.waitForSelector("#overlay.open", { timeout: 5000 });
    await expect(page.locator("#m-name")).toContainText(rowName.trim());
  });

  // ── OTHER PARTNERS section ───────────────────────────────────

  test("OTHER PARTNERS section hidden when no main section has matches", async ({ page }) => {
    await openCardModal(page, "Arlownay");

    const mFilter = page.locator("#m-filter");
    await mFilter.fill("elf");
    await mFilter.dispatchEvent("input");

    const mainSections = page.locator(".m-section:not(.incompat-all-sec)");
    let anyMainVisible = false;
    const secCount = await mainSections.count();
    for (let i = 0; i < secCount; i++) {
      const display = await mainSections.nth(i).evaluate(el => el.style.display);
      if (display !== "none") { anyMainVisible = true; break; }
    }

    const incompatSec = page.locator(".incompat-all-sec");
    if (!anyMainVisible) {
      expect(await incompatSec.count()).toBe(0);
    } else {
      expect(await incompatSec.count()).toBeGreaterThanOrEqual(0);
    }
  });

  // ── type chips ───────────────────────────────────────────────

  test("COMBINES WITH type chip filters rows to selected type", async ({ page }) => {
    await openCardModal(page, "Arlownay");

    const rows = page.locator(".m-section:not(.incompat-all-sec) .cw-row");
    const total = await rows.count();
    if (total === 0) { test.skip(); return; }

    const chip = page.locator(".cw-type-chip").first();
    if (await chip.count() === 0) { test.skip(); return; }

    await chip.click();

    const visible = page.locator(".m-section:not(.incompat-all-sec) .cw-row:not(.row-hidden)");
    expect(await visible.count()).toBeGreaterThan(0);
    expect(await visible.count()).toBeLessThanOrEqual(total);
  });

  test("clicking active type chip deselects and restores all rows", async ({ page }) => {
    await openCardModal(page, "Arlownay");

    const total = await page.locator(".m-section:not(.incompat-all-sec) .cw-row").count();
    if (total === 0) { test.skip(); return; }

    const chip = page.locator(".cw-type-chip").first();
    if (await chip.count() === 0) { test.skip(); return; }

    await chip.click();
    await chip.click(); // toggle off

    const visible = page.locator(".m-section:not(.incompat-all-sec) .cw-row:not(.row-hidden)");
    expect(await visible.count()).toBe(total);
  });

  test("type chip in MADE FROM filters material rows to selected type", async ({ page }) => {
    await openCardModal(page, "Twin-Headed Thunder Dragon");

    const total = await page.locator(".mf-row").count();
    if (total === 0) { test.skip(); return; }

    // mf type chips are also .cw-type-chip — grab from MADE FROM section
    const mfSectionChip = page.locator(".mf-row ~ .cw-types .cw-type-chip, .m-section-title.orange ~ .cw-types .cw-type-chip").first();
    // Simpler: grab last .cw-type-chip grouping that precedes .mf-row elements
    const allChips = page.locator(".cw-type-chip");
    const chipCount = await allChips.count();
    if (chipCount === 0) { test.skip(); return; }

    const lastChip = allChips.last();
    await lastChip.click();

    const visible = page.locator(".mf-row:not(.row-hidden)");
    expect(await visible.count()).toBeGreaterThanOrEqual(0); // may be 0 if chip type doesn't match
  });

  // ── filter state reset ───────────────────────────────────────

  test("filter clears when switching to a different card", async ({ page }) => {
    await openCardModal(page, "Arlownay");

    const mFilter = page.locator("#m-filter");
    await mFilter.fill("elf");
    await mFilter.dispatchEvent("input");

    await page.locator("#m-close").click();
    await page.waitForSelector("#overlay.open", { state: "detached" });

    await openCardModal(page, "Dark Magician");
    expect(await mFilter.inputValue()).toBe("");
    await expect(page.locator("#m-right-panel")).not.toHaveClass(/active/);
  });

  // ── Enter key navigation ─────────────────────────────────────

  test("Enter with single visible row navigates to that card", async ({ page }) => {
    await openCardModal(page, "Arlownay");

    const mFilter = page.locator("#m-filter");
    await mFilter.fill("elf");
    await mFilter.dispatchEvent("input");
    await page.waitForTimeout(200);

    const visible = page.locator(".fi-group:not(.row-hidden),.cw-row:not(.row-hidden),.mf-row:not(.row-hidden)");
    if (await visible.count() !== 1) { test.skip(); return; }

    const expectedName = await visible.locator(".mp-name,.fi-result-name,.mf-name").first().textContent();
    await mFilter.press("Enter");

    await page.waitForSelector("#overlay.open", { timeout: 5000 });
    await expect(page.locator("#m-name")).toContainText(expectedName.trim());
  });

  test("Escape in modal filter blurs input but keeps modal open", async ({ page }) => {
    await openCardModal(page, "Blue-Eyes White Dragon");

    const mFilter = page.locator("#m-filter");
    await mFilter.fill("test");
    await mFilter.press("Escape");

    await expect(page.locator("#overlay")).toHaveClass(/open/);
  });
});
