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
  const from = params.get("from") || "New Delhi";
  const to = params.get("to") || "Mumbai";
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
  const { baseFare, taxes, otherServices, seatCharge, discount, total } = useMemo(() => {
    const effectiveBase = dynamicPrice || basePrice;
    const baseFare = effectiveBase * travellers;
    const taxes = Math.round(baseFare * 0.28);
    const otherServices = 249;
    const seatCharge = selectedSeat ? selectedSeat.price : 0;
    const promo = PROMOS.find((p) => p.code === appliedPromo);
    const discount = promo ? promo.value : 0;
    const total = baseFare + taxes + otherServices + seatCharge - discount;
    return { baseFare, taxes, otherServices, seatCharge, discount, total };
  }, [basePrice, travellers, appliedPromo, dynamicPrice, selectedSeat]);

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
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/80 border border-white/60 rounded-3xl shadow-2xl backdrop-blur-md p-10 text-center">
          <div className="flex justify-center mb-5">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#4f9c7f] to-[#6bb39a] text-white shadow-lg">
              <CheckCircle2 className="w-11 h-11" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0f1a2e]">Booking Confirmed!</h1>
          <p className="text-[#3d5170] mt-2">
            Your flight from {from} to {to} has been booked successfully.
          </p>

          <div className="mt-6 rounded-2xl bg-white/80 border border-[#d5e3f2] p-5 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#7c8ba3]">Booking Reference</span>
              <span className="font-bold text-[#0f1a2e]">{bookingRef}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#7c8ba3]">Passenger</span>
              <span className="font-semibold text-[#0f1a2e]">{passenger.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#7c8ba3]">Flight</span>
              <span className="font-semibold text-[#0f1a2e]">
                {airline} {code}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#7c8ba3]">Amount Paid</span>
              <span className="font-bold text-[#0f1a2e]">{formatINR(total)}</span>
            </div>
          </div>

          <Button
            onClick={() => router.push("/")}
            className="mt-7 bg-[#0f1a2e] text-white hover:bg-[#1a2947] font-semibold rounded-full px-10 h-12 shadow-md"
          >
            Back to Home
          </Button>
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

          {/* ---- Flight itinerary card ---- */}
          <div className="bg-white rounded-2xl shadow-lg border border-[#eef2f7] p-6 md:p-7">
            {/* Route header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-extrabold text-[#0f1a2e] flex items-center gap-2">
                  {from} <span className="text-[#5b9bd5]">&rarr;</span> {to}
                </h1>
                <span className="inline-flex items-center bg-[#e6f4ea] text-[#1f8a4c] text-xs font-semibold px-3 py-1 rounded-full">
                  CANCELLATION FEES APPLY
                </span>
              </div>
              <button className="flex items-center gap-1.5 text-[#2c5a9e] hover:text-[#1a3a6b] text-sm font-medium">
                <Info className="w-4 h-4" /> View Fare Rules
              </button>
            </div>

            <div className="flex items-center gap-4 text-sm text-[#7c8ba3] mt-3">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4" />
                {formatDateTime(date, depart)}
              </span>
              <span className="w-1 h-1 rounded-full bg-[#c3cfe0]" />
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Non Stop - {duration}
              </span>
            </div>

            {/* Airline row */}
            <div className="flex items-center gap-4 mt-5">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#eaf3fb] shrink-0">
                <Plane className="w-6 h-6 text-[#5b9bd5]" />
              </div>
              <div>
                <p className="font-bold text-[#0f1a2e]">{airline}</p>
                <p className="text-xs text-[#7c8ba3]">
                  {code} &bull; {aircraft}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <span className="bg-[#eaf3fb] text-[#2c5a9e] text-xs font-medium px-2.5 py-1 rounded-md">
                  Economy
                </span>
                <span className="text-[#7c8ba3] text-xs font-medium">MMTSPECIAL</span>
              </div>
            </div>

            <div className="h-px bg-[#eef2f7] my-6" />

            {/* Timeline: depart -> arrive */}
            <div className="flex items-center justify-between gap-3">
              <div className="max-w-[38%]">
                <p className="text-xl md:text-2xl font-extrabold text-[#0f1a2e] leading-tight">
                  {formatDateTime(date, depart)}
                </p>
                <p className="text-sm text-[#7c8ba3] mt-1.5">
                  {from} International Airport{fromCode ? ` (${fromCode})` : ""}, Terminal T2
                </p>
              </div>

              <div className="flex-1 flex flex-col items-center px-2">
                <span className="text-xs text-[#7c8ba3] mb-1">{duration}</span>
                <div className="w-full flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#5b9bd5]" />
                  <div className="h-px bg-[#c3daf0] flex-1" />
                  <Plane className="w-4 h-4 text-[#5b9bd5] rotate-90" />
                  <div className="h-px bg-[#c3daf0] flex-1" />
                  <span className="w-2 h-2 rounded-full bg-[#5b9bd5]" />
                </div>
                <span className="text-xs text-[#7c8ba3] mt-1">Non-stop</span>
              </div>

              <div className="max-w-[38%] text-right">
                <p className="text-xl md:text-2xl font-extrabold text-[#0f1a2e] leading-tight">
                  {formatDateTime(date, arrive)}
                </p>
                <p className="text-sm text-[#7c8ba3] mt-1.5">
                  {to} International Airport{toCode ? ` (${toCode})` : ""}, Terminal T3
                </p>
              </div>
            </div>

            <div className="h-px bg-[#eef2f7] my-6" />

            {/* Baggage */}
            <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
              <span className="flex items-center gap-2 text-sm text-[#2c3e57]">
                <Luggage className="w-5 h-5 text-[#7c8ba3]" />
                Cabin Baggage: <span className="font-semibold">7 Kgs / Adult</span>
              </span>
              <span className="flex items-center gap-2 text-sm text-[#2c3e57]">
                <Luggage className="w-5 h-5 text-[#7c8ba3]" />
                Check-in Baggage:{" "}
                <span className="font-semibold">15 Kgs (1 piece only) / Adult</span>
              </span>
            </div>
          </div>

          {/* ---- Cancellation & Date Change Policy ---- */}
          <div className="bg-white rounded-2xl shadow-lg border border-[#eef2f7] p-6 md:p-7">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold text-[#0f1a2e] text-lg">
                <CircleAlert className="w-5 h-5 text-[#e0a800]" /> Cancellation &amp; Date
                Change Policy
              </h2>
              <button className="text-[#2c5a9e] hover:text-[#1a3a6b] text-sm font-medium">
                View Policy
              </button>
            </div>

            <div className="mt-5 rounded-xl bg-[#f8fafc] border border-[#eef2f7] p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-semibold text-[#0f1a2e]">
                  <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#eaf3fb]">
                    <Plane className="w-4 h-4 text-[#5b9bd5]" />
                  </span>
                  {fromCode}-{toCode}
                </span>
                <span className="font-bold text-[#0f1a2e]">
                  {formatINR(Math.round(baseFare * 0.85))}
                </span>
              </div>

              {/* Gradient time bar */}
              <div className="mt-4 h-2 rounded-full bg-gradient-to-r from-[#4caf50] via-[#f5b942] to-[#e5573f]" />
              <div className="flex items-center justify-between text-xs text-[#7c8ba3] mt-2">
                <span>Now</span>
                <span>Cancellation charges increase over time</span>
                <span>Before departure</span>
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

          {/* ---- Passenger details ---- */}
          <form
            onSubmit={handleConfirm}
            className="bg-white rounded-2xl shadow-lg border border-[#eef2f7] p-6 md:p-7 space-y-5"
          >
            <h2 className="text-lg font-bold text-[#0f1a2e]">Passenger Details</h2>

            <div className="space-y-1.5">
              <Label className="text-[#2c3e57] text-sm font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Full Name
              </Label>
              <Input
                value={passenger.name}
                onChange={(e) => setPassenger({ ...passenger, name: e.target.value })}
                placeholder="As per government ID"
                className="bg-white border border-[#d5e2f0] text-[#0f1a2e] placeholder:text-[#9aa8bd] rounded-lg h-11 px-3 focus-visible:ring-2 focus-visible:ring-[#5b9bd5]/40"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[#2c3e57] text-sm font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email
                </Label>
                <Input
                  type="email"
                  value={passenger.email}
                  onChange={(e) => setPassenger({ ...passenger, email: e.target.value })}
                  placeholder="you@example.com"
                  className="bg-white border border-[#d5e2f0] text-[#0f1a2e] placeholder:text-[#9aa8bd] rounded-lg h-11 px-3 focus-visible:ring-2 focus-visible:ring-[#5b9bd5]/40"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[#2c3e57] text-sm font-medium flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Phone
                </Label>
                <Input
                  type="tel"
                  value={passenger.phone}
                  onChange={(e) => setPassenger({ ...passenger, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="bg-white border border-[#d5e2f0] text-[#0f1a2e] placeholder:text-[#9aa8bd] rounded-lg h-11 px-3 focus-visible:ring-2 focus-visible:ring-[#5b9bd5]/40"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-[#1a3a6b] to-[#2c5a9e] text-white hover:from-[#0f2847] hover:to-[#1a3a6b] font-bold rounded-full py-3.5 shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
            >
              {submitting ? "Processing…" : <>Confirm &amp; Pay {formatINR(total)}</>}
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
          {/* Fare summary */}
          <div className="bg-white rounded-2xl shadow-lg border border-[#eef2f7] p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#0f1a2e] mb-5">
              <TicketPercent className="w-5 h-5 text-[#5b9bd5]" /> Fare Summary
            </h2>
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#3d5170]">
                  Base Fare ({travellers} {travellers > 1 ? "travellers" : "traveller"})
                </span>
                <span className="font-semibold text-[#0f1a2e]">{formatINR(baseFare)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3d5170]">Taxes and Surcharges</span>
                <span className="font-semibold text-[#0f1a2e]">{formatINR(taxes)}</span>
              </div>
              {seatCharge > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#3d5170]">Selected Seat ({selectedSeat?.id})</span>
                  <span className="font-semibold text-[#5b9bd5]">+{formatINR(seatCharge)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#3d5170]">Other Services</span>
                <span className="font-semibold text-[#0f1a2e]">
                  {formatINR(otherServices)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#1f8a4c]">Discounts</span>
                  <span className="font-semibold text-[#1f8a4c]">
                    - {formatINR(discount)}
                  </span>
                </div>
              )}
              <div className="h-px bg-[#eef2f7] my-1" />
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#0f1a2e]">Total Amount</span>
                <span className="flex items-center text-xl font-extrabold text-[#0f1a2e]">
                  <IndianRupee className="w-4 h-4" />
                  {total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <Button
              onClick={handleConfirm}
              disabled={submitting}
              className="w-full mt-5 bg-[#3a2318] hover:bg-[#4a2e20] text-white font-bold rounded-xl h-12 shadow-md transition-all disabled:opacity-70"
            >
              {submitting ? "Processing…" : "Book Now"}
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
