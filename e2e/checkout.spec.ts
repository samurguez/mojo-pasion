import { test, expect } from '@playwright/test';

// Valores exactos según el código fuente:
//   fmtEur(500)  → '5,00 €'   (envío Tenerife)
//   fmtEur(1295) → '12,95 €'  (1 unidad Mojo rojo suave)
//   fmtEur(1795) → '17,95 €'  (subtotal + envío)
//
// El botón "Pago seguro" NO se deshabilita con CP inválido: bloquea en el
// handler del click y muestra un field-error-msg dinámico (#err-postal-code).
//
// beforeEach usa el flujo real de /tienda para pre-cargar el carrito con
// el priceId correcto (inyectado server-side desde .env).

test.describe('Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tienda');
    await page.getByTestId('add-to-cart-btn').first().click();
    await page.waitForURL('**/checkout');
    // La página está en 'load'; DOMContentLoaded ya ha disparado initQtys()
  });

  test('muestra los productos añadidos previamente al carrito', async ({ page }) => {
    // Esperar a que renderQtys() escriba el subtotal
    await expect(page.getByTestId('checkout-subtotal')).toHaveText('12,95 €');

    const rows = page.getByTestId('checkout-product-row');
    await expect(rows).toHaveCount(2); // ambas filas siempre presentes

    // Primera fila = Mojo rojo suave (orden del array PRODUCTS)
    const firstRow = rows.first();
    await expect(firstRow.getByTestId('checkout-product-name')).toHaveText('Mojo rojo suave');
    await expect(firstRow.getByTestId('checkout-product-qty')).toHaveText('1');
    await expect(firstRow.getByTestId('checkout-product-total')).toHaveText('12,95 €');

    // Segunda fila = Mojo rojo picante, qty 0, total —
    const secondRow = rows.last();
    await expect(secondRow.getByTestId('checkout-product-qty')).toHaveText('0');
    await expect(secondRow.getByTestId('checkout-product-total')).toHaveText('—');
  });

  test('CP fuera de zona muestra error y bloquea el pago', async ({ page }) => {
    await page.getByTestId('checkout-postal-code').fill('08001');

    // validateCP fires on input when length === 5
    const zoneMsg = page.getByTestId('checkout-zone-message');
    await expect(zoneMsg).toBeVisible();
    await expect(zoneMsg).toContainText('solo enviamos a Canarias');

    // Click "Pago seguro" → validación bloquea (currentZone === null)
    await page.getByTestId('checkout-submit-btn').click();

    // Field error dinámico junto al input de CP
    await expect(page.locator('#err-postal-code')).toBeVisible();
    await expect(page.locator('#err-postal-code')).toContainText('no tiene envío disponible');

    // URL sigue en /checkout — no hubo redirección a Stripe
    expect(page.url()).toContain('/checkout');
  });

  test('CP de Tenerife (38001) calcula envío correcto', async ({ page }) => {
    await page.getByTestId('checkout-postal-code').fill('38001');

    await expect(page.getByTestId('checkout-zone-message')).toContainText('envío disponible');

    // Coste en la opción de entrega: fmtEur(500) → "5,00 €"
    await expect(page.getByTestId('checkout-shipping-cost')).toHaveText('5,00 €');

    // Total del resumen: fmtEur(1295 + 500) → "17,95 €"
    await expect(page.getByTestId('checkout-total')).toHaveText('17,95 €');
  });

  test('click Pago seguro redirige a Stripe Hosted Checkout', async ({ page }) => {
    await page.getByTestId('checkout-postal-code').fill('38001');
    await expect(page.getByTestId('checkout-zone-message')).toContainText('envío disponible');

    await page.getByTestId('checkout-submit-btn').click();

    // El fetch a /api/checkout crea una sesión Stripe test mode (~1-3 s)
    // y luego window.location.href = session.url navega a checkout.stripe.com
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 30_000 });
    expect(page.url()).toContain('checkout.stripe.com');
  });
});
