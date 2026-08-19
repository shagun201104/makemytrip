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
      "https://images.unsplash.com/photo-1580889240912-c39ff2f9a9b3?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Quaint Little Hill Station in Gujarat",
    image:
      "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=800&q=80",
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

  const handleCategory = (label: string) => {
    setActiveCategory(label);
    const keyMap: Record<string, string> = {
      Flights: "flights",
      Hotels: "hotels",
      Homestays: "homestays",
      Holiday: "holiday",
      Trains: "trains",
      Buses: "buses",
      Cabs: "cabs",
      Forex: "forex",
      Insurance: "insurance",
    };
    setActiveTab(keyMap[label] || "flights");
  };

  // Validate the flight form, then open the results dialog.
  const handleSearchFlights = () => {
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

  const handleSearchHotels = () => {
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
    <div
      style={{ backgroundImage: 'url("/img.avif")' }}
      className="min-h-screen w-full bg-contain bg-top bg-no-repeat"
    >
      {/* Soft overlay so content stays readable over the image */}
      <div className="min-h-screen w-full bg-gradient-to-b from-black/30 via-black/10 to-[#96bfe3]/80">
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

          {/* HERO HEADING */}
          <div className="pt-6 text-center space-y-4">
            {/* Badge pill */}
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-5 py-2 rounded-full shadow-lg">
              <Plane className="w-4 h-4 text-[#5b9bd5]" />
              <span className="text-sm font-semibold text-[#2c3e57] tracking-wide">
                Your Travel Companion
              </span>
            </div>

            {/* Main heading with gradient */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-white via-[#e8f4fc] to-white bg-clip-text text-transparent drop-shadow-2xl">
                Plan Your Perfect Trip
              </span>
            </h1>

            {/* Subtitle with better spacing and accent */}
            <p className="text-white text-lg md:text-xl font-medium drop-shadow-lg max-w-2xl mx-auto leading-relaxed">
              Search flights, book hotels, and grab the{" "}
              <span className="text-[#a3cef0] font-bold">best deals</span> — all in one place.
            </p>
          </div>

          {/* SECONDARY NAV */}
          <nav className="flex justify-center">
            <ul className="flex flex-wrap items-center justify-center gap-1.5 bg-gradient-to-r from-white/60 via-white/50 to-white/60 backdrop-blur-xl rounded-3xl p-2.5 border-2 border-white/70 shadow-2xl">
              {navItems.map(({ label, icon: Icon }) => {
                const isActive = activeCategory === label;
                return (
                  <li key={label}>
                    <button
                      type="button"
                      onClick={() => handleCategory(label)}
                      className={`group flex flex-col items-center justify-center gap-2 rounded-2xl w-[92px] px-2 py-3.5 text-xs font-bold transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-br from-white to-[#eef6fc] text-[#1a3a6b] shadow-lg scale-105 ring-2 ring-[#5b9bd5]/40"
                          : "text-[#2c3e57] hover:bg-white/80 hover:text-[#1a3a6b] hover:scale-105 hover:shadow-md"
                      }`}
                    >
                      <span
                        className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300 ${
                          isActive
                            ? "bg-gradient-to-br from-[#5b9bd5] to-[#4a86c9] text-white shadow-md"
                            : "bg-[#eef6fc] text-[#5b9bd5] group-hover:bg-[#d5e8f7]"
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

          {/* SEARCH CARD WITH FLIGHTS / HOTELS TOGGLE */}
          <div className="bg-gradient-to-br from-white/70 via-white/60 to-white/50 border-2 border-white/80 rounded-3xl shadow-2xl backdrop-blur-lg p-8 md:p-10">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 bg-gradient-to-r from-[#e8f4fc] to-[#d5e8f7] rounded-2xl p-2 shadow-inner">
                <TabsTrigger
                  value="flights"
                  className="rounded-xl font-bold text-base flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#1a3a6b] data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] text-[#5b9bd5] py-3 transition-all"
                >
                  <Plane className="w-5 h-5" />
                  Flights
                </TabsTrigger>
                <TabsTrigger
                  value="hotels"
                  className="rounded-xl font-bold text-base flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#1a3a6b] data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] text-[#5b9bd5] py-3 transition-all"
                >
                  <BedDouble className="w-5 h-5" />
                  Hotels
                </TabsTrigger>
              </TabsList>

              {/* FLIGHTS SEARCH */}
              <TabsContent value="flights" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  <div className="space-y-2">
                    <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 tracking-wide uppercase">
                      <MapPin className="w-4 h-4 text-[#5b9bd5]" /> From
                    </Label>
                    <Input
                      list="city-options"
                      value={fromCity}
                      onChange={(e) => setFromCity(e.target.value)}
                      placeholder="Departure city"
                      className="bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] placeholder:text-[#9aa8bd] rounded-xl h-12 px-4 font-medium shadow-sm hover:border-[#5b9bd5] focus:border-[#5b9bd5] focus:ring-2 focus:ring-[#5b9bd5]/20 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 tracking-wide uppercase">
                      <ArrowRightLeft className="w-4 h-4 text-[#5b9bd5]" /> To
                    </Label>
                    <Input
                      list="city-options"
                      value={toCity}
                      onChange={(e) => setToCity(e.target.value)}
                      placeholder="Destination city"
                      className="bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] placeholder:text-[#9aa8bd] rounded-xl h-12 px-4 font-medium shadow-sm hover:border-[#5b9bd5] focus:border-[#5b9bd5] focus:ring-2 focus:ring-[#5b9bd5]/20 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 tracking-wide uppercase">
                      <CalendarDays className="w-4 h-4 text-[#5b9bd5]" /> Departure
                    </Label>
                    <Input
                      type="date"
                      value={departDate}
                      onChange={(e) => setDepartDate(e.target.value)}
                      className="bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] rounded-xl h-12 px-4 font-medium shadow-sm hover:border-[#5b9bd5] focus:border-[#5b9bd5] focus:ring-2 focus:ring-[#5b9bd5]/20 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 tracking-wide uppercase">
                      <Users className="w-4 h-4 text-[#5b9bd5]" /> Travellers
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={travellers}
                      onChange={(e) => setTravellers(e.target.value)}
                      placeholder="1"
                      className="bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] placeholder:text-[#9aa8bd] rounded-xl h-12 px-4 font-medium shadow-sm hover:border-[#5b9bd5] focus:border-[#5b9bd5] focus:ring-2 focus:ring-[#5b9bd5]/20 transition-all"
                    />
                  </div>
                </div>

                {/* Shared Indian-city suggestions for From / To */}
                <datalist id="city-options">
                  {indianCities.map((city) => (
                    <option key={city} value={city} />
                  ))}
                </datalist>

                <div className="flex justify-center mt-8">
                  <Button
                    type="button"
                    onClick={handleSearchFlights}
                    className="bg-gradient-to-r from-[#1a3a6b] to-[#2c5a9e] text-white hover:from-[#0f2847] hover:to-[#1a3a6b] font-bold text-base rounded-full px-12 h-14 shadow-xl hover:shadow-2xl hover:scale-[1.02] flex items-center gap-3 transition-all"
                  >
                    <Search className="w-5 h-5" />
                    Search Flights
                  </Button>
                </div>
              </TabsContent>

              {/* HOTELS SEARCH */}
              <TabsContent value="hotels" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  <div className="space-y-2">
                    <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 tracking-wide uppercase">
                      <MapPin className="w-4 h-4 text-[#5b9bd5]" /> Location
                    </Label>
                    <Input
                      list="hotel-location-options"
                      value={hotelLocation}
                      onChange={(e) => setHotelLocation(e.target.value)}
                      placeholder="City or hotel name"
                      className="bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] placeholder:text-[#9aa8bd] rounded-xl h-12 px-4 font-medium shadow-sm hover:border-[#5b9bd5] focus:border-[#5b9bd5] focus:ring-2 focus:ring-[#5b9bd5]/20 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 tracking-wide uppercase">
                      <CalendarDays className="w-4 h-4 text-[#5b9bd5]" /> Check-in
                    </Label>
                    <Input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] rounded-xl h-12 px-4 font-medium shadow-sm hover:border-[#5b9bd5] focus:border-[#5b9bd5] focus:ring-2 focus:ring-[#5b9bd5]/20 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 tracking-wide uppercase">
                      <CalendarDays className="w-4 h-4 text-[#5b9bd5]" /> Check-out
                    </Label>
                    <Input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] rounded-xl h-12 px-4 font-medium shadow-sm hover:border-[#5b9bd5] focus:border-[#5b9bd5] focus:ring-2 focus:ring-[#5b9bd5]/20 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 tracking-wide uppercase">
                      <Users className="w-4 h-4 text-[#5b9bd5]" /> Guests
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      placeholder="2"
                      className="bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] placeholder:text-[#9aa8bd] rounded-xl h-12 px-4 font-medium shadow-sm hover:border-[#5b9bd5] focus:border-[#5b9bd5] focus:ring-2 focus:ring-[#5b9bd5]/20 transition-all"
                    />
                  </div>
                </div>

                {/* Autocomplete: popular cities + hotel names */}
                <datalist id="hotel-location-options">
                  {indianCities.map((city) => (
                    <option key={city} value={city} />
                  ))}
                  {sampleHotels.map((hotel) => (
                    <option key={hotel.name} value={hotel.name} />
                  ))}
                </datalist>

                <div className="flex justify-center mt-6">
                  <Button
                    type="button"
                    onClick={handleSearchHotels}
                    className="bg-[#0f1a2e] text-white hover:bg-[#1a2947] font-semibold rounded-full px-10 h-12 shadow-md flex items-center gap-2 hover:scale-[1.02] transition-all"
                  >
                    <Search className="w-4 h-4" />
                    Search Hotels
                  </Button>
                </div>
              </TabsContent>

              {/* OTHER CATEGORIES: HOMESTAYS, HOLIDAY, TRAINS, BUSES, CABS, FOREX, INSURANCE */}
              {["homestays", "holiday", "trains", "buses", "cabs", "forex", "insurance"].map((catKey) => (
                <TabsContent key={catKey} value={catKey} className="mt-6">
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/80 shadow-md">
                    <div className="flex items-center gap-2 mb-4 border-b border-[#e2e8f0] pb-3">
                      <Sparkles className="w-5 h-5 text-[#5b9bd5]" />
                      <h3 className="text-xl font-extrabold text-[#1a3a6b]">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {offers.map((offer) => (
                <div
                  key={offer.code}
                  className="bg-white/70 border border-white/60 rounded-2xl shadow-lg backdrop-blur-md p-5 flex flex-col justify-between hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  <div>
                    <span className="inline-block bg-[#0f1a2e] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                      {offer.tag}
                    </span>
                    <h3 className="text-[#0f1a2e] font-bold text-lg mt-3 leading-snug">
                      {offer.title}
                    </h3>
                    <p className="text-[#3d5170] text-sm mt-2">
                      {offer.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[#1a6b52] font-mono font-semibold text-sm border border-dashed border-[#1a6b52]/50 rounded-md px-2 py-1">
                      {offer.code}
                    </span>
                    <button
                      type="button"
                      className="text-[#0f1a2e] font-semibold text-sm hover:underline"
                    >
                      Grab Deal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* BEST OFFERS — IMAGE CARDS */}
          <section className="space-y-5">
            <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
              Best Offers
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {bestOffers.map((offer) => (
                <div
                  key={offer.title}
                  className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all group"
                >
                  {/* Background image */}
                  <div
                    style={{ backgroundImage: `url(${offer.image})` }}
                    className="absolute inset-0 bg-cover bg-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                  {/* Content */}
                  <div className="relative p-6 flex flex-col justify-end min-h-[280px]">
                    <h3 className="text-white font-bold text-2xl mb-2 drop-shadow-md">
                      {offer.title}
                    </h3>
                    <p className="text-white/90 text-sm mb-4 drop-shadow">
                      {offer.description}
                    </p>
                    <Button
                      type="button"
                      className="bg-[#5b9bd5] text-white hover:bg-[#4a86c9] font-semibold rounded-full px-6 h-10 shadow-md w-fit"
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* HANDPICKED COLLECTIONS */}
          <section className="space-y-5">
            <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
              Handpicked Collections for You
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {collections.map((col) => (
                <div
                  key={col.title}
                  className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all group cursor-pointer"
                >
                  {/* Background image */}
                  <div
                    style={{ backgroundImage: `url(${col.image})` }}
                    className="absolute inset-0 bg-cover bg-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  {/* TOP badge */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#0f1a2e]">
                    {col.badge}
                  </div>

                  {/* Title */}
                  <div className="relative p-6 flex flex-col justify-end min-h-[240px]">
                    <h3 className="text-white font-bold text-xl drop-shadow-md">
                      {col.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* UNLOCK LESSER-KNOWN WONDERS OF INDIA */}
          <section className="space-y-5">
            <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
              Unlock Lesser-Known Wonders of India
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {wonders.map((w) => (
                <div
                  key={w.title}
                  className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all group cursor-pointer"
                >
                  {/* Background image */}
                  <div
                    style={{ backgroundImage: `url(${w.image})` }}
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Title */}
                  <div className="relative p-6 flex flex-col justify-end min-h-[280px]">
                    <h3 className="text-white font-bold text-xl drop-shadow-md leading-snug">
                      {w.title}
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
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
          {/* Gradient header showing the route */}
          <DialogHeader className="bg-gradient-to-br from-[#a3cef0] to-[#c5e2f7] px-6 pt-6 pb-5 text-left">
            <DialogTitle className="text-2xl font-bold text-[#0f1a2e] flex items-center gap-2">
              <Plane className="w-6 h-6" />
              {fromCity || "From"}
              <ArrowRight className="w-5 h-5 text-[#2c3e57]/70" />
              {toCity || "To"}
            </DialogTitle>
            <DialogDescription className="text-[#2c3e57]/80 text-base">
              {departDate ? `Departure on ${departDate}` : "Available flights"}
              {" · "}
              {travellers} {Number(travellers) > 1 ? "travellers" : "traveller"}
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable list of flight results */}
          <div className="px-6 py-5 max-h-[60vh] overflow-y-auto space-y-3">
            {sampleFlights.map((flight) => (
              <div
                key={flight.code}
                className="flex items-center justify-between gap-4 rounded-xl border border-[#e2e8f0] bg-white px-5 py-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Airline + timing */}
                <div className="flex flex-col">
                  <span className="font-bold text-lg text-[#0f1a2e]">
                    {flight.airline}
                  </span>
                  <span className="text-sm text-[#7c8ba3]">{flight.code}</span>
                </div>

                <div className="flex flex-col items-center text-[#2c3e57]">
                  <span className="font-semibold text-lg">
                    {flight.depart} — {flight.arrive}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-[#7c8ba3]">
                    <Clock className="w-4 h-4" /> {flight.duration}
                  </span>
                </div>

                {/* Price in ₹ + book */}
                <div className="flex flex-col items-end gap-2">
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
                    className="h-9 px-5 text-sm bg-[#5b9bd5] text-white hover:bg-[#4a86c9] rounded-full font-semibold"
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* HOTEL SEARCH RESULTS DIALOG */}
      <Dialog open={showHotelResults} onOpenChange={setShowHotelResults}>
        <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
          {/* Gradient header showing location */}
          <DialogHeader className="bg-gradient-to-br from-[#a3cef0] to-[#c5e2f7] px-6 pt-6 pb-5 text-left">
            <DialogTitle className="text-2xl font-bold text-[#0f1a2e] flex items-center gap-2">
              <BedDouble className="w-6 h-6" />
              Hotels in {hotelLocation || "Your Location"}
            </DialogTitle>
            <DialogDescription className="text-[#2c3e57]/80 text-base">
              {checkInDate && checkOutDate
                ? `${checkInDate} to ${checkOutDate}`
                : "Available hotels"}
              {" · "}
              {guests} {Number(guests) > 1 ? "guests" : "guest"}
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable list of hotel results */}
          <div className="px-6 py-5 max-h-[60vh] overflow-y-auto space-y-3">
            {sampleHotels.map((hotel) => (
              <div
                key={hotel.name}
                className="flex items-start justify-between gap-4 rounded-xl border border-[#e2e8f0] bg-white px-5 py-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Hotel name + city + rating */}
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-[#0f1a2e]">
                      {hotel.name}
                    </span>
                    <span className="inline-block bg-[#5b9bd5]/10 text-[#5b9bd5] text-xs font-semibold px-2 py-0.5 rounded-full border border-[#5b9bd5]/20">
                      {hotel.tag}
                    </span>
                  </div>
                  <span className="text-sm text-[#7c8ba3] flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5" /> {hotel.city}
                  </span>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-semibold text-[#2c3e57]">
                      ★ {hotel.rating}
                    </span>
                    <span className="text-xs text-[#7c8ba3]">
                      ({hotel.reviews.toLocaleString("en-IN")} reviews)
                    </span>
                  </div>
                </div>

                {/* Price per night + book */}
                <div className="flex flex-col items-end gap-2">
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
                  <Button
                    type="button"
                    onClick={() => handleBookHotel(hotel)}
                    className="h-9 px-5 text-sm bg-[#5b9bd5] text-white hover:bg-[#4a86c9] rounded-full font-semibold"
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
