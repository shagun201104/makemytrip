"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Plane,
  PlaneTakeoff,
  PlaneLanding,
  Clock,
  Bell,
  BellRing,
  Search,
  X,
  AlertTriangle,
  CircleCheckBig,
  Radar,
  ArrowRight,
  Plus,
  Gauge,
  Navigation,
  Trash2,
  Timer,
  Users,
  Activity,
} from "lucide-react";
import {
  flightStatusApi,
  formatClock,
  formatDelay,
  type LiveFlight,
  type FlightPhase,
  type StatusEvent,
} from "@/app/lib/flightStatusApi";

// ---------------------------------------------------------------------------
// visual metadata per phase
// ---------------------------------------------------------------------------
const PHASE_META: Record<
  FlightPhase,
  { text: string; bg: string; border: string; dot: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  SCHEDULED: { text: "text-[#2f8f6b]", bg: "bg-[#eaf6f0]", border: "border-[#bfe2d2]", dot: "bg-[#4f9c7f]", Icon: Clock },
  ON_TIME: { text: "text-[#2f8f6b]", bg: "bg-[#eaf6f0]", border: "border-[#bfe2d2]", dot: "bg-[#4f9c7f]", Icon: CircleCheckBig },
  DELAYED: { text: "text-[#b3541e]", bg: "bg-[#fdf1e6]", border: "border-[#f4d3b0]", dot: "bg-[#e08a3c]", Icon: AlertTriangle },
  BOARDING: { text: "text-[#2f6bb3]", bg: "bg-[#e9f2fb]", border: "border-[#bcd9f2]", dot: "bg-[#5b9bd5]", Icon: Users },
  GATE_CLOSING: { text: "text-[#b3541e]", bg: "bg-[#fdf1e6]", border: "border-[#f4d3b0]", dot: "bg-[#e08a3c]", Icon: Timer },
  DEPARTED: { text: "text-[#3a5cb8]", bg: "bg-[#eaeffb]", border: "border-[#c3cdf2]", dot: "bg-[#4a86c9]", Icon: PlaneTakeoff },
  IN_AIR: { text: "text-[#3a5cb8]", bg: "bg-[#eaeffb]", border: "border-[#c3cdf2]", dot: "bg-[#4a86c9]", Icon: Plane },
  LANDED: { text: "text-[#2f8f6b]", bg: "bg-[#eaf6f0]", border: "border-[#bfe2d2]", dot: "bg-[#4f9c7f]", Icon: PlaneLanding },
  ARRIVED: { text: "text-[#2f8f6b]", bg: "bg-[#eaf6f0]", border: "border-[#bfe2d2]", dot: "bg-[#4f9c7f]", Icon: CircleCheckBig },
  CANCELLED: { text: "text-[#b3241e]", bg: "bg-[#fdeaea]", border: "border-[#f2bcbc]", dot: "bg-[#d14343]", Icon: X },
};

const SEV_STYLE: Record<StatusEvent["severity"], { border: string; bg: string; icon: string }> = {
  info: { border: "border-l-[#5b9bd5]", bg: "bg-white", icon: "text-[#5b9bd5]" },
  warning: { border: "border-l-[#e08a3c]", bg: "bg-white", icon: "text-[#e08a3c]" },
  success: { border: "border-l-[#4f9c7f]", bg: "bg-white", icon: "text-[#4f9c7f]" },
  critical: { border: "border-l-[#d14343]", bg: "bg-white", icon: "text-[#d14343]" },
};

function msToLabel(ms: number): string {
  if (ms <= 0) return "now";
  const mins = Math.round(ms / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function changed(a: number, b: number): boolean {
  return Math.abs(a - b) >= 60000;
}

// ---------------------------------------------------------------------------
// page
// ---------------------------------------------------------------------------
export default function FlightStatusPage() {
  const [tracked, setTracked] = useState<LiveFlight[]>([]);
  const [sim, setSim] = useState<number>(() => Date.now());
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LiveFlight[]>([]);
  const [searched, setSearched] = useState(false);
  const [notifications, setNotifications] = useState<StatusEvent[]>([]);
  const [toasts, setToasts] = useState<StatusEvent[]>([]);
  const [unread, setUnread] = useState(0);
  const [bellOpen, setBellOpen] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  const pushRef = useRef(false);
  useEffect(() => {
    pushRef.current = pushEnabled;
  }, [pushEnabled]);

  // subscribe once to the live engine
  useEffect(() => {
    const unsub = flightStatusApi.subscribe(({ flights, events }) => {
      setTracked(flights);
      if (events.length) {
        const newestFirst = events.slice().reverse();
        setNotifications((prev) => [...newestFirst, ...prev].slice(0, 50));
        setUnread((u) => u + events.length);
        setToasts((prev) => [...prev, ...events].slice(-3));
        events.forEach((e) => {
          window.setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== e.id));
          }, 6500);
          if (
            pushRef.current &&
            typeof window !== "undefined" &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            try {
              new Notification(e.title, { body: e.message });
            } catch {
              /* ignore */
            }
          }
        });
      }
    });
    return unsub;
  }, []);

  // accelerated clock for live countdowns
  useEffect(() => {
    const t = setInterval(() => setSim(flightStatusApi.simClock()), 1000);
    return () => clearInterval(t);
  }, []);

  const runSearch = () => {
    setResults(flightStatusApi.search(query));
    setSearched(true);
  };

  const enablePush = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPushEnabled(true); // fall back to in-app toasts only
      return;
    }
    if (Notification.permission === "granted") {
      setPushEnabled(true);
      return;
    }
    const perm = await Notification.requestPermission();
    setPushEnabled(perm === "granted");
  };

  const trackedIds = useMemo(() => new Set(tracked.map((f) => f.id)), [tracked]);

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      {/* header band */}
      <div className="bg-gradient-to-br from-[#0f1a2e] to-[#1c3454] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <Radar className="w-7 h-7 text-[#5b9bd5]" />
                <h1 className="text-3xl font-bold tracking-tight">Live Flight Status</h1>
                <span className="relative flex h-2.5 w-2.5 ml-1">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6bd39a] opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#4f9c7f]" />
                </span>
              </div>
              <p className="text-[#a3cef0] mt-2 max-w-xl text-sm">
                Real-time tracking with live status, gate updates, delay reasons and dynamic arrival
                estimates. Track as many flights as you like — updates stream in automatically.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* speed mode indicator */}
              <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full text-xs font-semibold text-white">
                <Gauge className="w-4 h-4 text-[#4f9c7f]" />
                <span>1x Real-Time (Actual Time)</span>
              </div>

              {/* push toggle */}
              <button
                onClick={enablePush}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border transition-all ${
                  pushEnabled
                    ? "bg-[#4f9c7f] border-[#4f9c7f] text-white"
                    : "bg-white/10 border-white/25 text-white hover:bg-white/20"
                }`}
              >
                {pushEnabled ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                {pushEnabled ? "Notifications on" : "Enable notifications"}
              </button>

              {/* bell + feed */}
              <div className="relative">
                <button
                  onClick={() => {
                    setBellOpen((o) => !o);
                    setUnread(0);
                  }}
                  className="relative flex items-center justify-center h-10 w-10 rounded-full bg-white/10 border border-white/25 hover:bg-white/20 transition-all"
                >
                  <Bell className="w-5 h-5" />
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#e04a4a] text-[10px] font-bold flex items-center justify-center">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </button>

                {bellOpen && (
                  <div className="absolute right-0 mt-2 w-[340px] max-h-[420px] overflow-y-auto rounded-2xl bg-white text-[#0f1a2e] shadow-2xl border border-[#d5e2f0] z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#eef3f9] sticky top-0 bg-white">
                      <span className="font-bold text-sm">Notifications</span>
                      <button onClick={() => setBellOpen(false)} className="text-[#9aa8bd] hover:text-[#0f1a2e]">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-10 text-center text-sm text-[#9aa8bd]">
                        No updates yet. Live updates will appear here.
                      </div>
                    ) : (
                      <div className="divide-y divide-[#f0f4f9]">
                        {notifications.map((n) => {
                          const s = SEV_STYLE[n.severity];
                          return (
                            <div key={n.id} className={`flex gap-3 px-4 py-3 border-l-4 ${s.border}`}>
                              <Activity className={`w-4 h-4 mt-0.5 shrink-0 ${s.icon}`} />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold leading-snug">{n.title}</p>
                                <p className="text-xs text-[#5b6b82] mt-0.5 leading-snug">{n.message}</p>
                                <p className="text-[10px] text-[#9aa8bd] mt-1">{formatClock(n.time)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* search / add flights */}
        <div className="bg-white rounded-2xl border border-[#d5e2f0] shadow-sm p-5 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-[#5b9bd5]" />
            <h2 className="text-sm font-bold text-[#1a3a6b] uppercase tracking-wide">Add a flight to track</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              placeholder="Flight number, airline or city (e.g. 6E, Vistara, Delhi, BOM)"
              className="flex-1 bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] placeholder:text-[#9aa8bd] rounded-xl h-12 px-4 font-medium shadow-sm hover:border-[#5b9bd5] focus:border-[#5b9bd5] focus:outline-none focus:ring-2 focus:ring-[#5b9bd5]/20 transition-all"
            />
            <button
              onClick={runSearch}
              className="h-12 px-6 rounded-xl bg-[#0f1a2e] text-white font-semibold hover:bg-[#1c3454] transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" /> Search
            </button>
          </div>

          {searched && (
            <div className="mt-4 space-y-2">
              {results.length === 0 ? (
                <p className="text-sm text-[#9aa8bd] py-2">No flights match “{query}”. Try a code like 6E, AI or a city.</p>
              ) : (
                results.map((f) => {
                  const meta = PHASE_META[f.phase];
                  const isTracked = trackedIds.has(f.id);
                  return (
                    <div
                      key={f.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[#e4ecf6] bg-[#f9fbfe] px-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#0f1a2e]">{f.flightNumber}</span>
                          <span className="text-xs text-[#5b6b82]">{f.airline}</span>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${meta.bg} ${meta.text} border ${meta.border}`}>
                            {f.statusLabel}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#5b6b82] mt-1">
                          <span className="font-semibold text-[#0f1a2e]">{f.from.code}</span>
                          <ArrowRight className="w-3 h-3" />
                          <span className="font-semibold text-[#0f1a2e]">{f.to.code}</span>
                          <span className="mx-1 text-[#c3d1e2]">•</span>
                          <span>{formatClock(f.estimatedDeparture)} – {formatClock(f.estimatedArrival)}</span>
                        </div>
                      </div>
                      {isTracked ? (
                        <span className="shrink-0 text-xs font-semibold text-[#4f9c7f] flex items-center gap-1">
                          <CircleCheckBig className="w-4 h-4" /> Tracking
                        </span>
                      ) : (
                        <button
                          onClick={() => flightStatusApi.track(f.id)}
                          className="shrink-0 flex items-center gap-1.5 rounded-lg bg-[#5b9bd5] text-white text-sm font-semibold px-3 py-2 hover:bg-[#4a86c9] transition-all"
                        >
                          <Plus className="w-4 h-4" /> Track
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* tracked flights */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#0f1a2e] flex items-center gap-2">
            <Plane className="w-5 h-5 text-[#5b9bd5]" /> Tracked flights
            <span className="text-sm font-semibold text-[#9aa8bd]">({tracked.length})</span>
          </h2>
        </div>

        {tracked.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-[#c3d1e2] p-12 text-center">
            <Radar className="w-10 h-10 text-[#c3d1e2] mx-auto mb-3" />
            <p className="text-[#5b6b82] font-medium">You&apos;re not tracking any flights yet.</p>
            <p className="text-sm text-[#9aa8bd] mt-1">Search above and hit “Track” to watch them live.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {tracked.map((f) => (
              <FlightCard key={f.id} f={f} sim={sim} onUntrack={() => flightStatusApi.untrack(f.id)} />
            ))}
          </div>
        )}
      </div>

      {/* toasts */}
      <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2 w-[340px] max-w-[calc(100vw-2.5rem)]">
        {toasts.map((t) => {
          const s = SEV_STYLE[t.severity];
          return (
            <div
              key={t.id}
              className={`rounded-xl bg-white shadow-2xl border border-[#e4ecf6] border-l-4 ${s.border} p-4 fs-toast-in`}
            >
              <div className="flex gap-3">
                <Activity className={`w-4 h-4 mt-0.5 shrink-0 ${s.icon}`} />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#0f1a2e] leading-snug">{t.title}</p>
                  <p className="text-xs text-[#5b6b82] mt-0.5 leading-snug">{t.message}</p>
                </div>
                <button
                  onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                  className="ml-auto text-[#c3d1e2] hover:text-[#5b6b82] shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes fsToastIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fs-toast-in { animation: fsToastIn 0.25s ease-out; }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// flight card
// ---------------------------------------------------------------------------
function FlightCard({ f, sim, onUntrack }: { f: LiveFlight; sim: number; onUntrack: () => void }) {
  const meta = PHASE_META[f.phase];
  const Icon = meta.Icon;
  const depChanged = changed(f.estimatedDeparture, f.scheduledDeparture);
  const arrChanged = changed(f.estimatedArrival, f.scheduledArrival);
  const airborne = f.phase === "IN_AIR" || f.phase === "DEPARTED";
  const done = f.phase === "ARRIVED" || f.phase === "LANDED";

  let eta: { label: string; value: string };
  if (done) {
    eta = { label: "Arrived", value: formatClock(f.actualArrival ?? f.estimatedArrival) };
  } else if (airborne) {
    eta = { label: "Lands in", value: msToLabel(f.estimatedArrival - sim) };
  } else {
    const diff = f.estimatedDeparture - sim;
    eta = diff <= 0 ? { label: "Status", value: "Departing" } : { label: "Departs in", value: msToLabel(diff) };
  }

  return (
    <div className="bg-white rounded-2xl border border-[#d5e2f0] shadow-sm overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#eef3f9]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-[#eef4fb] flex items-center justify-center shrink-0">
            <Plane className="w-5 h-5 text-[#5b9bd5]" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-[#0f1a2e] leading-tight">{f.flightNumber}</p>
            <p className="text-xs text-[#5b6b82] truncate">
              {f.airline} • {f.aircraft}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${meta.bg} ${meta.text} border ${meta.border}`}>
            <Icon className="w-3.5 h-3.5" />
            {f.statusLabel}
          </span>
          <button
            onClick={onUntrack}
            title="Stop tracking"
            className="h-8 w-8 rounded-lg flex items-center justify-center text-[#c3d1e2] hover:text-[#e04a4a] hover:bg-[#fdeaea] transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* route + progress */}
      <div className="px-5 pt-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-[#0f1a2e] leading-none">{f.from.code}</p>
            <p className="text-xs text-[#5b6b82] mt-1">{f.from.city}</p>
          </div>
          <div className="text-center px-2">
            <p className="text-[11px] font-semibold text-[#9aa8bd] uppercase tracking-wide">{eta.label}</p>
            <p className={`text-sm font-bold ${meta.text}`}>{eta.value}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#0f1a2e] leading-none">{f.to.code}</p>
            <p className="text-xs text-[#5b6b82] mt-1">{f.to.city}</p>
          </div>
        </div>

        {/* progress line */}
        <div className="relative h-1.5 rounded-full bg-[#e4ecf6] mt-4 mb-1">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-[#4a86c9]"
            style={{ width: `${f.progressPercent}%` }}
          />
          <div
            className="absolute -top-[7px] transition-all"
            style={{ left: `calc(${f.progressPercent}% - 8px)` }}
          >
            <Plane className={`w-4 h-4 rotate-45 ${done ? "text-[#4f9c7f]" : "text-[#4a86c9]"}`} />
          </div>
        </div>
        <div className="flex justify-between text-[10px] text-[#9aa8bd]">
          <span>{f.from.name}</span>
          <span>{f.to.name}</span>
        </div>
      </div>

      {/* times */}
      <div className="grid grid-cols-2 gap-3 px-5 py-4">
        <div className="rounded-xl bg-[#f9fbfe] border border-[#eef3f9] p-3">
          <p className="text-[11px] font-semibold text-[#9aa8bd] uppercase tracking-wide flex items-center gap-1">
            <PlaneTakeoff className="w-3.5 h-3.5" /> Departure
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-lg font-bold ${depChanged ? "text-[#b3541e]" : "text-[#0f1a2e]"}`}>
              {formatClock(f.estimatedDeparture)}
            </span>
            {depChanged && (
              <span className="text-xs text-[#9aa8bd] line-through">{formatClock(f.scheduledDeparture)}</span>
            )}
          </div>
          <p className="text-[11px] text-[#5b6b82] mt-1">
            {f.from.terminal} • Gate {f.from.gate}
          </p>
        </div>

        <div className="rounded-xl bg-[#f9fbfe] border border-[#eef3f9] p-3">
          <p className="text-[11px] font-semibold text-[#9aa8bd] uppercase tracking-wide flex items-center gap-1">
            <PlaneLanding className="w-3.5 h-3.5" /> Arrival
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-lg font-bold ${arrChanged ? "text-[#b3541e]" : "text-[#0f1a2e]"}`}>
              {formatClock(f.estimatedArrival)}
            </span>
            {arrChanged && (
              <span className="text-xs text-[#9aa8bd] line-through">{formatClock(f.scheduledArrival)}</span>
            )}
          </div>
          <p className="text-[11px] text-[#5b6b82] mt-1">
            {f.to.terminal} • Gate {f.to.gate}
          </p>
        </div>
      </div>

      {/* in-air telemetry */}
      {airborne && (
        <div className="flex items-center gap-4 px-5 pb-4 -mt-1">
          <span className="flex items-center gap-1.5 text-xs text-[#5b6b82]">
            <Navigation className="w-3.5 h-3.5 text-[#4a86c9]" /> {f.progressPercent}% complete
          </span>
          <span className="flex items-center gap-1.5 text-xs text-[#5b6b82]">
            <Gauge className="w-3.5 h-3.5 text-[#4a86c9]" /> {f.groundSpeedKmh} km/h
          </span>
          <span className="flex items-center gap-1.5 text-xs text-[#5b6b82]">
            <Activity className="w-3.5 h-3.5 text-[#4a86c9]" /> {f.altitudeFt.toLocaleString()} ft
          </span>
        </div>
      )}

      {/* delay banner */}
      {f.delayMinutes > 0 && !done && (
        <div className="mx-5 mb-5 rounded-xl bg-[#fdf1e6] border border-[#f4d3b0] px-4 py-3">
          <div className="flex items-center gap-2 text-[#b3541e] font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            Delayed by {formatDelay(f.delayMinutes)}
          </div>
          {f.delayReason && <p className="text-xs text-[#8a5a30] mt-1">Reason: {f.delayReason}</p>}
          <p className="text-xs text-[#8a5a30] mt-0.5">
            Revised: departs {formatClock(f.estimatedDeparture)}, arrives {formatClock(f.estimatedArrival)}.
          </p>
        </div>
      )}
    </div>
  );
}
