import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Chip } from "../components/Chip";
import { Container } from "../components/Container";
import { ImageCarousel } from "../components/ImageCarousel";
import { fetchProduct, type Product } from "../lib/api";
import { addToCart } from "../lib/cart";
import { formatInr } from "../lib/money";
import { resolveImageUrl } from "../lib/images";
import { useEffect, useMemo, useState } from "react";

function BagAddButton({ product: p, size }: { product: Product; size: string }) {
  const [picked, setPicked] = useState(false);

  return (
    <Button
      size="lg"
      onClick={() => {
        addToCart(
          {
            _id: p._id,
            name: p.name,
            slug: p.slug,
            images: p.images,
            priceInr: p.priceInr,
            mrpInr: p.mrpInr
          },
          size,
          1
        );
        window.dispatchEvent(new CustomEvent("aarnika-toast", { detail: "Added to bag" }));
        setPicked(true);
        window.setTimeout(() => setPicked(false), 2200);
      }}
      variant={picked ? "outline" : "primary"}
      aria-live="polite"
    >
      {picked ? "Added to bag" : "Add to bag"}
    </Button>
  );
}

export default function ProductPage() {
  const { slug = "" } = useParams();
  const product = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProduct(slug),
    enabled: Boolean(slug)
  });

  const p = product.data;
  const sizes = useMemo(
    () => (p?.sizes && p.sizes.length > 0 ? p.sizes : ["M", "L", "XL", "XXL", "XXXL"]),
    [p?.sizes]
  );
  const [size, setSize] = useState("");

  useEffect(() => {
    if (!p) return;
    const list = p.sizes && p.sizes.length > 0 ? p.sizes : ["M", "L", "XL", "XXL", "XXXL"];
    const first = list[0] ?? "M";
    setSize((cur) => (cur && list.includes(cur) ? cur : first));
  }, [p]);

  if (product.isLoading) {
    return (
      <Container className="py-10 text-sm text-sand-50/70">Loading…</Container>
    );
  }

  if (!p) {
    return (
      <Container className="py-10">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sand-50/70">
          Product not found.{" "}
          <Link className="text-gold-300" to="/shop">
            Shop all
          </Link>
          .
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <div className="mb-6 flex items-center gap-2 text-xs text-sand-50/60">
        <Link to="/" className="hover:text-sand-50">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/shop" className="hover:text-sand-50">
          Shop
        </Link>
        <ChevronRight className="h-3 w-3" />
        <div className="text-sand-50/85">{p.name}</div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <div className="grid gap-3">
          <ImageCarousel images={p.images} />
          {p.images.length > 1 && (
            <div className="mx-auto grid w-full max-w-md grid-cols-6 gap-2 sm:max-w-lg">
              {p.images.slice(0, 6).map((src, idx) => (
                <div
                  key={`${src}-${idx}`}
                  className="aspect-square overflow-hidden rounded-xl border border-white/12 bg-white/5 ring-1 ring-white/6"
                >
                  <img
                    src={resolveImageUrl(src)}
                    alt=""
                    className="h-full w-full object-cover opacity-95"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            {(p.badges ?? []).map((b) => (
              <Chip key={b}>{b}</Chip>
            ))}
            <Chip className="border-gold-500/30 bg-gold-500/10 text-gold-300">
              {p.collectionSlug.replace(/-/g, " ").toUpperCase()}
            </Chip>
          </div>

          <h1 className="mt-5 font-display text-4xl leading-tight text-sand-50">
            {p.name}
          </h1>
          <div className="mt-3 flex items-baseline gap-3">
            <div className="text-xl font-semibold text-gold-300">
              {formatInr(p.priceInr)}
            </div>
            <div className="text-sm text-sand-50/50 line-through">
              {formatInr(p.mrpInr)}
            </div>
            <div className="text-sm text-sand-50/70">
              You save {formatInr(Math.max(0, p.mrpInr - p.priceInr))}
            </div>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-sand-50/70">
            {p.description}
          </p>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs text-sand-50/70">
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-sand-50/45">
                Fabric
              </div>
              <div className="text-sand-50/85">{p.fabric}</div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-sand-50/45">
                Fit
              </div>
              <div className="text-sand-50/85">{p.fit}</div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-sand-50/45">
                Care
              </div>
              <div className="text-sand-50/85">{p.care}</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-[10px] font-semibold tracking-[0.25em] text-sand-50/45">
              SIZE
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={
                    s === size
                      ? "rounded-full bg-gold-500 px-3 py-1.5 text-[11px] font-bold text-ink-950"
                      : "rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] font-semibold text-sand-50/80 hover:bg-white/10"
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {size ? <BagAddButton product={p} size={size} /> : null}
            <Link to="/cart">
              <Button size="lg" variant="outline">
                Go to bag <span aria-hidden className="ml-1">→</span>
              </Button>
            </Link>
          </div>

          <div className="mt-8 text-xs text-sand-50/55">
            Shipping in 2–5 days • Easy returns • Secure payments
          </div>
        </div>
      </div>
    </Container>
  );
}

