# Mojo Pasión

Tienda online de mojo rojo palmero artesanal. Receta familiar de La Palma. Lanzada 28 mayo 2026. Founder solo: Samuel Rodríguez (Product Designer / UX specialist, NO developer).

## Stack

- **Frontend**: Astro 6 + Tailwind CSS
- **Backend**: Supabase (waitlist, futuras features)
- **Pagos**: Stripe (live)
- **Hosting**: Vercel
- **DNS**: DonDominio
- **Email**: hola@mojopasion.com (DonDominio Mail)
- **Analytics**: GA4 (G-4K3BK6E95M) + Meta Pixel
- **Dominio**: mojopasion.com (sin www como canónico — pendiente de unificar)

## Estructura del repo

- `/src/pages` → páginas (max 300 líneas — si se aproxima, proponer split)
- `/src/components` → componentes Astro reutilizables (Header, Footer, ProductCard, CookieConsent)
- `/src/lib` → módulos JS/TS con lógica de negocio (cart.ts ya existe)
- `/src/styles` → estilos globales
- `/public` → assets estáticos

## Workflow obligatorio

1. **Branch nueva SIEMPRE** antes de cualquier cambio: `git checkout -b <branch>`
2. **QA pre-commit**: TS build OK, sin console.logs, sin imports sin usar, sin referencias huérfanas
3. **Conventional commits**: `feat:`, `fix:`, `refactor:`, `chore:`, etc.
4. **`gh pr create` directamente** (no solo link)
5. **Reportar siempre**: commit hash + URL del PR + lista de archivos tocados
6. **Verificar fuente de verdad** (GitHub, localStorage, DOM) antes de cambiar — no fiarse del reporte verbal
7. **Cuando algo funciona en local pero falla en deploy**: primer sospechoso son las **env vars por entorno** (Production vs Preview en Vercel)

## Reglas de modificación

- **Decisiones validadas en sesión previa NO se tocan** sin confirmación explícita del founder
- **NO mezclar bug fixes con features** en el mismo PR — siempre PRs separados
- Si un cambio "rebota" en otra área del código no esperada, **PARAR y reportar** antes de seguir
- Cuando dudes, **preguntar antes de improvisar**

## Convenciones técnicas

### Componentes existentes (reutilizar SIEMPRE)
- `<Header />` con props: `showCart`, `showCta`, `transparentOnTop`
- `<Footer />` con prop: `variant="full" | "minimal"`
- `<ProductCard />` para productos
- `<CookieConsent />` ya en todas las páginas

### Patrones obligatorios
- **Cookie consent opt-in limpio**: GA4 y Meta Pixel solo se cargan si el usuario acepta
- **Detección de GA4 cargado**: usar `window._gaLoaded` (no `typeof gtag` — el stub siempre existe)
- **Bfcache safe**: cualquier botón que cambia su estado al clicar debe tener listener `pageshow` con `event.persisted` para resetear
- **Manejo de errores en operaciones críticas**: envolver en `try/catch` (especialmente `localStorage.setItem` que puede fallar en Safari estricto)
- **Touch targets mobile**: mínimo 44×44 CSS px (usar `::after` invisible si visualmente debe ser menor)
- **Formularios sin disabled por validación**: el CTA siempre clicable, validar al clic con scroll + shake + mensaje inline
- **Disabled SOLO durante loading**: el botón se pone disabled durante fetch para prevenir doble clic
- **Schema JSON-LD para productos**: validar siempre con https://validator.schema.org/

### Accesibilidad
- `aria-invalid="true"` en campos con error
- `aria-live="polite"` en mensajes de error
- Contraste WCAG AA mínimo (4.5:1 texto normal, 3:1 texto grande)
- Sin colores menores a #777 para texto sobre fondos oscuros (#0a0a0a)

## Identidad de marca

### Paleta
- Negro principal: `#111111`
- Mojo rojo (CTA, énfasis): `#E8002D`
- Crema (acentos cálidos): `#F5EDD8`
- Madera (elementos secundarios): `#5C3D1E`

### Tipografía
- Headings: Cormorant Garamond (serif elegante)
- Body / CTAs: DM Sans (sans humanista)

### Copy
- Tagline: **"No es para todo el mundo. Es para ti."**
- Voz: cercana, artesanal, sin grandilocuencia
- Referencias visuales: Burlap & Barrel, Daphnis and Chloe (premium artesanal, origen como lujo)

## Datos legales y comerciales

- **Dirección**: Calle Manuel Bello Ramos, 74, 38670 Adeje, Santa Cruz de Tenerife
- **Email**: hola@mojopasion.com
- **Envío**: solo Canarias (NO península)
  - Tenerife: 5€
  - Resto Canarias: 8,50€
- **Devoluciones**: 14 días desde recepción, cliente paga envío de vuelta, solo tarros sellados al vacío
- **Páginas legales**: `/privacidad`, `/aviso-legal`, `/devoluciones`

## Anti-patrones (NO hacer)

- ⛔ Monolitos: si un archivo `.astro` supera 500 líneas, **PARAR y proponer split** antes de seguir
- ⛔ Inventar datos para Schema (reseñas, valoraciones falsas → penalización Google)
- ⛔ Disabled en CTA por validación incompleta (mala UX según NN/g y Adam Silver)
- ⛔ Mezclar bug fix con feature en el mismo PR
- ⛔ Tocar código validado en sesión previa sin confirmación explícita
- ⛔ Usar `typeof gtag === 'function'` para detectar GA4 cargado (gtag es stub, siempre existe)
- ⛔ Setear flags como `redirected = true` antes de operaciones que pueden fallar
- ⛔ Generar archivos descargables para pasarle prompts (siempre code blocks en chat)
- ⛔ Modificar el sitemap apuntando a www si el canónico es sin-www (o viceversa)

## Comunicación con el founder

- **Idioma**: español
- **Tono**: ejecutivo, conciso, listas por línea (no prosa larga)
- **Estructura**: hallazgos primero, justificación después si se pide
- **Push-back honesto**: si una decisión parece subóptima, decirlo antes de ejecutar
- **Reporte final**: commit hash + URL del PR + archivos tocados + nota de QA hecho

## Tareas pendientes documentadas (backlog)

- Refactor `checkout.astro` (~1000 líneas) cuando llegue V1.5 (suscripción mensual / welcome kit)
- Sistema de reseñas reales (para Schema `aggregateRating` + `review`)
- Excluir `/checkout` y `/gracias` del sitemap + `noindex`
- Decisión canónico `www` vs sin-www + ajuste `astro.config.mjs` y Vercel
- Auditoría performance Lighthouse + fix fonts preload warnings
- Consent Mode v2 (solo si conectas Google Ads)
- Formspree para "Contacto" + migración mailto HORECA
- Mensaje al usuario si localStorage está bloqueado (caso edge Safari estricto)
- Manejo de error visible en botón "Pago seguro" si Stripe falla
