import { Link } from "react-router-dom";
import { Container } from "./Container";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { SITE_SETTINGS_FALLBACK } from "../lib/api";

export function Footer() {
  const { data: siteData } = useSiteSettings();
  const site = siteData ?? SITE_SETTINGS_FALLBACK;

  return (
    <footer className="mt-20 border-t border-white/10 bg-ink-950/60">
      <Container className="grid gap-8 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-display text-2xl text-sand-50">{site.footer.brandLine}</div>
          <div className="mt-2 max-w-md text-sm text-sand-50/65">{site.footer.blurb}</div>
        </div>
        <div>
          <div className="text-sm font-semibold text-sand-50">{site.footer.helpTitle}</div>
          <ul className="mt-3 space-y-2 text-sm text-sand-50/65">
            {site.footer.helpLinks.map((l, i) => {
              const p = l.path?.trim();
              return (
                <li key={i}>
                  {p ? (
                    <Link to={p} className="hover:text-gold-300">
                      {l.label}
                    </Link>
                  ) : (
                    l.label
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold text-sand-50">{site.footer.companyTitle}</div>
          <ul className="mt-3 space-y-2 text-sm text-sand-50/65">
            {site.footer.companyLinks.map((l, i) => {
              const p = l.path?.trim();
              return (
                <li key={i}>
                  {p ? (
                    <Link to={p} className="hover:text-gold-300">
                      {l.label}
                    </Link>
                  ) : (
                    l.label
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
      <div className="border-t border-white/10 py-5 text-center text-xs text-sand-50/55">
        © {new Date().getFullYear()} {site.footer.brandLine}. {site.footer.copyrightSuffix}
      </div>
    </footer>
  );
}
