"use client";

import React, { useMemo, useRef, useState } from "react";
import { formatINR, shortDate, type PricePoint, type PriceStats } from "@/app/lib/pricingEngine";

// Chart is drawn in a fixed coordinate space and scaled by CSS, so it stays
// crisp and responsive without a charting dependency.
const VB_W = 620;
const VB_H = 210;
const PAD = { top: 18, right: 14, bottom: 26, left: 14 };
const PLOT_W = VB_W - PAD.left - PAD.right;
const PLOT_H = VB_H - PAD.top - PAD.bottom;

export default function PriceHistoryChart({
  history,
  stats,
}: {
  history: PricePoint[];
  stats: PriceStats;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const geom = useMemo(() => {
    const n = history.length;
    const prices = history.map((p) => p.price);
    const lo = Math.min(...prices);
    const hi = Math.max(...prices);
    // Pad the domain a little so the line never sits flat on the frame.
    const span = hi - lo || Math.max(1, hi * 0.05);
    const dLo = lo - span * 0.18;
    const dHi = hi + span * 0.18;

    const x = (i: number) => PAD.left + (n === 1 ? PLOT_W / 2 : (i / (n - 1)) * PLOT_W);
    const y = (v: number) => PAD.top + (1 - (v - dLo) / (dHi - dLo)) * PLOT_H;

    const pts = history.map((p, i) => ({ ...p, cx: x(i), cy: y(p.price) }));
    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.cx.toFixed(1)},${p.cy.toFixed(1)}`).join(" ");
    const area = `${line} L${pts[pts.length - 1].cx.toFixed(1)},${(PAD.top + PLOT_H).toFixed(
      1
    )} L${pts[0].cx.toFixed(1)},${(PAD.top + PLOT_H).toFixed(1)} Z`;

    return { pts, line, area, avgY: y(stats.avg), minV: lo, maxV: hi };
  }, [history, stats.avg]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return;
    // Map cursor position -> viewBox x -> nearest data index.
    const vbX = ((e.clientX - rect.left) / rect.width) * VB_W;
    const ratio = (vbX - PAD.left) / PLOT_W;
    const idx = Math.round(ratio * (history.length - 1));
    setHover(Math.min(history.length - 1, Math.max(0, idx)));
  };

  const active = hover === null ? geom.pts[geom.pts.length - 1] : geom.pts[hover];
  const isToday = active.daysAgo === 0;
  const rising = stats.changePct > 0;

  return (
    <div>
      {/* summary strip */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mb-2">
        <Stat label="30-day low" value={formatINR(stats.min)} tone="good" />
        <Stat label="Average" value={formatINR(stats.avg)} tone="muted" />
        <Stat label="30-day high" value={formatINR(stats.max)} tone="warn" />
        <span className="text-xs font-semibold ml-auto">
          <span className="text-[#9aa8bd]">30-day change </span>
          <span className={rising ? "text-[#b3541e]" : "text-[#2f8f6b]"}>
            {rising ? "▲" : "▼"} {Math.abs(stats.changePct)}%
          </span>
        </span>
      </div>

      <div
        ref={wrapRef}
        className="relative w-full select-none"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-auto block" role="img"
             aria-label="Price history over the last 30 days">
          <defs>
            <linearGradient id="mmtPriceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5b9bd5" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#5b9bd5" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* horizontal gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1={PAD.left}
              x2={PAD.left + PLOT_W}
              y1={PAD.top + f * PLOT_H}
              y2={PAD.top + f * PLOT_H}
              stroke="#eef3f9"
              strokeWidth="1"
            />
          ))}

          {/* average reference line */}
          <line
            x1={PAD.left}
            x2={PAD.left + PLOT_W}
            y1={geom.avgY}
            y2={geom.avgY}
            stroke="#c3d1e2"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <text x={PAD.left + 3} y={geom.avgY - 5} fontSize="9" fill="#9aa8bd" fontWeight="600">
            avg
          </text>

          <path d={geom.area} fill="url(#mmtPriceFill)" />
          <path d={geom.line} fill="none" stroke="#4a86c9" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

          {/* hover guide */}
          <line
            x1={active.cx}
            x2={active.cx}
            y1={PAD.top}
            y2={PAD.top + PLOT_H}
            stroke="#9aa8bd"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity={hover === null ? 0 : 0.7}
          />

          {/* today marker (always visible) */}
          <circle
            cx={geom.pts[geom.pts.length - 1].cx}
            cy={geom.pts[geom.pts.length - 1].cy}
            r="4.5"
            fill="#0f1a2e"
            stroke="#fff"
            strokeWidth="2"
          />
          {/* active point */}
          <circle cx={active.cx} cy={active.cy} r="4" fill="#4a86c9" stroke="#fff" strokeWidth="2" />

          {/* x axis labels: oldest, middle, today */}
          {[0, Math.floor((history.length - 1) / 2), history.length - 1].map((i) => (
            <text
              key={i}
              x={geom.pts[i].cx}
              y={VB_H - 8}
              fontSize="10"
              fill="#9aa8bd"
              textAnchor={i === 0 ? "start" : i === history.length - 1 ? "end" : "middle"}
            >
              {i === history.length - 1 ? "Today" : shortDate(history[i].date)}
            </text>
          ))}
        </svg>

        {/* tooltip */}
        <div
          className="pointer-events-none absolute -top-1 rounded-lg bg-[#0f1a2e] text-white px-2.5 py-1.5 shadow-lg transition-opacity"
          style={{
            left: `${(active.cx / VB_W) * 100}%`,
            transform: "translate(-50%, -100%)",
            opacity: hover === null ? 0 : 1,
          }}
        >
          <p className="text-[10px] leading-none text-[#a3cef0] whitespace-nowrap">
            {isToday ? "Today" : shortDate(active.date)}
          </p>
          <p className="text-xs font-bold leading-tight whitespace-nowrap">{formatINR(active.price)}</p>
        </div>
      </div>

      {/* verdict */}
      <div
        className={`mt-2 rounded-xl px-3 py-2 text-xs font-semibold border ${
          stats.verdictTone === "good"
            ? "bg-[#eaf6f0] text-[#2f6b55] border-[#bfe2d2]"
            : stats.verdictTone === "warn"
            ? "bg-[#fdf1e6] text-[#8a5a30] border-[#f4d3b0]"
            : "bg-[#eef4fb] text-[#2f6bb3] border-[#bcd9f2]"
        }`}
      >
        {stats.verdict}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "good" | "warn" | "muted" }) {
  const color = tone === "good" ? "text-[#2f8f6b]" : tone === "warn" ? "text-[#b3541e]" : "text-[#0f1a2e]";
  return (
    <span className="text-xs">
      <span className="text-[#9aa8bd]">{label} </span>
      <span className={`font-bold ${color}`}>{value}</span>
    </span>
  );
}
