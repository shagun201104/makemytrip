// ---------------------------------------------------------------------------
// Live Flight Status — mock real-time API
// ---------------------------------------------------------------------------
// A fully client-side simulation of a professional flight-tracking backend.
// Flight statuses evolve on an accelerated clock (On Time -> Boarding ->
// Departed -> In Air -> Landed), delays are injected with realistic reasons and
// revised schedules, and every meaningful change is pushed to subscribers as a
// StatusEvent so the UI can raise notifications. Designed so it can later be
// swapped for a real REST/WebSocket backend without touching the UI.
// ---------------------------------------------------------------------------

export type FlightPhase =
  | "SCHEDULED"
  | "ON_TIME"
  | "DELAYED"
  | "BOARDING"
  | "GATE_CLOSING"
  | "DEPARTED"
  | "IN_AIR"
  | "LANDED"
  | "ARRIVED"
  | "CANCELLED";

export interface Airport {
  city: string;
  code: string; // IATA
  name: string;
  terminal: string;
  gate: string;
}

export interface LiveFlight {
  id: string;
  flightNumber: string;
  airline: string;
  aircraft: string;
  from: Airport;
  to: Airport;
  scheduledDeparture: number;
  scheduledArrival: number;
  estimatedDeparture: number;
  estimatedArrival: number;
  actualDeparture?: number;
  actualArrival?: number;
  phase: FlightPhase;
  statusLabel: string;
  delayMinutes: number;
  delayReason?: string;
  progressPercent: number;
  altitudeFt: number;
  groundSpeedKmh: number;
  lastUpdated: number;
}

export type EventType =
  | "DELAY"
  | "SCHEDULE_CHANGE"
  | "BOARDING"
  | "GATE_CHANGE"
  | "DEPARTED"
  | "ETA_UPDATE"
  | "LANDED"
  | "CANCELLED"
  | "STATUS";

export interface StatusEvent {
  id: string;
  flightId: string;
  flightNumber: string;
  type: EventType;
  title: string;
  message: string;
  time: number;
  severity: "info" | "warning" | "success" | "critical";
}

type Listener = (payload: { flights: LiveFlight[]; events: StatusEvent[] }) => void;

// --- tuning ------------------------------------------------------------------
const SIM_SPEED = 120; // 1 real second ≈ 2 simulated minutes (watchable demo)
const TICK_MS = 2000; // engine tick cadence
const MIN = 60_000; // one minute in ms

const DELAY_REASONS = [
  "Late arrival of incoming aircraft",
  "Air traffic congestion",
  "Weather conditions at destination",
  "Runway congestion at origin",
  "Operational reasons",
  "Technical inspection in progress",
  "Awaiting crew connection",
];

// --- airports ----------------------------------------------------------------
const AIRPORTS: Record<string, Omit<Airport, "gate" | "terminal">> = {
  DEL: { city: "New Delhi", code: "DEL", name: "Indira Gandhi Intl" },
  BOM: { city: "Mumbai", code: "BOM", name: "Chhatrapati Shivaji Maharaj Intl" },
  BLR: { city: "Bengaluru", code: "BLR", name: "Kempegowda Intl" },
  HYD: { city: "Hyderabad", code: "HYD", name: "Rajiv Gandhi Intl" },
  GOI: { city: "Goa", code: "GOI", name: "Manohar Intl" },
  CCU: { city: "Kolkata", code: "CCU", name: "Netaji Subhas Chandra Bose Intl" },
  MAA: { city: "Chennai", code: "MAA", name: "Chennai Intl" },
  PNQ: { city: "Pune", code: "PNQ", name: "Pune Intl" },
};

function airport(code: string, terminal: string, gate: string): Airport {
  const base = AIRPORTS[code];
  return { ...base, terminal, gate };
}

interface CatalogSpec {
  id: string;
  flightNumber: string;
  airline: string;
  aircraft: string;
  from: Airport;
  to: Airport;
  durationMin: number;
  depOffsetMin: number; // minutes from "now" to scheduled departure (may be negative)
  initialDelayMin?: number;
}

const CATALOG_SPECS: CatalogSpec[] = [
  {
    id: "6E2043",
    flightNumber: "6E 2043",
    airline: "IndiGo",
    aircraft: "Airbus A320neo",
    from: airport("DEL", "T3", "24"),
    to: airport("BOM", "T2", "42"),
    durationMin: 130,
    depOffsetMin: 22,
  },
  {
    id: "AI806",
    flightNumber: "AI 806",
    airline: "Air India",
    aircraft: "Boeing 787-8",
    from: airport("BOM", "T2", "58"),
    to: airport("DEL", "T3", "16"),
    durationMin: 135,
    depOffsetMin: -55, // already airborne
  },
  {
    id: "UK995",
    flightNumber: "UK 995",
    airline: "Vistara",
    aircraft: "Airbus A320",
    from: airport("DEL", "T3", "31"),
    to: airport("BLR", "T2", "12"),
    durationMin: 165,
    depOffsetMin: 68,
    initialDelayMin: 45,
  },
  {
    id: "SG8169",
    flightNumber: "SG 8169",
    airline: "SpiceJet",
    aircraft: "Boeing 737-800",
    from: airport("BLR", "T1", "07"),
    to: airport("HYD", "T1", "22"),
    durationMin: 75,
    depOffsetMin: 8,
  },
  {
    id: "QP1401",
    flightNumber: "QP 1401",
    airline: "Akasa Air",
    aircraft: "Boeing 737 MAX 8",
    from: airport("BOM", "T2", "44"),
    to: airport("GOI", "T1", "05"),
    durationMin: 70,
    depOffsetMin: 140,
  },
  {
    id: "6E6183",
    flightNumber: "6E 6183",
    airline: "IndiGo",
    aircraft: "Airbus A321neo",
    from: airport("DEL", "T3", "27"),
    to: airport("CCU", "T2", "3B"),
    durationMin: 140,
    depOffsetMin: 95,
  },
  {
    id: "AI2977",
    flightNumber: "AI 2977",
    airline: "Air India",
    aircraft: "Airbus A319",
    from: airport("DEL", "T3", "19"),
    to: airport("MAA", "T1", "9"),
    durationMin: 170,
    depOffsetMin: 45,
  },
  {
    id: "UK810",
    flightNumber: "UK 810",
    airline: "Vistara",
    aircraft: "Boeing 737-800",
    from: airport("PNQ", "T1", "4"),
    to: airport("DEL", "T3", "21"),
    durationMin: 130,
    depOffsetMin: 210,
  },
];

// --- formatting helpers (exported for the UI) --------------------------------
export function formatClock(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDelay(minutes: number): string {
  if (minutes <= 0) return "On Time";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

let seq = 0;
function nextId(prefix: string): string {
  seq += 1;
  return `${prefix}-${Date.now().toString(36)}-${seq}`;
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------
class FlightStatusEngine {
  private catalog: LiveFlight[] = [];
  private tracked = new Set<string>();
  private milestones = new Map<string, Set<FlightPhase>>();
  private listeners = new Set<Listener>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private realStart = Date.now();
  private anchor = Date.now();

  constructor() {
    this.build();
  }

  private build() {
    const now = Date.now();
    this.anchor = now;
    this.realStart = now;
    this.catalog = CATALOG_SPECS.map((s) => {
      const scheduledDeparture = now + s.depOffsetMin * MIN;
      const scheduledArrival = scheduledDeparture + s.durationMin * MIN;
      const delay = s.initialDelayMin ?? 0;
      const estimatedDeparture = scheduledDeparture + delay * MIN;
      const estimatedArrival = scheduledArrival + delay * MIN;
      const f: LiveFlight = {
        id: s.id,
        flightNumber: s.flightNumber,
        airline: s.airline,
        aircraft: s.aircraft,
        from: s.from,
        to: s.to,
        scheduledDeparture,
        scheduledArrival,
        estimatedDeparture,
        estimatedArrival,
        phase: "SCHEDULED",
        statusLabel: delay > 0 ? `Delayed by ${formatDelay(delay)}` : "On Time",
        delayMinutes: delay,
        delayReason: delay > 0 ? DELAY_REASONS[0] : undefined,
        progressPercent: 0,
        altitudeFt: 0,
        groundSpeedKmh: 0,
        lastUpdated: now,
      };
      this.derivePhase(f, now, []); // set an accurate starting phase
      return f;
    });
  }

  private simNow(): number {
    return this.anchor + (Date.now() - this.realStart) * SIM_SPEED;
  }

  // Public accessor to the accelerated simulation clock (for live countdowns).
  simClock(): number {
    return this.simNow();
  }

  // ---- public API ----------------------------------------------------------
  search(query: string): LiveFlight[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.catalog.slice();
    return this.catalog.filter((f) => {
      const hay = [
        f.flightNumber,
        f.airline,
        f.from.city,
        f.from.code,
        f.to.city,
        f.to.code,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q) || hay.replace(/\s+/g, "").includes(q.replace(/\s+/g, ""));
    });
  }

  getFlight(id: string): LiveFlight | undefined {
    return this.catalog.find((f) => f.id === id);
  }

  isTracked(id: string): boolean {
    return this.tracked.has(id);
  }

  getTracked(): LiveFlight[] {
    return this.catalog.filter((f) => this.tracked.has(f.id));
  }

  track(id: string) {
    if (this.getFlight(id)) {
      this.tracked.add(id);
      if (!this.milestones.has(id)) this.milestones.set(id, new Set());
      this.emit([]);
    }
  }

  untrack(id: string) {
    this.tracked.delete(id);
    this.emit([]);
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    this.start();
    // push an immediate snapshot
    fn({ flights: this.getTracked(), events: [] });
    return () => {
      this.listeners.delete(fn);
      if (this.listeners.size === 0) this.stop();
    };
  }

  private start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), TICK_MS);
  }

  private stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private emit(events: StatusEvent[]) {
    const snapshot = this.getTracked();
    this.listeners.forEach((l) => l({ flights: snapshot, events }));
  }

  // ---- simulation ----------------------------------------------------------
  private tick() {
    const sim = this.simNow();
    const events: StatusEvent[] = [];
    this.getTracked().forEach((f) => this.evolve(f, sim, events));
    this.emit(events);
  }

  private evolve(f: LiveFlight, sim: number, events: StatusEvent[]) {
    if (f.phase === "ARRIVED" || f.phase === "LANDED" || f.phase === "CANCELLED") {
      f.lastUpdated = Date.now();
      return;
    }

    // Randomly inject / extend a delay while still on the ground.
    const airborne = sim >= f.estimatedDeparture;
    if (!airborne && Math.random() < 0.14) {
      const add = 15 + Math.floor(Math.random() * 4) * 15; // 15..60 min
      f.delayMinutes += add;
      f.estimatedDeparture += add * MIN;
      f.estimatedArrival += add * MIN;
      f.delayReason = DELAY_REASONS[Math.floor(Math.random() * DELAY_REASONS.length)];
      events.push({
        id: nextId("evt"),
        flightId: f.id,
        flightNumber: f.flightNumber,
        type: "DELAY",
        title: `${f.flightNumber} delayed by ${formatDelay(f.delayMinutes)}`,
        message: `Reason: ${f.delayReason}. Revised departure ${formatClock(
          f.estimatedDeparture
        )} (scheduled ${formatClock(f.scheduledDeparture)}). New estimated arrival ${formatClock(
          f.estimatedArrival
        )}.`,
        time: Date.now(),
        severity: "warning",
      });
    }

    this.derivePhase(f, sim, events);
    f.lastUpdated = Date.now();
  }

  // Derive phase from the simulated clock and emit milestone events once each.
  private derivePhase(f: LiveFlight, sim: number, events: StatusEvent[]) {
    const seen = this.milestones.get(f.id) ?? new Set<FlightPhase>();
    this.milestones.set(f.id, seen);

    const dep = f.estimatedDeparture;
    const arr = f.estimatedArrival;
    const boardingOpens = dep - 40 * MIN;
    const gateCloses = dep - 20 * MIN;

    const setPhase = (p: FlightPhase) => {
      f.phase = p;
    };

    if (sim >= arr) {
      setPhase("ARRIVED");
      f.progressPercent = 100;
      f.altitudeFt = 0;
      f.groundSpeedKmh = 0;
      f.actualArrival = f.actualArrival ?? arr;
      f.statusLabel = f.delayMinutes > 0 ? `Landed (delayed ${formatDelay(f.delayMinutes)})` : "Landed";
      if (!seen.has("ARRIVED")) {
        seen.add("ARRIVED");
        events.push({
          id: nextId("evt"),
          flightId: f.id,
          flightNumber: f.flightNumber,
          type: "LANDED",
          title: `${f.flightNumber} has landed at ${f.to.city}`,
          message: `Arrived at ${f.to.name} (${f.to.code}) at ${formatClock(arr)}. ${
            f.delayMinutes > 0 ? `Arrived ${formatDelay(f.delayMinutes)} behind schedule.` : "On schedule."
          }`,
          time: Date.now(),
          severity: "success",
        });
      }
      return;
    }

    if (sim >= dep) {
      // In the air
      const frac = Math.min(0.99, Math.max(0, (sim - dep) / (arr - dep)));
      f.progressPercent = Math.round(frac * 100);
      f.altitudeFt = Math.round((28000 + Math.random() * 8000) / 100) * 100;
      f.groundSpeedKmh = 780 + Math.round(Math.random() * 90);
      f.actualDeparture = f.actualDeparture ?? dep;
      setPhase("IN_AIR");
      f.statusLabel = "In Air";
      if (!seen.has("DEPARTED")) {
        seen.add("DEPARTED");
        events.push({
          id: nextId("evt"),
          flightId: f.id,
          flightNumber: f.flightNumber,
          type: "DEPARTED",
          title: `${f.flightNumber} has departed ${f.from.city}`,
          message: `Departed ${f.from.code} at ${formatClock(dep)}. Estimated arrival ${formatClock(
            arr
          )} at ${f.to.name} (${f.to.code}).`,
          time: Date.now(),
          severity: "info",
        });
      }
      // Occasional in-air ETA refinement.
      if (Math.random() < 0.1) {
        const shift = (Math.random() < 0.5 ? -1 : 1) * (5 + Math.floor(Math.random() * 10)) * MIN;
        const newArr = Math.max(sim + 5 * MIN, arr + shift);
        if (Math.abs(newArr - f.estimatedArrival) >= 5 * MIN) {
          f.estimatedArrival = newArr;
          events.push({
            id: nextId("evt"),
            flightId: f.id,
            flightNumber: f.flightNumber,
            type: "ETA_UPDATE",
            title: `Updated arrival for ${f.flightNumber}`,
            message: `New estimated arrival ${formatClock(newArr)} at ${f.to.city} (${f.to.code}) — ${
              shift < 0 ? "making up time in the air." : "revised due to en-route winds."
            }`,
            time: Date.now(),
            severity: "info",
          });
        }
      }
      return;
    }

    if (sim >= gateCloses) {
      setPhase("GATE_CLOSING");
      f.statusLabel = "Gate Closing";
      if (!seen.has("GATE_CLOSING")) {
        seen.add("GATE_CLOSING");
        events.push({
          id: nextId("evt"),
          flightId: f.id,
          flightNumber: f.flightNumber,
          type: "STATUS",
          title: `${f.flightNumber} — gate closing`,
          message: `Final call. Gate ${f.from.gate}, ${f.from.terminal} at ${f.from.name}. Doors close shortly.`,
          time: Date.now(),
          severity: "warning",
        });
      }
      return;
    }

    if (sim >= boardingOpens) {
      setPhase("BOARDING");
      f.statusLabel = "Boarding";
      if (!seen.has("BOARDING")) {
        seen.add("BOARDING");
        events.push({
          id: nextId("evt"),
          flightId: f.id,
          flightNumber: f.flightNumber,
          type: "BOARDING",
          title: `${f.flightNumber} is now boarding`,
          message: `Boarding at Gate ${f.from.gate}, ${f.from.terminal}, ${f.from.name}. Gate closes ${formatClock(
            gateCloses
          )}.`,
          time: Date.now(),
          severity: "info",
        });
      }
      return;
    }

    // Still scheduled / delayed on the ground.
    if (f.delayMinutes > 0) {
      setPhase("DELAYED");
      f.statusLabel = `Delayed by ${formatDelay(f.delayMinutes)}`;
    } else {
      setPhase("ON_TIME");
      f.statusLabel = "On Time";
    }
  }
}

// Singleton — one shared simulation across the app.
export const flightStatusApi = new FlightStatusEngine();

// Convenience: pre-track a couple of flights so the tracker feels alive.
flightStatusApi.track("AI806");
flightStatusApi.track("6E2043");
