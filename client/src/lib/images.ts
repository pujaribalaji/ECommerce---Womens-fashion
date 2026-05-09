import { api } from "./api";

export function resolveImageUrl(src: string) {
  if (!src) return src;
  if (src.startsWith("/uploads/")) {
    const base = api.defaults.baseURL ?? "http://localhost:4000";
    return `${String(base).replace(/\/$/, "")}${src}`;
  }
  return src;
}

