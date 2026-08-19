// ---------------------------------------------------------------------------
// Dynamic Pricing Engine
// ---------------------------------------------------------------------------
// Adjusts displayed prices in real time from a set of *transparent, predictable*
// factors: holiday / seasonal windows (peak periods add +20%), live demand
// (seats or rooms left), advance-purchase window, travel day-of-week and a
// small live "demand pulse" that drifts while the user browses.
//
// Design rules that matter:
//  1. TRANSPARENT — every quote carries a `factors[]` breakdown so the UI can
//     explain exactly why a price moved. Nothing is a black box.
//  2. PREDICTABLE — the same inputs always produce the same price. All
//     randomness is seeded from a stable hash of the item key, never Math.random
//     during price computation. The total multiplier is clamped to a published
//     band, and prices round to the nearest ₹10 so they don't jitter.
//  3. CONSISTENT ACROSS PAGES — live state is held in one shared singleton and
//     mirrored to localStorage, so a flight costs the same on the search results
//     dialog and on the booking page.
//  4. SSR-SAFE — the first computed quote depends only on deterministic inputs,
//     so server and client render identically. Live drift and localStorage
//     restore happen after mount, via subscribe().
// ---------------------------------------------------------------------------

export type PriceKind = "FLIGHT" | "HOTEL";

export interface PriceFactor {
  key: string;
  label: string;
  /** 1.20 => +20%. 0.95 => -5%. */
  multiplier: number;
  reason: string;
  direction: "up" | "down" | "flat";
}

export interface PricePoint {
  /** ISO yyyy-mm-dd */
  date: string;
  price: number;
  /** days before today: 29 .. 0 */
  daysAgo: number;
}

export interface PriceStats {
  min: number;
  max: number;
  avg: number;
  /** where the current price sits between min (0) and max (100) */
  percentile: number;
  verdict: string;
  verdictTone: "good" | "neutral" | "warn";
  /** % change vs the oldest point in the window */
  changePct: number;
}

export type DemandLevel = "low" | "moderate" | "high" | "very-high";

export interface PriceQuote {
  key: string;
  kind: PriceKind;
  itemId: string;
  label: string;
  /** the airline/hotel list price before any adjustment */
  basePrice: number;
  /** the live, adjusted price users actually pay */
  currentPrice: number;
  /** previous live price, for change indicators */
  previousPrice: number;
  totalMultiplier: number;
  factors: PriceFactor[];
  trend: "up" | "down" | "flat";
  demandLevel: DemandLevel;
  /** seats (flights) or rooms (hotels) remaining at this price */
  unitsLeft: number;
  unitNoun: string;
  /** people viewing this right now — drives the urgency cue */
  viewers: number;
  history: PricePoint[];
  stats: PriceStats;
  updatedAt: number;
}

export interface PriceFreeze {
  key: string;
  label: string;
  kind: PriceKind;
  frozenPrice: number;
  fee: number;
  createdAt: number;
  expiresAt: number;
}

export interface QuoteInput {
  kind: PriceKind;
  itemId: string;
  label: string;
  basePrice: number;
  /** travel date / check-in date, ISO yyyy-mm-dd */
  date?: string;
}

// --- tuning constants (published so the UI can explain the rules) -----------
export const PRICING_RULES = {
  /** total multiplier is never allowed outside this band */
  minMultiplier: 0.75,
  maxMultiplier: 1.75,
  /** prices round to the nearest ₹ROUND_TO so they don't flicker */
  roundTo: 10,
  /** how often live prices are re-evaluated */
  refreshMs: 5000,
  /** how long a frozen price is held */
  freezeDurationMs: 30 * 60 * 1000,
  freezeFeePct: 0.02,
  freezeFeeMin: 149,
  freezeFeeMax: 999,
  historyDays: 30,
};

const STORAGE_STATE = "mmt_pricing_state_v1";
const STORAGE_FREEZE = "mmt_price_freezes_v1";

// ---------------------------------------------------------------------------
// deterministic helpers
// ---------------------------------------------------------------------------

/** FNV-1a style string hash -> uint32. Stable across server and client. */
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 — small, fast, seeded PRNG. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function roundTo(value: number, step: number): number {
  return Math.max(step, Math.round(value / step) * step);
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDate(iso?: string): Date | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isNaN(d.getTime()) ? null : d;
}

function daysBetween(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return Math.round((b - a) / 86400000);
}

// ---------------------------------------------------------------------------
// Factor 1 — holiday / seasonal windows
// ---------------------------------------------------------------------------
interface SeasonWindow {
  name: string;
  /** inclusive month/day boundaries, 1-indexed month */
  from: [number, number];
  to: [number, number];
  multiplier: number;
  note: string;
}

/**
 * Indian travel calendar. Top-tier peak windows apply the headline +20%.
 * Windows are checked in order, first match wins.
 */
export const SEASON_WINDOWS: SeasonWindow[] = [
  {
    name: "New Year & Christmas peak",
    from: [12, 20],
    to: [1, 5],
    multiplier: 1.2,
    note: "Peak holiday travel — demand is at its highest all year",
  },
  {
    name: "Diwali festive season",
    from: [10, 15],
    to: [11, 15],
    multiplier: 1.2,
    note: "Festive rush — families travelling home for Diwali",
  },
  {
    name: "Summer vacation",
    from: [4, 15],
    to: [6, 15],
    multiplier: 1.12,
    note: "School holidays drive higher leisure demand",
  },
  {
    name: "Holi weekend",
    from: [3, 1],
    to: [3, 15],
    multiplier: 1.08,
    note: "Short festive break increases bookings",
  },
  {
    name: "Independence Day long weekend",
    from: [8, 10],
    to: [8, 18],
    multiplier: 1.1,
    note: "Long weekend — leisure routes fill up early",
  },
  {
    name: "Monsoon low season",
    from: [7, 1],
    to: [7, 31],
    multiplier: 0.9,
    note: "Monsoon dip — fares are discounted to fill seats",
  },
  {
    name: "Post-holiday lull",
    from: [1, 20],
    to: [2, 28],
    multiplier: 0.92,
    note: "Quietest travel weeks — lowest fares of the year",
  },
];

function inWindow(d: Date, w: SeasonWindow): boolean {
  const md = (d.getMonth() + 1) * 100 + d.getDate();
  const from = w.from[0] * 100 + w.from[1];
  const to = w.to[0] * 100 + w.to[1];
  // A window that wraps the year end (e.g. Dec 20 -> Jan 5).
  return from <= to ? md >= from && md <= to : md >= from || md <= to;
}

export function getSeason(date: Date | null): SeasonWindow | null {
  if (!date) return null;
  return SEASON_WINDOWS.find((w) => inWindow(date, w)) ?? null;
}

function seasonFactor(date: Date | null): PriceFactor {
  const s = getSeason(date);
  if (!s) {
    return {
      key: "season",
      label: "Season",
      multiplier: 1,
      reason: "Regular season — no seasonal adjustment applied",
      direction: "flat",
    };
  }
  return {
    key: "season",
    label: s.name,
    multiplier: s.multiplier,
    reason: s.note,
    direction: s.multiplier > 1 ? "up" : "down",
  };
}

// ---------------------------------------------------------------------------
// Factor 2 — advance purchase window
// ---------------------------------------------------------------------------
function advanceFactor(daysAhead: number | null): PriceFactor {
  if (daysAhead === null) {
    return {
      key: "advance",
      label: "Booking window",
      multiplier: 1,
      reason: "No travel date selected yet",
      direction: "flat",
    };
  }
  const tiers: { max: number; mult: number; reason: string }[] = [
    { max: 2, mult: 1.25, reason: "Last-minute booking (under 3 days to departure)" },
    { max: 6, mult: 1.15, reason: "Departing within a week — limited inventory left" },
    { max: 14, mult: 1.06, reason: "Departing within two weeks" },
    { max: 29, mult: 1.0, reason: "Standard booking window" },
    { max: 59, mult: 0.95, reason: "Booked over a month ahead — early-bird saving" },
    { max: Infinity, mult: 0.9, reason: "Booked well in advance — best early-bird saving" },
  ];
  const t = tiers.find((x) => daysAhead <= x.max)!;
  return {
    key: "advance",
    label: "Booking window",
    multiplier: t.mult,
    reason: t.reason,
    direction: t.mult > 1 ? "up" : t.mult < 1 ? "down" : "flat",
  };
}

// ---------------------------------------------------------------------------
// Factor 3 — travel day of week
// ---------------------------------------------------------------------------
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function dayOfWeekFactor(date: Date | null): PriceFactor {
  if (!date) {
    return {
      key: "dow",
      label: "Travel day",
      multiplier: 1,
      reason: "No travel date selected yet",
      direction: "flat",
    };
  }
  const dow = date.getDay();
  let mult = 1;
  let reason = `${DAY_NAMES[dow]} is an average-demand travel day`;
  if (dow === 5 || dow === 0) {
    mult = 1.07;
    reason = `${DAY_NAMES[dow]} is one of the busiest travel days`;
  } else if (dow === 6) {
    mult = 1.04;
    reason = "Saturday sees above-average weekend demand";
  } else if (dow === 2 || dow === 3) {
    mult = 0.95;
    reason = `${DAY_NAMES[dow]} is typically the cheapest day to travel`;
  }
  return {
    key: "dow",
    label: "Travel day",
    multiplier: mult,
    reason,
    direction: mult > 1 ? "up" : mult < 1 ? "down" : "flat",
  };
}

// ---------------------------------------------------------------------------
// Factor 4 — live demand (inventory remaining)
// ---------------------------------------------------------------------------
function demandFactor(unitsLeft: number, unitNoun: string): PriceFactor {
  // "1 seat left", not "1 seats left".
  const noun = unitsLeft === 1 ? unitNoun.replace(/s$/, "") : unitNoun;
  const tiers: { max: number; mult: number; reason: string }[] = [
    { max: 5, mult: 1.22, reason: `Only ${unitsLeft} ${noun} left at this price` },
    { max: 12, mult: 1.12, reason: `Filling fast — ${unitsLeft} ${noun} remaining` },
    { max: 25, mult: 1.05, reason: `Moderate demand — ${unitsLeft} ${noun} remaining` },
    { max: 40, mult: 1.0, reason: `Good availability — ${unitsLeft} ${noun} remaining` },
    { max: Infinity, mult: 0.96, reason: `Plenty of availability — ${unitsLeft} ${noun} remaining` },
  ];
  const t = tiers.find((x) => unitsLeft <= x.max)!;
  return {
    key: "demand",
    label: "Live demand",
    multiplier: t.mult,
    reason: t.reason,
    direction: t.mult > 1 ? "up" : t.mult < 1 ? "down" : "flat",
  };
}

export function demandLevelFor(unitsLeft: number): DemandLevel {
  if (unitsLeft <= 5) return "very-high";
  if (unitsLeft <= 12) return "high";
  if (unitsLeft <= 25) return "moderate";
  return "low";
}

// ---------------------------------------------------------------------------
// Factor 5 — live search pressure ("demand pulse")
// ---------------------------------------------------------------------------
function pulseFactor(pulse: number, viewers: number): PriceFactor {
  const mult = 1 + pulse;
  return {
    key: "pulse",
    label: "Real-time searches",
    multiplier: mult,
    reason:
      pulse > 0.005
        ? `${viewers} people are viewing this right now — search activity is pushing the price up`
        : pulse < -0.005
        ? `Search activity has cooled off — price eased slightly`
        : `${viewers} people viewing — search activity is steady`,
    direction: pulse > 0.005 ? "up" : pulse < -0.005 ? "down" : "flat",
  };
}

// ---------------------------------------------------------------------------
// live per-item state
// ---------------------------------------------------------------------------
interface LiveState {
  unitsLeft: number;
  pulse: number;
  viewers: number;
  lastPrice: number;
}

export function quoteKey(kind: PriceKind, itemId: string, date?: string): string {
  return `${kind}:${itemId}:${date || "any"}`;
}

/** Deterministic starting state derived purely from the key — SSR-safe. */
function seedState(key: string, kind: PriceKind): LiveState {
  const rnd = mulberry32(hashString(key));
  const maxUnits = kind === "FLIGHT" ? 48 : 30;
  const unitsLeft = 3 + Math.floor(rnd() * (maxUnits - 3));
  const pulse = (rnd() - 0.5) * 0.06;
  const viewers = 4 + Math.floor(rnd() * 40);
  return { unitsLeft, pulse, viewers, lastPrice: 0 };
}

// ---------------------------------------------------------------------------
// price history
// ---------------------------------------------------------------------------
/**
 * The 29 historical points are fully deterministic per (key, basePrice), so we
 * build them once and cache. Only the final point (today = the live price)
 * changes between calls, and we splice that in without mutating the cache.
 */
const historyCache = new Map<string, PricePoint[]>();

function buildHistory(key: string, basePrice: number, currentPrice: number, days: number): PricePoint[] {
  const cacheKey = `${key}:${basePrice}:${days}`;
  let points = historyCache.get(cacheKey);

  if (!points) {
    const rnd = mulberry32(hashString(`${key}:history`));
    const today = new Date();
    points = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const t = (days - 1 - i) / (days - 1); // 0 (oldest) -> 1 (today)
      // Fares generally creep up as the departure date approaches.
      const drift = 1 + 0.14 * t;
      const noise = 1 + (rnd() - 0.5) * 0.1;
      // A couple of flash-sale dips make the curve look real.
      const dip = rnd() < 0.08 ? 0.9 : 1;
      points.push({
        date: toISODate(d),
        daysAgo: i,
        price: roundTo(basePrice * drift * noise * dip, PRICING_RULES.roundTo),
      });
    }
    historyCache.set(cacheKey, points);
  }

  // The newest point is, by definition, the price we're showing right now.
  const out = points.slice();
  out[out.length - 1] = { ...out[out.length - 1], price: currentPrice };
  return out;
}

function buildStats(history: PricePoint[], currentPrice: number): PriceStats {
  const prices = history.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const span = max - min;
  const percentile = span === 0 ? 50 : Math.round(((currentPrice - min) / span) * 100);
  const oldest = prices[0];
  const changePct = oldest === 0 ? 0 : Math.round(((currentPrice - oldest) / oldest) * 100);

  let verdict: string;
  let verdictTone: PriceStats["verdictTone"];
  if (currentPrice <= min * 1.02) {
    verdict = "Lowest price in 30 days — great time to book";
    verdictTone = "good";
  } else if (currentPrice <= avg) {
    verdict = "Below the 30-day average — good value right now";
    verdictTone = "good";
  } else if (percentile < 85) {
    verdict = "Above the 30-day average — consider freezing this price";
    verdictTone = "neutral";
  } else {
    verdict = "Near a 30-day high — prices may ease if you can wait";
    verdictTone = "warn";
  }

  return { min, max, avg, percentile, verdict, verdictTone, changePct };
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------
type QuoteListener = (quotes: Record<string, PriceQuote>) => void;
type FreezeListener = (freezes: Record<string, PriceFreeze>) => void;

class PricingEngine {
  private live = new Map<string, LiveState>();
  private inputs = new Map<string, QuoteInput>();
  private freezes = new Map<string, PriceFreeze>();
  private quoteListeners = new Set<QuoteListener>();
  private freezeListeners = new Set<FreezeListener>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private restored = false;

  // ---- persistence -------------------------------------------------------
  /**
   * Restore shared state from localStorage. Called lazily from subscribe(),
   * i.e. only after mount, so it can never cause a hydration mismatch.
   */
  private restore() {
    if (this.restored || typeof window === "undefined") return;
    this.restored = true;
    try {
      const rawState = window.localStorage.getItem(STORAGE_STATE);
      if (rawState) {
        const parsed = JSON.parse(rawState) as Record<string, LiveState>;
        Object.entries(parsed).forEach(([k, v]) => {
          if (v && typeof v.unitsLeft === "number") this.live.set(k, v);
        });
      }
    } catch {
      /* corrupt state is not worth crashing over */
    }
    try {
      const rawFreeze = window.localStorage.getItem(STORAGE_FREEZE);
      if (rawFreeze) {
        const parsed = JSON.parse(rawFreeze) as Record<string, PriceFreeze>;
        const now = Date.now();
        Object.entries(parsed).forEach(([k, v]) => {
          if (v && v.expiresAt > now) this.freezes.set(k, v);
        });
      }
    } catch {
      /* ignore */
    }
  }

  private persist() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        STORAGE_STATE,
        JSON.stringify(Object.fromEntries(this.live.entries()))
      );
      window.localStorage.setItem(
        STORAGE_FREEZE,
        JSON.stringify(Object.fromEntries(this.freezes.entries()))
      );
    } catch {
      /* quota / private mode — prices still work, just won't persist */
    }
  }

  private stateFor(key: string, kind: PriceKind): LiveState {
    let s = this.live.get(key);
    if (!s) {
      s = seedState(key, kind);
      this.live.set(key, s);
    }
    return s;
  }

  // ---- core computation --------------------------------------------------
  /**
   * Pure given (input, live state). Returns the full transparent breakdown.
   */
  quote(input: QuoteInput): PriceQuote {
    const key = quoteKey(input.kind, input.itemId, input.date);
    const state = this.stateFor(key, input.kind);
    const unitNoun = input.kind === "FLIGHT" ? "seats" : "rooms";

    const travelDate = parseDate(input.date);
    const daysAhead = travelDate ? Math.max(0, daysBetween(new Date(), travelDate)) : null;

    const factors: PriceFactor[] = [
      seasonFactor(travelDate),
      advanceFactor(daysAhead),
      dayOfWeekFactor(travelDate),
      demandFactor(state.unitsLeft, unitNoun),
      pulseFactor(state.pulse, state.viewers),
    ];

    const raw = factors.reduce((acc, f) => acc * f.multiplier, 1);
    const totalMultiplier = clamp(raw, PRICING_RULES.minMultiplier, PRICING_RULES.maxMultiplier);
    const currentPrice = roundTo(input.basePrice * totalMultiplier, PRICING_RULES.roundTo);

    const previousPrice = state.lastPrice || currentPrice;
    const history = buildHistory(key, input.basePrice, currentPrice, PRICING_RULES.historyDays);
    const stats = buildStats(history, currentPrice);

    return {
      key,
      kind: input.kind,
      itemId: input.itemId,
      label: input.label,
      basePrice: input.basePrice,
      currentPrice,
      previousPrice,
      totalMultiplier,
      factors,
      trend:
        currentPrice > previousPrice ? "up" : currentPrice < previousPrice ? "down" : "flat",
      demandLevel: demandLevelFor(state.unitsLeft),
      unitsLeft: state.unitsLeft,
      unitNoun,
      viewers: state.viewers,
      history,
      stats,
      updatedAt: Date.now(),
    };
  }

  /**
   * The price a booking should actually charge: a live quote, unless the user
   * has an active price freeze, in which case the locked price wins.
   */
  effectivePrice(input: QuoteInput): { price: number; frozen: PriceFreeze | null; quote: PriceQuote } {
    const q = this.quote(input);
    const frozen = this.getFreeze(q.key);
    return { price: frozen ? frozen.frozenPrice : q.currentPrice, frozen, quote: q };
  }

  // ---- watching / real-time ---------------------------------------------
  /** Register an item so the tick loop keeps its price live. */
  watch(input: QuoteInput) {
    const key = quoteKey(input.kind, input.itemId, input.date);
    this.inputs.set(key, input);
    this.stateFor(key, input.kind);
  }

  unwatch(input: QuoteInput) {
    this.inputs.delete(quoteKey(input.kind, input.itemId, input.date));
  }

  private snapshot(): Record<string, PriceQuote> {
    const out: Record<string, PriceQuote> = {};
    this.inputs.forEach((input, key) => {
      out[key] = this.quote(input);
    });
    return out;
  }

  subscribeQuotes(fn: QuoteListener): () => void {
    this.restore();
    this.quoteListeners.add(fn);
    this.start();
    fn(this.snapshot());
    return () => {
      this.quoteListeners.delete(fn);
      this.maybeStop();
    };
  }

  subscribeFreezes(fn: FreezeListener): () => void {
    this.restore();
    this.freezeListeners.add(fn);
    this.start();
    fn(Object.fromEntries(this.freezes.entries()));
    return () => {
      this.freezeListeners.delete(fn);
      this.maybeStop();
    };
  }

  private start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), PRICING_RULES.refreshMs);
  }

  private maybeStop() {
    if (this.quoteListeners.size === 0 && this.freezeListeners.size === 0 && this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * One real-time step: nudge live demand for watched items, expire stale
   * freezes, then publish. Drift is intentionally small so displayed prices
   * move believably rather than jumping around.
   */
  private tick() {
    let changed = false;

    this.inputs.forEach((input, key) => {
      const s = this.stateFor(key, input.kind);
      const before = this.quote(input).currentPrice;

      // Inventory trickles down as other people book.
      if (Math.random() < 0.3 && s.unitsLeft > 1) {
        s.unitsLeft -= 1;
      }
      // Viewer count wanders.
      s.viewers = clamp(s.viewers + Math.round((Math.random() - 0.5) * 6), 3, 90);
      // Demand pulse does a bounded random walk.
      s.pulse = clamp(s.pulse + (Math.random() - 0.5) * 0.02, -0.06, 0.06);

      const after = this.quote(input).currentPrice;
      s.lastPrice = before;
      if (after !== before) changed = true;
    });

    const now = Date.now();
    let freezeChanged = false;
    this.freezes.forEach((f, k) => {
      if (f.expiresAt <= now) {
        this.freezes.delete(k);
        freezeChanged = true;
      }
    });

    this.persist();
    if (changed || this.inputs.size > 0) this.emitQuotes();
    if (freezeChanged) this.emitFreezes();
  }

  private emitQuotes() {
    const snap = this.snapshot();
    this.quoteListeners.forEach((l) => l(snap));
  }

  private emitFreezes() {
    const snap = Object.fromEntries(this.freezes.entries());
    this.freezeListeners.forEach((l) => l(snap));
  }

  // ---- price freeze ------------------------------------------------------
  freezeFeeFor(price: number): number {
    return clamp(
      roundTo(price * PRICING_RULES.freezeFeePct, PRICING_RULES.roundTo),
      PRICING_RULES.freezeFeeMin,
      PRICING_RULES.freezeFeeMax
    );
  }

  /** Lock the current price for PRICING_RULES.freezeDurationMs. */
  freeze(input: QuoteInput): PriceFreeze {
    this.restore();
    const q = this.quote(input);
    const now = Date.now();
    const f: PriceFreeze = {
      key: q.key,
      label: q.label,
      kind: q.kind,
      frozenPrice: q.currentPrice,
      fee: this.freezeFeeFor(q.currentPrice),
      createdAt: now,
      expiresAt: now + PRICING_RULES.freezeDurationMs,
    };
    this.freezes.set(q.key, f);
    this.persist();
    this.emitFreezes();
    return f;
  }

  /** Active freeze for a key, or null. Expired entries are purged. */
  getFreeze(key: string): PriceFreeze | null {
    const f = this.freezes.get(key);
    if (!f) return null;
    if (f.expiresAt <= Date.now()) {
      this.freezes.delete(key);
      this.persist();
      return null;
    }
    return f;
  }

  releaseFreeze(key: string) {
    if (this.freezes.delete(key)) {
      this.persist();
      this.emitFreezes();
    }
  }

  listFreezes(): PriceFreeze[] {
    const now = Date.now();
    return Array.from(this.freezes.values())
      .filter((f) => f.expiresAt > now)
      .sort((a, b) => a.expiresAt - b.expiresAt);
  }
}

/** Shared singleton — one pricing truth for the whole app. */
export const pricingEngine = new PricingEngine();

// ---------------------------------------------------------------------------
// formatting helpers
// ---------------------------------------------------------------------------
export const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

/** "+20%" / "-5%" / "—" for a factor multiplier. */
export function factorPct(multiplier: number): string {
  const pct = Math.round((multiplier - 1) * 100);
  if (pct === 0) return "—";
  return `${pct > 0 ? "+" : ""}${pct}%`;
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function shortDate(iso: string): string {
  const d = parseDate(iso);
  if (!d) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
