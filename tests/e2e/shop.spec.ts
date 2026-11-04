import { expect, test } from "@playwright/test";

test("browses the homepage into the catalog", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Made to be lived with." })).toBeVisible();
  await page.getByRole("link", { name: "Shop the collection" }).click();
  await expect(page).toHaveURL(/\/catalog/);
  await expect(page.getByRole("heading", { name: "The collection" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Calder Lounge Sofa" })).toBeVisible();
});

test("searches the catalog", async ({ page }) => {
  await page.goto("/catalog?q=Calder");
  await expect(page.getByRole("heading", { name: "Calder Lounge Sofa" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Wren Armchair" })).toHaveCount(0);
});

test("adds a piece and completes demo checkout", async ({ page }) => {
  await page.goto("/products/calder-lounge-sofa");
  await expect(page.getByRole("heading", { name: "Calder Lounge Sofa" })).toBeVisible();
  await page.getByRole("button", { name: "Add to cart", exact: true }).first().click();
  await page.goto("/cart");
  await expect(page.getByRole("link", { name: "Calder Lounge Sofa" })).toBeVisible();
  await page.getByRole("link", { name: "Checkout" }).click();
  await page.getByLabel("Email").fill("guest@example.com");
  await page.getByLabel("Full name").fill("Guest Shopper");
  await page.getByLabel("Delivery address").fill("18 Willow Street, Hudson, NY 12534");
  await page.getByRole("button", { name: "Place order" }).click();
  await expect(page.getByRole("heading", { name: "Thank you." })).toBeVisible();
  await expect(page.getByText(/OE-/)).toBeVisible();
});

test("sends guests away from the admin studio", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login\?next=(%2F|\/)admin/);
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
});

test("opens the admin demo without an account", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: "Enter the demo" }).click();
  await expect(page).toHaveURL(/\/admin/);
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await expect(page.getByText("Demo sandbox")).toBeVisible();
  await page.getByRole("link", { name: "Orders" }).click();
  await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible();
  await expect(page.getByText("OE-1001", { exact: true })).toBeVisible();
});
