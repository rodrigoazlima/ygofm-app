/**
 * Open a card modal by name, handling single-match auto-open and
 * multi-match dropdown click.
 */
async function openCardModal(page, cardName) {
  const input = page.locator("#card-search");
  await input.fill(cardName);
  await input.dispatchEvent("input");

  await Promise.race([
    page.waitForSelector("#overlay.open", { timeout: 8000 }),
    page.waitForSelector(".sdrop-item", { state: "visible", timeout: 8000 })
      .then(async () => {
        await page.locator(".sdrop-item").first().click();
        await page.waitForSelector("#overlay.open", { timeout: 5000 });
      }),
  ]);
}

module.exports = { openCardModal };
