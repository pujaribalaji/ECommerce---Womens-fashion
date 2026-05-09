import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Container } from "../components/Container";
import { cartTotals, clearCart, getCart, type CartLine } from "../lib/cart";
import { formatInr } from "../lib/money";
import { resolveImageUrl } from "../lib/images";
import {
  createOrder,
  createRazorpayOrder,
  fetchPublicContact,
  type CheckoutCustomer,
  verifyRazorpaySignature
} from "../lib/api";
import { buildCheckoutWhatsDraft, whatsappHref } from "../lib/whatsapp";

function linesPayload(lines: CartLine[]) {
  return lines.map((l) => ({
    productId: l.product._id,
    name: l.product.name,
    slug: l.product.slug,
    priceInr: l.product.priceInr,
    size: l.size,
    qty: l.qty,
    imageUrl: resolveImageUrl(l.product.images?.[0] ?? "")
  }));
}

export default function Checkout() {
  const navigate = useNavigate();
  const [lines, setLines] = useState<CartLine[]>(() => getCart());
  const totals = useMemo(() => cartTotals(lines), [lines]);

  useEffect(() => {
    const on = () => setLines(getCart());
    window.addEventListener("aarnika-cart", on);
    return () => window.removeEventListener("aarnika-cart", on);
  }, []);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<"razorpay" | "cod">("razorpay");
  const [ownerWa, setOwnerWa] = useState<string | null>(null);

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

  const [customer, setCustomer] = useState<CheckoutCustomer>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    landmark: "",
    city: "",
    state: "",
    pin: ""
  });

  const whatsDraft = buildCheckoutWhatsDraft(
    customer,
    lines,
    method === "cod" ? "COD on delivery" : "Online via Razorpay"
  );
  const whatsHref =
    ownerWa && lines.length > 0 ? whatsappHref(ownerWa, whatsDraft) : null;

  async function loadRazorpayScript() {
    if ((window as any).Razorpay) return true;
    return await new Promise<boolean>((resolve) => {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });
  }

  function shippingOk() {
    return (
      customer.firstName.trim() &&
      customer.lastName.trim() &&
      customer.phone.trim() &&
      customer.email.trim() &&
      customer.address.trim().length >= 4 &&
      customer.city.trim() &&
      customer.pin.trim().length >= 4
    );
  }

  async function payNow() {
    setError(null);
    if (lines.length === 0) return;
    if (!shippingOk()) {
      setError("Please complete your shipping details (name, phone, email, full address, city, PIN).");
      return;
    }

    const payloadLines = linesPayload(lines);

    if (method === "cod") {
      setBusy(true);
      try {
        const res = await createOrder({
          customer,
          lines: payloadLines,
          totals,
          channel: "website",
          payment: { provider: "cod" }
        });
        clearCart();
        navigate("/success", {
          state: {
            orderNo: res.orderNo,
            ownerNotifyUrl: res.ownerNotifyUrl
          }
        });
      } catch (e: any) {
        setError(e?.response?.data?.error ?? e?.message ?? "Order failed.");
      } finally {
        setBusy(false);
      }
      return;
    }

    setBusy(true);
    try {
      const ok = await loadRazorpayScript();
      if (!ok) throw new Error("Failed to load payment gateway. Check your internet.");

      const rzpOrder = await createRazorpayOrder(totals.total);

      const RazorpayCtor = (window as any).Razorpay as any;
      const rzp = new RazorpayCtor({
        key: rzpOrder.keyId,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "Aarnika",
        description: "Order payment",
        order_id: rzpOrder.orderId,
        modal: {
          ondismiss: () => {
            setBusy(false);
          }
        },
        prefill: {
          name: `${customer.firstName} ${customer.lastName}`.trim(),
          email: customer.email,
          contact: customer.phone
        },
        theme: { color: "#E7C46C" },
        handler: async (resp: any) => {
          try {
            const verified = await verifyRazorpaySignature({
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature
            });
            if (!verified) throw new Error("Payment verification failed.");

            const res = await createOrder({
              customer,
              lines: payloadLines,
              totals,
              channel: "website",
              payment: {
                provider: "razorpay",
                razorpayOrderId: resp.razorpay_order_id,
                razorpayPaymentId: resp.razorpay_payment_id,
                razorpaySignature: resp.razorpay_signature
              }
            });

            clearCart();
            navigate("/success", {
              state: {
                orderNo: res.orderNo,
                ownerNotifyUrl: res.ownerNotifyUrl
              }
            });
          } catch (e: any) {
            setError(e?.message ?? "Payment failed.");
          } finally {
            setBusy(false);
          }
        }
      });

      rzp.on("payment.failed", (resp: any) => {
        const d = resp?.error;
        const msg =
          d?.description ||
          d?.reason ||
          d?.code ||
          "Payment failed. Please try again.";
        setError(String(msg));
        setBusy(false);
      });

      rzp.open();
    } catch (e: any) {
      setError(e?.message ?? "Payment failed.");
      setBusy(false);
    }
  }

  return (
    <Container className="py-10">
      <div className="text-xs tracking-[0.35em] text-sand-50/50">CHECKOUT</div>
      <div className="mt-2 font-display text-3xl text-sand-50">Pay securely</div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm font-semibold text-sand-50">Shipping address</div>
          <div className="mt-1 text-xs text-sand-50/50">
            We share this with the studio for delivery and show it on your admin order.
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-xs text-sand-50/60">
              First name
              <input
                value={customer.firstName}
                onChange={(e) => setCustomer((c) => ({ ...c, firstName: e.target.value }))}
                placeholder="First name"
                className="h-11 rounded-2xl border border-white/12 bg-ink-950/40 px-4 text-sm text-sand-50 placeholder:text-sand-50/35 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
              />
            </label>
            <label className="grid gap-2 text-xs text-sand-50/60">
              Last name
              <input
                value={customer.lastName}
                onChange={(e) => setCustomer((c) => ({ ...c, lastName: e.target.value }))}
                placeholder="Last name"
                className="h-11 rounded-2xl border border-white/12 bg-ink-950/40 px-4 text-sm text-sand-50 placeholder:text-sand-50/35 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
              />
            </label>
            <label className="grid gap-2 text-xs text-sand-50/60">
              Phone
              <input
                value={customer.phone}
                onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))}
                placeholder="+91"
                className="h-11 rounded-2xl border border-white/12 bg-ink-950/40 px-4 text-sm text-sand-50 placeholder:text-sand-50/35 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
              />
            </label>
            <label className="grid gap-2 text-xs text-sand-50/60">
              Email
              <input
                value={customer.email}
                onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))}
                placeholder="you@example.com"
                className="h-11 rounded-2xl border border-white/12 bg-ink-950/40 px-4 text-sm text-sand-50 placeholder:text-sand-50/35 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
              />
            </label>
            <label className="grid gap-2 text-xs text-sand-50/60 sm:col-span-2">
              Street address
              <textarea
                value={customer.address}
                onChange={(e) => setCustomer((c) => ({ ...c, address: e.target.value }))}
                placeholder="Flat / House, street, area"
                rows={2}
                className="min-h-[5rem] resize-y rounded-2xl border border-white/12 bg-ink-950/40 px-4 py-3 text-sm text-sand-50 placeholder:text-sand-50/35 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
              />
            </label>
            <label className="grid gap-2 text-xs text-sand-50/60 sm:col-span-2">
              Landmark (optional)
              <input
                value={customer.landmark}
                onChange={(e) => setCustomer((c) => ({ ...c, landmark: e.target.value }))}
                placeholder="Near café / metro / gate"
                className="h-11 rounded-2xl border border-white/12 bg-ink-950/40 px-4 text-sm text-sand-50 placeholder:text-sand-50/35 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
              />
            </label>
            <label className="grid gap-2 text-xs text-sand-50/60">
              City
              <input
                value={customer.city}
                onChange={(e) => setCustomer((c) => ({ ...c, city: e.target.value }))}
                placeholder="Bengaluru"
                className="h-11 rounded-2xl border border-white/12 bg-ink-950/40 px-4 text-sm text-sand-50 placeholder:text-sand-50/35 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
              />
            </label>
            <label className="grid gap-2 text-xs text-sand-50/60">
              State / region
              <input
                value={customer.state}
                onChange={(e) => setCustomer((c) => ({ ...c, state: e.target.value }))}
                placeholder="Karnataka"
                className="h-11 rounded-2xl border border-white/12 bg-ink-950/40 px-4 text-sm text-sand-50 placeholder:text-sand-50/35 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
              />
            </label>
            <label className="grid gap-2 text-xs text-sand-50/60">
              PIN
              <input
                value={customer.pin}
                onChange={(e) => setCustomer((c) => ({ ...c, pin: e.target.value }))}
                placeholder="560001"
                className="h-11 rounded-2xl border border-white/12 bg-ink-950/40 px-4 text-sm text-sand-50 placeholder:text-sand-50/35 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
              />
            </label>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-ink-950/40 p-5">
            <div className="text-sm font-semibold text-sand-50">Payment</div>
            {error && (
              <div className="mt-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
                {error}
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-sand-50/80">
                <input
                  type="radio"
                  name="paymethod"
                  checked={method === "razorpay"}
                  onChange={() => setMethod("razorpay")}
                />
                Online payment
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-sand-50/80">
                <input
                  type="radio"
                  name="paymethod"
                  checked={method === "cod"}
                  onChange={() => setMethod("cod")}
                />
                Cash on delivery
              </label>
            </div>
            <div className="mt-2 text-sm text-sand-50/70">
              {method === "razorpay"
                ? "Pay with Razorpay (UPI, Cards, NetBanking). Order will be saved after verification."
                : "Pay at your doorstep. Order will be placed without online payment."}
            </div>

            <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-900/15 p-4 text-sm">
              <div className="font-semibold text-sand-50">Prefer WhatsApp?</div>
              <div className="mt-1 text-xs text-sand-50/70">
                Send this bag plus your shipping draft to our studio. Completing Razorpay or COD above
                still creates a record in admin.
              </div>
              {whatsHref ? (
                <a
                  href={whatsHref}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-3 inline-flex rounded-full bg-gradient-to-b from-gold-400 to-gold-600 px-5 py-2.5 text-sm font-semibold text-ink-950"
                >
                  Chat order on WhatsApp
                </a>
              ) : (
                <div className="mt-3 text-xs text-sand-50/50">
                  WhatsApp unavailable — configure <code className="text-gold-200">OWNER_WHATSAPP</code>{" "}
                  on the API server.
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => void payNow()}
                disabled={lines.length === 0 || busy}
              >
                {busy ? "Processing…" : method === "cod" ? "Place COD order" : "Pay now"}
              </Button>
              <Link to="/cart">
                <Button size="lg" variant="outline">
                  Back to bag
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="h-fit rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm font-semibold text-sand-50">Order summary</div>
          <div className="mt-4 max-h-[320px] space-y-3 overflow-auto pr-1 text-sm">
            {lines.length === 0 ? (
              <div className="text-sand-50/60">Bag is empty.</div>
            ) : (
              lines.map((l) => (
                <div
                  key={`${l.product._id}-${l.size}`}
                  className="flex gap-3 rounded-2xl border border-white/8 bg-ink-950/30 p-2"
                >
                  <img
                    src={resolveImageUrl(l.product.images?.[0] ?? "")}
                    alt=""
                    className="h-14 w-12 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-sand-50">{l.product.name}</div>
                    <div className="text-xs text-sand-50/55">
                      {l.size} × {l.qty}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 space-y-3 text-sm text-sand-50/70">
            <div className="flex items-center justify-between">
              <div>Items</div>
              <div>{lines.reduce((s, l) => s + l.qty, 0)}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>MRP</div>
              <div>{formatInr(totals.mrp)}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Discount</div>
              <div>-{formatInr(totals.savings)}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Shipping</div>
              <div className="text-gold-300">Free</div>
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex items-center justify-between font-semibold text-sand-50">
              <div>Total</div>
              <div className="text-gold-300">{formatInr(totals.total)}</div>
            </div>
          </div>
          <div className="mt-5 text-xs text-sand-50/55">
            By placing your order you agree to our Terms & Privacy Policy.
          </div>
        </div>
      </div>
    </Container>
  );
}
