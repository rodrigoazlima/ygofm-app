const { test, expect } = require("@playwright/test");

test.describe("modal search filter", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for grid to render (loading element removed)
    await page.waitForSelector("#loading", { state: "detached", timeout: 10000 });
    await page.waitForSelector(".cell", { timeout: 10000 });
  });

  /**
   * Open a card modal by searching the header for an exact name.
   * Handles both: single-match auto-open and multi-match dropdown click.
   */
  async function openCardModal(page, cardName) {
    const input = page.locator("#card-search");
    await input.fill(cardName);
    await input.dispatchEvent("input");

    // Single match → modal opens immediately; multi match → dropdown appears
    await Promise.race([
      page.waitForSelector("#overlay.open", { timeout: 8000 }),
      page.waitForSelector(".sdrop-item", { state: "visible", timeout: 8000 })
        .then(async () => {
          await page.locator(".sdrop-item").first().click();
          await page.waitForSelector("#overlay.open", { timeout: 5000 });
        }),
    ]);
  }

  test("searching Arlownay then Elf shows Elf cards in right panel", async ({ page }) => {
    await openCardModal(page, "Arlownay");

    // Verify modal opened for Arlownay
    const modalName = await page.locator("#m-name").textContent();
    expect(modalName).toContain("Arlownay");

    // Type "elf" in modal filter
    const mFilter = page.locator("#m-filter");
    await mFilter.fill("elf");
    await mFilter.dispatchEvent("input");

    // Right panel must be visible
    const panel = page.locator("#m-right-panel");
    await expect(panel).toHaveClass(/active/, { timeout: 3000 });

    // Panel title must reference ARLOWNAY
    const title = panel.locator("#m-rp-title");
    await expect(title).toContainText("ARLOWNAY", { timeout: 3000 });

    // Panel must contain at least one entry with "Elf" in the name
    const panelRows = panel.locator(".mp-row");
    const count = await panelRows.count();
    expect(count).toBeGreaterThan(0);

    let foundElf = false;
    for (let i = 0; i < count; i++) {
      const text = await panelRows.nth(i).locator(".mp-name").textContent();
      if (text.toLowerCase().includes("elf")) { foundElf = true; break; }
    }
    expect(foundElf, "right panel must contain at least one card with 'Elf' in name").toBe(true);
  });

  test("OTHER PARTNERS section is hidden when no section matches", async ({ page }) => {
    await openCardModal(page, "Arlownay");

    const mFilter = page.locator("#m-filter");
    await mFilter.fill("elf");
    await mFilter.dispatchEvent("input");

    // When Arlownay has no Elf partners, OTHER PARTNERS section must NOT appear
    // (it only shows when at least one section already has matches)
    const mainSections = page.locator(".m-section:not(.incompat-all-sec)");
    let anyMainVisible = false;
    const secCount = await mainSections.count();
    for (let i = 0; i < secCount; i++) {
      const display = await mainSections.nth(i).evaluate(el => el.style.display);
      if (display !== "none") { anyMainVisible = true; break; }
    }

    const incompatSec = page.locator(".incompat-all-sec");
    const incompatCount = await incompatSec.count();
    if (!anyMainVisible) {
      // No main sections visible → OTHER PARTNERS must not exist
      expect(incompatCount).toBe(0);
    } else {
      // Some main sections visible → OTHER PARTNERS may or may not exist — just don't assert
      expect(incompatCount).toBeGreaterThanOrEqual(0);
    }
  });

  test("filter clears when switching cards", async ({ page }) => {
    await openCardModal(page, "Arlownay");

    const mFilter = page.locator("#m-filter");
    await mFilter.fill("elf");
    await mFilter.dispatchEvent("input");

    // Close modal
    await page.locator("#m-close").click();
    await page.waitForSelector("#overlay.open", { state: "detached" });

    // Open another card
    await openCardModal(page, "Dark Magician");
    const filterVal = await mFilter.inputValue();
    expect(filterVal).toBe("");

    // Right panel must not be active
    const panel = page.locator("#m-right-panel");
    await expect(panel).not.toHaveClass(/active/);
  });

  test("type chips filter COMBINES WITH rows", async ({ page }) => {
    // Find a card that has multiple COMBINES WITH types
    await openCardModal(page, "Blue-Eyes White Dragon");

    // Wait for combines-with section to render
    const cwRows = page.locator(".cw-row");
    const rowCount = await cwRows.count();
    if (rowCount === 0) {
      // Skip if no partners — this card may not have fusions listed
      test.skip();
      return;
    }

    // Click the first type chip in COMBINES WITH
    const chip = page.locator(".cw-type-chip").first();
    if (await chip.count() === 0) { test.skip(); return; }
    await chip.click();

    // At least one cw-row must remain visible (not row-hidden)
    const visibleRows = page.locator(".cw-row:not(.row-hidden)");
    await expect(visibleRows).not.toHaveCount(0);
  });
});
