import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "../lib/cn";
import { resolveImageUrl } from "../lib/images";

export function ImageCarousel({
  images,
  aspectClassName = "aspect-[4/5]",
  auto = false,
  intervalMs = 3500,
  className
}: {
  images: string[];
  aspectClassName?: string;
  auto?: boolean;
  intervalMs?: number;
  className?: string;
}) {
  const list = useMemo(() => images.filter(Boolean).map(resolveImageUrl), [images]);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!auto || list.length <= 1) return;
    const id = window.setInterval(() => {
      setI((x) => (x + 1) % list.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [auto, intervalMs, list.length]);

  const safeIndex = Math.min(i, Math.max(0, list.length - 1));
  const current = list[safeIndex] ?? "";

  if (list.length === 0) return null;

  return (
    <div className={cn("relative overflow-hidden rounded-3xl border border-white/10 bg-white/5", className)}>
      <img
        src={current}
        alt=""
        className={cn("w-full object-cover opacity-95", aspectClassName)}
      />

      {list.length > 1 && (
        <>
          <button
            aria-label="Previous image"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/12 bg-ink-950/45 p-2 text-sand-50/90 backdrop-blur hover:bg-ink-950/60"
            onClick={() => setI((x) => (x - 1 + list.length) % list.length)}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            aria-label="Next image"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/12 bg-ink-950/45 p-2 text-sand-50/90 backdrop-blur hover:bg-ink-950/60"
            onClick={() => setI((x) => (x + 1) % list.length)}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {list.map((_src, idx) => (
              <button
                key={idx}
                aria-label={`Go to image ${idx + 1}`}
                className={cn(
                  "h-1.5 w-5 rounded-full transition",
                  idx === safeIndex ? "bg-gold-400" : "bg-white/20 hover:bg-white/35"
                )}
                onClick={() => setI(idx)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

