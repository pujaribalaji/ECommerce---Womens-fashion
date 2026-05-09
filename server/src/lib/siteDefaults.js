/** Default storefront copy & structure (merged with DB on read). */
export const SITE_DEFAULTS = {
  brand: {
    name: "Aarnika",
    tagline: "ELEGANCE IN EVERY DETAIL",
    showLogoMark: true
  },
  header: {
    navItems: [
      { label: "Summer Loom", path: "/collections/summer-loom" },
      { label: "Indigo Atelier", path: "/collections/indigo-atelier" },
      { label: "Festive Edit", path: "/collections/festive-edit" },
      { label: "Shop", path: "/shop" }
    ],
    searchPlaceholder: "Search kurtas, dresses, dupattas…"
  },
  hero: {
    chips: [
      { text: "Premium Indian Craft", variant: "default" },
      { text: "New Season", variant: "gold" }
    ],
    titleBefore: "Aarnika brings",
    titleHighlight: "elegance",
    titleAfter: "to everyday dressing.",
    subtitle:
      "Luxe textures, clean silhouettes, and thoughtful detail—crafted for the modern Indian wardrobe.",
    primaryCta: { label: "Shop new arrivals", path: "/shop" },
    secondaryCta: { label: "Explore Indigo Atelier", path: "/collections/indigo-atelier" },
    features: [
      { title: "Premium fabrics", description: "Cotton, linen, blends" },
      { title: "Made to last", description: "Quality finishing" },
      { title: "Easy styling", description: "Day to night" }
    ],
    rightPanel: {
      mode: "collections",
      maxSlides: 6,
      customSlides: [
        {
          imageUrl:
            "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=80",
          title: "Summer Loom",
          description: "Airy cottons in sun-warmed tones.",
          path: "/collections/summer-loom"
        }
      ]
    }
  },
  curated: {
    eyebrow: "CURATED",
    title: "Collections",
    shopAllLabel: "Shop all",
    gridCount: 3
  },
  footer: {
    brandLine: "Aarnika",
    blurb:
      "Modern Indian craft, designed for everyday elegance. Thoughtful textiles, clean silhouettes, and elevated details.",
    helpTitle: "Help",
    helpLinks: [
      { label: "Shipping & Returns", path: "" },
      { label: "Size Guide", path: "" },
      { label: "Care", path: "" }
    ],
    companyTitle: "Company",
    companyLinks: [
      { label: "About Aarnika", path: "" },
      { label: "Stores", path: "" },
      { label: "Contact", path: "" }
    ],
    copyrightSuffix: "All rights reserved."
  }
};

export function deepMerge(base, patch) {
  if (patch === undefined || patch === null) return structuredClone(base);
  if (Array.isArray(base)) {
    return Array.isArray(patch) ? structuredClone(patch) : structuredClone(base);
  }
  if (typeof base === "object" && base !== null && !Array.isArray(base)) {
    const out = structuredClone(base);
    for (const k of Object.keys(patch)) {
      const pv = patch[k];
      const bv = base[k];
      if (pv && typeof pv === "object" && !Array.isArray(pv) && bv && typeof bv === "object" && !Array.isArray(bv)) {
        out[k] = deepMerge(bv, pv);
      } else if (pv !== undefined) {
        out[k] = pv;
      }
    }
    return out;
  }
  return patch;
}

export function mergeSiteSettings(saved) {
  return deepMerge(SITE_DEFAULTS, saved || {});
}
