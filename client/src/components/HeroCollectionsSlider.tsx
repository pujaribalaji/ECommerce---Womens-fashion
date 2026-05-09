import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "./Button";
import { cn } from "../lib/cn";
import { resolveImageUrl } from "../lib/images";

export type HeroSlide = {
  name: string;
  description: string;
  heroImage: string;
  path: string;
};

export function HeroCollectionsSlider({ items }: { items: HeroSlide[] }) {
  const [i, setI] = useState(0);
  const n = items.length;

  useEffect(() => {
    if (n <= 1) return;
    const id = window.setInterval(() => {
      setI((x) => (x + 1) % n);
    }, 3800);
    return () => window.clearInterval(id);
  }, [n]);

  const current = items[Math.min(i, n - 1)];
  if (!current) return null;

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 shadow-glow">
      <img
        src={resolveImageUrl(current.heroImage)}
        alt={current.name}
        className="aspect-[4/5] w-full object-cover opacity-95"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6">
        <div className="font-display text-2xl text-sand-50">{current.name}</div>
        <div className="mt-2 max-w-2xl text-sm text-sand-50/70">{current.description}</div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link to={current.path}>
            <Button variant="outline">
              View collection <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex gap-2">
            {items.slice(0, 6).map((_c, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Slide ${idx + 1}`}
                onClick={() => setI(idx)}
                className={cn(
                  "h-1.5 w-6 rounded-full transition",
                  idx === i ? "bg-gold-400" : "bg-white/20 hover:bg-white/35"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
