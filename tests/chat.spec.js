import { test, expect } from "@playwright/test";

test("primary chat flow", async ({ page }) => {
  await page.goto("/about");

  await expect(
    page.getByRole("heading", {
      name: /ai qualification chat/i,
    })
  ).toBeVisible();

  await expect(
    page.getByPlaceholder(/ask anything/i)
  ).toBeVisible();

  await expect(
    page.getByRole("button", {
      name: /send/i,
    })
  ).toBeVisible();
});