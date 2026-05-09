function digitsPhone(raw) {
  return String(raw || "").replace(/\D/g, "");
}

/** @param {{ orderNo: string; customer: any; lines: any[]; totals: any; status: string; payment: any }} order */
export function buildOwnerNotifyUrl(order) {
  const d = digitsPhone(process.env.OWNER_WHATSAPP);
  if (!d) return null;

  const c = order.customer;
  let body = `🛍️ *New Aarnika order*\n`;
  body += `Order: *${order.orderNo}*\n`;
  body += `Status: ${order.status}\n`;
  body += `Payment: ${order.payment?.provider ?? "?"}\n\n`;
  body += `*Customer*\n`;
  body += `${c.firstName} ${c.lastName}\n`;
  body += `${c.phone}\n${c.email}\n`;
  body += `\n*Ship to*\n${c.address}`;
  if (c.landmark) body += `\nNear: ${c.landmark}`;
  body += `\n${c.city}${c.state ? `, ${c.state}` : ""} ${c.pin}\n`;
  body += `\n*Items*\n`;

  for (const l of order.lines) {
    body += `\n• ${l.name}\n`;
    body += `  Size ${l.size} × ${l.qty} @ ₹${l.priceInr}\n`;
    if (l.imageUrl) body += `  📷 ${l.imageUrl}\n`;
  }

  body += `\n*Totals*\n`;
  body += `MRP ₹${order.totals.mrp} • Pay ₹${order.totals.total} (saved ₹${order.totals.savings})`;

  return `https://wa.me/${d}?text=${encodeURIComponent(body)}`;
}
