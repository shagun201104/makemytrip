"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  House,
  Umbrella,
  TrainFront,
  Bus,
  CarTaxiFront,
  CreditCard,
  ShieldCheck,
  MapPin,
  CalendarDays,
  Users,
  Search,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Clock,
  IndianRupee,
  ShieldAlert,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface CategoryServicesProps {
  category: string;
}

export function CategoryServices({ category }: CategoryServicesProps) {
  const router = useRouter();

  // State for search fields
  const [location, setLocation] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [currency, setCurrency] = useState("USD");
  const [forexAmount, setForexAmount] = useState("500");
  const [cabType, setCabType] = useState("Sedan");

  // Modal dialog states
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [bookedItemNotice, setBookedItemNotice] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveModal(category);
  };

  const handleBookService = (title: string, price: string) => {
    setBookedItemNotice(`Successfully reserved "${title}" for ${price}! Confirmation sent to your profile.`);
    setTimeout(() => {
      setBookedItemNotice(null);
      setActiveModal(null);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Search Form Based on Active Category */}
      <form onSubmit={handleSearch} className="space-y-6">
        {/* HOMESTAYS & VILLAS */}
        {category === "Homestays" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 uppercase">
                <MapPin className="w-4 h-4 text-[#5b9bd5]" /> Destination / Property
              </Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Goa, Manali, Coorg..."
                className="bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] rounded-xl h-12 px-4 font-medium"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 uppercase">
                <CalendarDays className="w-4 h-4 text-[#5b9bd5]" /> Check-in
              </Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] rounded-xl h-12 px-4"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 uppercase">
                <CalendarDays className="w-4 h-4 text-[#5b9bd5]" /> Check-out
              </Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] rounded-xl h-12 px-4"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 uppercase">
                <Users className="w-4 h-4 text-[#5b9bd5]" /> Guests & Rooms
              </Label>
              <Input
                type="number"
                min={1}
                value={passengers}
                onChange={(e) => setPassengers(e.target.value)}
                className="bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] rounded-xl h-12 px-4"
                required
              />
            </div>
          </div>
        )}

        {/* HOLIDAY PACKAGES */}
        {category === "Holiday" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 uppercase">
                <MapPin className="w-4 h-4 text-[#5b9bd5]" /> Destination
              </Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Kashmir, Kerala, Bali, Dubai..."
                className="bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] rounded-xl h-12 px-4"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 uppercase">
                <CalendarDays className="w-4 h-4 text-[#5b9bd5]" /> Travel Month
              </Label>
              <Input
                type="month"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] rounded-xl h-12 px-4"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 uppercase">
                <Users className="w-4 h-4 text-[#5b9bd5]" /> Travellers Count
              </Label>
              <Input
                type="number"
                min={1}
                value={passengers}
                onChange={(e) => setPassengers(e.target.value)}
                className="bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] rounded-xl h-12 px-4"
                required
              />
            </div>
          </div>
        )}

        {/* TRAINS */}
        {category === "Trains" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 uppercase">
                <MapPin className="w-4 h-4 text-[#5b9bd5]" /> From Station
              </Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="New Delhi (NDLS)"
                className="bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] rounded-xl h-12 px-4"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 uppercase">
                <MapPin className="w-4 h-4 text-[#5b9bd5]" /> To Station
              </Label>
              <Input
                placeholder="Varanasi (BSB) / Mumbai (CSMT)"
                className="bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] rounded-xl h-12 px-4"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 uppercase">
                <CalendarDays className="w-4 h-4 text-[#5b9bd5]" /> Travel Date
              </Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] rounded-xl h-12 px-4"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 uppercase">
                <TrainFront className="w-4 h-4 text-[#5b9bd5]" /> Train Class
              </Label>
              <select className="w-full bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] rounded-xl h-12 px-3 font-semibold text-xs outline-none">
                <option value="ALL">All Classes (Vande Bharat / 1A / 2A / 3A)</option>
                <option value="VB">Vande Bharat Express</option>
                <option value="1A">First AC (1A)</option>
                <option value="2A">Second AC (2A)</option>
                <option value="3A">Third AC (3A)</option>
              </select>
            </div>
          </div>
        )}

        {/* BUSES */}
        {category === "Buses" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 uppercase">
                <MapPin className="w-4 h-4 text-[#5b9bd5]" /> From City
              </Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Delhi, Bengaluru, Hyderabad..."
                className="bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] rounded-xl h-12 px-4"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 uppercase">
                <MapPin className="w-4 h-4 text-[#5b9bd5]" /> To City
              </Label>
              <Input
                placeholder="Manali, Goa, Chennai..."
                className="bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] rounded-xl h-12 px-4"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 uppercase">
                <CalendarDays className="w-4 h-4 text-[#5b9bd5]" /> Departure Date
              </Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] rounded-xl h-12 px-4"
                required
              />
            </div>
          </div>
        )}

        {/* CABS */}
        {category === "Cabs" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 uppercase">
                <MapPin className="w-4 h-4 text-[#5b9bd5]" /> Pickup Location
              </Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Delhi Airport (DEL) / City Center"
                className="bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] rounded-xl h-12 px-4"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 uppercase">
                <MapPin className="w-4 h-4 text-[#5b9bd5]" /> Drop Address
              </Label>
              <Input
                placeholder="Agra / Hotel Location"
                className="bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] rounded-xl h-12 px-4"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 uppercase">
                <CalendarDays className="w-4 h-4 text-[#5b9bd5]" /> Pickup Date
              </Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] rounded-xl h-12 px-4"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 uppercase">
                <CarTaxiFront className="w-4 h-4 text-[#5b9bd5]" /> Cab Category
              </Label>
              <select
                value={cabType}
                onChange={(e) => setCabType(e.target.value)}
                className="w-full bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] rounded-xl h-12 px-3 font-semibold text-xs outline-none"
              >
                <option value="Sedan">Sedan (Dzire / Etios) - 4 Seats</option>
                <option value="SUV">SUV (Innova / Ertiga) - 6 Seats</option>
                <option value="Hatchback">Hatchback (Swift / WagonR) - 4 Seats</option>
              </select>
            </div>
          </div>
        )}

        {/* FOREX */}
        {category === "Forex" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 uppercase">
                <CreditCard className="w-4 h-4 text-[#5b9bd5]" /> Target Currency
              </Label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] rounded-xl h-12 px-3 font-semibold text-sm outline-none"
              >
                <option value="USD">USD ($) — US Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
                <option value="AED">AED (AED) — UAE Dirham</option>
                <option value="THB">THB (฿) — Thai Baht</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 uppercase">
                <IndianRupee className="w-4 h-4 text-[#5b9bd5]" /> Amount in {currency}
              </Label>
              <Input
                type="number"
                value={forexAmount}
                onChange={(e) => setForexAmount(e.target.value)}
                className="bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] rounded-xl h-12 px-4 font-bold"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 uppercase">
                Delivery Format
              </Label>
              <select className="w-full bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] rounded-xl h-12 px-3 font-semibold text-xs outline-none">
                <option value="CARD">Multi-Currency Forex Card (Zero Markup)</option>
                <option value="CASH">Currency Notes (Doorstep Delivery)</option>
              </select>
            </div>
          </div>
        )}

        {/* INSURANCE */}
        {category === "Insurance" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 uppercase">
                <ShieldCheck className="w-4 h-4 text-[#5b9bd5]" /> Coverage Region
              </Label>
              <select className="w-full bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] rounded-xl h-12 px-3 font-semibold text-sm outline-none">
                <option value="DOMESTIC">Domestic Travel Insurance (India)</option>
                <option value="WORLDWIDE">Worldwide (Includes US & Canada)</option>
                <option value="ASIA">Asia & Middle East</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 uppercase">
                <CalendarDays className="w-4 h-4 text-[#5b9bd5]" /> Trip Start Date
              </Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] rounded-xl h-12 px-4"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#1a3a6b] text-sm font-bold flex items-center gap-1.5 uppercase">
                <Users className="w-4 h-4 text-[#5b9bd5]" /> Travellers
              </Label>
              <Input
                type="number"
                min={1}
                value={passengers}
                onChange={(e) => setPassengers(e.target.value)}
                className="bg-white border-2 border-[#d5e2f0] text-[#0f1a2e] rounded-xl h-12 px-4"
                required
              />
            </div>
          </div>
        )}

        <div className="flex justify-center mt-6">
          <Button
            type="submit"
            className="bg-gradient-to-r from-[#1a3a6b] to-[#2c5a9e] text-white hover:from-[#0f2847] hover:to-[#1a3a6b] font-bold text-base rounded-full px-12 h-14 shadow-xl hover:shadow-2xl hover:scale-[1.02] flex items-center gap-3 transition-all"
          >
            <Search className="w-5 h-5" /> Search {category}
          </Button>
        </div>
      </form>

      {/* RESULTS MODAL DIALOGS FOR EACH CATEGORY */}
      <Dialog open={Boolean(activeModal)} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden rounded-3xl border-0 shadow-2xl">
          <DialogHeader className="bg-gradient-to-br from-[#1a3a6b] to-[#2c5a9e] text-white px-6 pt-6 pb-5 text-left">
            <DialogTitle className="text-2xl font-extrabold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#5b9bd5]" />
              Available {category} Listings
            </DialogTitle>
            <DialogDescription className="text-[#dbe8f7] text-sm">
              Exclusive deals & instant reservations across {category}
            </DialogDescription>
          </DialogHeader>

          {bookedItemNotice && (
            <div className="m-6 mb-0 bg-[#dcfce7] border border-[#86efac] text-[#15803d] p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              {bookedItemNotice}
            </div>
          )}

          <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4">
            {/* HOMESTAYS RESULTS */}
            {category === "Homestays" && (
              <>
                {[
                  { title: "SaffronStays Ocean Villa", loc: "Goa · Beachfront", price: "₹12,499 / night", rating: "4.9 ★" },
                  { title: "Vista Mountain Cottage", loc: "Manali · Valley View", price: "₹8,999 / night", rating: "4.8 ★" },
                  { title: "Zostel Heritage Palace", loc: "Udaipur · Lakefront", price: "₹3,499 / night", rating: "4.7 ★" },
                ].map((item, i) => (
                  <div key={i} className="bg-white border border-[#e2e8f0] p-4 rounded-2xl flex items-center justify-between shadow-xs">
                    <div>
                      <h4 className="font-bold text-[#0f1a2e] text-base">{item.title}</h4>
                      <p className="text-xs text-[#7c8ba3]">{item.loc} · {item.rating}</p>
                      <p className="text-sm font-bold text-[#2f8f6b] mt-1">{item.price}</p>
                    </div>
                    <Button onClick={() => handleBookService(item.title, item.price)} className="bg-[#0f1a2e] text-white hover:bg-[#1a2947] font-bold text-xs rounded-xl px-5 h-10">
                      Reserve Villa
                    </Button>
                  </div>
                ))}
              </>
            )}

            {/* HOLIDAY PACKAGES RESULTS */}
            {category === "Holiday" && (
              <>
                {[
                  { title: "Kashmir Paradise 5D/4N", desc: "Srinagar, Gulmarg & Pahalgam with Houseboat Stay", price: "₹24,999 / person" },
                  { title: "Kerala Backwaters & Houseboat 6D/5N", desc: "Munnar Tea Gardens, Alleppey & Kovalam", price: "₹19,499 / person" },
                  { title: "Dubai Deluxe Exploration 6D/5N", desc: "Burj Khalifa, Desert Safari & Luxury Transfers", price: "₹44,999 / person" },
                ].map((pkg, i) => (
                  <div key={i} className="bg-white border border-[#e2e8f0] p-4 rounded-2xl flex items-center justify-between shadow-xs">
                    <div className="max-w-xs">
                      <h4 className="font-bold text-[#0f1a2e] text-base">{pkg.title}</h4>
                      <p className="text-xs text-[#7c8ba3] mt-0.5">{pkg.desc}</p>
                      <p className="text-sm font-bold text-[#5b9bd5] mt-1">{pkg.price}</p>
                    </div>
                    <Button onClick={() => handleBookService(pkg.title, pkg.price)} className="bg-[#5b9bd5] text-white hover:bg-[#4a86c9] font-bold text-xs rounded-xl px-5 h-10">
                      Book Package
                    </Button>
                  </div>
                ))}
              </>
            )}

            {/* TRAINS RESULTS */}
            {category === "Trains" && (
              <>
                {[
                  { train: "Vande Bharat Express (22436)", timing: "06:00 → 14:00 (8h)", price: "₹1,750 (Executive CC)" },
                  { train: "Rajdhani Express (12424)", timing: "16:55 → 08:30 (15h)", price: "₹2,850 (1st AC)" },
                  { train: "Shatabdi Express (12002)", timing: "06:00 → 09:50 (3h 50m)", price: "₹1,120 (AC Chair)" },
                ].map((t, i) => (
                  <div key={i} className="bg-white border border-[#e2e8f0] p-4 rounded-2xl flex items-center justify-between shadow-xs">
                    <div>
                      <h4 className="font-bold text-[#0f1a2e] text-base">{t.train}</h4>
                      <p className="text-xs text-[#7c8ba3]">{t.timing}</p>
                      <p className="text-sm font-bold text-[#0f1a2e] mt-1">{t.price}</p>
                    </div>
                    <Button onClick={() => handleBookService(t.train, t.price)} className="bg-[#0f1a2e] text-white hover:bg-[#1a2947] font-bold text-xs rounded-xl px-5 h-10">
                      Book Ticket
                    </Button>
                  </div>
                ))}
              </>
            )}

            {/* BUSES RESULTS */}
            {category === "Buses" && (
              <>
                {[
                  { name: "Zingbus Premium AC Sleeper (2+1)", timing: "22:00 → 06:00", price: "₹899" },
                  { name: "IntrCity SmartBus Volvo Multi-Axle", timing: "23:00 → 07:15", price: "₹1,049" },
                  { name: "Orange Tours Scania AC Seater", timing: "21:30 → 05:45", price: "₹799" },
                ].map((b, i) => (
                  <div key={i} className="bg-white border border-[#e2e8f0] p-4 rounded-2xl flex items-center justify-between shadow-xs">
                    <div>
                      <h4 className="font-bold text-[#0f1a2e] text-base">{b.name}</h4>
                      <p className="text-xs text-[#7c8ba3]">{b.timing}</p>
                      <p className="text-sm font-bold text-[#22c55e] mt-1">{b.price}</p>
                    </div>
                    <Button onClick={() => handleBookService(b.name, b.price)} className="bg-[#22c55e] text-white hover:bg-[#16a34a] font-bold text-xs rounded-xl px-5 h-10">
                      Select Seat
                    </Button>
                  </div>
                ))}
              </>
            )}

            {/* CABS RESULTS */}
            {category === "Cabs" && (
              <>
                {[
                  { model: "Maruti Dzire / Toyota Etios (Sedan)", capacity: "4 Passengers · 2 Bags", rate: "₹2,840 Total (Flat Fare)" },
                  { model: "Innova Crysta (Luxury SUV)", capacity: "6 Passengers · 4 Bags", rate: "₹4,150 Total (Flat Fare)" },
                  { model: "Maruti Swift (Hatchback)", capacity: "4 Passengers · 1 Bag", rate: "₹2,200 Total (Flat Fare)" },
                ].map((cab, i) => (
                  <div key={i} className="bg-white border border-[#e2e8f0] p-4 rounded-2xl flex items-center justify-between shadow-xs">
                    <div>
                      <h4 className="font-bold text-[#0f1a2e] text-base">{cab.model}</h4>
                      <p className="text-xs text-[#7c8ba3]">{cab.capacity}</p>
                      <p className="text-sm font-bold text-[#0f1a2e] mt-1">{cab.rate}</p>
                    </div>
                    <Button onClick={() => handleBookService(cab.model, cab.rate)} className="bg-[#0f1a2e] text-white hover:bg-[#1a2947] font-bold text-xs rounded-xl px-5 h-10">
                      Book Cab
                    </Button>
                  </div>
                ))}
              </>
            )}

            {/* FOREX RESULTS */}
            {category === "Forex" && (
              <div className="space-y-4">
                <div className="bg-[#f0f7ff] border border-[#bcd9f2] p-4 rounded-2xl text-xs text-[#1a3a6b]">
                  <p className="font-bold">Guaranteed Best Rate for {currency}</p>
                  <p className="mt-0.5">Order amount: {forexAmount} {currency} · Doorstep Express Delivery</p>
                </div>
                <Button onClick={() => handleBookService(`Forex Order (${forexAmount} ${currency})`, `₹${(Number(forexAmount) * 83.4).toLocaleString()}`)} className="w-full bg-[#0f1a2e] text-white hover:bg-[#1a2947] font-bold text-sm h-12 rounded-2xl">
                  Confirm Forex Order ({forexAmount} {currency})
                </Button>
              </div>
            )}

            {/* INSURANCE RESULTS */}
            {category === "Insurance" && (
              <>
                {[
                  { plan: "MMT Secure Travel Guard", coverage: "100% Flight Delay, Baggage Loss & Medical Cover", price: "₹299" },
                  { plan: "International Comprehensive Shield", coverage: "$50,000 Emergency Medical + Cancellation Cover", price: "₹899" },
                ].map((plan, i) => (
                  <div key={i} className="bg-white border border-[#e2e8f0] p-4 rounded-2xl flex items-center justify-between shadow-xs">
                    <div className="max-w-xs">
                      <h4 className="font-bold text-[#0f1a2e] text-base">{plan.plan}</h4>
                      <p className="text-xs text-[#7c8ba3]">{plan.coverage}</p>
                      <p className="text-sm font-bold text-[#2f8f6b] mt-1">{plan.price} / trip</p>
                    </div>
                    <Button onClick={() => handleBookService(plan.plan, plan.price)} className="bg-[#2f8f6b] text-white hover:bg-[#236b50] font-bold text-xs rounded-xl px-5 h-10">
                      Issue Policy
                    </Button>
                  </div>
                ))}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
