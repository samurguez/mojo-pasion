import { test, expect } from '@playwright/test';

// Textos exactos según el código fuente:
//   /devoluciones usa separador '|' (no '—') y 'd' minúscula
const LEGAL_PAGES = [
  {
    url: '/privacidad',
    title: 'Política de Privacidad',
    heading: 'Política de Privacidad',
  },
  {
    url: '/aviso-legal',
    title: 'Aviso Legal',
    heading: 'Aviso Legal',
  },
  {
    url: '/devoluciones',
    title: 'Política de devoluciones',
    heading: 'Política de devoluciones',
  },
];

for (const legalPage of LEGAL_PAGES) {
  test(`${legalPage.url} carga correctamente`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    const response = await page.goto(legalPage.url);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(new RegExp(legalPage.title, 'i'));
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(legalPage.heading);

    expect(
      consoleErrors,
      `Errores de consola en ${legalPage.url}: ${consoleErrors.join(' | ')}`
    ).toHaveLength(0);
  });
}
