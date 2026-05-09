import { Fragment, useEffect, useMemo, useState } from "react";
import { Link, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Container } from "../components/Container";
import { Button } from "../components/Button";
import { cn } from "../lib/cn";
import { api, fetchProducts, type Product } from "../lib/api";
import { formatInr } from "../lib/money";
import { resolveImageUrl } from "../lib/images";
import { AdminSiteDashboard } from "./AdminSite";
import { AdminAnalytics } from "./AdminAnalytics";
import { AdminSecurity } from "./AdminSecurity";

const KEY_STORAGE = "aarnika.adminKey.v1";

function useAdminKey() {
  const [key, setKey] = useState(() => localStorage.getItem(KEY_STORAGE) ?? "");
  const save = (v: string) => {
    setKey(v);
    localStorage.setItem(KEY_STORAGE, v);
  };
  const clear = () => save("");
  return { key, save, clear };
}

function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <Container className="py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs tracking-[0.35em] text-sand-50/50">ADMIN</div>
          <div className="mt-2 font-display text-3xl text-sand-50">
            Aarnika control room
          </div>
        </div>
        <Link to="/" className="text-sm font-semibold text-gold-300">
          Back to store <span aria-hidden>→</span>
        </Link>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="h-fit rounded-3xl border border-white/10 bg-white/5 p-4 lg:col-span-1">
          {[
            { to: "/admin/site", label: "Dashboard" },
            { to: "/admin/analytics", label: "Analytics" },
            { to: "/admin/products", label: "Products" },
            { to: "/admin/orders", label: "Orders" },
            { to: "/admin/security", label: "Security" }
          ].map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                cn(
                  "block rounded-2xl px-4 py-3 text-sm font-semibold text-sand-50/70 hover:bg-white/6 hover:text-sand-50",
                  isActive && "bg-white/8 text-gold-300"
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </div>
        <div className="lg:col-span-4">{children}</div>
      </div>
    </Container>
  );
}

function Gate({ onUnlock }: { onUnlock: (key: string) => void }) {
  const [val, setVal] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [resetSecret, setResetSecret] = useState("");
  const [newKey, setNewKey] = useState("");
  const [recoverBusy, setRecoverBusy] = useState(false);
  const [recoverMsg, setRecoverMsg] = useState<string | null>(null);

  async function tryUnlock() {
    const k = val.trim();
    if (!k) return;
    setBusy(true);
    setErr(null);
    try {
      await api.get("/api/admin/site", { headers: { "x-admin-key": k } });
      onUnlock(k);
    } catch {
      setErr("Incorrect key — check ADMIN_KEY in server/.env or your last rotated secret.");
    } finally {
      setBusy(false);
    }
  }

  async function recover() {
    if (newKey.trim().length < 8) {
      setRecoverMsg("New key must be at least 8 characters.");
      return;
    }
    setRecoverBusy(true);
    setRecoverMsg(null);
    try {
      await api.post("/api/admin/recover-key", {
        resetSecret: resetSecret.trim(),
        newKey: newKey.trim()
      });
      setRecoverMsg("Saved. Unlock below with your new secret.");
      setVal(newKey.trim());
      setNewKey("");
      setResetSecret("");
    } catch (e: any) {
      const status = e?.response?.status;
      setRecoverMsg(
        status === 403 ? "Wrong recovery secret." : e?.response?.data?.error ?? "Recovery failed."
      );
    } finally {
      setRecoverBusy(false);
    }
  }

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8">
        <div className="text-xs tracking-[0.35em] text-sand-50/50">ADMIN KEY</div>
        <div className="mt-2 font-display text-3xl text-sand-50">
          Enter secret key
        </div>
        <div className="mt-3 text-sm text-sand-50/70">
          Use the value from <span className="text-gold-200">ADMIN_KEY</span> in{" "}
          <span className="text-gold-200">server/.env</span> or your database-stored key after
          rotation.
        </div>
        {err && (
          <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
            {err}
          </div>
        )}
        <div className="mt-6 grid gap-2">
          <input
            value={val}
            type="password"
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void tryUnlock();
            }}
            placeholder="Admin secret key"
            className="h-12 rounded-2xl border border-white/12 bg-ink-950/40 px-4 text-sm text-sand-50 placeholder:text-sand-50/35 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
          />
          <Button size="lg" onClick={() => void tryUnlock()} disabled={!val.trim() || busy}>
            {busy ? "Checking…" : "Unlock admin"}
          </Button>
        </div>

        <details className="mt-10 rounded-2xl border border-white/12 bg-ink-950/35 px-5 py-4">
          <summary className="cursor-pointer text-sm font-semibold text-sand-50/90">
            Reset admin key (recovery secret)
          </summary>
          <div className="mt-4 space-y-3 text-xs text-sand-50/55">
            <p>
              Set <span className="text-gold-200">ADMIN_RESET_SECRET</span> on the API server first.
              Paste it here plus a new admin key — this updates the stored credential without needing
              the old key.
            </p>
            {recoverMsg && (
              <div className="rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-sm text-sand-50/85">
                {recoverMsg}
              </div>
            )}
            <input
              type="password"
              value={resetSecret}
              onChange={(e) => setResetSecret(e.target.value)}
              placeholder="ADMIN_RESET_SECRET value"
              className="h-11 w-full rounded-2xl border border-white/12 bg-ink-950/45 px-3 text-sm text-sand-50"
            />
            <input
              type="password"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="New admin key (min 8 chars)"
              className="h-11 w-full rounded-2xl border border-white/12 bg-ink-950/45 px-3 text-sm text-sand-50"
            />
            <Button
              size="md"
              variant="outline"
              disabled={recoverBusy}
              onClick={() => void recover()}
            >
              {recoverBusy ? "Saving…" : "Rotate using recovery secret"}
            </Button>
          </div>
        </details>
      </div>
    </Container>
  );
}

function Products({ adminKey }: { adminKey: string }) {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Kurtas",
    collectionSlug: "summer-loom",
    priceInr: 1999,
    mrpInr: 2499,
    images: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
    sizes: "M, L, XL, XXL, XXXL",
    badges: "New",
    fabric: "Cotton",
    fit: "Easy",
    care: "Machine wash cold",
    inStock: true
  });

  async function reload() {
    setLoading(true);
    setErr(null);
    try {
      const data = await fetchProducts({ sort: "new" });
      setItems(data);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  const payload = useMemo(() => {
    return {
      name: form.name,
      description: form.description,
      category: form.category,
      collectionSlug: form.collectionSlug,
      priceInr: Number(form.priceInr),
      mrpInr: Number(form.mrpInr),
      images: form.images
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      sizes: form.sizes
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean),
      badges: form.badges
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      fabric: form.fabric,
      fit: form.fit,
      care: form.care,
      inStock: Boolean(form.inStock)
    };
  }, [form]);

  async function addProduct() {
    setErr(null);
    try {
      const { data } = await api.post(
        "/api/admin/products",
        payload,
        { headers: { "x-admin-key": adminKey } }
      );
      setItems((prev) => [data.item, ...prev]);
      setForm((f) => ({ ...f, name: "", description: "" }));
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? e?.message ?? "Failed to add");
    }
  }

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setErr(null);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("images", f));
      const { data } = await api.post<{ urls: string[] }>("/api/admin/uploads", fd, {
        headers: { "x-admin-key": adminKey, "Content-Type": "multipart/form-data" }
      });
      const joined = data.urls.join(", ");
      setForm((f) => ({
        ...f,
        images: f.images ? `${f.images}, ${joined}` : joined
      }));
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function del(id: string) {
    setErr(null);
    try {
      await api.delete(`/api/admin/products/${id}`, {
        headers: { "x-admin-key": adminKey }
      });
      setItems((prev) => prev.filter((p) => p._id !== id));
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? e?.message ?? "Failed to delete");
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="text-sm font-semibold text-sand-50">Add product</div>
        {err && (
          <div className="mt-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
            {err}
          </div>
        )}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {[
            ["Name", "name"],
            ["Category", "category"],
            ["Collection slug", "collectionSlug"],
            ["Price (INR)", "priceInr"],
            ["MRP (INR)", "mrpInr"],
            ["Sizes (comma)", "sizes"],
            ["Badges (comma)", "badges"],
            ["Images URLs (comma)", "images"],
            ["Fabric", "fabric"],
            ["Fit", "fit"],
            ["Care", "care"]
          ].map(([label, key]) => (
            <label key={key} className="grid gap-2 text-xs text-sand-50/60">
              {label}
              <input
                value={(form as any)[key]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [key]: e.target.value }))
                }
                className="h-11 rounded-2xl border border-white/12 bg-ink-950/40 px-4 text-sm text-sand-50 focus:outline-none"
              />
            </label>
          ))}
          <div className="md:col-span-2 rounded-2xl border border-white/10 bg-ink-950/35 p-4">
            <div className="text-xs font-semibold text-sand-50/70">Upload images</div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={(e) => uploadFiles(e.target.files)}
                className="block text-sm text-sand-50/70 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-sand-50 hover:file:bg-white/15"
              />
              <div className="text-xs text-sand-50/55">
                {uploading ? "Uploading…" : "Choose files to upload; URLs will be appended automatically."}
              </div>
            </div>
          </div>
          <label className="grid gap-2 text-xs text-sand-50/60 md:col-span-2">
            Description
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="min-h-24 rounded-2xl border border-white/12 bg-ink-950/40 px-4 py-3 text-sm text-sand-50 focus:outline-none"
            />
          </label>
        </div>
        <div className="mt-4 flex gap-3">
          <Button onClick={addProduct} disabled={!form.name || !form.description}>
            Add
          </Button>
          <Button variant="outline" onClick={reload}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-end justify-between gap-3">
          <div className="text-sm font-semibold text-sand-50">Products</div>
          <div className="text-xs text-sand-50/55">{items.length} items</div>
        </div>

        {loading ? (
          <div className="mt-4 text-sm text-sand-50/70">Loading…</div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-sand-50/55">
                <tr>
                  <th className="py-2">Name</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Price</th>
                  <th className="py-2">Stock</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody className="text-sand-50/80">
                {items.map((p) => (
                  <tr key={p._id} className="border-t border-white/8">
                    <td className="py-3">
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-xs text-sand-50/55">{p.slug}</div>
                    </td>
                    <td className="py-3">{p.category}</td>
                    <td className="py-3">{formatInr(p.priceInr)}</td>
                    <td className="py-3">{p.inStock ? "In stock" : "Out"}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => del(p._id)}
                        className="rounded-full border border-white/12 bg-white/6 px-3 py-2 text-xs font-semibold text-sand-50/70 hover:bg-white/10"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Orders({ adminKey }: { adminKey: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function reload() {
    setLoading(true);
    setErr(null);
    try {
      const { data } = await api.get("/api/orders", {
        headers: { "x-admin-key": adminKey }
      });
      setItems(data.items);
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? e?.message ?? "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  async function setStatus(id: string, status: string) {
    try {
      await api.patch(
        `/api/orders/${id}/status`,
        { status },
        { headers: { "x-admin-key": adminKey } }
      );
      await reload();
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? e?.message ?? "Failed to update status");
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-end justify-between gap-3">
          <div className="text-sm font-semibold text-sand-50">Orders</div>
          <button
            onClick={reload}
            className="rounded-full border border-white/12 bg-white/6 px-3 py-2 text-xs font-semibold text-sand-50/70 hover:bg-white/10"
          >
            Refresh
          </button>
        </div>
        {err && (
          <div className="mt-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
            {err}
          </div>
        )}
        {loading ? (
          <div className="mt-4 text-sm text-sand-50/70">Loading…</div>
        ) : items.length === 0 ? (
          <div className="mt-4 text-sm text-sand-50/70">No orders yet.</div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-sand-50/55">
                <tr>
                  <th className="py-2">Order</th>
                  <th className="py-2">Customer</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Fulfillment</th>
                  <th className="py-2">Detail</th>
                </tr>
              </thead>
              <tbody className="text-sand-50/80">
                {items.map((o) => (
                  <Fragment key={o._id}>
                    <tr className="border-t border-white/8">
                      <td className="py-3 align-top">
                        <div className="font-semibold">{o.orderNo}</div>
                        <div className="text-xs text-sand-50/55">
                          {new Date(o.createdAt).toLocaleString()}
                        </div>
                        {o.channel && o.channel !== "website" ? (
                          <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-gold-200/70">
                            {String(o.channel).replace(/_/g, " ")}
                          </div>
                        ) : null}
                      </td>
                      <td className="py-3 align-top">
                        <div className="font-semibold">
                          {o.customer.firstName} {o.customer.lastName}
                        </div>
                        <div className="text-xs text-sand-50/55">{o.customer.phone}</div>
                      </td>
                      <td className="py-3 align-top">{formatInr(o.totals.total)}</td>
                      <td className="py-3 align-top capitalize">{o.status}</td>
                      <td className="py-3 align-top">
                        <select
                          value={o.status}
                          onChange={(e) => setStatus(o._id, e.target.value)}
                          className="h-10 rounded-full border border-white/12 bg-ink-950/40 px-4 text-sm text-sand-50 focus:outline-none"
                        >
                          {[
                            "paid",
                            "packed",
                            "shipped",
                            "delivered",
                            "cancelled",
                            "failed",
                            "created"
                          ].map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 align-top">
                        <button
                          type="button"
                          onClick={() =>
                            setExpanded((id) => (id === String(o._id) ? null : String(o._id)))
                          }
                          className="rounded-full border border-white/12 bg-white/6 px-3 py-2 text-xs font-semibold text-gold-200 hover:bg-white/10"
                        >
                          {expanded === String(o._id) ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>
                    {expanded === String(o._id) ? (
                      <tr className="border-t border-white/6 bg-black/35">
                        <td colSpan={6} className="px-4 py-6">
                          <div className="grid gap-6 lg:grid-cols-2">
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-[0.25em] text-sand-50/45">
                                Shipping
                              </div>
                              <div className="mt-3 space-y-1 text-sm text-sand-50/85">
                                <div className="font-semibold">
                                  {o.customer.firstName} {o.customer.lastName}
                                </div>
                                <div>{o.customer.email}</div>
                                <div>{o.customer.phone}</div>
                                <div className="pt-2 text-sand-50/70">{o.customer.address}</div>
                                {o.customer.landmark ? (
                                  <div className="text-xs text-gold-200/85">
                                    Near {o.customer.landmark}
                                  </div>
                                ) : null}
                                <div>
                                  {o.customer.city}
                                  {o.customer.state ? `, ${o.customer.state}` : ""} — PIN{" "}
                                  {o.customer.pin}
                                </div>
                              </div>
                              <div className="mt-4 text-xs text-sand-50/50">
                                Payment · {o.payment?.provider}
                                {o.payment?.razorpayPaymentId
                                  ? ` · ${o.payment.razorpayPaymentId}`
                                  : ""}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-[0.25em] text-sand-50/45">
                                Lines
                              </div>
                              <div className="mt-3 space-y-4">
                                {(o.lines ?? []).map((l: any) => (
                                  <div key={`${o._id}-${l.slug}-${l.size}`} className="flex gap-3">
                                    <img
                                      src={
                                        l.imageUrl
                                          ? resolveImageUrl(String(l.imageUrl))
                                          : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='120'/%3E"
                                      }
                                      alt=""
                                      className="h-24 w-[4.75rem] rounded-2xl object-cover"
                                    />
                                    <div>
                                      <div className="font-semibold">{l.name}</div>
                                      <div className="text-xs text-sand-50/55">
                                        Size <span className="text-sand-50">{l.size}</span> ×{" "}
                                        {l.qty}
                                      </div>
                                      <div className="mt-1 text-sm text-gold-200">
                                        {formatInr(Number(l.priceInr || 0) * Number(l.qty || 0))}{" "}
                                        <span className="text-xs text-sand-50/55">
                                          ({formatInr(Number(l.priceInr || 0))} each)
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Admin() {
  const nav = useNavigate();
  const loc = useLocation();
  const { key, save, clear } = useAdminKey();
  const [unlocked, setUnlocked] = useState(Boolean(key));

  /** Leaving any `/admin/*` route clears stored key immediately. */
  useEffect(() => {
    return () => {
      try {
        localStorage.removeItem(KEY_STORAGE);
      } catch {
        //
      }
    };
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    if (loc.pathname === "/admin") nav("/admin/site", { replace: true });
  }, [unlocked, loc.pathname, nav]);

  if (!unlocked) {
    return (
      <Gate
        onUnlock={(k) => {
          save(k);
          setUnlocked(true);
        }}
      />
    );
  }

  const adminKey = key;

  return (
    <AdminShell>
      <div className="mb-4 flex items-center justify-end gap-2">
        <button
          className="rounded-full border border-white/12 bg-white/6 px-3 py-2 text-xs font-semibold text-sand-50/70 hover:bg-white/10"
          onClick={() => {
            clear();
            setUnlocked(false);
            nav("/", { replace: true });
          }}
        >
          Lock admin
        </button>
      </div>

      <Routes>
        <Route path="site" element={<AdminSiteDashboard adminKey={adminKey} />} />
        <Route path="analytics" element={<AdminAnalytics adminKey={adminKey} />} />
        <Route path="products" element={<Products adminKey={adminKey} />} />
        <Route path="orders" element={<Orders adminKey={adminKey} />} />
        <Route
          path="security"
          element={<AdminSecurity adminKey={adminKey} onRotated={(next) => save(next)} />}
        />
        <Route path="*" element={<div className="text-sm text-sand-50/70">Select a section.</div>} />
      </Routes>
    </AdminShell>
  );
}

