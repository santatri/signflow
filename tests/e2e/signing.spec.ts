import path from "node:path";
import { expect, test } from "@playwright/test";

const SAMPLE = path.join(__dirname, "fixtures", "sample.pdf");

test("un visiteur importe un PDF, le signe et le télécharge", async ({ page, isMobile }) => {
  test.skip(isMobile, "Le glisser-placer précis est validé sur desktop ; le mobile est couvert par le test de mise en page.");

  await page.goto("/editor/new");
  await page.setInputFiles('input[type="file"]', SAMPLE);
  await page.waitForURL(/\/editor\/[0-9a-f-]{36}/);
  await expect(page.locator('canvas[aria-label^="Page"]')).toHaveCount(2);

  await page.getByRole("button", { name: "Créer ma signature" }).click();
  const pad = page.getByLabel("Zone de dessin de la signature");
  const box = (await pad.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.15, box.y + box.height * 0.6);
  await page.mouse.down();
  for (let i = 0; i <= 20; i++) {
    await page.mouse.move(box.x + box.width * (0.15 + i * 0.035), box.y + box.height * (0.5 + 0.25 * Math.sin(i / 2)));
  }
  await page.mouse.up();
  await page.getByRole("button", { name: "Utiliser cette signature" }).click();

  const first = (await page.locator('[data-page="1"]').boundingBox())!;
  await page.mouse.click(first.x + first.width * 0.6, first.y + first.height * 0.2);
  await expect(page.getByRole("group", { name: "Signature, page 1" })).toBeVisible();

  await page.getByRole("button", { name: /Signer le document/ }).click();
  await expect(page.getByRole("status").filter({ hasText: "Document signé" })).toBeVisible();

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: /Télécharger le PDF signé/ }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("sample-signe.pdf");
});

test("un fichier qui n'est pas un PDF est refusé", async ({ page }) => {
  await page.goto("/editor/new");
  await page.setInputFiles('input[type="file"]', { name: "faux.pdf", mimeType: "application/pdf", buffer: Buffer.from("pas un pdf") });
  await expect(page.locator('[role="alert"]:not(#__next-route-announcer__)')).toContainText("PDF");
});

test("un document d'un autre visiteur est introuvable", async ({ page }) => {
  const response = await page.request.get("/api/documents/00000000-0000-4000-8000-000000000000/file");
  expect(response.status()).toBe(404);
});
