import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { fetchCollections, SITE_SETTINGS_FALLBACK } from "../lib/api";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { Container } from "../components/Container";
import { Button } from "../components/Button";
import { Chip } from "../components/Chip";
import { HeroCollectionsSlider, type HeroSlide } from "../components/HeroCollectionsSlider";
import { resolveImageUrl } from "../lib/images";
import { useMemo } from "react";

export default function Home() {
  const { data: siteData } = useSiteSettings();
  const site = siteData ?? SITE_SETTINGS_FALLBACK;
  const collections = useQuery({
    queryKey: ["collections"],
    queryFn: fetchCollections
  });

  const heroSlides: HeroSlide[] = useMemo(() => {
    const s = site;
    const rp = s.hero.rightPanel;
    if (rp.mode === "custom" && rp.customSlides?.length) {
      return rp.customSlides.map((slide) => ({
        name: slide.title,
        description: slide.description ?? "",
        heroImage: slide.imageUrl,
        path: slide.path
      }));
    }
    return (collections.data ?? []).slice(0, rp.maxSlides ?? 6).map((c) => ({
      name: c.name,
      description: c.description,
      heroImage: c.heroImage,
      path: `/collections/${c.slug}`
    }));
  }, [site, collections.data]);

  const gridCount = Math.min(6, Math.max(1, site.curated.gridCount ?? 3));
  const curatedItems = (collections.data ?? []).slice(0, gridCount);

  return (
    <div>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.18]">
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-gold-500/40 blur-3xl" />
          <div className="absolute -right-28 top-10 h-96 w-96 rounded-full bg-sand-100/15 blur-3xl" />
        </div>

        <Container className="relative py-16 sm:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {site.hero.chips.map((c, idx) =>
                  c.variant === "gold" ? (
                    <Chip
                      key={idx}
                      className="border-gold-500/30 bg-gold-500/10 text-gold-300"
                    >
                      {c.text}
                    </Chip>
                  ) : (
                    <Chip key={idx}>{c.text}</Chip>
                  )
                )}
              </div>
              <h1 className="mt-6 font-display text-4xl leading-tight text-sand-50 sm:text-5xl">
                {site.hero.titleBefore}{" "}
                <span className="text-gold-300">{site.hero.titleHighlight}</span>{" "}
                {site.hero.titleAfter}
              </h1>
              <p className="mt-4 max-w-xl text-base text-sand-50/70">{site.hero.subtitle}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to={site.hero.primaryCta.path}>
                  <Button size="lg">
                    {site.hero.primaryCta.label} <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to={site.hero.secondaryCta.path}>
                  <Button size="lg" variant="outline">
                    {site.hero.secondaryCta.label}
                  </Button>
                </Link>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-3 max-w-md">
                {site.hero.features.map((row) => (
                  <div
                    key={row.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-sand-50">
                      <Sparkles className="h-4 w-4 text-gold-300" />
                      {row.title}
                    </div>
                    <div className="mt-2 text-xs text-sand-50/60">{row.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-b from-gold-500/25 to-transparent blur-2xl" />
              {heroSlides.length > 0 ? (
                <HeroCollectionsSlider items={heroSlides} />
              ) : (
                <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 shadow-glow">
                  <img
                    alt=""
                    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=80"
                    className="aspect-[4/5] w-full object-cover opacity-95"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/90 to-transparent p-6">
                    <div className="font-display text-2xl text-sand-50">Collections</div>
                    <div className="mt-1 text-sm text-sand-50/70">Add collections or custom slides in Admin → Dashboard.</div>
                    <div className="mt-4">
                      <Link to="/shop">
                        <Button variant="outline">
                          Shop <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>

      <Container className="mt-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs tracking-[0.35em] text-sand-50/50">
              {site.curated.eyebrow}
            </div>
            <div className="mt-2 font-display text-3xl text-sand-50">{site.curated.title}</div>
          </div>
          <Link to="/shop" className="text-sm font-semibold text-gold-300">
            {site.curated.shopAllLabel} <span aria-hidden>→</span>
          </Link>
        </div>

        <div
          className={`mt-6 grid gap-4 ${
            gridCount >= 5
              ? "md:grid-cols-3 lg:grid-cols-5"
              : gridCount === 4
                ? "md:grid-cols-2 lg:grid-cols-4"
                : "md:grid-cols-3"
          }`}
        >
          {curatedItems.map((c) => (
            <Link
              key={c.slug}
              to={`/collections/${c.slug}`}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5"
            >
              <img
                src={resolveImageUrl(c.heroImage)}
                alt={c.name}
                className="aspect-[4/3] w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/92 via-ink-950/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="font-display text-2xl text-sand-50">{c.name}</div>
                <div className="mt-1 text-sm text-sand-50/70">{c.description}</div>
                <div className="mt-3 text-sm font-semibold text-gold-300">
                  Explore <span aria-hidden>→</span>
                </div>
              </div>
            </Link>
          ))}
          {collections.isLoading && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-sand-50/60">
              Loading collections…
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
