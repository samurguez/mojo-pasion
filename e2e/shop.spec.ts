import { test, expect } from '@playwright/test';

// Claves y valores exactos según el código fuente:
//   localStorage key  → 'mojo-cart-v1'        (cart.ts:9)
//   priceDisplay      → '12,95 €'              (tienda-config.ts, con espacio antes de €)
//   nombres           → 'Mojo rojo suave' / 'Mojo rojo picante'
//
// El botón "Añadir" redirige a /checkout inmediatamente tras añadir al carrito
// cuando GA no está cargado (_gaLoaded === false en contexto de test).
// Los tests que validan localStorage lo leen en /checkout (mismo origen).

test.describe('Tienda / Carrito', () => {
  // Playwright crea un browserContext fresco por test → localStorage limpio sin setup extra.

  test('muestra los 2 productos con precios correctos', async ({ page }) => {
    await page.goto('/tienda');

    const cards = page.getByTestId('product-card');
    await expect(cards).toHaveCount(2);

    await expect(cards.nth(0).getByRole('heading', { level: 2 })).toHaveText('Mojo rojo suave');
    await expect(cards.nth(1).getByRole('heading', { level: 2 })).toHaveText('Mojo rojo picante');

    // El precio va embebido en el botón: "Añadir · 12,95 €"
    await expect(cards.nth(0).getByTestId('add-to-cart-btn')).toContainText('12,95 €');
    await expect(cards.nth(1).getByTestId('add-to-cart-btn')).toContainText('12,95 €');

    await expect(cards.nth(0).getByRole('img')).toBeVisible();
    await expect(cards.nth(1).getByRole('img')).toBeVisible();
  });

  test('añadir al carrito actualiza localStorage', async ({ page }) => {
    await page.goto('/tienda');

    // El click añade el item y redirige síncronamente a /checkout
    await page.getByTestId('add-to-cart-btn').first().click();
    await page.waitForURL('**/checkout');

    const rawCart = await page.evaluate(() => localStorage.getItem('mojo-cart-v1'));
    expect(rawCart).not.toBeNull();

    const cart = JSON.parse(rawCart!) as Array<{
      priceId: string;
      name: string;
      priceInCents: number;
      priceDisplay: string;
      quantity: number;
    }>;

    expect(cart).toHaveLength(1);
    expect(cart[0]).toMatchObject({
      name: 'Mojo rojo suave',
      priceInCents: 1295,
      priceDisplay: '12,95 €',
      quantity: 1,
    });
  });

  test('añadir 2 productos diferentes acumula en carrito', async ({ page }) => {
    await page.goto('/tienda');

    // Primer producto → redirige a /checkout
    await page.getByTestId('add-to-cart-btn').first().click();
    await page.waitForURL('**/checkout');

    // Volver a tienda y añadir el segundo
    await page.goto('/tienda');
    await page.getByTestId('add-to-cart-btn').last().click();
    await page.waitForURL('**/checkout');

    const rawCart = await page.evaluate(() => localStorage.getItem('mojo-cart-v1'));
    const cart = JSON.parse(rawCart!) as Array<{ name: string; quantity: number }>;

    expect(cart).toHaveLength(2);
    expect(cart[0].name).toBe('Mojo rojo suave');
    expect(cart[1].name).toBe('Mojo rojo picante');
  });
});
