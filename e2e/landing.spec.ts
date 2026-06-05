import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('carga la home con título correcto', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Mojo Pasión/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('tiene schema.org Product en HTML', async ({ page }) => {
    await page.goto('/');

    const schemas = await page.evaluate(() =>
      Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(
        s => JSON.parse(s.textContent ?? '{}')
      )
    );

    const withGraph = schemas.find((s: Record<string, unknown>) => Array.isArray(s['@graph']));
    expect(withGraph, 'No se encontró ningún schema con @graph').toBeTruthy();

    const graph = withGraph['@graph'] as Record<string, unknown>[];

    const itemList = graph.find(node => node['@type'] === 'ItemList') as
      | { itemListElement: { item: Record<string, unknown> }[] }
      | undefined;
    expect(itemList, 'ItemList no encontrado en @graph').toBeTruthy();

    const products = itemList!.itemListElement.map(el => el.item);
    expect(products).toHaveLength(2);

    for (const product of products) {
      expect(product['@type']).toBe('Product');
      expect(product['name']).toBeTruthy();
      expect(product['image']).toBeTruthy();
      const offers = product['offers'] as Record<string, unknown> | undefined;
      expect(offers, `Product "${product['name']}" no tiene offers`).toBeTruthy();
      expect(offers!['price']).toBeTruthy();
    }
  });

  test('muestra CTA a /tienda en hero', async ({ page }) => {
    await page.goto('/');

    // El header también tiene un link "Comprar" — acotamos al hero para evitar modo estricto
    const cta = page.locator('section.hero').getByRole('link', { name: 'Comprar' });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/tienda');
  });
});
