"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bookHotel } from "@/app/api";
import {
  BedDouble,
  ArrowLeft,
  MapPin,
  Star,
  CalendarDays,
  Clock,
  Users,
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
  Wifi,
  Coffee,
  UtensilsCrossed,
  Car,
  Dumbbell,
  Waves,
} from "lucide-react";

import { BookingPriceBanner } from "@/components/pricing/PriceInsights";
import { useLiveQuote } from "@/components/pricing/usePricing";
import { type QuoteInput } from "@/app/lib/pricingEngine";
import { InteractiveRoomGrid, type HotelRoomOption } from "@/components/booking/InteractiveRoomGrid";
import { ReviewSystem } from "@/components/reviews/ReviewSystem";

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

// Number of nights between two YYYY-MM-DD dates (min 1).
const nightsBetween = (checkin: string, checkout: string) => {
  if (!checkin || !checkout) return 1;
  const ms = new Date(checkout).getTime() - new Date(checkin).getTime();
  const n = Math.round(ms / (1000 * 60 * 60 * 24));
  return n > 0 ? n : 1;
};

// "2026-08-15" -> "Fri, 15 Aug 2026"
const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  const d = new Date(`${dateStr}T00:00`);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const AMENITIES = [
  { icon: Wifi, label: "Free Wi-Fi" },
  { icon: Coffee, label: "Breakfast Included" },
  { icon: UtensilsCrossed, label: "Restaurant" },
  { icon: Waves, label: "Swimming Pool" },
  { icon: Dumbbell, label: "Fitness Centre" },
  { icon: Car, label: "Free Parking" },
];

const PROMOS = [
  {
    code: "HOTELDEAL",
    value: 500,
    desc: "Get an instant discount of ₹500 on your hotel booking with this coupon!",
  },
  {
    code: "STAYUPI",
    value: 750,
    desc: "Use this code and get ₹750 instant discount on payments via UPI only!",
  },
  {
    code: "WELCOME1000",
    value: 1000,
    desc: "First booking? Flat ₹1,000 off on stays above ₹6,000. New users only!",
  },
];

const HOTEL_OFFERS = [
  {
    title: "Airport Cabs",
    subtitle: "Flat 15% off on transfers",
    img: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&q=60",
  },
  {
    title: "Curated Experiences",
    subtitle: "Tours & activities from ₹999",
    img: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=60",
  },
  {
    title: "Spa & Wellness",
    subtitle: "Complimentary spa credits",
    img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=60",
  },
];

function HotelBookingContent() {
  const params = useSearchParams();
  const router = useRouter();

  const name = params.get("name") || "The Taj Palace";
  const city = params.get("city") || "New Delhi";
  const rating = params.get("rating") || "4.8";
  const reviews = Number(params.get("reviews") || "2340");
  const tag = params.get("tag") || "Luxury";
  const checkin = params.get("checkin") || "";
  const checkout = params.get("checkout") || "";
  const guests = Number(params.get("guests") || "2");
  const nightly = Number(params.get("price") || "8999");

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [guest, setGuest] = useState({ name: "", email: "", phone: "" });
  const [selectedRoom, setSelectedRoom] = useState<HotelRoomOption | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingRef, setBookingRef] = useState("");

  // Detailed Guest & Add-on states
  const [numAdults, setNumAdults] = useState<number>(guests || 2);
  const [numChildren, setNumChildren] = useState<number>(0);
  const [childAge, setChildAge] = useState<string>("5");
  const [numInfants, setNumInfants] = useState<number>(0);
  const [extraMattress, setExtraMattress] = useState<boolean>(false);
  const [includeBreakfast, setIncludeBreakfast] = useState<boolean>(true);

  const user = useSelector((state: any) => state.user.user);

  // Dynamic pricing
  const pricingInput: QuoteInput | null = name ? {
    kind: "HOTEL",
    itemId: name.replace(/\s+/g, "-").toLowerCase(),
    label: name,
    basePrice: nightly,
    date: checkin || undefined,
  } : null;
  const { effective: dynamicNightly } = useLiveQuote(pricingInput);

  // Price breakdown
  const nights = nightsBetween(checkin, checkout);
  const { roomTotal, breakfastTotal, mattressTotal, taxes, otherServices, discount, total } = useMemo(() => {
    const extraNightly = selectedRoom ? selectedRoom.extraPricePerNight : 0;
    const effectiveNightly = (dynamicNightly || nightly) + extraNightly;
    const roomTotal = effectiveNightly * nights;
    const breakfastTotal = includeBreakfast ? 350 * (numAdults + numChildren) * nights : 0;
    const mattressTotal = extraMattress ? 500 * nights : 0;
    const taxes = Math.round((roomTotal + mattressTotal + breakfastTotal) * 0.12);
    const otherServices = 299;
    const promo = PROMOS.find((p) => p.code === appliedPromo);
    const discount = promo ? promo.value : 0;
    const total = roomTotal + mattressTotal + breakfastTotal + taxes + otherServices - discount;
    return { roomTotal, breakfastTotal, mattressTotal, taxes, otherServices, discount, total };
  }, [nightly, nights, appliedPromo, dynamicNightly, selectedRoom, includeBreakfast, extraMattress, numAdults, numChildren]);

  const applyPromo = (code: string) => {
    const match = PROMOS.find(
      (p) => p.code.toLowerCase() === code.trim().toLowerCase()
    );
    if (!match) {
      alert("Invalid promo code. Try HOTELDEAL, STAYUPI or WELCOME1000.");
      return;
    }
    setAppliedPromo(match.code);
    setPromoInput(match.code);
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guest.name || !guest.email || !guest.phone) {
      alert("Please fill in all guest details.");
      return;
    }

    // Local reference used when there is no logged-in user (demo mode).
    let ref = `MMTH${Math.floor(Math.random() * 900000 + 100000)}`;

    const userId = user?.id || user?._id;
    if (userId) {
      try {
        setSubmitting(true);
        const booking = await bookHotel({
          userId,
          hotelName: name,
          rooms: 1,
          nights,
          price: nightly,
          date: checkin,
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
            <h1 className="text-3xl font-black text-white drop-shadow-md">Booking Confirmed! 🎉</h1>
            <p className="text-white/80 text-sm mt-1.5 font-medium">
              Your stay at <span className="font-extrabold text-white">{name}</span>, {city} is booked successfully.
            </p>
          </div>

          {/* Details Card */}
          <div className="p-7 space-y-4">
            <div className="rounded-2xl bg-[#f8fafc] border border-[#cbd5e1] p-5 text-left space-y-3">
              <div className="flex justify-between items-center text-sm pb-2 border-b border-[#e2e8f0]">
                <span className="text-[#64748b] font-semibold">Booking Reference ID</span>
                <span className="font-extrabold text-[#1d4ed8] text-base font-mono">{bookingRef}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748b] font-semibold">Guest Name</span>
                <span className="font-extrabold text-[#0f172a]">{guest.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748b] font-semibold">Hotel Property</span>
                <span className="font-extrabold text-[#0f172a]">{name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748b] font-semibold">Stay Duration</span>
                <span className="font-bold text-[#0f172a]">{nights} {nights > 1 ? "Nights" : "Night"} ({formatDate(checkin)} - {formatDate(checkout)})</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-[#e2e8f0]">
                <span className="text-[#64748b] font-bold">Total Paid</span>
                <span className="font-black text-xl text-[#16a34a]">{formatINR(total)}</span>
              </div>
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

          {/* ---- Hotel details card ---- */}
          <div className="bg-white rounded-2xl shadow-lg border border-[#eef2f7] p-6 md:p-7">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-extrabold text-[#0f1a2e]">{name}</h1>
                <span className="inline-block bg-[#eaf3fb] text-[#2c5a9e] text-xs font-semibold px-2.5 py-1 rounded-full border border-[#cfe2f4]">
                  {tag}
                </span>
                <span className="inline-flex items-center bg-[#e6f4ea] text-[#1f8a4c] text-xs font-semibold px-3 py-1 rounded-full">
                  FREE CANCELLATION
                </span>
              </div>
              <button className="flex items-center gap-1.5 text-[#2c5a9e] hover:text-[#1a3a6b] text-sm font-medium">
                <Info className="w-4 h-4" /> View Property Rules
              </button>
            </div>

            <div className="flex items-center gap-4 text-sm text-[#7c8ba3] mt-3">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> {city}
              </span>
              <span className="w-1 h-1 rounded-full bg-[#c3cfe0]" />
              <span className="flex items-center gap-1.5 font-semibold text-[#2c3e57]">
                <Star className="w-4 h-4 fill-[#f5b942] text-[#f5b942]" /> {rating}
                <span className="font-normal text-[#7c8ba3]">
                  ({reviews.toLocaleString("en-IN")} reviews)
                </span>
              </span>
            </div>

            {/* Room row */}
            <div className="flex items-center gap-4 mt-5">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#eaf3fb] shrink-0">
                <BedDouble className="w-6 h-6 text-[#5b9bd5]" />
              </div>
              <div>
                <p className="font-bold text-[#0f1a2e]">Deluxe Room</p>
                <p className="text-xs text-[#7c8ba3]">
                  1 King Bed &bull; Breakfast Included &bull; {guests}{" "}
                  {guests > 1 ? "Guests" : "Guest"}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <span className="bg-[#eaf3fb] text-[#2c5a9e] text-xs font-medium px-2.5 py-1 rounded-md">
                  Free Cancellation
                </span>
                <span className="text-[#7c8ba3] text-xs font-medium">MMTSTAY</span>
              </div>
            </div>

            <div className="h-px bg-[#eef2f7] my-6" />

            {/* Timeline: check-in -> check-out */}
            <div className="flex items-center justify-between gap-3">
              <div className="max-w-[38%]">
                <p className="text-xs text-[#7c8ba3] uppercase tracking-wide font-semibold">
                  Check-in
                </p>
                <p className="text-xl md:text-2xl font-extrabold text-[#0f1a2e] leading-tight mt-1">
                  {formatDate(checkin)}
                </p>
                <p className="text-sm text-[#7c8ba3] mt-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> From 2:00 PM
                </p>
              </div>

              <div className="flex-1 flex flex-col items-center px-2">
                <span className="text-xs text-[#7c8ba3] mb-1">
                  {nights} {nights > 1 ? "nights" : "night"}
                </span>
                <div className="w-full flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#5b9bd5]" />
                  <div className="h-px bg-[#c3daf0] flex-1" />
                  <BedDouble className="w-4 h-4 text-[#5b9bd5]" />
                  <div className="h-px bg-[#c3daf0] flex-1" />
                  <span className="w-2 h-2 rounded-full bg-[#5b9bd5]" />
                </div>
                <span className="text-xs text-[#7c8ba3] mt-1">Stay</span>
              </div>

              <div className="max-w-[38%] text-right">
                <p className="text-xs text-[#7c8ba3] uppercase tracking-wide font-semibold">
                  Check-out
                </p>
                <p className="text-xl md:text-2xl font-extrabold text-[#0f1a2e] leading-tight mt-1">
                  {formatDate(checkout)}
                </p>
                <p className="text-sm text-[#7c8ba3] mt-1.5 flex items-center justify-end gap-1">
                  <Clock className="w-3.5 h-3.5" /> Until 11:00 AM
                </p>
              </div>
            </div>

            <div className="h-px bg-[#eef2f7] my-6" />

            {/* Amenities */}
            <p className="text-sm font-semibold text-[#0f1a2e] mb-3">Popular Amenities</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4">
              {AMENITIES.map((a) => (
                <span
                  key={a.label}
                  className="flex items-center gap-2 text-sm text-[#2c3e57]"
                >
                  <a.icon className="w-4 h-4 text-[#5b9bd5]" />
                  {a.label}
                </span>
              ))}
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
                    <BedDouble className="w-4 h-4 text-[#5b9bd5]" />
                  </span>
                  {name}
                </span>
                <span className="font-bold text-[#0f1a2e]">
                  {formatINR(Math.round(nightly * 0.9))}
                </span>
              </div>

              {/* Gradient time bar */}
              <div className="mt-4 h-2 rounded-full bg-gradient-to-r from-[#4caf50] via-[#f5b942] to-[#e5573f]" />
              <div className="flex items-center justify-between text-xs text-[#7c8ba3] mt-2">
                <span>Free till 24h before</span>
                <span>Charges increase closer to check-in</span>
                <span>No refund</span>
              </div>
            </div>
          </div>

          {/* ---- Offers strip ---- */}
          <div className="bg-white rounded-2xl shadow-lg border border-[#eef2f7] p-6 md:p-7">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 font-bold text-[#0f1a2e] text-lg">
                <Gift className="w-5 h-5 text-[#e5573f]" /> Complete your stay &amp; unlock
                these offers
              </h2>
              <span className="bg-[#fde8e4] text-[#e5573f] text-xs font-semibold px-3 py-1 rounded-full">
                Member Exclusive
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {HOTEL_OFFERS.map((offer) => (
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

          {/* ---- Guest details ---- */}
          <form
            onSubmit={handleConfirm}
            className="bg-white rounded-2xl shadow-lg border border-[#eef2f7] p-6 md:p-7 space-y-5"
          >
            <h2 className="text-lg font-bold text-[#0f1a2e]">Guest Details</h2>

            <div className="space-y-1.5">
              <Label className="text-[#2c3e57] text-sm font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Full Name
              </Label>
              <Input
                value={guest.name}
                onChange={(e) => setGuest({ ...guest, name: e.target.value })}
                placeholder="Primary guest name"
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
                  value={guest.email}
                  onChange={(e) => setGuest({ ...guest, email: e.target.value })}
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
                  value={guest.phone}
                  onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="bg-white border border-[#d5e2f0] text-[#0f1a2e] placeholder:text-[#9aa8bd] rounded-lg h-11 px-3 focus-visible:ring-2 focus-visible:ring-[#5b9bd5]/40"
                />
              </div>
            </div>

            {/* Guest Composition & Children Age Selector */}
            <div className="rounded-xl bg-[#f8fafc] border border-[#e2e8f0] p-4 space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#1a3a6b]">Guest Composition &amp; Age Breakdown</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-[#334155]">Adults (12+ yrs)</Label>
                  <select
                    value={numAdults}
                    onChange={(e) => setNumAdults(Number(e.target.value))}
                    className="w-full mt-1 bg-white border border-[#cbd5e1] rounded-lg h-10 px-3 text-sm font-semibold text-[#0f172a]"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n} Adult{n > 1 ? "s" : ""}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-[#334155]">Children (0-12 yrs)</Label>
                  <select
                    value={numChildren}
                    onChange={(e) => setNumChildren(Number(e.target.value))}
                    className="w-full mt-1 bg-white border border-[#cbd5e1] rounded-lg h-10 px-3 text-sm font-semibold text-[#0f172a]"
                  >
                    {[0, 1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>{n} Child{n !== 1 ? "ren" : ""}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-[#334155]">Infants (Under 2 yrs)</Label>
                  <select
                    value={numInfants}
                    onChange={(e) => setNumInfants(Number(e.target.value))}
                    className="w-full mt-1 bg-white border border-[#cbd5e1] rounded-lg h-10 px-3 text-sm font-semibold text-[#0f172a]"
                  >
                    {[0, 1, 2].map((n) => (
                      <option key={n} value={n}>{n} Infant{n !== 1 ? "s" : ""}</option>
                    ))}
                  </select>
                </div>
              </div>

              {numChildren > 0 && (
                <div className="bg-white p-3 rounded-lg border border-[#cbd5e1]">
                  <Label className="text-xs font-bold text-[#1e293b]">Child Age Limit Selection</Label>
                  <p className="text-[11px] text-[#64748b] mb-2">Children below 12 years receive complimentary stay without extra bed.</p>
                  <select
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value)}
                    className="w-full bg-[#f1f5f9] border border-[#cbd5e1] rounded-md h-9 px-2 text-xs font-medium text-[#0f172a]"
                  >
                    <option value="2">Child 1 Age: 2 years (Infant Bed Included)</option>
                    <option value="5">Child 1 Age: 5 years (Junior Stay Included)</option>
                    <option value="8">Child 1 Age: 8 years (Child Discount)</option>
                    <option value="11">Child 1 Age: 11 years (Child Discount)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Room Add-ons & Facilities */}
            <div className="rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[#15803d]">Optional Add-ons &amp; Facilities</p>

              <label className="flex items-center justify-between cursor-pointer p-2 bg-white rounded-lg border border-[#dcfce7] hover:border-[#86efac]">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includeBreakfast}
                    onChange={(e) => setIncludeBreakfast(e.target.checked)}
                    className="w-4 h-4 text-[#16a34a] rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#14532d]">Complimentary Daily Breakfast Buffet</span>
                    <p className="text-[11px] text-[#475569]">Includes Continental, South Indian &amp; Hot Dishes</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-[#15803d]">+₹350/person/night</span>
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 bg-white rounded-lg border border-[#dcfce7] hover:border-[#86efac]">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={extraMattress}
                    onChange={(e) => setExtraMattress(e.target.checked)}
                    className="w-4 h-4 text-[#16a34a] rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#14532d]">Extra Bed / Rollaway Mattress</span>
                    <p className="text-[11px] text-[#475569]">Plush extra mattress with luxury duvet &amp; pillow</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-[#15803d]">+₹500/night</span>
              </label>
            </div>

            {/* Payment Method & EMI Installment Options */}
            <div className="rounded-xl bg-[#f8fafc] border border-[#e2e8f0] p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[#1a3a6b]">Select Payment Method &amp; EMI Options</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className="flex items-center gap-2 bg-white border border-[#cbd5e1] p-3 rounded-lg cursor-pointer hover:border-[#3b82f6]">
                  <input type="radio" name="payMethod" defaultChecked className="text-[#1a3a6b]" />
                  <div>
                    <p className="text-xs font-bold text-[#0f172a]">📱 BHIM UPI / GPay / PhonePe</p>
                    <p className="text-[10px] text-[#64748b]">Instant 0% fee payment</p>
                  </div>
                </label>

                <label className="flex items-center gap-2 bg-white border border-[#cbd5e1] p-3 rounded-lg cursor-pointer hover:border-[#3b82f6]">
                  <input type="radio" name="payMethod" className="text-[#1a3a6b]" />
                  <div>
                    <p className="text-xs font-bold text-[#0f172a]">💳 Credit / Debit Card</p>
                    <p className="text-[10px] text-[#64748b]">Visa, Mastercard, RuPay</p>
                  </div>
                </label>

                <label className="flex items-center gap-2 bg-white border border-[#cbd5e1] p-3 rounded-lg cursor-pointer hover:border-[#3b82f6]">
                  <input type="radio" name="payMethod" className="text-[#1a3a6b]" />
                  <div>
                    <p className="text-xs font-bold text-[#0f172a]">🏦 Net Banking</p>
                    <p className="text-[10px] text-[#64748b]">SBI, HDFC, ICICI, Axis</p>
                  </div>
                </label>

                <label className="flex items-center gap-2 bg-[#eff6ff] border border-[#bfdbfe] p-3 rounded-lg cursor-pointer hover:border-[#2563eb]">
                  <input type="radio" name="payMethod" className="text-[#1a3a6b]" />
                  <div>
                    <p className="text-xs font-bold text-[#1e40af]">📊 Easy No-Cost EMI</p>
                    <p className="text-[10px] text-[#2563eb] font-semibold">Pay in 3, 6, or 12 monthly installments</p>
                  </div>
                </label>
              </div>

              <div className="bg-white p-3 rounded-lg border border-[#e2e8f0] text-xs text-[#334155] flex justify-between items-center">
                <span>Monthly EMI Estimate (No-Cost):</span>
                <span className="font-extrabold text-[#1e3a8a]">{formatINR(Math.round(total / 3))}/mo for 3 months</span>
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

          {/* Interactive Room Grid & 3D Virtual Tour Selection */}
          <InteractiveRoomGrid
            hotelName={name || "Taj Palace New Delhi"}
            basePricePerNight={dynamicNightly || nightly}
            onSelectRoom={setSelectedRoom}
            selectedRoomId={selectedRoom?.id}
          />

          {/* Review & Rating System */}
          <ReviewSystem
            itemId={name ? name.replace(/\s+/g, "-").toLowerCase() : "taj-palace"}
            itemName={name || "Taj Palace New Delhi"}
            itemType="HOTEL"
          />
        </div>

        {/* ============ RIGHT COLUMN (sticky) ============ */}
        <div className="space-y-6 lg:sticky lg:top-6">
          {/* Price summary */}
          <div className="bg-white rounded-2xl shadow-lg border border-[#eef2f7] p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#0f1a2e] mb-5">
              <TicketPercent className="w-5 h-5 text-[#5b9bd5]" /> Price Summary
            </h2>
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#3d5170]">
                  {formatINR(nightly)} &times; {nights} {nights > 1 ? "nights" : "night"}
                </span>
                <span className="font-semibold text-[#0f1a2e]">{formatINR(roomTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3d5170]">Taxes &amp; Service Fees</span>
                <span className="font-semibold text-[#0f1a2e]">{formatINR(taxes)}</span>
              </div>
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
              Free cancellation &middot; Pay at hotel option available
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
                          active ? "border-[#e0a800]" : "border-[#c9b878]"
                        }`}
                      >
                        {active && <span className="w-2 h-2 rounded-full bg-[#e0a800]" />}
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

export default function HotelBookingPage() {
  return (
    <div className="min-h-screen bg-[#f4f7fb] px-4 md:px-6 py-8">
      <Suspense
        fallback={
          <div className="max-w-6xl mx-auto text-center text-[#2c3e57] py-20">
            Loading your booking&hellip;
          </div>
        }
      >
        <HotelBookingContent />
      </Suspense>
    </div>
  );
}
