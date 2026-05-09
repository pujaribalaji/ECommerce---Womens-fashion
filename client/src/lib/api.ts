import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE ?? "https://aarinkabackend.vercel.app/api";

export const api = axios.create({
  baseURL: API_BASE
});

export type Collection = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  heroImage: string;
};

export type Product = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  collectionSlug: string;
  priceInr: number;
  mrpInr: number;
  images: string[];
  sizes?: string[];
  badges: string[];
  fabric?: string;
  fit?: string;
  care?: string;
  inStock: boolean;
};

export async function fetchCollections() {
  const { data } = await api.get<{ items: Collection[] }>("/api/collections");
  return data.items;
}

export async function fetchProducts(params?: {
  q?: string;
  collection?: string;
  category?: string;
  sort?: "featured" | "price-asc" | "price-desc" | "new";
}) {
  const { data } = await api.get<{ items: Product[] }>("/api/products", {
    params
  });
  return data.items;
}

export async function fetchProduct(slug: string) {
  const { data } = await api.get<{ item: Product }>(`/api/products/${slug}`);
  return data.item;
}

export type CheckoutCustomer = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  landmark: string;
  city: string;
  state: string;
  pin: string;
};

export async function createRazorpayOrder(amountInr: number) {
  const { data } = await api.post<{
    keyId: string;
    orderId: string;
    amount: number;
    currency: string;
  }>("/api/payments/razorpay/order", {
    amountInr,
    receipt: `aarnika_${Date.now()}`
  });
  return data;
}

export async function verifyRazorpaySignature(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  const { data } = await api.post<{ ok: boolean }>(
    "/api/payments/razorpay/verify",
    payload
  );
  return data.ok;
}

export async function createOrder(payload: {
  customer: CheckoutCustomer;
  lines: Array<{
    productId: string;
    name: string;
    slug: string;
    priceInr: number;
    size: string;
    qty: number;
    imageUrl?: string;
  }>;
  totals: { mrp: number; total: number; savings: number };
  channel?: "website" | "whatsapp_intent";
  payment:
    | {
        provider: "razorpay";
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
      }
    | { provider: "cod" };
}) {
  const { data } = await api.post<{
    orderId: string;
    orderNo: string;
    ownerNotifyUrl: string | null;
  }>("/api/orders", payload);
  return data;
}

export async function fetchPublicContact() {
  const { data } = await api.get<{
    ownerWhatsAppDigits: string | null;
    hasOwnerWhatsApp: boolean;
  }>("/api/public/contact");
  return data;
}

/** Storefront CMS (merged with defaults on server). */
export type SiteSettings = {
  brand: {
    name: string;
    tagline: string;
    showLogoMark: boolean;
  };
  header: {
    navItems: { label: string; path: string }[];
    searchPlaceholder: string;
  };
  hero: {
    chips: { text: string; variant: "default" | "gold" }[];
    titleBefore: string;
    titleHighlight: string;
    titleAfter: string;
    subtitle: string;
    primaryCta: { label: string; path: string };
    secondaryCta: { label: string; path: string };
    features: { title: string; description: string }[];
    rightPanel: {
      mode: "collections" | "custom";
      maxSlides: number;
      customSlides: { imageUrl: string; title: string; description: string; path: string }[];
    };
  };
  curated: {
    eyebrow: string;
    title: string;
    shopAllLabel: string;
    gridCount: number;
  };
  footer: {
    brandLine: string;
    blurb: string;
    helpTitle: string;
    helpLinks: { label: string; path?: string }[];
    companyTitle: string;
    companyLinks: { label: string; path?: string }[];
    copyrightSuffix: string;
  };
};

/** Used until the first successful fetch (matches server defaults). */
export const SITE_SETTINGS_FALLBACK: SiteSettings = {
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

export const SITE_SETTINGS_QUERY_KEY = ["site-settings"] as const;

export async function fetchSiteSettings() {
  const { data } = await api.get<{ settings: SiteSettings }>("/api/site");
  return data.settings;
}

export async function fetchAdminSiteSettings(adminKey: string) {
  const { data } = await api.get<{ settings: SiteSettings }>("/api/admin/site", {
    headers: { "x-admin-key": adminKey }
  });
  return data.settings;
}

export async function saveSiteSettings(adminKey: string, settings: SiteSettings) {
  const { data } = await api.put<{ ok: boolean; settings: SiteSettings }>(
    "/api/admin/site",
    settings,
    { headers: { "x-admin-key": adminKey } }
  );
  return data.settings;
}

export async function resetSiteSettings(adminKey: string) {
  const { data } = await api.post<{ ok: boolean; settings: SiteSettings }>(
    "/api/admin/site/reset",
    {},
    { headers: { "x-admin-key": adminKey } }
  );
  return data.settings;
}

