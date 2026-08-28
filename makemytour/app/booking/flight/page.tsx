"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bookFlight } from "@/app/api";
import {
  Plane,
  ArrowLeft,
  Clock,
  CalendarDays,
  Luggage,
  Info,
  CircleAlert,
  Gift,
  TicketPercent,
  CheckCircle2,
  ShieldCheck,
  User,
  Mail,
  Phone,
  IndianRupee,
  Ticket,
} from "lucide-react";

import { BookingPriceBanner } from "@/components/pricing/PriceInsights";
import { useLiveQuote } from "@/components/pricing/usePricing";
import { type QuoteInput } from "@/app/lib/pricingEngine";
import { InteractiveSeatMap, type Seat } from "@/components/booking/InteractiveSeatMap";
import { ReviewSystem } from "@/components/reviews/ReviewSystem";

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

// Well-known Indian airport codes; falls back to first 3 letters.
const CITY_CODES: Record<string, string> = {
  "new delhi": "DEL",
  delhi: "DEL",
  mumbai: "BOM",
  bengaluru: "BLR",
  bangalore: "BLR",
  kolkata: "CCU",
  chennai: "MAA",
  hyderabad: "HYD",
  goa: "GOI",
  pune: "PNQ",
  jaipur: "JAI",
  ahmedabad: "AMD",
  kochi: "COK",
  lucknow: "LKO",
};

const cityCode = (city: string) =>
  CITY_CODES[city.trim().toLowerCase()] ||
  city.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() ||
  "DEL";

// Aircraft varies a little by airline for a realistic feel.
const AIRCRAFT: Record<string, string> = {
  IndiGo: "Airbus A320neo",
  "Air India": "Boeing 787 Dreamliner",
  Vistara: "Airbus A320",
  SpiceJet: "Boeing 737-800",
  "Akasa Air": "Boeing 737 MAX",
};

// "2026-08-15" + "06:15" -> "Fri, 15 Aug 2026 at 06:15"
const formatDateTime = (dateStr: string, time: string) => {
  if (!dateStr) return time;
  const d = new Date(`${dateStr}T${time || "00:00"}`);
  if (isNaN(d.getTime())) return time;
  const datePart = d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return `${datePart} at ${time}`;
};

const PROMOS = [
  {
    code: "MMTSECURE",
    value: 299,
    desc: "Get an instant discount of ₹299 on your flight booking and Trip Secure with this coupon!",
  },
  {
    code: "SPECIALUPI",
    value: 362,
    desc: "Use this code and get ₹362 instant discount on payments via UPI only!",
  },
  {
    code: "FLYHIGH500",
    value: 500,
    desc: "Save a flat ₹500 on domestic flights above ₹5,000. Limited period offer!",
  },
];

const FLIGHT_OFFERS = [
  {
    title: "Stay Vacations",
    subtitle: "Up to 35% off on luxury stays",
    img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=60",
  },
  {
    title: "Beach Escapes",
    subtitle: "Goa & islands from ₹6,299",
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=60",
  },
  {
    title: "City Luxe Hotels",
    subtitle: "Free breakfast + late checkout",
    img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=60",
  },
];

function FlightBookingContent() {
  const params = useSearchParams();
  const router = useRouter();

  const airline = params.get("airline") || "IndiGo";
  const code = params.get("code") || "6E-2043";
  const depart = params.get("depart") || "06:15";
  const arrive = params.get("arrive") || "08:30";
  const duration = params.get("duration") || "2h 15m";
  const rawFrom = params.get("from") || "New Delhi";
  const rawTo = params.get("to") || "Mumbai";
  const from = rawFrom.includes("→") ? rawFrom.split("→")[0].trim() : rawFrom;
  const to = rawTo.includes("→") ? rawTo.split("→").pop()?.trim() || rawTo : rawTo;
  const date = params.get("date") || "";
  const travellers = Number(params.get("travellers") || "1");
  const basePrice = Number(params.get("price") || "4899");

  const aircraft = AIRCRAFT[airline] || "Airbus A320";
  const fromCode = cityCode(from);
  const toCode = cityCode(to);

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [passenger, setPassenger] = useState({ name: "", email: "", phone: "" });
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingRef, setBookingRef] = useState("");

  // Traveller Breakdown States
  const [numAdults, setNumAdults] = useState<number>(travellers || 1);
  const [numChildren, setNumChildren] = useState<number>(0);
  const [childAge, setChildAge] = useState<string>("6");
  const [numInfants, setNumInfants] = useState<number>(0);

  const user = useSelector((state: any) => state.user.user);

  // Dynamic pricing
  const pricingInput: QuoteInput | null = code ? {
    kind: "FLIGHT",
    itemId: code,
    label: `${airline} ${code}`,
    basePrice: basePrice,
    date: date || undefined,
  } : null;
  const { effective: dynamicPrice } = useLiveQuote(pricingInput);

  // Price breakdown
  const { baseFare, childFare, infantFare, taxes, otherServices, seatCharge, discount, total } = useMemo(() => {
    const effectiveBase = dynamicPrice || basePrice;
    const adultFare = effectiveBase * numAdults;
    const childFare = Math.round(effectiveBase * 0.75) * numChildren; // 25% discount for 2-12 yrs
    const infantFare = 1500 * numInfants; // Flat 1500 per infant
    const baseFare = adultFare + childFare + infantFare;
    const taxes = Math.round(baseFare * 0.28);
    const otherServices = 249;
    const seatCharge = selectedSeat ? selectedSeat.price : 0;
    const promo = PROMOS.find((p) => p.code === appliedPromo);
    const discount = promo ? promo.value : 0;
    const total = baseFare + taxes + otherServices + seatCharge - discount;
    return { baseFare, childFare, infantFare, taxes, otherServices, seatCharge, discount, total };
  }, [basePrice, numAdults, numChildren, numInfants, appliedPromo, dynamicPrice, selectedSeat]);

  const applyPromo = (code: string) => {
    const match = PROMOS.find(
      (p) => p.code.toLowerCase() === code.trim().toLowerCase()
    );
    if (!match) {
      alert("Invalid promo code. Try MMTSECURE, SPECIALUPI or FLYHIGH500.");
      return;
    }
    setAppliedPromo(match.code);
    setPromoInput(match.code);
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passenger.name || !passenger.email || !passenger.phone) {
      alert("Please fill in all passenger details.");
      return;
    }

    // Local reference used when there is no logged-in user (demo mode).
    let ref = `MMT${code.replace(/[^0-9]/g, "")}${Math.floor(
      Math.random() * 900 + 100
    )}`;

    const userId = user?.id || user?._id;
    if (userId) {
      try {
        setSubmitting(true);
        const booking = await bookFlight({
          userId,
          flightName: `${airline} ${code}`,
          seats: travellers,
          price: basePrice,
          date,
        });
        if (booking?.bookingId) ref = booking.bookingId;
      } catch (err) {
        alert(
          err instanceof Error ? err.message : "Booking failed. Please try again."
        );
        setSubmitting(false);
        return;
      }
      setSubmitting(false);
    }

    setBookingRef(ref);
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <div className="max-w-2xl mx-auto py-6">
        <div className="bg-white rounded-3xl shadow-2xl border-4 border-[#3b82f6]/40 overflow-hidden text-center">
          {/* Top Gradient Banner */}
          <div className="bg-gradient-to-r from-[#0f1a2e] via-[#1e3a8a] to-[#0f1a2e] p-8 text-white">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] text-white shadow-xl animate-pulse">
                <CheckCircle2 className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-white drop-shadow-md">Flight Ticket Confirmed! ✈️</h1>
            <p className="text-white/80 text-sm mt-1.5 font-medium">
              Your flight from <span className="font-extrabold text-white">{from}</span> to <span className="font-extrabold text-white">{to}</span> has been booked successfully.
            </p>
          </div>

          {/* Details Card */}
          <div className="p-7 space-y-4">
            <div className="rounded-2xl bg-[#f8fafc] border border-[#cbd5e1] p-5 text-left space-y-3">
              <div className="flex justify-between items-center text-sm pb-2 border-b border-[#e2e8f0]">
                <span className="text-[#64748b] font-semibold">PNR / Ticket Reference ID</span>
                <span className="font-extrabold text-[#1d4ed8] text-base font-mono">{bookingRef}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748b] font-semibold">Primary Passenger</span>
                <span className="font-extrabold text-[#0f172a]">{passenger.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748b] font-semibold">Airline &amp; Flight</span>
                <span className="font-extrabold text-[#0f172a]">{airline} {code}</span>
              </div>
              {selectedSeat && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#64748b] font-semibold">Assigned Seat</span>
                  <span className="font-bold text-[#1d4ed8]">Seat {selectedSeat.id} ({selectedSeat.type})</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm pt-2 border-t border-[#e2e8f0]">
                <span className="text-[#64748b] font-bold">Total Paid</span>
                <span className="font-black text-xl text-[#16a34a]">{formatINR(total)}</span>
              </div>
            </div>

            {/* Instant Mobile SMS & WhatsApp Notification Alert */}
            <div className="bg-[#1e3a8a]/90 border-2 border-[#3b82f6]/60 p-4 rounded-2xl text-left space-y-1 shadow-lg">
              <p className="text-xs font-black text-[#60a5fa] flex items-center gap-1.5 uppercase tracking-wider">
                📱 Instant Mobile SMS &amp; WhatsApp Alert Sent
              </p>
              <p className="text-xs text-white font-bold">
                E-Ticket PNR &amp; Boarding Pass dispatched to <span className="text-[#facc15] font-black">{passenger.phone}</span> &amp; <span className="text-[#60a5fa] font-black">{passenger.email}</span>!
              </p>
            </div>

            {/* Action Buttons: View in Profile + Home */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                onClick={() => router.push("/profile")}
                className="w-full sm:w-auto bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white hover:opacity-95 font-extrabold rounded-full px-8 h-12 shadow-xl flex items-center justify-center gap-2"
              >
                <Ticket className="w-5 h-5" />
                View My Booking in Profile &rarr;
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="w-full sm:w-auto border-2 border-[#cbd5e1] text-[#0f172a] hover:bg-[#f1f5f9] font-bold rounded-full px-8 h-12"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[#2c3e57] hover:text-[#0f1a2e] font-medium mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to results
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ============ LEFT COLUMN ============ */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dynamic price banner */}
          {pricingInput && <BookingPriceBanner input={pricingInput} />}

          {/* ---- LUXURY FLIGHT ROUTE DETAILS CARD ---- */}
          <div className="bg-[#0f1a2e] text-white rounded-3xl shadow-2xl border-4 border-[#3b82f6]/40 p-6 md:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap border-b border-[#1e293b] pb-4">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
                  {from} <span className="text-[#60a5fa]">&rarr;</span> {to}
                </h1>
                <span className="inline-flex items-center bg-[#166534] text-[#4ade80] text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  Refundable &bull; Cancellation Protection
                </span>
              </div>
              <button className="flex items-center gap-1.5 text-[#60a5fa] hover:text-[#93c5fd] text-xs font-black uppercase tracking-wider">
                <Info className="w-4 h-4" /> View Fare Rules
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-white/80">
              <span className="flex items-center gap-1.5 bg-[#1e293b] px-3 py-1.5 rounded-lg border border-[#3b82f6]/40">
                <CalendarDays className="w-4 h-4 text-[#60a5fa]" />
                {formatDateTime(date, depart)}
              </span>
              <span className="flex items-center gap-1.5 bg-[#1e293b] px-3 py-1.5 rounded-lg border border-[#3b82f6]/40">
                <Clock className="w-4 h-4 text-[#60a5fa]" /> Non Stop &bull; {duration}
              </span>
            </div>

            {/* Airline row */}
            <div className="flex items-center gap-4 bg-[#1e293b]/90 p-4 rounded-2xl border border-[#3b82f6]/40">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#2563eb] text-white shrink-0 shadow-md">
                <Plane className="w-6 h-6" />
              </div>
              <div>
                <p className="font-extrabold text-white text-base">{airline}</p>
                <p className="text-xs text-white/70 font-semibold">
                  {code} &bull; {aircraft}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <span className="bg-[#2563eb] text-white text-xs font-black px-3 py-1 rounded-lg">
                  Economy Class
                </span>
                <span className="text-[#facc15] text-xs font-black tracking-wider uppercase">MMTSPECIAL</span>
              </div>
            </div>

            {/* Timeline: depart -> arrive */}
            <div className="flex items-center justify-between gap-3 bg-[#0f1a2e] p-4 rounded-2xl border border-[#1e293b]">
              <div className="max-w-[38%]">
                <p className="text-2xl md:text-3xl font-black text-white leading-tight">
                  {formatDateTime(date, depart)}
                </p>
                <p className="text-xs text-white/70 font-bold mt-1.5">
                  {from} Airport ({fromCode}), Terminal T2
                </p>
              </div>

              <div className="flex-1 flex flex-col items-center px-2">
                <span className="text-xs font-black text-[#60a5fa] mb-1">{duration}</span>
                <div className="w-full flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#60a5fa]" />
                  <div className="h-0.5 bg-gradient-to-r from-[#60a5fa] to-[#2563eb] flex-1" />
                  <Plane className="w-5 h-5 text-[#60a5fa] rotate-90" />
                  <div className="h-0.5 bg-gradient-to-r from-[#2563eb] to-[#60a5fa] flex-1" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#60a5fa]" />
                </div>
                <span className="text-[11px] font-extrabold text-[#4ade80] mt-1">Direct Flight</span>
              </div>

              <div className="max-w-[38%] text-right">
                <p className="text-2xl md:text-3xl font-black text-white leading-tight">
                  {formatDateTime(date, arrive)}
                </p>
                <p className="text-xs text-white/70 font-bold mt-1.5">
                  {to} Airport ({toCode}), Terminal T3
                </p>
              </div>
            </div>

            {/* Baggage */}
            <div className="flex flex-wrap items-center gap-6 bg-[#1e293b]/80 p-4 rounded-xl border border-[#3b82f6]/30">
              <span className="flex items-center gap-2 text-xs font-extrabold text-white">
                <Luggage className="w-4 h-4 text-[#60a5fa]" />
                Cabin Baggage: <span className="text-[#60a5fa]">7 Kgs / Passenger</span>
              </span>
              <span className="flex items-center gap-2 text-xs font-extrabold text-white">
                <Luggage className="w-4 h-4 text-[#60a5fa]" />
                Check-in Baggage: <span className="text-[#60a5fa]">15 Kgs (1 Piece) / Passenger</span>
              </span>
            </div>
          </div>

          {/* ---- LUXURY CANCELLATION & DATE CHANGE POLICY ---- */}
          <div className="bg-[#0f1a2e] text-white rounded-3xl shadow-2xl border-4 border-[#3b82f6]/40 p-6 md:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-black text-white text-xl">
                <CircleAlert className="w-6 h-6 text-[#facc15]" /> Cancellation &amp; Date Change Policy
              </h2>
              <button className="text-[#60a5fa] hover:text-[#93c5fd] text-xs font-black uppercase tracking-wider">
                View Detailed Rules
              </button>
            </div>

            <div className="rounded-2xl bg-[#1e293b] border-2 border-[#3b82f6]/40 p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2.5 font-black text-white">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#2563eb]">
                    <Plane className="w-4 h-4 text-white" />
                  </span>
                  {fromCode} &rarr; {toCode}
                </span>
                <span className="font-black text-[#facc15] text-lg">
                  {formatINR(Math.round(baseFare * 0.85))} Fee
                </span>
              </div>

              {/* Gradient time bar */}
              <div className="mt-4 h-2.5 rounded-full bg-gradient-to-r from-[#22c55e] via-[#eab308] to-[#ef4444]" />
              <div className="flex items-center justify-between text-xs font-bold text-white/80 mt-2">
                <span>Today</span>
                <span>Tiered Refund Structure</span>
                <span>2 hrs before departure</span>
              </div>
            </div>
          </div>

          {/* ---- Offers strip ---- */}
          <div className="bg-white rounded-2xl shadow-lg border border-[#eef2f7] p-6 md:p-7">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 font-bold text-[#0f1a2e] text-lg">
                <Gift className="w-5 h-5 text-[#e5573f]" /> Book a Flight &amp; unlock these
                offers
              </h2>
              <span className="bg-[#fde8e4] text-[#e5573f] text-xs font-semibold px-3 py-1 rounded-full">
                Flyer Exclusive Deal
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {FLIGHT_OFFERS.map((offer) => (
                <div
                  key={offer.title}
                  className="relative rounded-xl overflow-hidden h-32 group"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundImage: `url("${offer.img}")` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <span className="absolute top-2 left-2 bg-white text-[#0f1a2e] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Best Seller
                  </span>
                  <div className="absolute bottom-2 left-3 right-3 text-white">
                    <p className="font-bold text-sm leading-tight">{offer.title}</p>
                    <p className="text-[11px] text-white/85">{offer.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ---- LUXURY PASSENGER DETAILS & PAYMENT FORM ---- */}
          <form
            onSubmit={handleConfirm}
            className="bg-[#0f1a2e] text-white rounded-3xl shadow-2xl border-4 border-[#3b82f6]/40 p-6 md:p-8 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <User className="w-6 h-6 text-[#60a5fa]" /> Primary Passenger Details
              </h2>
              <span className="bg-[#2563eb] text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Step 2 of 2
              </span>
            </div>

            <div className="space-y-2">
              <Label className="text-white text-xs font-black flex items-center gap-1.5 uppercase tracking-wider">
                <User className="w-4 h-4 text-[#60a5fa]" /> Full Name (As per Govt Photo ID / Passport)
              </Label>
              <Input
                value={passenger.name}
                onChange={(e) => setPassenger({ ...passenger, name: e.target.value })}
                placeholder="Enter full name as on Passport or Aadhaar"
                className="bg-[#1e293b] border-2 border-[#3b82f6]/50 text-white placeholder:text-white/40 rounded-xl h-12 px-4 font-bold shadow-inner focus:border-[#60a5fa]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white text-xs font-black flex items-center gap-1.5 uppercase tracking-wider">
                  <Mail className="w-4 h-4 text-[#60a5fa]" /> Email Address (For E-Ticket)
                </Label>
                <Input
                  type="email"
                  value={passenger.email}
                  onChange={(e) => setPassenger({ ...passenger, email: e.target.value })}
                  placeholder="you@example.com"
                  className="bg-[#1e293b] border-2 border-[#3b82f6]/50 text-white placeholder:text-white/40 rounded-xl h-12 px-4 font-bold shadow-inner focus:border-[#60a5fa]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white text-xs font-black flex items-center gap-1.5 uppercase tracking-wider">
                  <Phone className="w-4 h-4 text-[#60a5fa]" /> Mobile Number (For Flight Status SMS)
                </Label>
                <Input
                  type="tel"
                  value={passenger.phone}
                  onChange={(e) => setPassenger({ ...passenger, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="bg-[#1e293b] border-2 border-[#3b82f6]/50 text-white placeholder:text-white/40 rounded-xl h-12 px-4 font-bold shadow-inner focus:border-[#60a5fa]"
                />
              </div>
            </div>

            {/* Traveller Age Breakdown */}
            <div className="rounded-2xl bg-[#1e293b]/90 border-2 border-[#3b82f6]/40 p-5 space-y-4">
              <p className="text-xs font-black uppercase tracking-wider text-[#60a5fa]">Passenger Breakdown &amp; Age Limits</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-bold text-white/90">Adults (12+ yrs)</Label>
                  <p className="text-[10px] text-white/70 mb-1 font-semibold">Standard Adult Fare</p>
                  <select
                    value={numAdults}
                    onChange={(e) => setNumAdults(Number(e.target.value))}
                    className="w-full bg-[#0f1a2e] border-2 border-[#3b82f6]/50 text-white rounded-xl h-11 px-3 text-sm font-extrabold cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <option key={n} value={n}>{n} Adult{n > 1 ? "s" : ""}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-bold text-white/90">Children (2-12 yrs)</Label>
                  <p className="text-[10px] text-[#4ade80] mb-1 font-bold">25% Discounted Fare</p>
                  <select
                    value={numChildren}
                    onChange={(e) => setNumChildren(Number(e.target.value))}
                    className="w-full bg-[#0f1a2e] border-2 border-[#3b82f6]/50 text-white rounded-xl h-11 px-3 text-sm font-extrabold cursor-pointer"
                  >
                    {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n} Child{n !== 1 ? "ren" : ""}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-bold text-white/90">Infants (Under 2 yrs)</Label>
                  <p className="text-[10px] text-[#60a5fa] mb-1 font-bold">Flat ₹1,500 Lap Fee</p>
                  <select
                    value={numInfants}
                    onChange={(e) => setNumInfants(Number(e.target.value))}
                    className="w-full bg-[#0f1a2e] border-2 border-[#3b82f6]/50 text-white rounded-xl h-11 px-3 text-sm font-extrabold cursor-pointer"
                  >
                    {[0, 1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>{n} Infant{n !== 1 ? "s" : ""}</option>
                    ))}
                  </select>
                </div>
              </div>

              {numChildren > 0 && (
                <div className="bg-[#0f1a2e] p-4 rounded-xl border border-[#3b82f6]/40 space-y-1.5">
                  <Label className="text-xs font-black text-[#60a5fa]">Child Age Limit &amp; Identification</Label>
                  <p className="text-[11px] text-white/80 font-medium">Government photo ID or birth certificate required at airport check-in desk for age verification.</p>
                  <select
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value)}
                    className="w-full bg-[#1e293b] border border-[#3b82f6]/40 text-white rounded-lg h-10 px-3 text-xs font-bold"
                  >
                    <option value="3">Child 1 Age: 3 years (Seat assigned)</option>
                    <option value="6">Child 1 Age: 6 years (Seat assigned)</option>
                    <option value="9">Child 1 Age: 9 years (Seat assigned)</option>
                    <option value="11">Child 1 Age: 11 years (Seat assigned)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Payment Method & EMI Installment Options */}
            <div className="rounded-2xl bg-[#1e293b]/90 border-2 border-[#3b82f6]/40 p-5 space-y-3">
              <p className="text-xs font-black uppercase tracking-wider text-[#60a5fa]">Select Payment Method &amp; EMI Options</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 bg-[#0f1a2e] border-2 border-[#3b82f6]/50 p-3.5 rounded-xl cursor-pointer hover:border-[#60a5fa] transition-all">
                  <input type="radio" name="flightPayMethod" defaultChecked className="w-4 h-4 text-[#2563eb]" />
                  <div>
                    <p className="text-xs font-black text-white">📱 BHIM UPI / GPay / PhonePe</p>
                    <p className="text-[11px] text-white/80 font-medium">Instant 0% fee payment</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 bg-[#0f1a2e] border-2 border-[#3b82f6]/50 p-3.5 rounded-xl cursor-pointer hover:border-[#60a5fa] transition-all">
                  <input type="radio" name="flightPayMethod" className="w-4 h-4 text-[#2563eb]" />
                  <div>
                    <p className="text-xs font-black text-white">💳 Credit / Debit Card</p>
                    <p className="text-[11px] text-white/80 font-medium">Visa, Mastercard, RuPay</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 bg-[#0f1a2e] border-2 border-[#3b82f6]/50 p-3.5 rounded-xl cursor-pointer hover:border-[#60a5fa] transition-all">
                  <input type="radio" name="flightPayMethod" className="text-[#2563eb]" />
                  <div>
                    <p className="text-xs font-black text-white">🏦 Net Banking</p>
                    <p className="text-[11px] text-white/80 font-medium">SBI, HDFC, ICICI, Axis</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 bg-[#1e3a8a]/60 border-2 border-[#60a5fa] p-3.5 rounded-xl cursor-pointer hover:bg-[#1e3a8a] transition-all">
                  <input type="radio" name="flightPayMethod" className="text-[#2563eb]" />
                  <div>
                    <p className="text-xs font-black text-[#facc15]">📊 Easy No-Cost EMI</p>
                    <p className="text-[11px] text-white font-bold">Pay in 3, 6, or 12 monthly installments</p>
                  </div>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-[#e5573f] via-[#f97316] to-[#e5573f] text-white hover:opacity-95 font-black text-lg rounded-full py-4 shadow-2xl hover:shadow-orange-500/40 hover:scale-[1.02] transition-all uppercase tracking-wide cursor-pointer disabled:opacity-70"
            >
              {submitting ? "Processing Flight Ticket…" : <>Confirm &amp; Pay {formatINR(total)}</>}
            </Button>
          </form>

          {/* Interactive Seat Selection */}
          <InteractiveSeatMap
            flightCode={code || "6E-204"}
            selectedSeatId={selectedSeat?.id}
            onSeatSelect={setSelectedSeat}
          />

          {/* Review & Rating System */}
          <ReviewSystem
            itemId={code || "6E-204"}
            itemName={`${airline} ${code}`}
            itemType="FLIGHT"
          />
        </div>

        {/* ============ RIGHT COLUMN (sticky) ============ */}
        <div className="space-y-6 lg:sticky lg:top-6">
          {/* Fare summary — Luxury High Contrast Dark Navy Card */}
          <div className="bg-[#0f1a2e] text-white rounded-3xl shadow-2xl border-4 border-[#3b82f6]/40 p-7 space-y-5">
            <h2 className="flex items-center gap-2.5 text-xl font-black text-white border-b border-[#1e293b] pb-4">
              <TicketPercent className="w-6 h-6 text-[#60a5fa]" /> Fare Summary
            </h2>
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between items-center text-white/90 font-medium">
                <span>
                  Base Fare ({travellers} {travellers > 1 ? "travellers" : "traveller"})
                </span>
                <span className="font-extrabold text-white">{formatINR(baseFare)}</span>
              </div>
              <div className="flex justify-between items-center text-white/90 font-medium">
                <span>Taxes &amp; Surcharges</span>
                <span className="font-extrabold text-white">{formatINR(taxes)}</span>
              </div>
              {seatCharge > 0 && (
                <div className="flex justify-between items-center text-[#60a5fa] font-bold">
                  <span>Selected Seat ({selectedSeat?.id})</span>
                  <span className="font-black text-[#60a5fa]">+{formatINR(seatCharge)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-white/90 font-medium">
                <span>Other Services</span>
                <span className="font-extrabold text-white">
                  {formatINR(otherServices)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-[#4ade80] font-bold bg-[#16a34a]/20 px-3 py-1.5 rounded-xl border border-[#4ade80]/30">
                  <span>Applied Promo Discount</span>
                  <span className="font-black">- {formatINR(discount)}</span>
                </div>
              )}
              <div className="h-px bg-[#1e293b] my-2" />
              <div className="flex justify-between items-center pt-1">
                <span className="font-black text-base text-white">Total Amount</span>
                <span className="flex items-center text-2xl font-black text-[#facc15] drop-shadow-md">
                  <IndianRupee className="w-5 h-5" />
                  {total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <Button
              onClick={handleConfirm}
              disabled={submitting}
              className="w-full mt-4 bg-gradient-to-r from-[#e5573f] via-[#f97316] to-[#e5573f] text-white hover:opacity-95 font-black text-lg rounded-full h-14 shadow-2xl hover:shadow-orange-500/40 hover:scale-105 transition-all tracking-wide uppercase cursor-pointer disabled:opacity-70"
            >
              {submitting ? "Processing…" : <>Confirm &amp; Pay {formatINR(total)}</>}
            </Button>

            <div className="mt-4 flex items-center gap-2 text-xs text-[#4f9c7f] bg-[#4f9c7f]/10 rounded-lg px-3 py-2.5 border border-[#4f9c7f]/20">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              Safe and secure payment &middot; Free cancellation within 24h
            </div>
          </div>

          {/* Promo codes */}
          <div className="bg-[#fdf6e3] rounded-2xl shadow-lg border border-[#f3e6c0] p-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-[#0f1a2e] mb-4">
              <Gift className="w-5 h-5 text-[#e0a800]" /> PROMO CODES
            </h2>

            <div className="flex gap-2 mb-4">
              <Input
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Enter promo code here"
                className="bg-white border border-[#e6d59a] text-[#0f1a2e] placeholder:text-[#b09a5e] rounded-lg h-11 px-3 focus-visible:ring-2 focus-visible:ring-[#e0a800]/40"
              />
              <Button
                type="button"
                onClick={() => applyPromo(promoInput)}
                className="bg-[#0f1a2e] hover:bg-[#1a2947] text-white font-semibold rounded-lg px-5 h-11 shrink-0"
              >
                Apply
              </Button>
            </div>

            <div className="space-y-3">
              {PROMOS.map((promo) => {
                const active = appliedPromo === promo.code;
                return (
                  <button
                    type="button"
                    key={promo.code}
                    onClick={() => applyPromo(promo.code)}
                    className={`w-full text-left rounded-xl border p-4 transition-all ${
                      active
                        ? "border-[#e0a800] bg-white ring-2 ring-[#e0a800]/30"
                        : "border-[#f0e3b8] bg-white/70 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex items-center justify-center w-4 h-4 rounded-full border-2 shrink-0 ${
                          active
                            ? "border-[#e0a800]"
                            : "border-[#c9b878]"
                        }`}
                      >
                        {active && (
                          <span className="w-2 h-2 rounded-full bg-[#e0a800]" />
                        )}
                      </span>
                      <div>
                        <p className="font-bold text-[#e5573f] text-sm tracking-wide">
                          {promo.code}
                        </p>
                        <p className="text-xs text-[#5c6675] mt-1 leading-relaxed">
                          {promo.desc}
                        </p>
                        <span className="inline-block text-[#2c5a9e] text-xs font-medium mt-2">
                          Terms &amp; Conditions
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FlightBookingPage() {
  return (
    <div className="min-h-screen bg-[#f4f7fb] px-4 md:px-6 py-8">
      <Suspense
        fallback={
          <div className="max-w-6xl mx-auto text-center text-[#2c3e57] py-20">
            Loading your booking&hellip;
          </div>
        }
      >
        <FlightBookingContent />
      </Suspense>
    </div>
  );
}
