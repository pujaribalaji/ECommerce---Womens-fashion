import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../components/Button";
import { Container } from "../components/Container";

type LocState = {
  orderNo?: string;
  ownerNotifyUrl?: string | null;
};

export default function Success() {
  const loc = useLocation();
  const st = (loc.state || {}) as LocState;
  const orderNo = st.orderNo;
  const ownerNotifyUrl = st.ownerNotifyUrl;

  useEffect(() => {
    if (!ownerNotifyUrl || typeof ownerNotifyUrl !== "string") return;
    window.open(ownerNotifyUrl, "_blank", "noopener,noreferrer");
  }, [ownerNotifyUrl]);

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
        <div className="text-xs tracking-[0.35em] text-sand-50/50">DONE</div>
        <div className="mt-3 font-display text-4xl text-sand-50">
          Order placed
        </div>
        {orderNo && (
          <div className="mt-4 rounded-2xl border border-gold-400/25 bg-white/8 py-3 text-sm text-sand-50/90">
            Reference · <span className="font-semibold text-gold-300">{orderNo}</span>
          </div>
        )}
        <div className="mt-4 text-sm text-sand-50/70">
          Thanks for choosing Aarnika. Keep the WhatsApp chat handy — we opened a draft for the studio
          with your items and shipping snapshot.
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/shop">
            <Button size="lg">Continue shopping</Button>
          </Link>
          <Link to="/">
            <Button size="lg" variant="outline">
              Home
            </Button>
          </Link>
          {ownerNotifyUrl && typeof ownerNotifyUrl === "string" ? (
            <a href={ownerNotifyUrl} target="_blank" rel="noreferrer noopener">
              <Button size="lg" variant="outline">
                Open WhatsApp message
              </Button>
            </a>
          ) : null}
        </div>
      </div>
    </Container>
  );
}
