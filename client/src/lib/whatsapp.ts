import type { CheckoutCustomer } from "./api";
import type { CartLine } from "./cart";
import { cartTotals } from "./cart";
import { resolveImageUrl } from "./images";
import { formatInr } from "./money";

export function whatsappHref(phoneDigits: string, text: string) {
  const p = String(phoneDigits || "").replace(/\D/g, "");
  if (!p) return null;
  return `https://wa.me/${p}?text=${encodeURIComponent(text)}`;
}

function linesDraftBlock(lines: CartLine[]) {
  let b = "";
  let n = 1;
  for (const l of lines) {
    const img = resolveImageUrl(l.product.images?.[0] ?? "");
    b += `${n}. ${l.product.name}\n`;
    b += `   Size ${l.size} × ${l.qty} — ${formatInr(l.product.priceInr * l.qty)}\n`;
    if (img) b += `   Image: ${img}\n`;
    n += 1;
  }
  const tot = cartTotals(lines);
  b += `\nSubtotal on site: ${formatInr(tot.total)} (${formatInr(tot.mrp)} MRP, save ${formatInr(
    tot.savings
  )})`;
  return b.trimEnd();
}

/** Message for placing an order from the shopping bag without web checkout. */
export function buildCartWhatsAppDraft(lines: CartLine[]) {
  let t =
    "Hi Aarnika team — I'd like to place this order via WhatsApp. Please confirm availability and shipping.\n\n";
  t += linesDraftBlock(lines);
  return t;
}

/** Checkout screen: send address + basket as a WhatsApp-first order request. */
export function buildCheckoutWhatsDraft(
  customer: CheckoutCustomer,
  lines: CartLine[],
  method: string
) {
  let t =
    "Hi Aarnika — please process my order.\nPreferred payment / channel: I'll confirm on chat.\n\n";
  t += "*Shipping*\n";
  t += `${customer.firstName} ${customer.lastName}\n`;
  t += `${customer.phone}\n${customer.email}\n`;
  t += `${customer.address}`;
  if (customer.landmark) t += `\nNear ${customer.landmark}`;
  t += `\n${customer.city}${customer.state ? `, ${customer.state}` : ""} — ${customer.pin}\n`;
  t += `\n*Bag*\nSuggested web pathway · ${method}\n`;
  t += `\n${linesDraftBlock(lines)}`;
  return t;
}
