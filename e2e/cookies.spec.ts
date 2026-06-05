import { test, expect } from '@playwright/test';

// Playwright crea un browserContext fresco por test → localStorage limpio sin setup extra.
//
// Nota sobre window._gaLoaded: el componente lo inicializa a `false` (no `undefined`)
// con `var _gaLoaded = false` en un script no-módulo, por lo que la comprobación
// "no cargado" usa !== true para cubrir ambos estados.

test.describe('Cookie Consent', () => {
  test('banner aparece en primera visita sin localStorage previo', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('cookie-banner')).toBeVisible();

    const gaLoaded = await page.evaluate(() => (window as any)._gaLoaded);
    expect(gaLoaded).not.toBe(true);
  });

  test('aceptar cookies carga GA4 y oculta banner', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('cookie-banner')).toBeVisible();
    await page.getByTestId('cookie-accept').click();

    await expect(page.getByTestId('cookie-banner')).not.toBeVisible();

    // _gaLoaded se pone a true síncronamente en loadGA(), antes del fetch del script
    await page.waitForFunction(() => (window as any)._gaLoaded === true, { timeout: 10_000 });

    const stored = await page.evaluate(() => localStorage.getItem('mojo-cookies'));
    expect(stored).toBe('accepted');
  });

  test('rechazar cookies NO carga GA4 y oculta banner', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('cookie-banner')).toBeVisible();
    await page.getByTestId('cookie-reject').click();

    await expect(page.getByTestId('cookie-banner')).not.toBeVisible();

    const gaLoaded = await page.evaluate(() => (window as any)._gaLoaded);
    expect(gaLoaded).not.toBe(true);

    const stored = await page.evaluate(() => localStorage.getItem('mojo-cookies'));
    expect(stored).toBe('rejected');
  });
});
