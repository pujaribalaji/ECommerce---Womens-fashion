import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Container } from "../components/Container";
import { ProductCard } from "../components/ProductCard";
import { fetchCollections, fetchProducts } from "../lib/api";
import { useState } from "react";

export default function Collection() {
  const { slug = "" } = useParams();
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc" | "new">("featured");
  const collections = useQuery({
    queryKey: ["collections"],
    queryFn: fetchCollections
  });
  const col = (collections.data ?? []).find((c) => c.slug === slug);

  const products = useQuery({
    queryKey: ["products", { collection: slug, sort }],
    queryFn: () => fetchProducts({ collection: slug, sort }),
    enabled: Boolean(slug)
  });

  if (collections.isLoading) {
    return (
      <Container className="py-10 text-sm text-sand-50/70">
        Loading…
      </Container>
    );
  }

  if (!col) {
    return (
      <Container className="py-10">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sand-50/70">
          Collection not found.{" "}
          <Link className="text-gold-300" to="/shop">
            Go to shop
          </Link>
          .
        </div>
      </Container>
    );
  }

  return (
    <div>
      <div className="relative overflow-hidden border-b border-white/10 bg-ink-950/40">
        <div className="absolute inset-0">
          <img
            src={col.heroImage}
            alt={col.name}
            className="h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/55 to-ink-950/10" />
        </div>
        <Container className="relative py-14">
          <div className="text-xs tracking-[0.35em] text-sand-50/55">
            COLLECTION
          </div>
          <h1 className="mt-3 font-display text-4xl text-sand-50">
            {col.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-sand-50/70">
            {col.description}
          </p>
        </Container>
      </div>

      <Container className="py-10">
        <div className="mb-5 flex items-center justify-end gap-2">
          <label className="text-xs text-sand-50/55">Sort</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="h-10 rounded-full border border-gold-500/25 bg-ink-950/50 px-4 text-sm text-sand-50 shadow-[0_0_0_1px_rgba(231,196,108,0.10)] focus:outline-none focus:ring-2 focus:ring-gold-400/25"
          >
            <option value="featured">Featured</option>
            <option value="new">New</option>
            <option value="price-asc">Price: Low</option>
            <option value="price-desc">Price: High</option>
          </select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {(products.data ?? []).map((p) => (
            <ProductCard key={p._id} p={p} />
          ))}
        </div>
      </Container>
    </div>
  );
}

