import { test, expect } from "@playwright/test";

test("3D experience loads successfully", async ({ page }) => {
  await page.goto("http://localhost:3000/3d");

  await expect(
    page.getByRole("heading", {
      name: /interactive 3d experience/i,
    })
  ).toBeVisible();

  await expect(
    page.getByRole("button", {
      name: /blue/i,
    })
  ).toBeVisible();

  await expect(
    page.getByRole("button", {
      name: /purple/i,
    })
  ).toBeVisible();

  await expect(
    page.getByRole("button", {
      name: /teal/i,
    })
  ).toBeVisible();
});