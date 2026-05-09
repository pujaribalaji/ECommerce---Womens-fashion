import type { Product } from "./api";

export type CartLine = {
  product: Pick<Product, "_id" | "name" | "slug" | "images" | "priceInr" | "mrpInr">;
  /** Must match variant size from the catalogue. */
  size: string;
  qty: number;
};

const KEY = "aarnika.cart.v1";

function read(): CartLine[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(lines: CartLine[]) {
  localStorage.setItem(KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event("aarnika-cart"));
}

export function getCart() {
  return read();
}

export function addToCart(product: CartLine["product"], size: string, qty = 1) {
  const lines = read();
  const idx = lines.findIndex((l) => l.product._id === product._id && l.size === size);
  if (idx >= 0) lines[idx] = { ...lines[idx], qty: lines[idx].qty + qty };
  else lines.push({ product, size, qty });
  write(lines);
}

export function setQty(productId: string, size: string, qty: number) {
  const lines = read()
    .map((l) => (l.product._id === productId && l.size === size ? { ...l, qty } : l))
    .filter((l) => l.qty > 0);
  write(lines);
}

export function clearCart() {
  write([]);
}

export function cartTotals(lines: CartLine[]) {
  const mrp = lines.reduce((sum, l) => sum + l.product.mrpInr * l.qty, 0);
  const total = lines.reduce((sum, l) => sum + l.product.priceInr * l.qty, 0);
  return { mrp, total, savings: Math.max(0, mrp - total) };
}

