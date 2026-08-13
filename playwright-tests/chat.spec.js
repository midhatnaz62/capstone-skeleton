import { test, expect } from "@playwright/test";

test("primary chat flow", async ({ page }) => {
  await page.goto("/about");

  await expect(
    page.getByRole("heading", {
      name: /ai qualification chat/i,
    })
  ).toBeVisible();

  await expect(
    page.getByPlaceholderText(/ask anything/i)
  ).toBeVisible();

  await page.getByPlaceholderText(/ask anything/i).fill("Hello");

  await page.getByRole("button", {
    name: /send/i,
  }).click();

  await expect(
    page.getByText(/thinking/i)
  ).toBeVisible();
});