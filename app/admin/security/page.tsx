"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Transaction {
  id: string;
  user: string;
  amount: number;
  status: "completed" | "pending" | "failed" | "suspicious";
  timestamp: string;
  endpoint: string;
}

interface AuthEvent {
  id: string;
  user: string;
  type: "login" | "failed" | "blocked" | "2fa";
  ip: string;
  timestamp: string;
  country: string;
}

interface ApiEndpoint {
  name: string;
  url: string;
  status: "healthy" | "degraded" | "down";
  responseTime: number;
  uptime: number;
  lastChecked: string;
}

interface ChartPoint {
  hour: string;
  txns: number;
  failed: number;
}

// ─── Mock Data Generators ─────────────────────────────────────────────────────
const USERS = ["pioneer_7x", "pi_user_42", "node_alpha", "mainet_98", "pi_whale_3", "anon_user", "sdk_test_01"];
const COUNTRIES = ["🇺🇸 US", "🇸🇦 SA", "🇪🇬 EG", "🇩🇪 DE", "🇯🇵 JP", "🇰🇷 KR", "🇧🇷 BR"];
const ENDPOINTS = [
  { name: "Pi Auth", url: "/api/pi/auth", status: "healthy" as const, responseTime: 142, uptime: 99.97, lastChecked: "2s ago" },
  { name: "Payment Approve", url: "/api/payments/approve", status: "healthy" as const, responseTime: 238, uptime: 99.91, lastChecked: "5s ago" },
  { name: "Payment Complete", url: "/api/payments/complete", status: "degraded" as const, responseTime: 892, uptime: 97.43, lastChecked: "3s ago" },
  { name: "Payment Incomplete", url: "/api/payments/incomplete", status: "healthy" as const, responseTime: 187, uptime: 99.88, lastChecked: "8s ago" },
  { name: "User Verify", url: "/api/user/verify", status: "healthy" as const, responseTime: 312, uptime: 99.76, lastChecked: "1s ago" },
  { name: "Pi SDK Init", url: "/api/pi/sdk", status: "down" as const, responseTime: 0, uptime: 91.20, lastChecked: "12s ago" },
];

function genTxns(): Transaction[] {
  const statuses: Transaction["status"][] = ["completed", "completed", "completed", "pending", "failed", "suspicious"];
  return Array.from({ length: 12 }, (_, i) => ({
    id: `PI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    user: USERS[Math.floor(Math.random() * USERS.length)],
    amount: parseFloat((Math.random() * 500 + 0.5).toFixed(4)),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    timestamp: `${Math.floor(Math.random() * 59)}s ago`,
    endpoint: ["/approve", "/complete", "/incomplete"][Math.floor(Math.random() * 3)],
  }));
}

function genAuthEvents(): AuthEvent[] {
  const types: AuthEvent["type"][] = ["login", "login", "failed", "failed", "blocked", "2fa"];
  return Array.from({ length: 10 }, (_, i) => ({
    id: `AUTH-${i}`,
    user: USERS[Math.floor(Math.random() * USERS.length)],
    type: types[Math.floor(Math.random() * types.length)],
    ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.x.x`,
    timestamp: `${Math.floor(Math.random() * 59)}m ago`,
    country: COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)],
  }));
}

function genChartData(): ChartPoint[] {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, "0")}:00`,
    txns: Math.floor(Math.random() * 180 + 20),
    failed: Math.floor(Math.random() * 15),
  }));
}

// ─── Sub Components ───────────────────────────────────────────────────────────
function PulsingDot({ color }: { color: string }) {
  return (
    <span className="relative flex h-2 w-2">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${color}`} />
      <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`} />
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    pending: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    failed: "bg-red-500/15 text-red-400 border border-red-500/30",
    suspicious: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
    healthy: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    degraded: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    down: "bg-red-500/15 text-red-400 border border-red-500/30",
    login: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
    failed_auth: "bg-red-500/15 text-red-400 border border-red-500/30",
    blocked: "bg-red-700/15 text-red-300 border border-red-700/30",
    "2fa": "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30",
  };
  const key = status === "failed" && !["completed","pending","suspicious"].includes(status) ? "failed_auth" : status;
  return (
    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${map[status] || map[key] || "bg-gray-500/15 text-gray-400"}`}>
      {status.toUpperCase()}
    </span>
  );
}

function MiniBarChart({ data }: { data: ChartPoint[] }) {
  const max = Math.max(...data.map((d) => d.txns));
  return (
    <div className="flex items-end gap-0.5 h-16 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
          <div
            className="w-full rounded-sm bg-amber-500/70 hover:bg-amber-400 transition-colors cursor-pointer"
            style={{ height: `${(d.txns / max) * 100}%` }}
            title={`${d.hour}: ${d.txns} txns`}
          />
          <div
            className="w-full rounded-sm bg-red-500/60"
            style={{ height: `${(d.failed / max) * 100}%`, minHeight: d.failed > 0 ? "2px" : "0" }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SecurityDashboard() {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([]);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [endpoints] = useState<ApiEndpoint[]>(ENDPOINTS);
  const [lastRefresh, setLastRefresh] = useState<string>("");
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    setTxns(genTxns());
    setAuthEvents(genAuthEvents());
    setChartData(genChartData());
    setLastRefresh(new Date().toLocaleTimeString());
  }, []);

  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (tick > 0 && tick % 30 === 0) refresh();
  }, [tick, refresh]);

  // Stats
  const totalTxns = txns.length;
  const failedTxns = txns.filter((t) => t.status === "failed" || t.status === "suspicious").length;
  const failedLogins = authEvents.filter((a) => a.type === "failed" || a.type === "blocked").length;
  const activeSessions = authEvents.filter((a) => a.type === "login" || a.type === "2fa").length;
  const apiHealthy = endpoints.filter((e) => e.status === "healthy").length;

  const statCards = [
    { label: "Pi Transactions", value: totalTxns, sub: `${failedTxns} flagged`, icon: "⬡", color: "text-amber-400", border: "border-amber-500/20", glow: "shadow-amber-500/10" },
    { label: "Auth Events", value: authEvents.length, sub: `${failedLogins} blocked`, icon: "🔐", color: "text-red-400", border: "border-red-500/20", glow: "shadow-red-500/10" },
    { label: "Active Sessions", value: activeSessions, sub: "live pioneers", icon: "👤", color: "text-cyan-400", border: "border-cyan-500/20", glow: "shadow-cyan-500/10" },
    { label: "API Health", value: `${apiHealthy}/${endpoints.length}`, sub: "endpoints online", icon: "📡", color: "text-emerald-400", border: "border-emerald-500/20", glow: "shadow-emerald-500/10" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-mono">
      {/* Scanline overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.02]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.3) 2px,rgba(255,255,255,0.3) 4px)" }} />

      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-sm">⬡</div>
            <div>
              <div className="text-xs text-gray-500">ADM Global / admin</div>
              <div className="text-sm font-bold text-white tracking-wider">SECURITY CENTER</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <PulsingDot color="bg-emerald-400" />
              <span>LIVE</span>
            </div>
            <span>Refresh: {30 - (tick % 30)}s</span>
            <span className="text-gray-600">{lastRefresh}</span>
            <button onClick={refresh} className="px-3 py-1 border border-gray-700 rounded text-gray-400 hover:border-amber-500/50 hover:text-amber-400 transition-colors">
              ↻ Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Security Alert Banner */}
        {failedTxns > 2 && (
          <div className="border border-red-500/40 bg-red-500/5 rounded-lg px-4 py-3 flex items-center gap-3 text-sm">
            <span className="text-red-400 text-lg">⚠</span>
            <span className="text-red-300">Suspicious activity detected — <strong>{failedTxns} flagged transactions</strong> in current session</span>
            <span className="ml-auto text-red-500/60 text-xs">Auto-refresh active</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map((s) => (
            <div key={s.label} className={`border ${s.border} bg-gray-900/60 rounded-xl p-4 shadow-lg ${s.glow}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{s.icon}</span>
                <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
              </div>
              <div className="text-xs text-gray-400">{s.label}</div>
              <div className="text-[10px] text-gray-600 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Chart + API Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Chart */}
          <div className="lg:col-span-2 border border-gray-800 bg-gray-900/60 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">Pi Payment Volume</div>
                <div className="text-sm text-white font-semibold">24h Transaction Activity</div>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-gray-500">
                <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 bg-amber-500/70 rounded-sm" /> Transactions</span>
                <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 bg-red-500/60 rounded-sm" /> Failed</span>
              </div>
            </div>
            <MiniBarChart data={chartData} />
            <div className="flex justify-between text-[9px] text-gray-700 mt-1">
              <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
            </div>
          </div>

          {/* API Endpoints */}
          <div className="border border-gray-800 bg-gray-900/60 rounded-xl p-4">
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">API Monitor</div>
            <div className="text-sm text-white font-semibold mb-3">Endpoint Health</div>
            <div className="space-y-2">
              {endpoints.map((ep) => (
                <div key={ep.name} className="flex items-center justify-between py-1.5 border-b border-gray-800/60 last:border-0">
                  <div className="flex items-center gap-2">
                    <PulsingDot color={ep.status === "healthy" ? "bg-emerald-400" : ep.status === "degraded" ? "bg-amber-400" : "bg-red-400"} />
                    <div>
                      <div className="text-xs text-gray-300">{ep.name}</div>
                      <div className="text-[9px] text-gray-600">{ep.url}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-mono ${ep.status === "down" ? "text-red-400" : ep.responseTime > 500 ? "text-amber-400" : "text-emerald-400"}`}>
                      {ep.status === "down" ? "—" : `${ep.responseTime}ms`}
                    </div>
                    <div className="text-[9px] text-gray-600">{ep.uptime}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions + Auth Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Transaction Logs */}
          <div className="border border-gray-800 bg-gray-900/60 rounded-xl p-4">
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Pi SDK</div>
            <div className="text-sm text-white font-semibold mb-3">Transaction Logs</div>
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {txns.map((t) => (
                <div key={t.id} className="flex items-center justify-between bg-gray-800/40 rounded-lg px-3 py-2 hover:bg-gray-800/70 transition-colors">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={t.status} />
                    <div>
                      <div className="text-xs text-gray-300 font-mono">{t.id}</div>
                      <div className="text-[9px] text-gray-600">{t.user} · {t.endpoint}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-amber-400 font-mono">π {t.amount}</div>
                    <div className="text-[9px] text-gray-600">{t.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Auth Events */}
          <div className="border border-gray-800 bg-gray-900/60 rounded-xl p-4">
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Auth Layer</div>
            <div className="text-sm text-white font-semibold mb-3">Login & Auth Events</div>
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {authEvents.map((a) => (
                <div key={a.id} className="flex items-center justify-between bg-gray-800/40 rounded-lg px-3 py-2 hover:bg-gray-800/70 transition-colors">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={a.type} />
                    <div>
                      <div className="text-xs text-gray-300">{a.user}</div>
                      <div className="text-[9px] text-gray-600">{a.ip} · {a.country}</div>
                    </div>
                  </div>
                  <div className="text-[9px] text-gray-600 text-right">{a.timestamp}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security Rules */}
        <div className="border border-gray-800 bg-gray-900/60 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Protection Rules</div>
          <div className="text-sm text-white font-semibold mb-3">Active Security Policies</div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { rule: "Pi API Key", status: "Protected in .env", ok: true },
              { rule: "Admin Routes", status: "Token Required", ok: true },
              { rule: "Payment Hooks", status: "Server-side only", ok: true },
              { rule: "SDK Init", status: "Client restricted", ok: false },
            ].map((r) => (
              <div key={r.rule} className={`border ${r.ok ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"} rounded-lg p-3`}>
                <div className="text-lg mb-1">{r.ok ? "🔒" : "⚠️"}</div>
                <div className="text-xs font-semibold text-gray-200">{r.rule}</div>
                <div className={`text-[10px] mt-0.5 ${r.ok ? "text-emerald-500" : "text-red-400"}`}>{r.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-gray-700 pb-4">
          ADM Global Security Center · Pi Network Ecosystem · Data refreshes every 30s · Mock data for display
        </div>
      </main>
    </div>
  );
}
