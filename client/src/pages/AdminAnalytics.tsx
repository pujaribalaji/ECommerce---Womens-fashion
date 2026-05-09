import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { api } from "../lib/api";
import { formatInr } from "../lib/money";

const GOLD = "#E7C46C";
const MUTED = [
  GOLD,
  "#94a3b8",
  "#38bdf8",
  "#34d399",
  "#fb7185",
  "#c084fc",
  "#fcd34d",
  "#fdba74"
];

type Analytics = {
  totalOrders: number;
  revenueInr: number;
  byStatus: Record<string, number>;
  last7Days: number;
  byChannel: Record<string, number>;
};

export function AdminAnalytics({ adminKey }: { adminKey: string }) {
  const [data, setData] = useState<Analytics | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ok = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const { data: d } = await api.get<{ ok?: boolean } & Analytics>("/api/admin/analytics", {
          headers: { "x-admin-key": adminKey }
        });
        if (!ok) return;
        const { totalOrders, revenueInr, byStatus, last7Days, byChannel } = d as Analytics;
        setData({
          totalOrders,
          revenueInr,
          byStatus: byStatus || {},
          last7Days,
          byChannel: byChannel || {}
        });
      } catch (e: any) {
        if (!ok) return;
        setErr(e?.response?.data?.error ?? e?.message ?? "Failed to load");
      } finally {
        if (ok) setLoading(false);
      }
    })();
    return () => {
      ok = false;
    };
  }, [adminKey]);

  const pieData = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.byStatus).map(([name, value]) => ({
      name,
      value
    }));
  }, [data]);

  const channelData = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.byChannel).map(([name, value]) => ({
      name: name.replace(/_/g, " "),
      value
    }));
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="text-sm font-semibold text-sand-50">Insights</div>
        </div>
        {err && (
          <div className="mt-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
            {err}
          </div>
        )}
        {loading ? (
          <div className="mt-4 text-sm text-sand-50/70">Loading…</div>
        ) : !data ? null : (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-ink-950/40 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-sand-50/45">
                  Orders
                </div>
                <div className="mt-2 font-display text-3xl text-sand-50">
                  {data.totalOrders}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-ink-950/40 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-sand-50/45">
                  Revenue snapshot
                </div>
                <div className="mt-2 font-display text-3xl text-gold-300">
                  {formatInr(data.revenueInr)}
                </div>
                <div className="mt-1 text-xs text-sand-50/50">
                  Excludes cancelled & failed orders
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-ink-950/40 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-sand-50/45">
                  Last 7 days
                </div>
                <div className="mt-2 font-display text-3xl text-sand-50">{data.last7Days}</div>
                <div className="mt-1 text-xs text-sand-50/50">New orders in window</div>
              </div>
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-2">
              <div className="h-[340px]">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sand-50/55">
                  By status
                </div>
                {pieData.length === 0 ? (
                  <div className="text-sm text-sand-50/60">No order data.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={110}
                        label={({ name, percent }) =>
                          `${name} ${percent != null ? (percent * 100).toFixed(0) : 0}%`
                        }
                      >
                        {pieData.map((_, i) => (
                          <Cell key={`c-${i}`} fill={MUTED[i % MUTED.length]} stroke="rgba(255,255,255,0.06)" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          background: "#14171f",
                          border: "1px solid rgba(255,255,255,0.12)"
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="h-[340px]">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sand-50/55">
                  Channel
                </div>
                {channelData.length === 0 ? (
                  <div className="text-sm text-sand-50/60">No channel data.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={channelData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="name" stroke="#cbd5f5" />
                      <YAxis allowDecimals={false} stroke="#cbd5f5" />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          background: "#14171f",
                          border: "1px solid rgba(255,255,255,0.12)"
                        }}
                      />
                      <Bar dataKey="value" fill={GOLD} radius={[8, 8, 0, 0]} name="Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
