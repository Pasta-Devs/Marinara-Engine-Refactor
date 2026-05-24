import { expect, test } from "@playwright/test";

test("app shell renders without a blank page", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
  await expect(page.locator("#root")).toBeVisible();

  expect(errors).toEqual([]);
});
