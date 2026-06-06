import { expect, test } from "@playwright/test";

async function login(page: import("@playwright/test").Page, email: string) {
  await page.goto("/login");
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', "uyanik123");
  await page.click('[type="submit"]');
  await page.waitForURL(/\/(coach|student|parent|yonetim)\/dashboard/, { timeout: 45_000 });
}

test.describe("Koç → öğrenci → veli demo akışı", () => {
  test("koç giriş yapıp ödev ekranına ulaşır", async ({ page }) => {
    await login(page, "coach@uyanik.local");
    await page.goto("/coach/assignments/create");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("öğrenci giriş yapıp ödev listesini görür", async ({ page }) => {
    await login(page, "student@uyanik.local");
    await page.goto("/student/assignments");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("veli giriş yapıp dashboard görür", async ({ page }) => {
    await login(page, "parent@uyanik.local");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByTestId("parent-summary")).toBeVisible({ timeout: 15_000 });
  });

  test("öğrenci koç sayfasına gidemez", async ({ page }) => {
    await login(page, "student@uyanik.local");
    await page.goto("/coach/dashboard");
    await page.waitForURL("**/student/dashboard");
  });

  test("koç ödev oluşturur, öğrenci görür ve tamamlar", async ({ page }) => {
    const assignmentTitle = `E2E Odev ${Date.now()}`;

    await login(page, "coach@uyanik.local");
    await page.goto("/coach/assignments/create");
    await expect(page.locator("#student option[value='student_001']")).toBeAttached({ timeout: 15_000 });
    await page.selectOption("#student", "student_001");
    await page.fill("#title", assignmentTitle);
    await page.click('button[type="submit"]');
    await expect(page.getByTestId("created-assignment")).toContainText(assignmentTitle, {
      timeout: 15_000,
    });

    await login(page, "student@uyanik.local");
    await page.goto("/student/assignments");
    await expect(page.getByTestId("assignment-list")).toContainText(assignmentTitle, {
      timeout: 15_000,
    });
    await page.getByRole("listitem").filter({ hasText: assignmentTitle }).getByRole("button", { name: "Tamamla" }).click();
    await expect(page.getByRole("listitem").filter({ hasText: assignmentTitle })).toContainText(
      "(Tamamlandi)",
      { timeout: 15_000 },
    );

    await login(page, "parent@uyanik.local");
    await expect(page.getByTestId("parent-summary")).toContainText(/Tamamlanan: [1-9]/, {
      timeout: 15_000,
    });
  });
});
