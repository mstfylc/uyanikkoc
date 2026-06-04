import { expect, test } from "@playwright/test";

async function login(page: import("@playwright/test").Page, email: string) {
  await page.goto("/login");
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', "uyanik123");
  await page.click('[type="submit"]');
  await page.waitForURL(/\/(coach|student|parent|branch|admin)\/dashboard/, { timeout: 45_000 });
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

  test("şube yöneticisi dashboard'a ulaşır", async ({ page }) => {
    await login(page, "branch@uyanik.local");
    await expect(page).toHaveURL(/\/branch\/dashboard/);
    await expect(page.getByTestId("branch-dashboard")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Şube Dashboard");
  });

  test("admin dashboard'a ulaşır", async ({ page }) => {
    await login(page, "admin@uyanik.local");
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.getByTestId("admin-dashboard")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Admin Dashboard");
  });
});
