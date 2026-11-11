import { expect, test } from "@playwright/test";

test.describe("Landing page", () => {
  test("affiche le hero et les sections principales", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Signez vos documents simplement, rapidement et gratuitement.");
    await expect(page.getByRole("heading", { name: "Fonctionnalités" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Comment ça marche" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Gratuit dans sa première version/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Confidentialité" })).toBeVisible();
  });

  test("la navigation principale mène à la FAQ", async ({ page, isMobile }) => {
    await page.goto("/");
    if (isMobile) await page.getByRole("button", { name: "Ouvrir le menu" }).click();
    await page.getByRole("link", { name: "FAQ", exact: true }).first().click();
    await expect(page).toHaveURL(/\/faq$/);
    await expect(page.getByRole("heading", { name: "Foire aux questions" })).toBeVisible();
  });

  test("n'a pas de défilement horizontal", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
  });
});

test.describe("Responsive mobile", () => {
  test("le menu mobile s'ouvre et affiche les actions", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Projet mobile uniquement");
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Navigation principale" })).toBeHidden();
    await page.getByRole("button", { name: "Ouvrir le menu" }).click();
    await expect(page.getByRole("link", { name: "Se connecter" })).toBeVisible();
  });
});

test.describe("Authentification (interfaces)", () => {
  for (const [path, heading] of [
    ["/login", "Connexion"],
    ["/register", "Créer un compte"],
    ["/forgot-password", "Mot de passe oublié"],
    ["/verify-email", "Vérification de l'email"],
  ] as const) {
    test(`affiche ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByText(heading, { exact: true }).first()).toBeVisible();
    });
  }

  test("valide le formulaire d'inscription côté client", async ({ page }) => {
    await page.goto("/register");
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page.getByText("Le nom doit contenir au moins 2 caractères.")).toBeVisible();
    await expect(page.getByText("Adresse email invalide.").or(page.getByText("L'adresse email est obligatoire."))).toBeVisible();

    await page.getByLabel("Nom complet").fill("Jean Dupont");
    await page.getByLabel("Adresse email").fill("jean@example.com");
    await page.getByLabel("Mot de passe", { exact: true }).fill("Motdepasse123");
    await page.getByLabel("Confirmer le mot de passe").fill("Different123");
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page.getByText("Les mots de passe ne correspondent pas.")).toBeVisible();
    await expect(page).toHaveURL(/\/register/);
  });
});

test.describe("Accès protégé et dashboards", () => {
  test("le dashboard redirige un visiteur anonyme vers la connexion", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("l'administration redirige un visiteur anonyme vers la connexion", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("la connexion refuse de mauvais identifiants", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Adresse email").fill("inconnu@example.test");
    await page.getByLabel("Mot de passe").fill("Mauvais12345");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.locator('[role="alert"]:not(#__next-route-announcer__)')).toContainText("incorrect");
  });

  test("inscription, dashboard vide honnête, refus admin, déconnexion", async ({ page }) => {
    const email = `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.test`;
    await page.goto("/register");
    await page.getByLabel("Nom complet").fill("Utilisateur E2E");
    await page.getByLabel("Adresse email").fill(email);
    await page.getByLabel("Mot de passe", { exact: true }).fill("Motdepasse123");
    await page.getByLabel("Confirmer le mot de passe").fill("Motdepasse123");
    await page.getByRole("button", { name: "Créer mon compte" }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: "Vue générale" })).toBeVisible();
    for (const label of ["Documents importés", "Documents signés", "Documents en attente", "Demandes envoyées"]) {
      await expect(page.getByRole("main").getByText(label, { exact: true })).toBeVisible();
    }
    await expect(page.getByText("Aucun document pour le moment")).toBeVisible();

    // Sans rôle admin, l'administration renvoie vers le dashboard.
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/dashboard/);

    await page.getByRole("button", { name: "Se déconnecter" }).click();
    await expect(page).toHaveURL(/\/login/);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});

test("l'API de santé répond sans secret", async ({ request }) => {
  const res = await request.get("/api/health");
  expect([200, 503]).toContain(res.status());
  const body = await res.json();
  expect(body.application).toBe("SignFlow");
  expect(JSON.stringify(body)).not.toMatch(/secret|token|key/i);
});
