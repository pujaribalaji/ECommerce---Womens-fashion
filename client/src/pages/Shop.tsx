import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Container } from "../components/Container";
import { ProductCard } from "../components/ProductCard";
import { fetchProducts } from "../lib/api";

export default function Shop() {
  const [sp, setSp] = useSearchParams();
  const q = sp.get("q") ?? "";
  const sort = (sp.get("sort") ?? "featured") as
    | "featured"
    | "price-asc"
    | "price-desc"
    | "new";

  const query = useMemo(() => ({ q: q || undefined, sort }), [q, sort]);

  const products = useQuery({
    queryKey: ["products", query],
    queryFn: () => fetchProducts(query)
  });

  return (
    <Container className="py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs tracking-[0.35em] text-sand-50/50">SHOP</div>
          <div className="mt-2 font-display text-3xl text-sand-50">
            {q ? `Results for “${q}”` : "All products"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-sand-50/55">Sort</label>
          <select
            value={sort}
            onChange={(e) => {
              sp.set("sort", e.target.value);
              setSp(sp, { replace: true });
            }}
            className="h-10 rounded-full border border-gold-500/25 bg-ink-950/50 px-4 text-sm text-sand-50 shadow-[0_0_0_1px_rgba(231,196,108,0.10)] focus:outline-none focus:ring-2 focus:ring-gold-400/25"
          >
            <option value="featured">Featured</option>
            <option value="new">New</option>
            <option value="price-asc">Price: Low</option>
            <option value="price-desc">Price: High</option>
          </select>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {(products.data ?? []).map((p) => (
          <ProductCard key={p._id} p={p} />
        ))}
        {products.isLoading && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-sand-50/60">
            Loading products…
          </div>
        )}
        {products.data?.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-sand-50/60">
            No products found.
          </div>
        )}
      </div>
    </Container>
  );
}

