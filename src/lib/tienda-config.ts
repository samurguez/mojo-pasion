// === CONFIGURACIÓN EDITABLE DE LA TIENDA ===
// Modifica este archivo para cambiar precios, zonas de envío y puntos de recogida.
// No toques la lógica de las páginas.

export interface ProductConfig {
  id: string;
  priceId: string;
  name: string;
  tagline: string;
  description: string;
  priceInCents: number;
  priceDisplay: string;
  image: string;
  imageAlt: string;
  badge: string | null;
}

export const PRODUCTS: ProductConfig[] = [
  {
    id: 'mojo-rojo-suave',
    priceId: import.meta.env.PRICE_ID_MOJO_SUAVE,
    name: 'Mojo rojo suave',
    tagline: 'El sabor auténtico palmero, sin picante.',
    description:
      'Pimienta de Puntagorda, sal marina de Fuencaliente, ajo del país, aceite de oliva y la receta de siempre. Hecho a mano en Canarias.',
    priceInCents: 1295,
    priceDisplay: '12,95 €',
    image: '/images/hero.avif',
    imageAlt: 'Tarro de Mojo Pasión rojo suave artesano canario',
    badge: null,
  },
  {
    id: 'mojo-rojo-picante',
    priceId: import.meta.env.PRICE_ID_MOJO_PICANTE,
    name: 'Mojo rojo picante',
    tagline: 'Para los que saben lo que quieren.',
    description:
      'La misma receta artesana, con el punto de picante que pide la pimienta palmera de verdad.',
    priceInCents: 1295,
    priceDisplay: '12,95 €',
    image: '/images/pimienta.avif',
    imageAlt: 'Tarro de Mojo Pasión rojo picante artesano canario',
    badge: 'Picante',
  },
];

// Zonas de envío — solo Canarias en V1
export const SHIPPING_ZONES = {
  tenerife: {
    label: 'Tenerife',
    postalPrefix: '38',
    costInCents: 500,       // 5,00 €
    freeFromInCents: 2500,  // Gratis a partir de 25,00 €
  },
  canarias: {
    label: 'Resto de Canarias',
    postalPrefix: '35',
    costInCents: 850,       // 8,50 €
    freeFromInCents: 3800,  // Gratis a partir de 38,00 €
  },
};

// Puntos de recogida — solo Tenerife en V1
export const PICKUP_POINTS = [
  { id: 'adeje', label: 'Adeje' },
  { id: 'la-esperanza', label: 'La Esperanza' },
];

export type ShippingZoneKey = keyof typeof SHIPPING_ZONES;
