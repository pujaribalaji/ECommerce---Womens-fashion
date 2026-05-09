import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../lib/cn";
import { getCart } from "../lib/cart";
import { Container } from "./Container";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { SITE_SETTINGS_FALLBACK } from "../lib/api";

function AarnikaMark() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M32 10c5 6 6 12 0 19-6-7-5-13 0-19Z"
        stroke="url(#g)"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      <path
        d="M19 18c8 2 12 7 12 15-9-1-14-6-12-15Z"
        stroke="url(#g)"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      <path
        d="M45 18c2 9-3 14-12 15 0-8 4-13 12-15Z"
        stroke="url(#g)"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      <path
        d="M12 33c10-3 18 0 20 9-10 3-18 0-20-9Z"
        stroke="url(#g)"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      <path
        d="M52 33c-2 9-10 12-20 9 2-9 10-12 20-9Z"
        stroke="url(#g)"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      <path
        d="M16 46c8-5 16-5 24 0-8 6-16 6-24 0Z"
        stroke="url(#g)"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      <path
        d="M24 46c8-5 16-5 24 0-8 6-16 6-24 0Z"
        stroke="url(#g)"
        strokeWidth="2.3"
        strokeLinecap="round"
        opacity="0.75"
      />
      <defs>
        <linearGradient id="g" x1="6" y1="10" x2="58" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F0D38C" />
          <stop offset="0.6" stopColor="#E7C46C" />
          <stop offset="1" stopColor="#B88D2F" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Header() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const { data: siteData } = useSiteSettings();
  const site = siteData ?? SITE_SETTINGS_FALLBACK;

  const updateCount = () => {
    const lines = getCart();
    setCartCount(lines.reduce((sum, l) => sum + l.qty, 0));
  };

  useEffect(() => {
    updateCount();
    const on = () => updateCount();
    window.addEventListener("aarnika-cart", on);
    return () => window.removeEventListener("aarnika-cart", on);
  }, []);

  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-ink-950/70 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          {site.brand.showLogoMark && <AarnikaMark />}
          <div className="leading-tight">
            <div className="font-display text-xl tracking-wide text-sand-50">
              {site.brand.name}
            </div>
            <div className="hidden text-[10px] tracking-[0.35em] text-sand-50/50 sm:block">
              {site.brand.tagline}
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {site.header.navItems.map((n) => (
            <NavLink
              key={n.path}
              to={n.path}
              className={({ isActive }) =>
                cn(
                  "text-sm font-semibold tracking-wide text-sand-50/75 hover:text-sand-50",
                  isActive && "text-gold-300"
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-3">
          <form
            className="hidden w-full max-w-sm items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3 py-2 md:flex"
            onSubmit={(e) => {
              e.preventDefault();
              const query = q.trim();
              navigate(query ? `/shop?q=${encodeURIComponent(query)}` : "/shop");
            }}
          >
            <Search className="h-4 w-4 text-sand-50/60" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={site.header.searchPlaceholder}
              className="w-full bg-transparent text-sm text-sand-50 placeholder:text-sand-50/40 focus:outline-none"
            />
          </form>

          <Link
            to="/cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/6 text-sand-50/90 hover:bg-white/10"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1 text-[11px] font-bold text-ink-950">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </Container>
    </div>
  );
}

