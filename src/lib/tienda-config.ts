// === CONFIGURACIÓN EDITABLE DE LA TIENDA ===
// Modifica este archivo para cambiar precios, zonas de envío y puntos de recogida.
// No toques la lógica de las páginas.

import type { ImageMetadata } from 'astro';
import imgMojoSuave from '../assets/productos/mojo-suave.jpg';
import imgMojoPicante from '../assets/productos/mojo-picante.jpg';
import { BUSINESS } from '../data/business';

export interface ProductConfig {
  id: string;
  priceId: string;
  name: string;
  tagline: string;
  description: string;
  priceInCents: number;
  priceDisplay: string;
  image: ImageMetadata;
  imageAlt: string;
  badge: string | null;
}

export const PRODUCTS: ProductConfig[] = [
  {
    id: 'mojo-rojo-suave',
    priceId: import.meta.env.PRICE_ID_MOJO_SUAVE,
    name: 'Mojo rojo suave',
    tagline: '',
    description:
      'Pimienta de Puntagorda, sal marina de Fuencaliente, ajo del país, aceite de oliva y la receta de siempre. Hecho a mano en Canarias.',
    priceInCents: 1295,
    priceDisplay: '12,95 €',
    image: imgMojoSuave,
    imageAlt: 'Tarro de Mojo Pasión rojo suave artesano canario',
    badge: null,
  },
  {
    id: 'mojo-rojo-picante',
    priceId: import.meta.env.PRICE_ID_MOJO_PICANTE,
    name: 'Mojo rojo picante',
    tagline: '',
    description:
      'Pimienta de Puntagorda, sal marina de Fuencaliente, ajo del país, aceite de oliva y la receta de siempre, pero con ese toque de picante. Hecho a mano en Canarias.',
    priceInCents: 1295,
    priceDisplay: '12,95 €',
    image: imgMojoPicante,
    imageAlt: 'Tarro de Mojo Pasión rojo picante artesano canario',
    badge: null,
  },
];

// Zonas de envío — solo Canarias en V1
export const SHIPPING_ZONES = {
  tenerife: {
    label: BUSINESS.shipping.zones.tenerife.name,
    postalPrefix: BUSINESS.shipping.zones.tenerife.postalCodePrefix[0],
    costInCents: BUSINESS.shipping.zones.tenerife.costCents,
    freeFromInCents: BUSINESS.shipping.zones.tenerife.freeFromCents,
  },
  canarias: {
    label: BUSINESS.shipping.zones.canarias.name,
    postalPrefix: BUSINESS.shipping.zones.canarias.postalCodePrefix[0],
    costInCents: BUSINESS.shipping.zones.canarias.costCents,
    freeFromInCents: BUSINESS.shipping.zones.canarias.freeFromCents,
  },
};

// Puntos de recogida — solo Tenerife en V1
export const PICKUP_POINTS = [
  { id: 'zona-sur', label: 'Zona sur (Adeje)' },
  { id: 'zona-norte', label: 'Zona norte (Santa Cruz/La Laguna)' },
];

export type ShippingZoneKey = keyof typeof SHIPPING_ZONES;
