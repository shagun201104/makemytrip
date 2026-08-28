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

            {/* Instant Mobile SMS & WhatsApp Notification Alert */}
            <div className="bg-[#1e3a8a]/90 border-2 border-[#3b82f6]/60 p-4 rounded-2xl text-left space-y-1 shadow-lg">
              <p className="text-xs font-black text-[#60a5fa] flex items-center gap-1.5 uppercase tracking-wider">
                📱 Instant Mobile SMS &amp; WhatsApp Alert Sent
              </p>
              <p className="text-xs text-white font-bold">
                E-Voucher &amp; QR Code dispatched to <span className="text-[#facc15] font-black">{guest.phone}</span> &amp; <span className="text-[#60a5fa] font-black">{guest.email}</span>!
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
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Top Helper Alert Banner */}
      <div className="bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white p-4 rounded-2xl shadow-xl flex items-center justify-between gap-3 border border-white/20">
        <div className="flex items-center gap-3">
          <Ticket className="w-6 h-6 text-[#60a5fa] shrink-0" />
          <p className="text-xs md:text-sm font-bold">
            💡 <span className="underline decoration-wavy">Where will I see my booking?</span> Once confirmed, your ticket &amp; booking details will instantly appear under your <span className="text-[#60a5fa] font-black uppercase">Profile &rarr; My Trips</span> section!
          </p>
        </div>
        <Button
          type="button"
          onClick={() => router.push("/profile")}
          className="bg-white text-[#1d4ed8] hover:bg-white/90 font-extrabold text-xs rounded-full px-4 h-9 shadow-md shrink-0"
        >
          My Profile &rarr;
        </Button>
      </div>

      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-white hover:text-white/80 font-bold text-sm transition-colors bg-[#0f1a2e]/80 backdrop-blur-md px-4 py-2 rounded-full w-fit border border-[#3b82f6]/40"
      >
        <ArrowLeft className="w-4 h-4" /> Back to search results
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ============ LEFT COLUMN ============ */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dynamic price banner */}
          {pricingInput && <BookingPriceBanner input={pricingInput} />}

          {/* ---- OPTION M PASTEL SAGE GREEN HOTEL DETAILS CARD ---- */}
          <div className="bg-[#eff5f0] rounded-3xl shadow-xl border-4 border-[#b6d7c1] overflow-hidden text-[#15281c]">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#d4e6d9] via-[#e2ece4] to-[#d4e6d9] p-6 md:p-8 text-[#15281c] space-y-3 border-b border-[#b6d7c1]">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="bg-[#15803d] text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                    {tag || "LUXURY STAY"}
                  </span>
                  <span className="bg-[#15803d] text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> FREE CANCELLATION
                  </span>
                </div>
                <button className="flex items-center gap-1 text-[#15803d] hover:underline text-xs font-extrabold">
                  <Info className="w-4 h-4" /> View Property Rules
                </button>
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-[#15281c]">{name}</h1>

              <div className="flex items-center gap-4 text-xs md:text-sm text-[#2e4d38]">
                <span className="flex items-center gap-1 font-bold">
                  <MapPin className="w-4 h-4 text-[#15803d]" /> {city}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]" />
                <span className="flex items-center gap-1 font-black text-[#b45309] bg-[#d4e6d9] px-2.5 py-0.5 rounded-full border border-[#b6d7c1]">
                  <Star className="w-4 h-4 fill-[#b45309] text-[#b45309]" /> {rating}
                  <span className="text-[#2e4d38] font-semibold ml-1">
                    ({reviews.toLocaleString("en-IN")} verified reviews)
                  </span>
                </span>
              </div>
            </div>

            {/* Room Info */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-4 bg-[#f8fafc] border-2 border-[#cbd5e1] rounded-2xl p-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] text-white shrink-0 shadow-lg">
                  <BedDouble className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <p className="font-extrabold text-base md:text-lg text-[#0f172a]">Deluxe Executive Room</p>
                  <p className="text-xs md:text-sm font-semibold text-[#64748b] mt-0.5">
                    1 King Bed &bull; Complimentary Breakfast &bull; {guests}{" "}
                    {guests > 1 ? "Guests" : "Guest"}
                  </p>
                </div>
                <span className="bg-[#dcfce7] text-[#16a34a] text-xs font-black px-3 py-1.5 rounded-xl border border-[#86efac] hidden sm:inline-block">
                  MMTSTAY INCLUDED
                </span>
              </div>

              {/* Timeline: check-in -> check-out */}
              <div className="bg-[#f8fafc] border-2 border-[#cbd5e1] rounded-2xl p-5 md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="max-w-[38%]">
                    <p className="text-xs text-[#64748b] uppercase tracking-wider font-black">
                      Check-in Date
                    </p>
                    <p className="text-xl md:text-2xl font-black text-[#0f172a] leading-tight mt-1">
                      {formatDate(checkin)}
                    </p>
                    <p className="text-xs text-[#2563eb] font-bold mt-1.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#2563eb]" /> From 2:00 PM
                    </p>
                  </div>

                  <div className="flex-1 flex flex-col items-center px-2">
                    <span className="bg-[#1e3a8a] text-white text-[10px] md:text-xs font-black px-3 py-1 rounded-full shadow-md mb-1">
                      {nights} {nights > 1 ? "Nights Stay" : "Night Stay"}
                    </span>
                    <div className="w-full flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-[#2563eb] shadow-md" />
                      <div className="h-1 bg-gradient-to-r from-[#2563eb] via-[#60a5fa] to-[#2563eb] flex-1 rounded-full" />
                      <BedDouble className="w-5 h-5 text-[#2563eb]" />
                      <div className="h-1 bg-gradient-to-r from-[#2563eb] via-[#60a5fa] to-[#2563eb] flex-1 rounded-full" />
                      <span className="w-3 h-3 rounded-full bg-[#2563eb] shadow-md" />
                    </div>
                  </div>

                  <div className="max-w-[38%] text-right">
                    <p className="text-xs text-[#64748b] uppercase tracking-wider font-black">
                      Check-out Date
                    </p>
                    <p className="text-xl md:text-2xl font-black text-[#0f172a] leading-tight mt-1">
                      {formatDate(checkout)}
                    </p>
                    <p className="text-xs text-[#2563eb] font-bold mt-1.5 flex items-center justify-end gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#2563eb]" /> Until 11:00 AM
                    </p>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#0f172a] mb-3">Popular Included Amenities</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {AMENITIES.map((a) => (
                    <div
                      key={a.label}
                      className="flex items-center gap-2.5 bg-[#f1f5f9] border border-[#cbd5e1] rounded-xl px-3 py-2 text-xs font-bold text-[#0f172a]"
                    >
                      <a.icon className="w-4 h-4 text-[#2563eb]" />
                      {a.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ---- Cancellation & Date Change Policy ---- */}
          <div className="bg-white rounded-3xl shadow-xl border-2 border-[#cbd5e1] p-6 md:p-7 text-[#0f1a2e]">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-black text-[#0f1a2e] text-lg">
                <CircleAlert className="w-5 h-5 text-[#f59e0b]" /> Cancellation Policy
              </h2>
              <button className="text-[#2563eb] font-extrabold text-xs hover:underline">
                View Full Terms
              </button>
            </div>

            <div className="mt-4 rounded-2xl bg-[#f8fafc] border border-[#cbd5e1] p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-extrabold text-[#0f1a2e]">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#2563eb] text-white">
                    <BedDouble className="w-4 h-4" />
                  </span>
                  {name}
                </span>
                <span className="font-black text-[#16a34a]">
                  {formatINR(Math.round(nightly * 0.9))}
                </span>
              </div>

              {/* Gradient time bar */}
              <div className="mt-3 h-2 rounded-full bg-gradient-to-r from-[#16a34a] via-[#f59e0b] to-[#dc2626]" />
              <div className="flex items-center justify-between text-[11px] font-bold text-[#64748b] mt-2">
                <span>Free cancellation up to 24h</span>
                <span>Partial refund</span>
                <span>Non-refundable</span>
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

          {/* ---- OPTION M PASTEL SAGE GREEN GUEST DETAILS & PAYMENT FORM ---- */}
          <form
            onSubmit={handleConfirm}
            className="bg-[#eff5f0] text-[#15281c] rounded-3xl shadow-xl border-4 border-[#b6d7c1] p-6 md:p-8 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-[#b6d7c1] pb-4">
              <h2 className="text-2xl font-black text-[#15281c] flex items-center gap-2">
                <User className="w-6 h-6 text-[#15803d]" /> Guest Details &amp; Options
              </h2>
              <span className="bg-[#15803d] text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Step 2 of 2
              </span>
            </div>

            <div className="space-y-2">
              <Label className="text-[#15281c] text-xs font-black flex items-center gap-1.5 uppercase tracking-wider">
                <User className="w-4 h-4 text-[#15803d]" /> Primary Guest Full Name
              </Label>
              <Input
                value={guest.name}
                onChange={(e) => setGuest({ ...guest, name: e.target.value })}
                placeholder="Enter full name as on Govt ID"
                className="bg-[#e2ece4] border-2 border-[#b6d7c1] text-[#15281c] placeholder:text-[#2e4d38]/60 rounded-xl h-12 px-4 font-bold shadow-inner focus:border-[#15803d]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#15281c] text-xs font-black flex items-center gap-1.5 uppercase tracking-wider">
                  <Mail className="w-4 h-4 text-[#15803d]" /> Email Address (For E-Ticket)
                </Label>
                <Input
                  type="email"
                  value={guest.email}
                  onChange={(e) => setGuest({ ...guest, email: e.target.value })}
                  placeholder="you@example.com"
                  className="bg-[#e2ece4] border-2 border-[#b6d7c1] text-[#15281c] placeholder:text-[#2e4d38]/60 rounded-xl h-12 px-4 font-bold shadow-inner focus:border-[#15803d]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#15281c] text-xs font-black flex items-center gap-1.5 uppercase tracking-wider">
                  <Phone className="w-4 h-4 text-[#15803d]" /> Mobile Number (For SMS/WhatsApp)
                </Label>
                <Input
                  type="tel"
                  value={guest.phone}
                  onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="bg-[#e2ece4] border-2 border-[#b6d7c1] text-[#15281c] placeholder:text-[#2e4d38]/60 rounded-xl h-12 px-4 font-bold shadow-inner focus:border-[#15803d]"
                />
              </div>
            </div>

            {/* Guest Composition & Children Age Selector */}
            <div className="rounded-2xl bg-[#e2ece4] border-2 border-[#b6d7c1] p-5 space-y-4">
              <p className="text-xs font-black uppercase tracking-wider text-[#15803d]">Guest Composition &amp; Age Breakdown</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-bold text-[#15281c]">Adults (12+ yrs)</Label>
                  <select
                    value={numAdults}
                    onChange={(e) => setNumAdults(Number(e.target.value))}
                    className="w-full mt-1.5 bg-[#d4e6d9] border-2 border-[#b6d7c1] text-[#15281c] rounded-xl h-11 px-3 text-sm font-extrabold cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n} Adult{n > 1 ? "s" : ""}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-bold text-[#15281c]">Children (0-12 yrs)</Label>
                  <select
                    value={numChildren}
                    onChange={(e) => setNumChildren(Number(e.target.value))}
                    className="w-full mt-1.5 bg-[#d4e6d9] border-2 border-[#b6d7c1] text-[#15281c] rounded-xl h-11 px-3 text-sm font-extrabold cursor-pointer"
                  >
                    {[0, 1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>{n} Child{n !== 1 ? "ren" : ""}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-bold text-[#15281c]">Infants (Under 2 yrs)</Label>
                  <select
                    value={numInfants}
                    onChange={(e) => setNumInfants(Number(e.target.value))}
                    className="w-full mt-1.5 bg-[#d4e6d9] border-2 border-[#b6d7c1] text-[#15281c] rounded-xl h-11 px-3 text-sm font-extrabold cursor-pointer"
                  >
                    {[0, 1, 2].map((n) => (
                      <option key={n} value={n}>{n} Infant{n !== 1 ? "s" : ""}</option>
                    ))}
                  </select>
                </div>
              </div>

              {numChildren > 0 && (
                <div className="bg-[#d4e6d9] p-4 rounded-xl border border-[#b6d7c1] space-y-1.5">
                  <Label className="text-xs font-black text-[#15803d]">Child Age Limit Selection</Label>
                  <p className="text-[11px] text-[#2e4d38] font-medium">Children below 12 years receive complimentary stay without extra bed.</p>
                  <select
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value)}
                    className="w-full bg-[#e2ece4] border border-[#b6d7c1] text-[#15281c] rounded-lg h-10 px-3 text-xs font-bold"
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
            <div className="rounded-2xl bg-[#d4e6d9] border-2 border-[#b6d7c1] p-5 space-y-3">
              <p className="text-xs font-black uppercase tracking-wider text-[#15803d]">Optional Add-ons &amp; Facilities</p>

              <label className="flex items-center justify-between cursor-pointer p-3 bg-[#e2ece4] rounded-xl border border-[#b6d7c1] hover:border-[#15803d] transition-all">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={includeBreakfast}
                    onChange={(e) => setIncludeBreakfast(e.target.checked)}
                    className="w-5 h-5 text-[#15803d] rounded cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-extrabold text-[#15281c]">Complimentary Daily Breakfast Buffet</span>
                    <p className="text-xs text-[#2e4d38]">Includes Continental, South Indian &amp; Hot Chef Specialities</p>
                  </div>
                </div>
                <span className="text-xs font-black text-[#15803d] bg-[#d4e6d9] px-3 py-1 rounded-lg border border-[#b6d7c1]">+₹350/person/night</span>
              </label>

              <label className="flex items-center justify-between cursor-pointer p-3 bg-[#e2ece4] rounded-xl border border-[#b6d7c1] hover:border-[#15803d] transition-all">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={extraMattress}
                    onChange={(e) => setExtraMattress(e.target.checked)}
                    className="w-5 h-5 text-[#15803d] rounded cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-extrabold text-[#15281c]">Extra Bed / Rollaway Mattress</span>
                    <p className="text-xs text-[#2e4d38]">Plush extra mattress with luxury duvet &amp; pillow</p>
                  </div>
                </div>
                <span className="text-xs font-black text-[#15803d] bg-[#d4e6d9] px-3 py-1 rounded-lg border border-[#b6d7c1]">+₹500/night</span>
              </label>
            </div>

            {/* Payment Method & EMI Installment Options */}
            <div className="rounded-2xl bg-[#e2ece4] border-2 border-[#b6d7c1] p-5 space-y-3">
              <p className="text-xs font-black uppercase tracking-wider text-[#15803d]">Select Payment Method &amp; EMI Options</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 bg-[#d4e6d9] border-2 border-[#b6d7c1] p-3.5 rounded-xl cursor-pointer hover:border-[#15803d] transition-all">
                  <input type="radio" name="payMethod" defaultChecked className="w-4 h-4 text-[#15803d]" />
                  <div>
                    <p className="text-xs font-black text-[#15281c]">📱 BHIM UPI / GPay / PhonePe</p>
                    <p className="text-[11px] text-[#2e4d38] font-medium">Instant 0% fee payment</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 bg-[#d4e6d9] border-2 border-[#b6d7c1] p-3.5 rounded-xl cursor-pointer hover:border-[#15803d] transition-all">
                  <input type="radio" name="payMethod" className="w-4 h-4 text-[#15803d]" />
                  <div>
                    <p className="text-xs font-black text-[#15281c]">💳 Credit / Debit Card</p>
                    <p className="text-[11px] text-[#2e4d38] font-medium">Visa, Mastercard, RuPay</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 bg-[#d4e6d9] border-2 border-[#b6d7c1] p-3.5 rounded-xl cursor-pointer hover:border-[#15803d] transition-all">
                  <input type="radio" name="payMethod" className="text-[#15803d]" />
                  <div>
                    <p className="text-xs font-black text-[#15281c]">🏦 Net Banking</p>
                    <p className="text-[11px] text-[#2e4d38] font-medium">SBI, HDFC, ICICI, Axis</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 bg-[#d4e6d9] border-2 border-[#15803d] p-3.5 rounded-xl cursor-pointer hover:bg-[#c8e6c9] transition-all">
                  <input type="radio" name="payMethod" className="text-[#15803d]" />
                  <div>
                    <p className="text-xs font-black text-[#b45309]">📊 Easy No-Cost EMI</p>
                    <p className="text-[11px] text-[#15281c] font-bold">Pay in 3, 6, or 12 monthly installments</p>
                  </div>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-[#e5573f] via-[#f97316] to-[#e5573f] text-white hover:opacity-95 font-black text-lg rounded-full py-4 shadow-2xl hover:shadow-orange-500/40 hover:scale-[1.02] transition-all uppercase tracking-wide cursor-pointer disabled:opacity-70"
            >
              {submitting ? "Processing Booking…" : <>Confirm &amp; Pay {formatINR(total)}</>}
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
          {/* Price summary — Option M Soft Pastel Sage Green Card */}
          <div className="bg-[#eff5f0] text-[#15281c] rounded-3xl shadow-xl border-4 border-[#b6d7c1] p-7 space-y-5">
            <h2 className="flex items-center gap-2.5 text-xl font-black text-[#15281c] border-b border-[#b6d7c1] pb-4">
              <TicketPercent className="w-6 h-6 text-[#15803d]" /> Price Summary
            </h2>
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between items-center text-[#2e4d38] font-semibold">
                <span>
                  {formatINR(nightly)} &times; {nights} {nights > 1 ? "nights" : "night"}
                </span>
                <span className="font-extrabold text-[#15281c]">{formatINR(roomTotal)}</span>
              </div>
              <div className="flex justify-between items-center text-[#2e4d38] font-semibold">
                <span>Taxes &amp; Service Fees</span>
                <span className="font-extrabold text-[#15281c]">{formatINR(taxes)}</span>
              </div>
              <div className="flex justify-between items-center text-[#2e4d38] font-semibold">
                <span>Other Included Services</span>
                <span className="font-extrabold text-[#15281c]">
                  {formatINR(otherServices)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-[#15803d] font-bold bg-[#d4e6d9] px-3 py-1.5 rounded-xl border border-[#b6d7c1]">
                  <span>Applied Promo Discount</span>
                  <span className="font-black">- {formatINR(discount)}</span>
                </div>
              )}
              <div className="h-px bg-[#b6d7c1] my-2" />
              <div className="flex justify-between items-center pt-1">
                <span className="font-black text-base text-[#15281c]">Total Amount</span>
                <span className="flex items-center text-2xl font-black text-[#15803d]">
                  <IndianRupee className="w-5 h-5" />
                  {total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <Button
              onClick={handleConfirm}
              disabled={submitting}
              className="w-full mt-4 bg-gradient-to-r from-[#e05638] via-[#ea580c] to-[#e05638] text-white hover:opacity-95 font-black text-lg rounded-full h-14 shadow-2xl hover:shadow-orange-500/40 hover:scale-105 transition-all tracking-wide uppercase cursor-pointer disabled:opacity-70"
            >
              {submitting ? "Processing…" : <>Confirm &amp; Reserve Room</>}
            </Button>

            <div className="flex items-center gap-2 text-xs font-bold text-[#15803d] bg-[#d4e6d9] rounded-2xl px-4 py-3 border border-[#b6d7c1]">
              <ShieldCheck className="w-4 h-4 shrink-0 text-[#15803d]" />
              Free Cancellation &middot; Pay at Hotel Option Available
            </div>
          </div>

          {/* Promo code card — Luxury Gold Card */}
          <div className="bg-gradient-to-br from-[#fffbeb] to-[#fef3c7] border-2 border-[#fde68a] rounded-3xl p-6 shadow-xl text-[#0f1a2e]">
            <h3 className="flex items-center gap-2 text-base font-black text-[#78350f] mb-3">
              <Gift className="w-5 h-5 text-[#d97706]" /> Exclusive Promo Codes
            </h3>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Enter promo code"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                className="bg-white border-2 border-[#fde68a] text-[#0f172a] font-bold rounded-xl h-11 px-3 text-sm focus:border-[#d97706]"
              />
              <Button
                type="button"
                onClick={() => applyPromo(promoInput)}
                className="bg-[#78350f] text-white hover:bg-[#92400e] font-black text-xs rounded-xl px-5 h-11 shadow-md"
              >
                Apply
              </Button>
            </div>

            <div className="space-y-2">
              {PROMOS.map((p) => (
                <div
                  key={p.code}
                  onClick={() => applyPromo(p.code)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    appliedPromo === p.code
                      ? "bg-white border-[#d97706] shadow-md ring-2 ring-[#d97706]/30"
                      : "bg-white/90 border-[#fde68a] hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs text-[#d97706] bg-[#fef3c7] px-2 py-0.5 rounded border border-[#fde68a]">
                      {p.code}
                    </span>
                    <span className="text-[11px] font-black text-[#16a34a]">
                      - ₹{p.value} OFF
                    </span>
                  </div>
                  <p className="text-xs text-[#78350f] font-semibold mt-1">
                    {p.desc}
                  </p>
                </div>
              ))}
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
