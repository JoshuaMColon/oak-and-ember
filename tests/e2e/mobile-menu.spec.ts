import { expect, test } from "@playwright/test";

const widths = [320, 375, 414, 768, 1024, 1280];

for (const width of widths) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    for (const path of ["/", "/catalog"]) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });
}

test("mobile menu opens full screen, locks scroll and closes", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/catalog");
  const toggle = page.getByRole("button", { name: "Open menu" });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  const menu = page.getByRole("dialog", { name: "Site menu" });
  await expect(menu).toBeVisible();
  const box = await menu.boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(790);
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("");

  await page.getByRole("button", { name: "Open menu" }).click();
  await menu.getByRole("link", { name: "Our story" }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(menu).toBeHidden();
});
