import { expect, test } from "@playwright/test";

async function login(page: import("@playwright/test").Page, email: string) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', "uyanik123");
  await page.click('[type="submit"]');
  await page.waitForURL(/\/(coach|student|parent|yonetim)\/dashboard/, {
    timeout: 45_000,
    waitUntil: "domcontentloaded",
  });
}

test.describe("Auth ve RBAC iskeleti", () => {
  test("login sayfası açılır", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('[name="email"]')).toBeVisible();
    await expect(page.locator('[name="password"]')).toBeVisible();
    await expect(page.locator('[type="submit"]')).toBeVisible();
  });

  test("koç giriş yapıp dashboard'a ulaşır", async ({ page }) => {
    await login(page, "coach@uyanik.local");
    await expect(page).toHaveURL(/\/coach\/dashboard/);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("öğrenci koç rotasına erişemez", async ({ page }) => {
    await login(page, "student@uyanik.local");
    await page.goto("/coach/dashboard");
    await page.waitForURL("**/student/dashboard");
    expect(page.url()).toContain("/student/dashboard");
  });

  test("şube yöneticisi yonetim dashboard'a ulaşır", async ({ page }) => {
    await login(page, "branch@uyanik.local");
    await expect(page).toHaveURL(/\/yonetim\/dashboard/);
    await expect(page.getByRole("link", { name: "Koçlar" })).toBeVisible();
  });

  test("admin yonetim dashboard'a ulaşır", async ({ page }) => {
    await login(page, "admin@uyanik.local");
    await expect(page).toHaveURL(/\/yonetim\/dashboard/);
    await expect(page.getByRole("heading", { name: "Platform Genel Bakış", level: 1 })).toBeVisible({ timeout: 20_000 });
  });
});
