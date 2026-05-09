import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/Button";
import {
  api,
  fetchAdminSiteSettings,
  type SiteSettings,
  resetSiteSettings,
  saveSiteSettings,
  SITE_SETTINGS_FALLBACK,
  SITE_SETTINGS_QUERY_KEY
} from "../lib/api";

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-xs text-sand-50/60">
      {label}
      {children}
    </label>
  );
}

function inputClass() {
  return "h-10 rounded-xl border border-white/12 bg-ink-950/40 px-3 text-sm text-sand-50 focus:outline-none focus:ring-2 focus:ring-gold-400/25";
}

export function AdminSiteDashboard({ adminKey }: { adminKey: string }) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<SiteSettings>(SITE_SETTINGS_FALLBACK);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let on = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const s = await fetchAdminSiteSettings(adminKey);
        if (on) setDraft(structuredClone(s));
      } catch (e: any) {
        if (on) setErr(e?.response?.data?.error ?? e?.message ?? "Load failed");
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => {
      on = false;
    };
  }, [adminKey]);

  async function uploadImage(file: File | null) {
    if (!file) return null;
    const fd = new FormData();
    fd.append("images", file);
    const { data } = await api.post<{ urls: string[] }>("/api/admin/uploads", fd, {
      headers: { "x-admin-key": adminKey, "Content-Type": "multipart/form-data" }
    });
    return data.urls[0] ?? null;
  }

  async function save() {
    setSaving(true);
    setErr(null);
    setMsg(null);
    try {
      await saveSiteSettings(adminKey, draft);
      await qc.invalidateQueries({ queryKey: SITE_SETTINGS_QUERY_KEY });
      setMsg("Saved. Storefront updated.");
    } catch (e: any) {
      setErr(
        e?.response?.data?.error ??
          (e?.response?.data?.issues ? JSON.stringify(e.response.data.issues) : null) ??
          e?.message ??
          "Save failed"
      );
    } finally {
      setSaving(false);
    }
  }

  async function reset() {
    if (!confirm("Reset site copy to built-in defaults?")) return;
    setSaving(true);
    setErr(null);
    setMsg(null);
    try {
      const s = await resetSiteSettings(adminKey);
      setDraft(structuredClone(s));
      await qc.invalidateQueries({ queryKey: SITE_SETTINGS_QUERY_KEY });
      setMsg("Reset to defaults.");
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? e?.message ?? "Reset failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-sand-50/70">Loading site settings…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/5 p-4">
        <div>
          <div className="text-sm font-semibold text-sand-50">Dashboard / Site content</div>
          <div className="mt-1 text-xs text-sand-50/55">
            Edit header, homepage hero, curated section labels, footer, and hero slider (collections or custom slides).
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
          <Button variant="outline" onClick={reset} disabled={saving}>
            Reset defaults
          </Button>
        </div>
      </div>

      {msg && (
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-sm text-emerald-100">
          {msg}
        </div>
      )}
      {err && (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
          {err}
        </div>
      )}

      <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="text-sm font-semibold text-sand-50">Brand</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Site name">
            <input
              className={inputClass()}
              value={draft.brand.name}
              onChange={(e) =>
                setDraft((d) => ({ ...d, brand: { ...d.brand, name: e.target.value } }))
              }
            />
          </Field>
          <Field label="Tagline">
            <input
              className={inputClass()}
              value={draft.brand.tagline}
              onChange={(e) =>
                setDraft((d) => ({ ...d, brand: { ...d.brand, tagline: e.target.value } }))
              }
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-sand-50/80 sm:col-span-2">
            <input
              type="checkbox"
              checked={draft.brand.showLogoMark}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  brand: { ...d.brand, showLogoMark: e.target.checked }
                }))
              }
            />
            Show lotus mark in header
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="text-sm font-semibold text-sand-50">Header</div>
        <div className="mt-4">
          <Field label="Search placeholder">
            <input
              className={inputClass()}
              value={draft.header.searchPlaceholder}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  header: { ...d.header, searchPlaceholder: e.target.value }
                }))
              }
            />
          </Field>
        </div>
        <div className="mt-4">
          <div className="text-xs font-semibold text-sand-50/55">Navigation</div>
          <div className="mt-2 space-y-2">
            {draft.header.navItems.map((item, idx) => (
              <div key={idx} className="flex flex-wrap gap-2">
                <input
                  className={`${inputClass()} min-w-[140px] flex-1`}
                  placeholder="Label"
                  value={item.label}
                  onChange={(e) => {
                    const navItems = draft.header.navItems.map((it, i) =>
                      i === idx ? { ...it, label: e.target.value } : it
                    );
                    setDraft((d) => ({ ...d, header: { ...d.header, navItems } }));
                  }}
                />
                <input
                  className={`${inputClass()} min-w-[180px] flex-1`}
                  placeholder="/shop or /collections/…"
                  value={item.path}
                  onChange={(e) => {
                    const navItems = draft.header.navItems.map((it, i) =>
                      i === idx ? { ...it, path: e.target.value } : it
                    );
                    setDraft((d) => ({ ...d, header: { ...d.header, navItems } }));
                  }}
                />
                <button
                  type="button"
                  className="rounded-full border border-white/12 bg-white/6 px-3 py-2 text-xs text-sand-50/70"
                  onClick={() => {
                    const navItems = draft.header.navItems.filter((_, i) => i !== idx);
                    setDraft((d) => ({ ...d, header: { ...d.header, navItems } }));
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="text-xs font-semibold text-gold-300"
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  header: {
                    ...d.header,
                    navItems: [...d.header.navItems, { label: "New", path: "/shop" }]
                  }
                }))
              }
            >
              + Add link
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="text-sm font-semibold text-sand-50">Home — hero (left)</div>
        <div className="mt-4 space-y-4">
          <div>
            <div className="text-xs font-semibold text-sand-50/55">Chips</div>
            {draft.hero.chips.map((chip, idx) => (
              <div key={idx} className="mt-2 flex flex-wrap gap-2">
                <input
                  className={`${inputClass()} flex-1 min-w-[200px]`}
                  value={chip.text}
                  onChange={(e) => {
                    const chips = draft.hero.chips.map((c, i) =>
                      i === idx ? { ...c, text: e.target.value } : c
                    );
                    setDraft((d) => ({ ...d, hero: { ...d.hero, chips } }));
                  }}
                />
                <select
                  className={inputClass()}
                  value={chip.variant}
                  onChange={(e) => {
                    const chips = draft.hero.chips.map((c, i) =>
                      i === idx ? { ...c, variant: e.target.value as "default" | "gold" } : c
                    );
                    setDraft((d) => ({ ...d, hero: { ...d.hero, chips } }));
                  }}
                >
                  <option value="default">Default</option>
                  <option value="gold">Gold</option>
                </select>
                <button
                  type="button"
                  className="rounded-full border border-white/12 bg-white/6 px-3 py-2 text-xs"
                  onClick={() => {
                    const chips = draft.hero.chips.filter((_, i) => i !== idx);
                    setDraft((d) => ({ ...d, hero: { ...d.hero, chips } }));
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="mt-2 text-xs font-semibold text-gold-300"
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  hero: {
                    ...d.hero,
                    chips: [...d.hero.chips, { text: "New", variant: "default" }]
                  }
                }))
              }
            >
              + Add chip
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Title (before highlight)">
              <input
                className={inputClass()}
                value={draft.hero.titleBefore}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, hero: { ...d.hero, titleBefore: e.target.value } }))
                }
              />
            </Field>
            <Field label="Highlight word">
              <input
                className={inputClass()}
                value={draft.hero.titleHighlight}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, hero: { ...d.hero, titleHighlight: e.target.value } }))
                }
              />
            </Field>
            <Field label="Title (after highlight)">
              <input
                className={inputClass()}
                value={draft.hero.titleAfter}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, hero: { ...d.hero, titleAfter: e.target.value } }))
                }
              />
            </Field>
          </div>

          <Field label="Subtitle">
            <textarea
              className={`${inputClass()} min-h-[80px] py-2`}
              value={draft.hero.subtitle}
              onChange={(e) =>
                setDraft((d) => ({ ...d, hero: { ...d.hero, subtitle: e.target.value } }))
              }
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Primary button label">
              <input
                className={inputClass()}
                value={draft.hero.primaryCta.label}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    hero: { ...d.hero, primaryCta: { ...d.hero.primaryCta, label: e.target.value } }
                  }))
                }
              />
            </Field>
            <Field label="Primary button path">
              <input
                className={inputClass()}
                value={draft.hero.primaryCta.path}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    hero: { ...d.hero, primaryCta: { ...d.hero.primaryCta, path: e.target.value } }
                  }))
                }
              />
            </Field>
            <Field label="Secondary button label">
              <input
                className={inputClass()}
                value={draft.hero.secondaryCta.label}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    hero: {
                      ...d.hero,
                      secondaryCta: { ...d.hero.secondaryCta, label: e.target.value }
                    }
                  }))
                }
              />
            </Field>
            <Field label="Secondary button path">
              <input
                className={inputClass()}
                value={draft.hero.secondaryCta.path}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    hero: {
                      ...d.hero,
                      secondaryCta: { ...d.hero.secondaryCta, path: e.target.value }
                    }
                  }))
                }
              />
            </Field>
          </div>

          <div>
            <div className="text-xs font-semibold text-sand-50/55">Feature cards (3 recommended)</div>
            {draft.hero.features.map((f, idx) => (
              <div key={idx} className="mt-2 grid gap-2 sm:grid-cols-2">
                <input
                  className={inputClass()}
                  placeholder="Title"
                  value={f.title}
                  onChange={(e) => {
                    const features = draft.hero.features.map((x, i) =>
                      i === idx ? { ...x, title: e.target.value } : x
                    );
                    setDraft((d) => ({ ...d, hero: { ...d.hero, features } }));
                  }}
                />
                <input
                  className={inputClass()}
                  placeholder="Description"
                  value={f.description}
                  onChange={(e) => {
                    const features = draft.hero.features.map((x, i) =>
                      i === idx ? { ...x, description: e.target.value } : x
                    );
                    setDraft((d) => ({ ...d, hero: { ...d.hero, features } }));
                  }}
                />
              </div>
            ))}
            <button
              type="button"
              className="mt-2 text-xs font-semibold text-gold-300"
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  hero: {
                    ...d.hero,
                    features: [...d.hero.features, { title: "New", description: "…" }]
                  }
                }))
              }
            >
              + Add feature card
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="text-sm font-semibold text-sand-50">Home — hero (right slider)</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Source">
            <select
              className={inputClass()}
              value={draft.hero.rightPanel.mode}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  hero: {
                    ...d.hero,
                    rightPanel: {
                      ...d.hero.rightPanel,
                      mode: e.target.value as "collections" | "custom"
                    }
                  }
                }))
              }
            >
              <option value="collections">Auto from collections (API)</option>
              <option value="custom">Custom slides (you define text + image + link)</option>
            </select>
          </Field>
          <Field label="Max slides (collections mode)">
            <input
              type="number"
              min={1}
              max={12}
              className={inputClass()}
              value={draft.hero.rightPanel.maxSlides}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  hero: {
                    ...d.hero,
                    rightPanel: {
                      ...d.hero.rightPanel,
                      maxSlides: Number(e.target.value) || 6
                    }
                  }
                }))
              }
            />
          </Field>
        </div>

        {draft.hero.rightPanel.mode === "custom" && (
          <div className="mt-4 space-y-3">
            {draft.hero.rightPanel.customSlides.map((slide, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-ink-950/30 p-4 text-sm"
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  <Field label="Image URL">
                    <input
                      className={inputClass()}
                      value={slide.imageUrl}
                      onChange={(e) => {
                        const customSlides = draft.hero.rightPanel.customSlides.map((s, i) =>
                          i === idx ? { ...s, imageUrl: e.target.value } : s
                        );
                        setDraft((d) => ({
                          ...d,
                          hero: { ...d.hero, rightPanel: { ...d.hero.rightPanel, customSlides } }
                        }));
                      }}
                    />
                  </Field>
                  <Field label="Upload file">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="text-xs text-sand-50/70 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:font-semibold"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        const url = await uploadImage(file ?? null);
                        if (!url) return;
                        const customSlides = draft.hero.rightPanel.customSlides.map((s, i) =>
                          i === idx ? { ...s, imageUrl: url } : s
                        );
                        setDraft((d) => ({
                          ...d,
                          hero: { ...d.hero, rightPanel: { ...d.hero.rightPanel, customSlides } }
                        }));
                        e.target.value = "";
                      }}
                    />
                  </Field>
                  <Field label="Title">
                    <input
                      className={inputClass()}
                      value={slide.title}
                      onChange={(e) => {
                        const customSlides = draft.hero.rightPanel.customSlides.map((s, i) =>
                          i === idx ? { ...s, title: e.target.value } : s
                        );
                        setDraft((d) => ({
                          ...d,
                          hero: { ...d.hero, rightPanel: { ...d.hero.rightPanel, customSlides } }
                        }));
                      }}
                    />
                  </Field>
                  <Field label="Link path">
                    <input
                      className={inputClass()}
                      value={slide.path}
                      onChange={(e) => {
                        const customSlides = draft.hero.rightPanel.customSlides.map((s, i) =>
                          i === idx ? { ...s, path: e.target.value } : s
                        );
                        setDraft((d) => ({
                          ...d,
                          hero: { ...d.hero, rightPanel: { ...d.hero.rightPanel, customSlides } }
                        }));
                      }}
                    />
                  </Field>
                </div>
                <Field label="Description">
                  <textarea
                    className={`${inputClass()} min-h-[60px] py-2 sm:col-span-2`}
                    value={slide.description}
                    onChange={(e) => {
                      const customSlides = draft.hero.rightPanel.customSlides.map((s, i) =>
                        i === idx ? { ...s, description: e.target.value } : s
                      );
                      setDraft((d) => ({
                        ...d,
                        hero: { ...d.hero, rightPanel: { ...d.hero.rightPanel, customSlides } }
                      }));
                    }}
                  />
                </Field>
                <button
                  type="button"
                  className="mt-2 text-xs text-red-200/90"
                  onClick={() => {
                    const customSlides = draft.hero.rightPanel.customSlides.filter(
                      (_, i) => i !== idx
                    );
                    setDraft((d) => ({
                      ...d,
                      hero: { ...d.hero, rightPanel: { ...d.hero.rightPanel, customSlides } }
                    }));
                  }}
                >
                  Remove slide
                </button>
              </div>
            ))}
            <button
              type="button"
              className="text-xs font-semibold text-gold-300"
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  hero: {
                    ...d.hero,
                    rightPanel: {
                      ...d.hero.rightPanel,
                      customSlides: [
                        ...d.hero.rightPanel.customSlides,
                        {
                          imageUrl:
                            "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
                          title: "New slide",
                          description: "",
                          path: "/shop"
                        }
                      ]
                    }
                  }
                }))
              }
            >
              + Add custom slide
            </button>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="text-sm font-semibold text-sand-50">Home — curated grid</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Eyebrow">
            <input
              className={inputClass()}
              value={draft.curated.eyebrow}
              onChange={(e) =>
                setDraft((d) => ({ ...d, curated: { ...d.curated, eyebrow: e.target.value } }))
              }
            />
          </Field>
          <Field label="Title">
            <input
              className={inputClass()}
              value={draft.curated.title}
              onChange={(e) =>
                setDraft((d) => ({ ...d, curated: { ...d.curated, title: e.target.value } }))
              }
            />
          </Field>
          <Field label="Shop all label">
            <input
              className={inputClass()}
              value={draft.curated.shopAllLabel}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  curated: { ...d.curated, shopAllLabel: e.target.value }
                }))
              }
            />
          </Field>
          <Field label="Number of collection cards (1–6)">
            <input
              type="number"
              min={1}
              max={6}
              className={inputClass()}
              value={draft.curated.gridCount}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  curated: { ...d.curated, gridCount: Number(e.target.value) || 3 }
                }))
              }
            />
          </Field>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="text-sm font-semibold text-sand-50">Footer</div>
        <div className="mt-4 grid gap-3">
          <Field label="Brand line">
            <input
              className={inputClass()}
              value={draft.footer.brandLine}
              onChange={(e) =>
                setDraft((d) => ({ ...d, footer: { ...d.footer, brandLine: e.target.value } }))
              }
            />
          </Field>
          <Field label="Blurb">
            <textarea
              className={`${inputClass()} min-h-[90px] py-2`}
              value={draft.footer.blurb}
              onChange={(e) =>
                setDraft((d) => ({ ...d, footer: { ...d.footer, blurb: e.target.value } }))
              }
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <div className="text-xs font-semibold text-sand-50/55">{draft.footer.helpTitle}</div>
              <input
                className={`${inputClass()} mt-2`}
                value={draft.footer.helpTitle}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, footer: { ...d.footer, helpTitle: e.target.value } }))
                }
              />
              {draft.footer.helpLinks.map((link, idx) => (
                <div key={idx} className="mt-2 flex gap-2">
                  <input
                    className={`${inputClass()} flex-1`}
                    placeholder="Label"
                    value={link.label}
                    onChange={(e) => {
                      const helpLinks = draft.footer.helpLinks.map((l, i) =>
                        i === idx ? { ...l, label: e.target.value } : l
                      );
                      setDraft((d) => ({ ...d, footer: { ...d.footer, helpLinks } }));
                    }}
                  />
                  <input
                    className={`${inputClass()} flex-1`}
                    placeholder="Path (optional)"
                    value={link.path ?? ""}
                    onChange={(e) => {
                      const helpLinks = draft.footer.helpLinks.map((l, i) =>
                        i === idx ? { ...l, path: e.target.value } : l
                      );
                      setDraft((d) => ({ ...d, footer: { ...d.footer, helpLinks } }));
                    }}
                  />
                </div>
              ))}
            </div>
            <div>
              <div className="text-xs font-semibold text-sand-50/55">
                {draft.footer.companyTitle}
              </div>
              <input
                className={`${inputClass()} mt-2`}
                value={draft.footer.companyTitle}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    footer: { ...d.footer, companyTitle: e.target.value }
                  }))
                }
              />
              {draft.footer.companyLinks.map((link, idx) => (
                <div key={idx} className="mt-2 flex gap-2">
                  <input
                    className={`${inputClass()} flex-1`}
                    placeholder="Label"
                    value={link.label}
                    onChange={(e) => {
                      const companyLinks = draft.footer.companyLinks.map((l, i) =>
                        i === idx ? { ...l, label: e.target.value } : l
                      );
                      setDraft((d) => ({ ...d, footer: { ...d.footer, companyLinks } }));
                    }}
                  />
                  <input
                    className={`${inputClass()} flex-1`}
                    placeholder="Path (optional)"
                    value={link.path ?? ""}
                    onChange={(e) => {
                      const companyLinks = draft.footer.companyLinks.map((l, i) =>
                        i === idx ? { ...l, path: e.target.value } : l
                      );
                      setDraft((d) => ({ ...d, footer: { ...d.footer, companyLinks } }));
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          <Field label="Copyright suffix">
            <input
              className={inputClass()}
              value={draft.footer.copyrightSuffix}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  footer: { ...d.footer, copyrightSuffix: e.target.value }
                }))
              }
            />
          </Field>
        </div>
      </section>
    </div>
  );
}
