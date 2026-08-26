"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Footer from "@/components/Footer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Plane,
  BedDouble,
  Tag,
  Percent,
  Search,
  MapPin,
  CalendarDays,
  Users,
  ArrowRightLeft,
  ArrowRight,
  Clock,
  IndianRupee,
  Building2,
  House,
  Umbrella,
  TrainFront,
  Bus,
  CarTaxiFront,
  CreditCard,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { LivePrice } from "@/components/pricing/PriceInsights";
import { PersonalizedRecommendations } from "@/components/recommendations/PersonalizedRecommendations";
import { CategoryServices } from "@/components/CategoryServices";

// Popular Indian cities used for the From / To autocomplete.
const indianCities = [
  "New Delhi",
  "Mumbai",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Goa",
  "Kochi",
  "Lucknow",
  "Chandigarh",
  "Indore",
  "Guwahati",
  "Srinagar",
];

// Sample flights shown in the results dialog (prices in ₹).
const sampleFlights = [
  { airline: "IndiGo", code: "6E-2043", depart: "06:15", arrive: "08:30", duration: "2h 15m", price: 4899 },
  { airline: "Air India", code: "AI-501", depart: "09:40", arrive: "12:05", duration: "2h 25m", price: 5650 },
  { airline: "Vistara", code: "UK-995", depart: "13:20", arrive: "15:30", duration: "2h 10m", price: 6120 },
  { airline: "SpiceJet", code: "SG-8169", depart: "18:05", arrive: "20:35", duration: "2h 30m", price: 4499 },
  { airline: "Akasa Air", code: "QP-1401", depart: "21:10", arrive: "23:20", duration: "2h 10m", price: 5299 },
  { airline: "IndiGo", code: "6E-554", depart: "07:00", arrive: "09:35", duration: "2h 35m", price: 6499 },
  { airline: "Air India", code: "AI-404", depart: "10:15", arrive: "12:00", duration: "1h 45m", price: 3999 },
  { airline: "Vistara", code: "UK-992", depart: "14:00", arrive: "16:45", duration: "2h 45m", price: 5899 },
  { airline: "IndiGo", code: "6E-809", depart: "17:30", arrive: "20:00", duration: "2h 30m", price: 5199 },
  { airline: "Air India", code: "AI-887", depart: "19:15", arrive: "21:35", duration: "2h 20m", price: 4799 },
  { airline: "SpiceJet", code: "SG-412", depart: "08:30", arrive: "10:05", duration: "1h 35m", price: 3499 },
  { airline: "Akasa Air", code: "QP-1108", depart: "11:45", arrive: "13:50", duration: "2h 05m", price: 4599 },
  { airline: "Vistara", code: "UK-771", depart: "15:10", arrive: "17:40", duration: "2h 30m", price: 5999 },
  { airline: "IndiGo", code: "6E-302", depart: "18:40", arrive: "21:30", duration: "2h 50m", price: 5750 },
  { airline: "Air India", code: "AI-610", depart: "22:00", arrive: "23:15", duration: "1h 15m", price: 3899 },
];

// Popular hotels shown in the hotel results dialog (prices per night in ₹).
const sampleHotels = [
  { name: "The Taj Palace", city: "New Delhi", rating: 4.8, reviews: 2340, price: 8999, tag: "Luxury" },
  { name: "Oberoi Grand", city: "Kolkata", rating: 4.7, reviews: 1890, price: 7499, tag: "Heritage" },
  { name: "Marine Bay Resort", city: "Goa", rating: 4.6, reviews: 3120, price: 6299, tag: "Beachfront" },
  { name: "Leela Sky Suites", city: "Mumbai", rating: 4.9, reviews: 2760, price: 10499, tag: "Premium" },
  { name: "Hilltop Retreat", city: "Manali", rating: 4.5, reviews: 1440, price: 4599, tag: "Mountain View" },
  { name: "ITC Rajputana Palace", city: "Jaipur", rating: 4.7, reviews: 1680, price: 6899, tag: "Royal Heritage" },
  { name: "Grand Hyatt Kochi", city: "Kochi", rating: 4.8, reviews: 2100, price: 8199, tag: "Waterfront" },
  { name: "JW Marriott Bengaluru", city: "Bengaluru", rating: 4.8, reviews: 2950, price: 9499, tag: "City Luxury" },
  { name: "Taj Falaknuma Palace", city: "Hyderabad", rating: 4.9, reviews: 3400, price: 18500, tag: "Ultra Luxury" },
  { name: "Radisson Blu Resort", city: "Udaipur", rating: 4.6, reviews: 1560, price: 7299, tag: "Lake View" },
  { name: "Novotel Airport Hotel", city: "New Delhi", rating: 4.5, reviews: 2040, price: 5999, tag: "Transit & Spa" },
  { name: "Alila Diwa Resort", city: "Goa", rating: 4.7, reviews: 2450, price: 8799, tag: "Paddy Fields" },
  { name: "Trident Hotel Nariman Point", city: "Mumbai", rating: 4.7, reviews: 3100, price: 9899, tag: "Sea Facing" },
  { name: "The Westin Pune Koregaon", city: "Pune", rating: 4.6, reviews: 1780, price: 6799, tag: "Executive" },
  { name: "Fortune Park Signature", city: "Ahmedabad", rating: 4.4, reviews: 1120, price: 4199, tag: "Business" },
];

// Format a number as Indian Rupees, e.g. 4899 -> "₹4,899".
const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const navItems = [
  { label: "Flights", icon: Plane },
  { label: "Hotels", icon: Building2 },
  { label: "Homestays", icon: House },
  { label: "Holiday", icon: Umbrella },
  { label: "Trains", icon: TrainFront },
  { label: "Buses", icon: Bus },
  { label: "Cabs", icon: CarTaxiFront },
  { label: "Forex", icon: CreditCard },
  { label: "Insurance", icon: ShieldCheck },
];

const offers = [
  {
    title: "Flat 20% OFF on Domestic Flights",
    description: "Book now and save big on your next getaway within the country.",
    code: "FLYHIGH20",
    tag: "Flights",
  },
  {
    title: "Hotels from $49 / night",
    description: "Handpicked stays at unbeatable prices across top destinations.",
    code: "STAY49",
    tag: "Hotels",
  },
  {
    title: "International Escapes — Up to 30% OFF",
    description: "Explore the world for less with limited-time international fares.",
    code: "WORLD30",
    tag: "Flights",
  },
  {
    title: "Weekend Getaway Bundle",
    description: "Flight + Hotel combos that save you more when booked together.",
    code: "WEEKEND",
    tag: "Deals",
  },
];

// Big image cards for the "Best Offers" section.
const bestOffers = [
  {
    title: "Domestic Flights",
    description: "Get up to 20% off on domestic flights",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "International Hotels",
    description: "Book luxury hotels worldwide",
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Holiday Packages",
    description: "Exclusive deals on holiday packages",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  },
];

// "Handpicked Collections for You" — image cards with a TOP badge.
const collections = [
  {
    title: "Stays in & Around Delhi",
    badge: "TOP 8",
    image:
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Stays in & Around Mumbai",
    badge: "TOP 8",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Stays in & Around Bangalore",
    badge: "TOP 9",
    image:
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Beach Destinations",
    badge: "TOP 11",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  },
];

// "Unlock Lesser-Known Wonders of India" — hidden gem destinations.
const wonders = [
  {
    title: "Shimla's Best Kept Secret",
    image:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Tamil Nadu's Charming Hill Town",
    image:
      "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Quaint Little Hill Station in Gujarat",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "A Pleasant Summer Retreat",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
  },
];

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("flights");
  const [activeCategory, setActiveCategory] = useState("Flights");

  // Flight search form fields.
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [travellers, setTravellers] = useState("1");

  // Hotel search form fields.
  const [hotelLocation, setHotelLocation] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState("2");

  // Controls the search-results dialog.
  const [showResults, setShowResults] = useState(false);
  const [showHotelResults, setShowHotelResults] = useState(false);

  const handleCategory = (category: string) => {
    setActiveCategory(category);
    if (category === "Flights") setActiveTab("flights");
    else if (category === "Hotels") setActiveTab("hotels");
    else setActiveTab(category.toLowerCase());
  };

  // Validate the flight form, then open the results dialog.
  const handleSearchFlights = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromCity || !toCity || !departDate) {
      alert("Please select From, To and Departure date.");
      return;
    }
    if (fromCity === toCity) {
      alert("Departure and destination cities can't be the same.");
      return;
    }
    setShowResults(true);
  };

  const handleSearchHotels = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelLocation || !checkInDate || !checkOutDate) {
      alert("Please select Location, Check-in and Check-out dates.");
      return;
    }
    if (checkInDate >= checkOutDate) {
      alert("Check-out date must be after check-in date.");
      return;
    }
    setShowHotelResults(true);
  };

  const handleBookNow = (flight: (typeof sampleFlights)[number]) => {
    const params = new URLSearchParams({
      airline: flight.airline,
      code: flight.code,
      depart: flight.depart,
      arrive: flight.arrive,
      duration: flight.duration,
      price: String(flight.price),
      from: fromCity || "New Delhi",
      to: toCity || "Mumbai",
      date: departDate,
      travellers,
    });
    setShowResults(false);
    router.push(`/booking/flight?${params.toString()}`);
  };

  const handleBookHotel = (hotel: (typeof sampleHotels)[number]) => {
    const params = new URLSearchParams({
      name: hotel.name,
      city: hotel.city,
      rating: String(hotel.rating),
      reviews: String(hotel.reviews),
      price: String(hotel.price),
      tag: hotel.tag,
      checkin: checkInDate,
      checkout: checkOutDate,
      guests,
    });
    setShowHotelResults(false);
    router.push(`/booking/hotel?${params.toString()}`);
  };

  return (
    <div className="min-h-screen w-full text-white relative overflow-x-hidden">
      {/* True Fixed Background Layer — Original Crisp Image, Zero Blur, Zero Scrolling Movement */}
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat pointer-events-none z-0"
        style={{
          backgroundImage: `url('/world_travel_bg.jpg')`,
        }}
      />

      <div className="relative z-10 min-h-screen w-full bg-black/15">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-10">

          {/* HERO HEADING */}
          <div className="pt-6 text-center space-y-4">
            {/* Badge pill */}
            <div className="inline-flex items-center gap-2 bg-[#0f1a2e]/90 border border-[#3b82f6]/40 backdrop-blur-md px-5 py-2 rounded-full shadow-xl">
              <Plane className="w-4 h-4 text-[#60a5fa] animate-bounce" />
              <span className="text-sm font-extrabold text-white tracking-wide uppercase">
                India&apos;s Premium Super Travel Engine
              </span>
            </div>

            {/* Main heading with gradient */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-white via-[#e0f2fe] to-white bg-clip-text text-transparent drop-shadow-2xl">
                Plan Your Perfect Vacation
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-white text-lg md:text-xl font-bold drop-shadow-xl max-w-2xl mx-auto leading-relaxed">
              Search flights, book luxury hotels, and grab the{" "}
              <span className="text-[#60a5fa] underline decoration-wavy">best deals</span> — all in one place.
            </p>
          </div>

          {/* SECONDARY NAV — HIGH CONTRAST LUXURY NAVY BAR */}
          <nav className="flex justify-center">
            <ul className="flex flex-wrap items-center justify-center gap-2 bg-[#0f1a2e]/95 backdrop-blur-2xl rounded-3xl p-3 border-2 border-[#3b82f6]/50 shadow-2xl">
              {navItems.map(({ label, icon: Icon }) => {
                const isActive = activeCategory === label;
                return (
                  <li key={label}>
                    <button
                      type="button"
                      onClick={() => handleCategory(label)}
                      className={`group flex flex-col items-center justify-center gap-1.5 rounded-2xl w-[96px] px-2 py-3 text-xs font-extrabold transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white shadow-xl scale-105 ring-2 ring-white/80"
                          : "text-white/80 hover:bg-white/10 hover:text-white hover:scale-105"
                      }`}
                    >
                      <span
                        className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                          isActive
                            ? "bg-white text-[#1d4ed8] shadow-md"
                            : "bg-[#1e293b] text-[#60a5fa] group-hover:bg-[#2563eb] group-hover:text-white"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </span>
                      {label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* SEARCH CARD WITH FLIGHTS / HOTELS TOGGLE — EYE CATCHING & HIGH CONTRAST */}
          <div className="bg-white/95 backdrop-blur-2xl border-4 border-[#3b82f6]/40 rounded-3xl shadow-2xl p-6 md:p-9 text-[#0f1a2e]">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 bg-[#f1f5f9] rounded-2xl p-1.5 border border-[#cbd5e1]">
                <TabsTrigger
                  value="flights"
                  className="rounded-xl font-extrabold text-base flex items-center justify-center gap-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0f1a2e] data-[state=active]:to-[#1e3a8a] data-[state=active]:text-white data-[state=active]:shadow-lg text-[#475569] py-3 transition-all"
                >
                  <Plane className="w-5 h-5 text-[#3b82f6]" />
                  Flights
                </TabsTrigger>
                <TabsTrigger
                  value="hotels"
                  className="rounded-xl font-extrabold text-base flex items-center justify-center gap-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0f1a2e] data-[state=active]:to-[#1e3a8a] data-[state=active]:text-white data-[state=active]:shadow-lg text-[#475569] py-3 transition-all"
                >
                  <BedDouble className="w-5 h-5 text-[#3b82f6]" />
                  Hotels
                </TabsTrigger>
              </TabsList>

              {/* FLIGHTS SEARCH */}
              <TabsContent value="flights" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  <div className="space-y-2">
                    <Label className="text-[#0f1a2e] text-xs font-black flex items-center gap-1.5 tracking-wider uppercase">
                      <MapPin className="w-4 h-4 text-[#2563eb]" /> Departure City
                    </Label>
                    <select
                      value={fromCity}
                      onChange={(e) => setFromCity(e.target.value)}
                      className="w-full bg-[#f8fafc] border-2 border-[#cbd5e1] text-[#0f172a] rounded-xl h-13 px-4 font-bold shadow-sm hover:border-[#2563eb] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all cursor-pointer"
                    >
                      <option value="" disabled>Select Departure City</option>
                      {indianCities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#0f1a2e] text-xs font-black flex items-center gap-1.5 tracking-wider uppercase">
                      <ArrowRightLeft className="w-4 h-4 text-[#2563eb]" /> Destination City
                    </Label>
                    <select
                      value={toCity}
                      onChange={(e) => setToCity(e.target.value)}
                      className="w-full bg-[#f8fafc] border-2 border-[#cbd5e1] text-[#0f172a] rounded-xl h-13 px-4 font-bold shadow-sm hover:border-[#2563eb] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all cursor-pointer"
                    >
                      <option value="" disabled>Select Destination City</option>
                      {indianCities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#0f1a2e] text-xs font-black flex items-center gap-1.5 tracking-wider uppercase">
                      <CalendarDays className="w-4 h-4 text-[#2563eb]" /> Departure Date
                    </Label>
                    <Input
                      type="date"
                      value={departDate}
                      onChange={(e) => setDepartDate(e.target.value)}
                      className="bg-[#f8fafc] border-2 border-[#cbd5e1] text-[#0f172a] rounded-xl h-13 px-4 font-bold shadow-sm hover:border-[#2563eb] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#0f1a2e] text-xs font-black flex items-center gap-1.5 tracking-wider uppercase">
                      <Users className="w-4 h-4 text-[#2563eb]" /> Travellers
                    </Label>
                    <select
                      value={travellers}
                      onChange={(e) => setTravellers(e.target.value)}
                      className="w-full bg-[#f8fafc] border-2 border-[#cbd5e1] text-[#0f172a] rounded-xl h-13 px-4 font-bold shadow-sm hover:border-[#2563eb] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all cursor-pointer"
                    >
                      <option value="1">1 Adult (12+ yrs)</option>
                      <option value="2">2 Adults (12+ yrs)</option>
                      <option value="3">3 Adults (12+ yrs)</option>
                      <option value="4">2 Adults + 1 Child (2-12 yrs)</option>
                      <option value="5">2 Adults + 2 Children (2-12 yrs)</option>
                      <option value="6">2 Adults + 1 Infant (Under 2 yrs)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-center mt-8">
                  <Button
                    type="button"
                    onClick={handleSearchFlights}
                    className="bg-gradient-to-r from-[#e5573f] via-[#f97316] to-[#e5573f] text-white hover:opacity-95 font-black text-lg rounded-full px-14 h-14 shadow-2xl hover:shadow-orange-500/40 hover:scale-105 flex items-center gap-3 transition-all tracking-wide uppercase cursor-pointer"
                  >
                    <Search className="w-6 h-6 stroke-[3]" />
                    Search Flights
                  </Button>
                </div>
              </TabsContent>

              {/* HOTELS SEARCH */}
              <TabsContent value="hotels" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  <div className="space-y-2">
                    <Label className="text-[#0f1a2e] text-xs font-black flex items-center gap-1.5 tracking-wider uppercase">
                      <MapPin className="w-4 h-4 text-[#2563eb]" /> Hotel Location
                    </Label>
                    <select
                      value={hotelLocation}
                      onChange={(e) => setHotelLocation(e.target.value)}
                      className="w-full bg-[#f8fafc] border-2 border-[#cbd5e1] text-[#0f172a] rounded-xl h-13 px-4 font-bold shadow-sm hover:border-[#2563eb] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all cursor-pointer"
                    >
                      <option value="" disabled>Select Location or Hotel</option>
                      {indianCities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                      {sampleHotels.map((h) => (
                        <option key={h.name} value={h.name}>{h.name} ({h.city})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#0f1a2e] text-xs font-black flex items-center gap-1.5 tracking-wider uppercase">
                      <CalendarDays className="w-4 h-4 text-[#2563eb]" /> Check-in Date
                    </Label>
                    <Input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="bg-[#f8fafc] border-2 border-[#cbd5e1] text-[#0f172a] rounded-xl h-13 px-4 font-bold shadow-sm hover:border-[#2563eb] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#0f1a2e] text-xs font-black flex items-center gap-1.5 tracking-wider uppercase">
                      <CalendarDays className="w-4 h-4 text-[#2563eb]" /> Check-out Date
                    </Label>
                    <Input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="bg-[#f8fafc] border-2 border-[#cbd5e1] text-[#0f172a] rounded-xl h-13 px-4 font-bold shadow-sm hover:border-[#2563eb] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#0f1a2e] text-xs font-black flex items-center gap-1.5 tracking-wider uppercase">
                      <Users className="w-4 h-4 text-[#2563eb]" /> Guests &amp; Rooms
                    </Label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="w-full bg-[#f8fafc] border-2 border-[#cbd5e1] text-[#0f172a] rounded-xl h-13 px-4 font-bold shadow-sm hover:border-[#2563eb] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all cursor-pointer"
                    >
                      <option value="1">1 Guest (1 Room)</option>
                      <option value="2">2 Guests (1 Room)</option>
                      <option value="3">3 Guests (1 Room + Extra Bed)</option>
                      <option value="4">4 Guests (2 Adults + 2 Children)</option>
                      <option value="5">5 Guests (Family Suite)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-center mt-8">
                  <Button
                    type="button"
                    onClick={handleSearchHotels}
                    className="bg-gradient-to-r from-[#e5573f] via-[#f97316] to-[#e5573f] text-white hover:opacity-95 font-black text-lg rounded-full px-14 h-14 shadow-2xl hover:shadow-orange-500/40 hover:scale-105 flex items-center gap-3 transition-all tracking-wide uppercase cursor-pointer"
                  >
                    <Search className="w-6 h-6 stroke-[3]" />
                    Search Hotels
                  </Button>
                </div>
              </TabsContent>

              {/* OTHER CATEGORIES */}
              {["homestays", "holiday", "trains", "buses", "cabs", "forex", "insurance"].map((catKey) => (
                <TabsContent key={catKey} value={catKey} className="mt-6">
                  <div className="bg-[#f8fafc] rounded-2xl p-6 border-2 border-[#cbd5e1] shadow-md text-[#0f1a2e]">
                    <div className="flex items-center gap-2 mb-4 border-b border-[#cbd5e1] pb-3">
                      <Sparkles className="w-5 h-5 text-[#2563eb]" />
                      <h3 className="text-xl font-extrabold text-[#0f1a2e]">
                        {activeCategory} Search &amp; Booking
                      </h3>
                    </div>
                    <CategoryServices category={activeCategory} />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* AI PERSONALIZED RECOMMENDATIONS */}
          <PersonalizedRecommendations />

          {/* OFFERS & DEALS */}
          <section className="space-y-5">
            <div className="flex items-center gap-2">
              <Tag className="w-6 h-6 text-white drop-shadow" />
              <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
                Offers &amp; Deals
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
              {offers.map((offer) => (
                <div
                  key={offer.code}
                  className="bg-white/95 border-2 border-white rounded-2xl shadow-lg backdrop-blur-md p-4 md:p-5 flex flex-col justify-between hover:shadow-xl hover:-translate-y-0.5 transition-all text-[#0f1a2e]"
                >
                  <div>
                    <span className="inline-block bg-[#0f1a2e] text-white text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full">
                      {offer.tag}
                    </span>
                    <h3 className="text-[#0f1a2e] font-extrabold text-sm md:text-lg mt-2 leading-snug">
                      {offer.title}
                    </h3>
                    <p className="text-[#334155] text-xs mt-1.5 line-clamp-2">
                      {offer.description}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[#16a34a] font-mono font-bold text-xs border border-dashed border-[#16a34a] rounded-md px-1.5 py-0.5">
                      {offer.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (offer.tag === "Hotels") {
                          setShowHotelResults(true);
                        } else {
                          setShowResults(true);
                        }
                      }}
                      className="text-[#2563eb] font-extrabold text-xs hover:underline flex items-center gap-0.5"
                    >
                      Grab Deal &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* BEST OFFERS — IMAGE CARDS (2 COLUMNS ON MOBILE) */}
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
              Best Offers
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
              {bestOffers.map((offer) => (
                <div
                  key={offer.title}
                  onClick={() => {
                    if (offer.title.includes("Flights")) {
                      setShowResults(true);
                    } else if (offer.title.includes("Hotels")) {
                      setHotelLocation("Goa");
                      setShowHotelResults(true);
                    } else {
                      handleCategory("Holiday");
                    }
                  }}
                  className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all group cursor-pointer"
                >
                  {/* Background image */}
                  <div
                    style={{ backgroundImage: `url(${offer.image})` }}
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                  {/* Content */}
                  <div className="relative p-4 md:p-6 flex flex-col justify-end min-h-[220px] md:min-h-[280px]">
                    <h3 className="text-white font-extrabold text-sm md:text-2xl mb-1 drop-shadow-md leading-tight">
                      {offer.title}
                    </h3>
                    <p className="text-white/90 text-xs mb-3 drop-shadow line-clamp-2">
                      {offer.description}
                    </p>
                    <Button
                      type="button"
                      className="bg-white/95 text-[#0f1a2e] hover:bg-white font-extrabold text-[10px] md:text-xs rounded-full px-4 h-8 md:h-10 shadow-md w-fit"
                    >
                      Book Now &rarr;
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* HANDPICKED COLLECTIONS — 2 COLUMNS ON MOBILE (LIKE MAKEMYTRIP APP) */}
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
              Handpicked Collections for You
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
              {collections.map((col) => (
                <div
                  key={col.title}
                  onClick={() => {
                    if (col.title.includes("Delhi")) setHotelLocation("New Delhi");
                    else if (col.title.includes("Mumbai")) setHotelLocation("Mumbai");
                    else if (col.title.includes("Bangalore")) setHotelLocation("Bengaluru");
                    else setHotelLocation("Goa");
                    setShowHotelResults(true);
                  }}
                  className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all group cursor-pointer"
                >
                  {/* Background image */}
                  <div
                    style={{ backgroundImage: `url(${col.image})` }}
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                  {/* TOP badge */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-black text-[#0f1a2e] shadow-sm">
                    {col.badge}
                  </div>

                  {/* Title & Action Button */}
                  <div className="relative p-4 md:p-6 flex flex-col justify-end min-h-[220px] md:min-h-[260px] gap-2 md:gap-3">
                    <h3 className="text-white font-extrabold text-sm md:text-xl drop-shadow-md flex items-center justify-between">
                      <span className="line-clamp-2">{col.title}</span>
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-white transform group-hover:translate-x-1 transition-transform shrink-0 ml-1" />
                    </h3>
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (col.title.includes("Delhi")) setHotelLocation("New Delhi");
                        else if (col.title.includes("Mumbai")) setHotelLocation("Mumbai");
                        else if (col.title.includes("Bangalore")) setHotelLocation("Bengaluru");
                        else setHotelLocation("Goa");
                        setShowHotelResults(true);
                      }}
                      className="bg-white/95 text-[#0f1a2e] hover:bg-white font-extrabold text-[10px] md:text-xs rounded-full px-3 md:px-4 h-8 md:h-9 shadow-md w-fit backdrop-blur-sm"
                    >
                      Explore Stays &rarr;
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FLAGSHIP STORES (AIRLINES & HOTELS) — 2 COLUMNS ON MOBILE (LIKE MAKEMYTRIP APP) */}
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
              Flagship Airline &amp; Hotel Stores
            </h2>

            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#60a5fa] drop-shadow">Flagship Airline Stores</p>
              <div className="grid grid-cols-2 gap-3 md:gap-5">
                <div
                  onClick={() => setShowResults(true)}
                  className="relative overflow-hidden rounded-2xl h-36 bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] p-4 flex flex-col justify-between shadow-xl hover:scale-[1.02] transition-all cursor-pointer group"
                >
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full w-fit backdrop-blur-sm">OFFICIAL STORE</span>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-black text-lg md:text-2xl">Air India</h3>
                      <p className="text-white/80 text-xs font-semibold">Fly nonstop worldwide</p>
                    </div>
                    <Plane className="w-8 h-8 text-white/80 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                <div
                  onClick={() => setShowResults(true)}
                  className="relative overflow-hidden rounded-2xl h-36 bg-gradient-to-r from-[#78350f] to-[#d97706] p-4 flex flex-col justify-between shadow-xl hover:scale-[1.02] transition-all cursor-pointer group"
                >
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full w-fit backdrop-blur-sm">PREMIUM PARTNER</span>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-black text-lg md:text-2xl">Etihad Airways</h3>
                      <p className="text-white/80 text-xs font-semibold">Luxury 5-star flying</p>
                    </div>
                    <Plane className="w-8 h-8 text-white/80 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              <p className="text-xs font-bold uppercase tracking-wider text-[#60a5fa] drop-shadow pt-2">Flagship Hotel Stores</p>
              <div className="grid grid-cols-2 gap-3 md:gap-5">
                {[
                  { name: "ITC Hotels Limited", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=80" },
                  { name: "Sterling Hotels & Resorts", img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=500&q=80" },
                  { name: "Hyatt Hotels", img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=500&q=80" },
                  { name: "Cinnamon Hotels", img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=500&q=80" },
                ].map((store) => (
                  <div
                    key={store.name}
                    onClick={() => {
                      setHotelLocation("Goa");
                      setShowHotelResults(true);
                    }}
                    className="relative overflow-hidden rounded-2xl h-36 p-4 flex flex-col justify-end shadow-xl hover:scale-[1.02] transition-all cursor-pointer group"
                  >
                    <div style={{ backgroundImage: `url(${store.img})` }} className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="relative">
                      <span className="bg-white/90 text-[#0f172a] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider mb-1 inline-block">Official Flagship</span>
                      <h4 className="text-white font-extrabold text-sm md:text-base leading-snug">{store.name}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* UNLOCK LESSER-KNOWN WONDERS OF INDIA — 2 COLUMNS ON MOBILE (LIKE MAKEMYTRIP APP) */}
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
              Unlock Lesser-Known Wonders of India
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
              {wonders.map((w) => (
                <div
                  key={w.title}
                  onClick={() => {
                    const loc = w.title.includes("Ziro") ? "Guwahati" : w.title.includes("Gokarna") ? "Goa" : w.title.includes("Khajjiar") ? "Manali" : "Kochi";
                    setHotelLocation(loc);
                    setShowHotelResults(true);
                  }}
                  className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all group cursor-pointer"
                >
                  {/* Background image */}
                  <div
                    style={{ backgroundImage: `url(${w.image})` }}
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                  {/* Title */}
                  <div className="relative p-4 md:p-6 flex flex-col justify-end min-h-[220px] md:min-h-[280px]">
                    <h3 className="text-white font-bold text-sm md:text-xl drop-shadow-md leading-snug flex items-center justify-between">
                      <span className="line-clamp-2">{w.title}</span>
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-white transform group-hover:translate-x-1 transition-transform shrink-0 ml-1" />
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* DOWNLOAD APP BANNER */}
          <section>
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Left: text + store buttons */}
              <div className="text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-[#0f1a2e]">
                  Download App Now!
                </h2>
                <p className="text-[#3d5170] mt-2 mb-5">
                  Get India&apos;s #1 travel super app with best deals on flights
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  {/* App Store button */}
                  <button
                    type="button"
                    className="flex items-center gap-2 bg-[#0f1a2e] text-white rounded-xl px-5 py-2.5 hover:bg-[#1a2947] transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                      <path d="M16.365 1.43c0 1.14-.42 2.2-1.13 2.99-.85.96-2.23 1.7-3.36 1.6-.14-1.1.42-2.28 1.08-3 .74-.83 2.06-1.46 3.19-1.53.02.31.02.62.02.94M20.9 17.06c-.55 1.28-.82 1.85-1.53 2.98-.99 1.57-2.39 3.53-4.12 3.55-1.54.01-1.93-1-4.02-.99-2.09.01-2.52.99-4.06.98-1.73-.02-3.05-1.79-4.04-3.36-2.77-4.4-3.06-9.56-1.35-12.3 1.21-1.95 3.12-3.09 4.92-3.09 1.83 0 2.98 1.01 4.49 1.01 1.47 0 2.36-1.01 4.48-1.01 1.6 0 3.3.87 4.51 2.38-3.96 2.17-3.32 7.83.29 9.85z" />
                    </svg>
                    <div className="text-left leading-tight">
                      <div className="text-[10px]">Download on the</div>
                      <div className="text-sm font-semibold">App Store</div>
                    </div>
                  </button>

                  {/* Google Play button */}
                  <button
                    type="button"
                    className="flex items-center gap-2 bg-[#0f1a2e] text-white rounded-xl px-5 py-2.5 hover:bg-[#1a2947] transition-colors"
                  >
                    <svg viewBox="0 0 512 512" className="w-6 h-6">
                      <path fill="#00d2ff" d="M48 59.49v393a4.33 4.33 0 007.37 3.07L260 256 55.37 56.42A4.33 4.33 0 0048 59.49z" />
                      <path fill="#00e676" d="M345.8 174L89.22 32.64l-.16-.09c-4.42-2.4-8.62 3.58-5 7.05L260 256z" />
                      <path fill="#ff3d00" d="M108.37 442.13l.17-.1L345.8 338 260 256z" />
                      <path fill="#ffc400" d="M416.34 224.53L345.8 174l-92.16 82L345.8 338l70.54-50.53a32 32 0 000-62.94z" />
                    </svg>
                    <div className="text-left leading-tight">
                      <div className="text-[10px]">GET IT ON</div>
                      <div className="text-sm font-semibold">Google Play</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Right: QR code */}
              <div className="flex items-center gap-4">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://makemytour.com/app"
                  alt="Scan to download the app"
                  className="w-28 h-28 rounded-lg"
                />
                <p className="text-[#3d5170] text-sm max-w-[120px]">
                  Scan QR code to download the app
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>



      {/* FLIGHT SEARCH RESULTS DIALOG */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="sm:max-w-[680px] p-0 overflow-hidden rounded-3xl border-0 shadow-2xl bg-[#f8fafc]">
          {/* Luxury Gradient header showing the route */}
          <DialogHeader className="bg-gradient-to-r from-[#0f1a2e] via-[#1a3a6b] to-[#2c5a9e] px-7 py-6 text-left text-white relative">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-extrabold text-white flex items-center gap-3">
                  <Plane className="w-7 h-7 text-[#60a5fa] animate-pulse" />
                  <span>{fromCity || "New Delhi"}</span>
                  <ArrowRight className="w-5 h-5 text-white/80" />
                  <span>{toCity || "Goa"}</span>
                </DialogTitle>
                <DialogDescription className="text-white/80 text-xs mt-1.5 flex items-center gap-2">
                  <span>{departDate ? `Departure: ${departDate}` : "Daily Direct Flights"}</span>
                  <span>•</span>
                  <span>{travellers} {Number(travellers) > 1 ? "Travellers" : "Traveller"}</span>
                </DialogDescription>
              </div>
              <span className="bg-[#22c55e] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Lowest Fare Guaranteed
              </span>
            </div>
          </DialogHeader>

          {/* Scrollable list of flight results */}
          <div className="px-6 py-5 max-h-[65vh] overflow-y-auto space-y-4">
            {sampleFlights.map((flight, idx) => (
              <div
                key={flight.code}
                className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm hover:shadow-xl hover:border-[#3b82f6] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                {/* Airline logo badge + details */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] border border-[#bfdbfe] flex items-center justify-center font-black text-sm text-[#1e40af] shrink-0 shadow-xs">
                    {flight.airline.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-[#0f172a] group-hover:text-[#2563eb] transition-colors">
                        {flight.airline}
                      </span>
                      <span className="text-[11px] font-bold text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded-md">
                        {flight.code}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs font-semibold text-[#475569]">
                      <span className="bg-[#dcfce7] text-[#15803d] text-[10px] px-2 py-0.5 rounded-md font-extrabold">Non-Stop</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#64748b]" /> {flight.duration}</span>
                      <span>• Cabin Bag Included</span>
                    </div>
                  </div>
                </div>

                {/* Timing route */}
                <div className="text-left md:text-center bg-[#f8fafc] px-4 py-2 rounded-xl border border-[#f1f5f9]">
                  <p className="font-extrabold text-base text-[#0f172a]">{flight.depart} → {flight.arrive}</p>
                  <p className="text-[10px] font-bold text-[#2563eb] uppercase tracking-wider mt-0.5">Direct Flight</p>
                </div>

                {/* Price in ₹ + book button */}
                <div className="flex items-center md:flex-col items-end justify-between md:justify-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-[#f1f5f9]">
                  <LivePrice
                    input={{
                      kind: "FLIGHT",
                      itemId: flight.code,
                      label: `${flight.airline} ${flight.code}`,
                      basePrice: flight.price,
                      date: departDate || undefined,
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => handleBookNow(flight)}
                    className="h-10 px-6 text-xs bg-gradient-to-r from-[#1a3a6b] to-[#2c5a9e] text-white hover:from-[#0f2847] hover:to-[#1a3a6b] rounded-full font-extrabold shadow-md hover:shadow-lg transition-all"
                  >
                    Select &amp; Reserve Seat &rarr;
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* HOTEL SEARCH RESULTS DIALOG */}
      <Dialog open={showHotelResults} onOpenChange={setShowHotelResults}>
        <DialogContent className="sm:max-w-[720px] p-0 overflow-hidden rounded-3xl border-0 shadow-2xl bg-[#f8fafc]">
          {/* Luxury Header */}
          <DialogHeader className="bg-gradient-to-r from-[#0f1a2e] via-[#1a3a6b] to-[#2c5a9e] px-7 py-6 text-left text-white relative">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-extrabold text-white flex items-center gap-3">
                  <BedDouble className="w-7 h-7 text-[#60a5fa]" />
                  <span>Hotels in {hotelLocation || "Your Selected Destination"}</span>
                </DialogTitle>
                <DialogDescription className="text-white/80 text-xs mt-1.5">
                  {checkInDate && checkOutDate ? `${checkInDate} to ${checkOutDate}` : "Luxury & Handpicked Hotels"}
                  {" • "}
                  {guests} {Number(guests) > 1 ? "Guests" : "Guest"}
                </DialogDescription>
              </div>
              <span className="bg-[#f59e0b] text-[#0f172a] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Up to 25% OFF
              </span>
            </div>
          </DialogHeader>

          {/* Scrollable list of hotel results */}
          <div className="px-6 py-5 max-h-[65vh] overflow-y-auto space-y-4">
            {sampleHotels.map((hotel, idx) => {
              const hotelImages = [
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
                "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
                "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80",
                "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80",
                "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80",
                "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=600&q=80",
              ];
              const hotelImg = hotelImages[idx % hotelImages.length];

              return (
                <div
                  key={hotel.name}
                  className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#3b82f6] transition-all flex flex-col sm:flex-row gap-4 p-4 group"
                >
                  {/* Property Cover Photo */}
                  <div className="relative w-full sm:w-44 h-36 rounded-xl overflow-hidden shrink-0 bg-[#e2e8f0]">
                    <img
                      src={hotelImg}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2 left-2 bg-[#0f172a]/90 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full backdrop-blur-sm">
                      {hotel.tag}
                    </span>
                  </div>

                  {/* Property Info */}
                  <div className="flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-base text-[#0f172a] group-hover:text-[#2563eb] transition-colors leading-snug">
                          {hotel.name}
                        </h4>
                        <span className="bg-[#fef3c7] text-[#b45309] text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                          ★ {hotel.rating}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748b] flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#94a3b8]" /> {hotel.city} • Prime Location
                      </p>
                    </div>

                    {/* Amenities chips */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="bg-[#eff6ff] text-[#1e40af] text-[10px] font-bold px-2 py-0.5 rounded-md">Free Breakfast</span>
                      <span className="bg-[#f0fdf4] text-[#166534] text-[10px] font-bold px-2 py-0.5 rounded-md">Free WiFi</span>
                      <span className="bg-[#fef2f2] text-[#991b1b] text-[10px] font-bold px-2 py-0.5 rounded-md">Swimming Pool</span>
                    </div>

                    {/* Price & Book */}
                    <div className="flex items-center justify-between border-t border-[#f1f5f9] pt-2 mt-1">
                      <div>
                        <span className="text-[10px] font-bold text-[#64748b] uppercase block">Special Nightly Rate</span>
                        <LivePrice
                          input={{
                            kind: "HOTEL",
                            itemId: hotel.name.replace(/\s+/g, "-").toLowerCase(),
                            label: hotel.name,
                            basePrice: hotel.price,
                            date: checkInDate || undefined,
                          }}
                          suffix="per night"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => handleBookHotel(hotel)}
                        className="h-10 px-5 text-xs bg-gradient-to-r from-[#1a3a6b] to-[#2c5a9e] text-white hover:from-[#0f2847] hover:to-[#1a3a6b] rounded-full font-extrabold shadow-md hover:shadow-lg transition-all"
                      >
                        Book &amp; Reserve Room &rarr;
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
