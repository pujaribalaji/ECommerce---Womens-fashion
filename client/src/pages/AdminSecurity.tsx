import { useState } from "react";
import { Button } from "../components/Button";
import { api } from "../lib/api";

export function AdminSecurity({
  adminKey,
  onRotated
}: {
  adminKey: string;
  onRotated: (next: string) => void;
}) {
  const [newKey, setNewKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function rotate() {
    const k = newKey.trim();
    if (k.length < 8) {
      setErr("New key must be at least 8 characters.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await api.put("/api/admin/secret", { newKey: k }, { headers: { "x-admin-key": adminKey } });
      setNewKey("");
      onRotated(k);
      window.dispatchEvent(new CustomEvent("aarnika-toast", { detail: "Admin key updated" }));
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? e?.message ?? "Could not rotate key");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="text-sm font-semibold text-sand-50">Admin key rotation</div>
      <div className="mt-2 text-sm text-sand-50/65">
        After rotation, paste the new secret into Gate when you revisit this dashboard. Existing
        browser sessions updated here stay unlocked.
      </div>
      {err && (
        <div className="mt-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
          {err}
        </div>
      )}
      <div className="mt-5 grid gap-3">
        <input
          value={newKey}
          type="password"
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="New admin secret (min 8 characters)"
          className="h-11 rounded-2xl border border-white/12 bg-ink-950/40 px-4 text-sm text-sand-50 placeholder:text-sand-50/35 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
        />
        <Button size="lg" disabled={busy} onClick={() => void rotate()}>
          {busy ? "Saving…" : "Rotate admin key"}
        </Button>
      </div>
    </div>
  );
}
