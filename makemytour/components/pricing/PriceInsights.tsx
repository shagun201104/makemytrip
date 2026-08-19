"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Snowflake,
  Lock,
  LockOpen,
  ChartSpline,
  Flame,
  Eye,
  Info,
  ShieldCheck,
  Hourglass,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  pricingEngine,
  formatINR,
  factorPct,
  formatCountdown,
  PRICING_RULES,
  type DemandLevel,
  type PriceQuote,
  type PriceFreeze,
  type QuoteInput,
} from "@/app/lib/pricingEngine";
import { useLiveQuote, useTicker } from "./usePricing";
import PriceHistoryChart from "./PriceHistoryChart";

const DEMAND_META: Record<DemandLevel, { label: string; cls: string }> = {
  low: { label: "Low demand", cls: "bg-[#eaf6f0] text-[#2f6b55] border-[#bfe2d2]" },
  moderate: { label: "Moderate demand", cls: "bg-[#eef4fb] text-[#2f6bb3] border-[#bcd9f2]" },
  high: { label: "High demand", cls: "bg-[#fdf1e6] text-[#8a5a30] border-[#f4d3b0]" },
  "very-high": { label: "Very high demand", cls: "bg-[#fdeaea] text-[#9c3535] border-[#f2bcbc]" },
};

function TrendIcon({ trend, className = "w-3.5 h-3.5" }: { trend: PriceQuote["trend"]; className?: string }) {
  if (trend === "up") return <TrendingUp className={`${className} text-[#b3541e]`} />;
  if (trend === "down") return <TrendingDown className={`${className} text-[#2f8f6b]`} />;
  return <Minus className={`${className} text-[#9aa8bd]`} />;
}

// ---------------------------------------------------------------------------
// Compact live price — for search-result rows
// ---------------------------------------------------------------------------
export function LivePrice({
  input,
  suffix,
  align = "end",
}: {
  input: QuoteInput;
  suffix?: string;
  align?: "start" | "end";
}) {
  const { quote, freeze, effective, live } = useLiveQuote(input);
  const [open, setOpen] = useState(false);

  const raised = quote ? quote.currentPrice > quote.basePrice : false;
  const alignCls = align === "end" ? "items-end text-right" : "items-start text-left";

  return (
    <div className={`flex flex-col ${alignCls} gap-1`}>
      {/* was-price when dynamic pricing moved it */}
      {quote && raised && !freeze && (
        <span className="text-xs text-[#9aa8bd] line-through leading-none">
          {formatINR(quote.basePrice)}
        </span>
      )}

      <span className="flex items-center gap-1.5 text-xl font-bold text-[#0f1a2e] leading-none">
        {formatINR(effective)}
        {live && quote && !freeze && <TrendIcon trend={quote.trend} />}
        {freeze && <Lock className="w-3.5 h-3.5 text-[#2f8f6b]" />}
      </span>

      {suffix && <span className="text-xs text-[#7c8ba3]">{suffix}</span>}

      {freeze ? (
        <span className="text-[11px] font-bold text-[#2f8f6b]">Price locked</span>
      ) : (
        quote && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#5b9bd5] hover:text-[#0f1a2e] hover:underline transition-colors"
          >
            <ChartSpline className="w-3 h-3" />
            Price trend
          </button>
        )
      )}

      <PriceInsightsDialog input={input} open={open} onOpenChange={setOpen} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Full insights dialog: history graph + why the price is what it is + freeze
// ---------------------------------------------------------------------------
export function PriceInsightsDialog({
  input,
  open,
  onOpenChange,
}: {
  input: QuoteInput;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { quote, freeze } = useLiveQuote(input);
  const now = useTicker();

  if (!quote) return null;

  const fee = pricingEngine.freezeFeeFor(quote.currentPrice);
  const demand = DEMAND_META[quote.demandLevel];
  const movedPct = Math.round((quote.totalMultiplier - 1) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-br from-[#a3cef0] to-[#c5e2f7] px-6 pt-6 pb-5 text-left">
          <DialogTitle className="text-xl font-bold text-[#0f1a2e] flex items-center gap-2">
            <ChartSpline className="w-5 h-5" />
            Price history &amp; insights
          </DialogTitle>
          <DialogDescription className="text-[#2c3e57]/80">
            {quote.label} · last {PRICING_RULES.historyDays} days
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {/* current price headline */}
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <p className="text-[11px] font-bold text-[#9aa8bd] uppercase tracking-wide">
                Current price
              </p>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-[#0f1a2e]">
                  {formatINR(freeze ? freeze.frozenPrice : quote.currentPrice)}
                </span>
                {!freeze && <TrendIcon trend={quote.trend} className="w-5 h-5" />}
              </div>
              <p className="text-xs text-[#7c8ba3] mt-1">
                Base fare {formatINR(quote.basePrice)}
                {movedPct !== 0 && (
                  <span className={movedPct > 0 ? "text-[#b3541e] font-semibold" : "text-[#2f8f6b] font-semibold"}>
                    {" "}· adjusted {movedPct > 0 ? "+" : ""}{movedPct}%
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${demand.cls}`}>
                <Flame className="w-3 h-3 inline mr-1" />
                {demand.label}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-[#7c8ba3]">
                <Eye className="w-3 h-3" /> {quote.viewers} viewing now
              </span>
              <span className="text-[11px] text-[#7c8ba3]">
                {quote.unitsLeft} {quote.unitsLeft === 1 ? quote.unitNoun.replace(/s$/, "") : quote.unitNoun} left
              </span>
            </div>
          </div>

          {/* history graph */}
          <PriceHistoryChart history={quote.history} stats={quote.stats} />

          {/* transparent factor breakdown */}
          <div className="mt-5">
            <h4 className="flex items-center gap-1.5 text-sm font-bold text-[#1a3a6b] mb-2">
              <Info className="w-4 h-4 text-[#5b9bd5]" />
              Why this price?
            </h4>
            <div className="rounded-xl border border-[#e4ecf6] overflow-hidden">
              {quote.factors.map((f, i) => (
                <div
                  key={f.key}
                  className={`flex items-start justify-between gap-3 px-3.5 py-2.5 ${
                    i % 2 === 0 ? "bg-[#f9fbfe]" : "bg-white"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#0f1a2e]">{f.label}</p>
                    <p className="text-[11px] text-[#7c8ba3] leading-snug">{f.reason}</p>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-bold tabular-nums ${
                      f.direction === "up"
                        ? "text-[#b3541e]"
                        : f.direction === "down"
                        ? "text-[#2f8f6b]"
                        : "text-[#9aa8bd]"
                    }`}
                  >
                    {factorPct(f.multiplier)}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#eef4fb] border-t border-[#d5e2f0]">
                <span className="text-xs font-bold text-[#1a3a6b]">Total adjustment</span>
                <span className="text-xs font-bold text-[#1a3a6b] tabular-nums">
                  {factorPct(quote.totalMultiplier)}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-[#9aa8bd] mt-1.5 leading-snug">
              Adjustments are capped between {factorPct(PRICING_RULES.minMultiplier)} and{" "}
              {factorPct(PRICING_RULES.maxMultiplier)} of the base fare, and prices are rounded to the
              nearest ₹{PRICING_RULES.roundTo}. The same inputs always produce the same price.
            </p>
          </div>

          {/* price freeze */}
          <div className="mt-5">
            {freeze ? (
              <FreezeActive freeze={freeze} now={now} live={quote.currentPrice} />
            ) : (
              <div className="rounded-xl border border-[#bcd9f2] bg-[#eef4fb] p-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center shrink-0 border border-[#bcd9f2]">
                    <Snowflake className="w-4 h-4 text-[#5b9bd5]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#0f1a2e]">
                      Freeze this price for {Math.round(PRICING_RULES.freezeDurationMs / 60000)} minutes
                    </p>
                    <p className="text-xs text-[#5b6b82] mt-0.5 leading-snug">
                      Lock {formatINR(quote.currentPrice)} for a {formatINR(fee)} fee. If the price rises
                      before you book, you still pay the locked fare. If it falls, you pay the lower price.
                    </p>
                    <Button
                      type="button"
                      onClick={() => pricingEngine.freeze(input)}
                      className="mt-3 h-9 px-4 text-sm bg-[#0f1a2e] text-white hover:bg-[#1c3454] rounded-full font-semibold"
                    >
                      <Snowflake className="w-4 h-4 mr-1.5" />
                      Freeze for {formatINR(fee)}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Active freeze panel with countdown
// ---------------------------------------------------------------------------
function FreezeActive({ freeze, now, live }: { freeze: PriceFreeze; now: number; live: number }) {
  const remaining = freeze.expiresAt - (now || freeze.createdAt);
  const saving = live - freeze.frozenPrice;

  return (
    <div className="rounded-xl border border-[#bfe2d2] bg-[#eaf6f0] p-4">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center shrink-0 border border-[#bfe2d2]">
          <ShieldCheck className="w-4 h-4 text-[#2f8f6b]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#0f1a2e] flex items-center gap-2">
            Price locked at {formatINR(freeze.frozenPrice)}
            <span className="flex items-center gap-1 text-xs font-bold text-[#2f6b55] bg-white border border-[#bfe2d2] rounded-full px-2 py-0.5">
              <Hourglass className="w-3 h-3" />
              {formatCountdown(remaining)}
            </span>
          </p>
          <p className="text-xs text-[#5b6b82] mt-1 leading-snug">
            {saving > 0
              ? `The live price has risen to ${formatINR(live)} — your lock is saving you ${formatINR(saving)}.`
              : saving < 0
              ? `The live price has dropped to ${formatINR(live)} — you'll be charged the lower price.`
              : "You'll pay this price when you book, even if it rises."}
          </p>
          <button
            type="button"
            onClick={() => pricingEngine.releaseFreeze(freeze.key)}
            className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-[#7c8ba3] hover:text-[#b3241e] transition-colors"
          >
            <LockOpen className="w-3.5 h-3.5" />
            Release this lock
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Banner for the booking pages
// ---------------------------------------------------------------------------
export function BookingPriceBanner({ input }: { input: QuoteInput }) {
  const { quote, freeze } = useLiveQuote(input);
  const now = useTicker();
  const [open, setOpen] = useState(false);

  if (!quote) return null;

  const movedPct = Math.round((quote.totalMultiplier - 1) * 100);
  const peak = quote.factors.find((f) => f.key === "season" && f.multiplier > 1);

  return (
    <>
      <div className="rounded-2xl border border-[#d5e2f0] bg-white shadow-sm p-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-[#eef4fb] flex items-center justify-center shrink-0">
              {freeze ? (
                <Lock className="w-4 h-4 text-[#2f8f6b]" />
              ) : (
                <ChartSpline className="w-4 h-4 text-[#5b9bd5]" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#0f1a2e] flex items-center gap-2 flex-wrap">
                {freeze ? (
                  <>
                    Price locked at {formatINR(freeze.frozenPrice)}
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#2f6b55] bg-[#eaf6f0] border border-[#bfe2d2] rounded-full px-2 py-0.5">
                      <Hourglass className="w-3 h-3" />
                      {formatCountdown(freeze.expiresAt - (now || freeze.createdAt))}
                    </span>
                  </>
                ) : (
                  <>
                    Live price {formatINR(quote.currentPrice)}
                    {movedPct !== 0 && (
                      <span
                        className={`text-[11px] font-bold rounded-full px-2 py-0.5 border ${
                          movedPct > 0
                            ? "bg-[#fdf1e6] text-[#8a5a30] border-[#f4d3b0]"
                            : "bg-[#eaf6f0] text-[#2f6b55] border-[#bfe2d2]"
                        }`}
                      >
                        {movedPct > 0 ? "+" : ""}
                        {movedPct}% vs base
                      </span>
                    )}
                  </>
                )}
              </p>
              <p className="text-xs text-[#7c8ba3] mt-0.5 truncate">
                {peak ? peak.reason : quote.stats.verdict}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 flex items-center gap-1.5 text-sm font-semibold text-[#5b9bd5] hover:text-[#0f1a2e] border border-[#bcd9f2] hover:border-[#5b9bd5] rounded-full px-3.5 py-2 transition-colors"
          >
            <ChartSpline className="w-4 h-4" />
            {freeze ? "View lock" : "Price history & freeze"}
          </button>
        </div>
      </div>

      <PriceInsightsDialog input={input} open={open} onOpenChange={setOpen} />
    </>
  );
}
