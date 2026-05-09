import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/Button";
import { Container } from "../components/Container";
import { cartTotals, clearCart, getCart, setQty, type CartLine } from "../lib/cart";
import { formatInr } from "../lib/money";
import { resolveImageUrl } from "../lib/images";
import { fetchPublicContact } from "../lib/api";
import { buildCartWhatsAppDraft, whatsappHref } from "../lib/whatsapp";

export default function Cart() {
  const [lines, setLines] = useState<CartLine[]>(() => getCart());
  const [ownerWa, setOwnerWa] = useState<string | null>(null);

  useEffect(() => {
    const on = () => setLines(getCart());
    window.addEventListener("aarnika-cart", on);
    return () => window.removeEventListener("aarnika-cart", on);
  }, []);

  useEffect(() => {
    let ok = true;
    fetchPublicContact()
      .then((c) => {
        if (!ok) return;
        setOwnerWa(c.ownerWhatsAppDigits);
      })
      .catch(() => {});
    return () => {
      ok = false;
    };
  }, []);

  const totals = useMemo(() => cartTotals(lines), [lines]);
  const bagWhatsHref =
    ownerWa && lines.length > 0 ? whatsappHref(ownerWa, buildCartWhatsAppDraft(lines)) : null;

  return (
    <Container className="py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-xs tracking-[0.35em] text-sand-50/50">BAG</div>
          <div className="mt-2 font-display text-3xl text-sand-50">
            Your bag
          </div>
        </div>
        {lines.length > 0 && (
          <button
            className="text-sm font-semibold text-sand-50/60 hover:text-sand-50"
            onClick={() => clearCart()}
          >
            Clear bag
          </button>
        )}
      </div>

      {lines.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-8">
          <div className="text-sm text-sand-50/70">
            Your bag is empty. Discover something beautiful.
          </div>
          <div className="mt-5">
            <Link to="/shop">
              <Button size="lg">Shop now</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {lines.map((l) => (
              <div
                key={`${l.product._id}-${l.size}`}
                className="flex gap-4 rounded-3xl border border-white/10 bg-white/5 p-4"
              >
                <img
                  src={resolveImageUrl(l.product.images[0] ?? "")}
                  alt={l.product.name}
                  className="h-28 w-24 rounded-2xl object-cover opacity-95"
                />
                <div className="flex flex-1 items-start justify-between gap-3">
                  <div>
                    <div className="font-display text-xl text-sand-50">
                      {l.product.name}
                    </div>
                    <div className="mt-1 text-xs text-sand-50/55">
                      Size: <span className="text-sand-50/80">{l.size}</span>
                    </div>
                    <div className="mt-1 text-sm text-sand-50/65">
                      {formatInr(l.product.priceInr)}{" "}
                      <span className="text-xs text-sand-50/45 line-through">
                        {formatInr(l.product.mrpInr)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        aria-label="Decrease quantity"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/6 hover:bg-white/10"
                        onClick={() => setQty(l.product._id, l.size, l.qty - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <div className="min-w-10 text-center text-sm font-semibold text-sand-50">
                        {l.qty}
                      </div>
                      <button
                        aria-label="Increase quantity"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/6 hover:bg-white/10"
                        onClick={() => setQty(l.product._id, l.size, l.qty + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        aria-label="Remove"
                        className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/6 hover:bg-white/10"
                        onClick={() => setQty(l.product._id, l.size, 0)}
                      >
                        <Trash2 className="h-4 w-4 text-sand-50/75" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gold-300">
                    {formatInr(l.product.priceInr * l.qty)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="h-fit rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-semibold text-sand-50">Summary</div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between text-sand-50/70">
                <div>MRP</div>
                <div>{formatInr(totals.mrp)}</div>
              </div>
              <div className="flex items-center justify-between text-sand-50/70">
                <div>Discount</div>
                <div>-{formatInr(totals.savings)}</div>
              </div>
              <div className="flex items-center justify-between text-sand-50/70">
                <div>Shipping</div>
                <div className="text-gold-300">Free</div>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex items-center justify-between font-semibold text-sand-50">
                <div>Total</div>
                <div className="text-gold-300">{formatInr(totals.total)}</div>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <Link to="/checkout">
                <Button size="lg" className="w-full">
                  Checkout
                </Button>
              </Link>
              {bagWhatsHref ? (
                <a href={bagWhatsHref} target="_blank" rel="noreferrer noopener" className="block">
                  <Button size="lg" variant="outline" className="w-full">
                    Order via WhatsApp
                  </Button>
                </a>
              ) : null}
              <div className="text-center text-xs text-sand-50/55">
                Secure checkout • Fast delivery • Easy returns
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

