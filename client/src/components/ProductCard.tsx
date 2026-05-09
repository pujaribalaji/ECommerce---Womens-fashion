import { Link } from "react-router-dom";
import type { Product } from "../lib/api";
import { formatInr } from "../lib/money";
import { cn } from "../lib/cn";
import { Chip } from "./Chip";
import { resolveImageUrl } from "../lib/images";

export function ProductCard({ p }: { p: Product }) {
  const primary = resolveImageUrl(p.images[0] ?? "");
  return (
    <Link
      to={`/p/${p.slug}`}
      className={cn(
        "group rounded-2xl border border-white/10 bg-white/5 p-2 transition hover:bg-white/7 hover:shadow-glow"
      )}
    >
      <div className="relative overflow-hidden rounded-xl bg-ink-900/30">
        <img
          src={primary}
          alt={p.name}
          loading="lazy"
          className="aspect-[3/4] w-full object-cover opacity-95 transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {p.badges?.slice(0, 2).map((b) => (
            <Chip key={b} className="bg-ink-950/35 backdrop-blur">
              {b}
            </Chip>
          ))}
        </div>
      </div>
      <div className="mt-3">
        <div className="font-display text-base leading-snug text-sand-50">
          {p.name}
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <div className="text-sm font-semibold text-gold-300">
            {formatInr(p.priceInr)}
          </div>
          <div className="text-xs text-sand-50/50 line-through">
            {formatInr(p.mrpInr)}
          </div>
        </div>
        <div className="mt-2 text-xs text-sand-50/65">{p.category}</div>
      </div>
    </Link>
  );
}

