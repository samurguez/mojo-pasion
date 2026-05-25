// Solo este endpoint corre en servidor (Vercel serverless function).
// Todas las páginas del sitio siguen siendo estáticas.
export const prerender = false;

import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { PRODUCTS, SHIPPING_ZONES } from '../../lib/tienda-config';

interface CartItem {
  priceId: string;
  quantity: number;
}

interface CheckoutBody {
  items: CartItem[];
  deliveryMethod: 'shipping' | 'pickup';
  postalCode?: string;
  pickupPoint?: string;
  phone?: string;
}

// Tipo local para los line items: precio ya creado en Stripe | precio ad-hoc (envío)
type LineItem =
  | { price: string; quantity: number }
  | { price_data: { currency: string; product_data: { name: string }; unit_amount: number }; quantity: number };

const validPriceIds = new Set(PRODUCTS.map(p => p.priceId));

function calcCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    const product = PRODUCTS.find(p => p.priceId === item.priceId);
    return sum + (product?.priceInCents ?? 0) * item.quantity;
  }, 0);
}

function calcShipping(postalCode: string, cartTotal: number): { cost: number; ok: boolean } {
  const prefix = postalCode.slice(0, 2);
  if (prefix === SHIPPING_ZONES.tenerife.postalPrefix) {
    const z = SHIPPING_ZONES.tenerife;
    return { cost: cartTotal >= z.freeFromInCents ? 0 : z.costInCents, ok: true };
  }
  if (prefix === SHIPPING_ZONES.canarias.postalPrefix) {
    const z = SHIPPING_ZONES.canarias;
    return { cost: cartTotal >= z.freeFromInCents ? 0 : z.costInCents, ok: true };
  }
  return { cost: 0, ok: false };
}

export const POST: APIRoute = async ({ request }) => {
  const json = (body: object, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });

  const stripeKey = import.meta.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return json({ error: 'Stripe no configurado en el servidor' }, 500);

  let body: CheckoutBody;
  try {
    body = await request.json() as CheckoutBody;
  } catch {
    return json({ error: 'Payload inválido' }, 400);
  }

  const { items, deliveryMethod, postalCode, pickupPoint, phone } = body;

  if (!Array.isArray(items) || items.length === 0) return json({ error: 'Carrito vacío' }, 400);

  for (const item of items) {
    if (!validPriceIds.has(item.priceId) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 50) {
      return json({ error: 'Producto o cantidad inválida' }, 400);
    }
  }

  const cartTotal = calcCartTotal(items);
  let shippingCost = 0;

  if (deliveryMethod === 'shipping') {
    if (!postalCode || !/^\d{5}$/.test(postalCode)) {
      return json({ error: 'Código postal inválido' }, 400);
    }
    const { cost, ok } = calcShipping(postalCode, cartTotal);
    if (!ok) return json({ error: 'Zona fuera de cobertura en V1' }, 400);
    shippingCost = cost;
  } else if (deliveryMethod === 'pickup') {
    if (!pickupPoint) return json({ error: 'Punto de recogida requerido' }, 400);
    if (!phone?.trim()) return json({ error: 'Teléfono requerido para recogida' }, 400);
  } else {
    return json({ error: 'Método de entrega inválido' }, 400);
  }

  const stripe = new Stripe(stripeKey);

  const lineItems: LineItem[] = items.map(item => ({
    price: item.priceId,
    quantity: item.quantity,
  }));

  // El coste de envío va como línea adicional (Stripe no calcula la lógica "gratis por zona")
  if (shippingCost > 0) {
    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: { name: 'Gastos de envío' },
        unit_amount: shippingCost,
      },
      quantity: 1,
    });
  }

  // Deriva el origin del request para que funcione igual en local y en producción
  const origin = new URL(request.url).origin;

  // Construye el objeto completo de una vez — `as const` para los literales que Stripe tipifica estrictamente
  const sessionParams = {
    mode: 'payment' as const,
    line_items: lineItems,
    success_url: `${origin}/gracias?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout`,
    locale: 'es' as const,
    metadata: {
      delivery_method: deliveryMethod,
      ...(deliveryMethod === 'shipping' && postalCode ? { postal_code: postalCode } : {}),
      ...(deliveryMethod === 'pickup' && pickupPoint ? { pickup_point: pickupPoint } : {}),
      ...(phone ? { phone } : {}),
    },
    // Stripe recoge la dirección completa para envíos a domicilio
    // Nota: Hosted Checkout no permite pre-rellenar el CP automáticamente
    ...(deliveryMethod === 'shipping' ? {
      shipping_address_collection: { allowed_countries: ['ES' as const] },
      phone_number_collection: { enabled: true },
    } : {}),
  };

  try {
    const session = await stripe.checkout.sessions.create(sessionParams);
    return json({ url: session.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al crear la sesión de pago';
    return json({ error: msg }, 500);
  }
};
