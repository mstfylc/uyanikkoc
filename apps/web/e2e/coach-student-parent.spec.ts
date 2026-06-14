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

test.describe("Koç → öğrenci → veli demo akışı", () => {
  test("koç giriş yapıp ödev ekranına ulaşır", async ({ page }) => {
    await login(page, "coach@uyanik.local");
    await page.goto("/coach/assignments/create");
    await expect(page.getByRole("heading", { name: "Toplu Ödev Ata" })).toBeVisible({ timeout: 20_000 });
    await expect(page.locator(".oa-sheet")).toBeVisible();
  });

  test("öğrenci giriş yapıp ödev listesini görür", async ({ page }) => {
    await login(page, "student@uyanik.local");
    await page.goto("/student/assignments");
    await expect(page.getByTestId("assignment-list")).toBeVisible({ timeout: 20_000 });
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
    await login(page, "coach@uyanik.local");
    await page.goto("/coach/assignments/create");
    const modal = page.locator(".oa-sheet");
    await expect(modal.getByRole("heading", { name: "Toplu Ödev Ata" })).toBeVisible({ timeout: 20_000 });

    const firstTopic = modal.locator(".oa-topic .nm").first();
    await expect(firstTopic).toBeVisible({ timeout: 15_000 });
    const assignmentTitle = (await firstTopic.textContent())?.trim() ?? "";
    expect(assignmentTitle.length).toBeGreaterThan(0);

    await firstTopic.click();
    await expect(modal.getByRole("button", { name: /Öğrenciye Ata/ })).toBeEnabled({ timeout: 10_000 });
    await modal.getByRole("button", { name: /Öğrenciye Ata/ }).click();
    await page.waitForURL(/\/coach\/assignments/, { timeout: 20_000 });

    await login(page, "student@uyanik.local");
    await page.goto("/student/assignments");
    await expect(page.getByTestId("assignment-list")).toContainText(assignmentTitle, {
      timeout: 15_000,
    });
    const assignmentItem = page.getByRole("listitem").filter({ hasText: assignmentTitle });
    const resultButton = assignmentItem.getByRole("button", { name: "Sonuç Gir" });
    if (await resultButton.isVisible()) {
      await resultButton.click();
      const resultModal = page.locator(".modal-panel").filter({ hasText: "Sonucu gir" });
      await expect(resultModal).toBeVisible({ timeout: 15_000 });
      const inputs = resultModal.locator("input");
      await inputs.nth(0).fill("18");
      await inputs.nth(1).fill("4");
      await inputs.nth(2).fill("2");
      await resultModal.getByRole("button", { name: "Sonucu Kaydet" }).click();
    } else {
      await assignmentItem.getByRole("button", { name: "Tamamla" }).click();
    }
    await expect(page.getByRole("listitem").filter({ hasText: assignmentTitle })).toContainText(
      "(Tamamlandı)",
      { timeout: 15_000 },
    );

    await login(page, "parent@uyanik.local");
    await expect(page.getByTestId("parent-summary")).toContainText(/Tamamlanan: [1-9]/, {
      timeout: 15_000,
    });
  });
  test("koc konu takibi kaynaklar ve yillik cizelge ile acilir", async ({ page }) => {
    await login(page, "coach@uyanik.local");
    await page.goto("/coach/topics");
    await expect(page.getByRole("heading", { name: "Konu Takibi", level: 1 })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("heading", { name: "Net Kaybı Haritası" })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("heading", { name: "Öğrencinin Yanlış Defteri" })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("heading", { name: "Hata Frekansı" })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("heading", { name: "Soru Takibi" })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("complementary").filter({ hasText: "Dersler" })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("button", { name: "Ödev ata" }).first()).toBeVisible({ timeout: 20_000 });
  });

  test("ogrenci kaynak katalogu books_clean verisini kullanir", async ({ page }) => {
    await login(page, "student@uyanik.local");
    await page.goto("/student/assignments");
    await expect(page.getByText("Kaynaklarım")).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: "Katalogdan ekle" }).click();
    await expect(page.getByText("Türkiye geneli bilinen yayınevi kitapları")).toContainText("9108 kaynak", { timeout: 20_000 });
    await page.getByPlaceholder("Kitap veya yayınevi ara...").fill("ZORU 7 BANKASI");
    await expect(page.locator(".modal-body")).toContainText("ZORU 7 BANKASI", { timeout: 20_000 });
  });
});
