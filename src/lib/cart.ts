export interface CartItem {
  priceId: string;
  name: string;
  priceInCents: number;
  priceDisplay: string;
  quantity: number;
}

const KEY = 'mojo-cart-v1';

function write(items: CartItem[]): void {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('cart:update', { detail: { items } }));
}

export function get(): CartItem[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') as CartItem[]; }
  catch { return []; }
}

export function count(): number {
  return get().reduce((s, i) => s + i.quantity, 0);
}

export function add(item: Omit<CartItem, 'quantity'>): void {
  const items = get();
  const idx = items.findIndex(i => i.priceId === item.priceId);
  if (idx >= 0) { items[idx].quantity += 1; }
  else { items.push({ ...item, quantity: 1 }); }
  write(items);
}

export function updateQty(priceId: string, qty: number): void {
  if (qty < 1) { remove(priceId); return; }
  const items = get();
  const idx = items.findIndex(i => i.priceId === priceId);
  if (idx >= 0) { items[idx].quantity = qty; write(items); }
}

export function remove(priceId: string): void {
  write(get().filter(i => i.priceId !== priceId));
}

export function clear(): void {
  write([]);
}

export function setAll(items: CartItem[]): void {
  write(items);
}

declare global {
  interface Window {
    Cart: {
      get: typeof get;
      count: typeof count;
      add: typeof add;
      updateQty: typeof updateQty;
      remove: typeof remove;
      clear: typeof clear;
      setAll: typeof setAll;
    };
  }
}
window.Cart = { get, count, add, updateQty, remove, clear, setAll };
