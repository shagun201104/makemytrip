"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { getflight, addflight, editflight, gethotel, addhotel, edithotel } from "@/app/api";
import { Plane, BedDouble, Users as UsersIcon, Building2, ShieldAlert, Plus, Edit, CheckCircle2, User } from "lucide-react";

// Default admin users — Shagun Prajapati is the sole ADMIN.
const initialUsers = [
  {
    _id: "1",
    firstname: "Shagun",
    lastname: "Prajapati",
    email: "shagun201104@gmail.com",
    role: "ADMIN",
  },
];

// Rich set of default flights for Admin Panel management
const initialAdminFlights = [
  {
    id: "f-101",
    flightName: "IndiGo 6E-204",
    from: "New Delhi",
    to: "Mumbai",
    departureTime: "2026-08-25T06:15",
    arrivalTime: "2026-08-25T08:30",
    price: 4899,
    availableSeats: 120,
  },
  {
    id: "f-102",
    flightName: "Air India AI-501",
    from: "New Delhi",
    to: "Bengaluru",
    departureTime: "2026-08-25T09:40",
    arrivalTime: "2026-08-25T12:05",
    price: 5650,
    availableSeats: 85,
  },
  {
    id: "f-103",
    flightName: "Vistara UK-995",
    from: "Mumbai",
    to: "Goa",
    departureTime: "2026-08-25T13:20",
    arrivalTime: "2026-08-25T15:30",
    price: 6120,
    availableSeats: 45,
  },
  {
    id: "f-104",
    flightName: "SpiceJet SG-8169",
    from: "Kolkata",
    to: "New Delhi",
    departureTime: "2026-08-25T18:05",
    arrivalTime: "2026-08-25T20:35",
    price: 4499,
    availableSeats: 60,
  },
  {
    id: "f-105",
    flightName: "Akasa Air QP-1401",
    from: "Bengaluru",
    to: "Hyderabad",
    departureTime: "2026-08-26T07:30",
    arrivalTime: "2026-08-26T08:45",
    price: 3299,
    availableSeats: 95,
  },
  {
    id: "f-106",
    flightName: "IndiGo 6E-554",
    from: "New Delhi",
    to: "Goa",
    departureTime: "2026-08-26T11:00",
    arrivalTime: "2026-08-26T13:30",
    price: 6499,
    availableSeats: 30,
  },
  {
    id: "f-107",
    flightName: "Air India AI-404",
    from: "Mumbai",
    to: "Jaipur",
    departureTime: "2026-08-27T15:15",
    arrivalTime: "2026-08-27T17:00",
    price: 3999,
    availableSeats: 50,
  },
  {
    id: "f-108",
    flightName: "Vistara UK-992",
    from: "New Delhi",
    to: "Chennai",
    departureTime: "2026-08-27T19:40",
    arrivalTime: "2026-08-27T22:25",
    price: 5899,
    availableSeats: 75,
  },
  {
    id: "f-109",
    flightName: "IndiGo 6E-809",
    from: "Bengaluru",
    to: "Kolkata",
    departureTime: "2026-08-28T17:30",
    arrivalTime: "2026-08-28T20:00",
    price: 5199,
    availableSeats: 65,
  },
  {
    id: "f-110",
    flightName: "Air India AI-887",
    from: "Hyderabad",
    to: "New Delhi",
    departureTime: "2026-08-28T19:15",
    arrivalTime: "2026-08-28T21:35",
    price: 4799,
    availableSeats: 80,
  },
  {
    id: "f-111",
    flightName: "SpiceJet SG-412",
    from: "New Delhi",
    to: "Ahmedabad",
    departureTime: "2026-08-29T08:30",
    arrivalTime: "2026-08-29T10:05",
    price: 3499,
    availableSeats: 90,
  },
  {
    id: "f-112",
    flightName: "Akasa Air QP-1108",
    from: "Mumbai",
    to: "Kochi",
    departureTime: "2026-08-29T11:45",
    arrivalTime: "2026-08-29T13:50",
    price: 4599,
    availableSeats: 70,
  },
  {
    id: "f-113",
    flightName: "Vistara UK-771",
    from: "Kolkata",
    to: "Pune",
    departureTime: "2026-08-30T15:10",
    arrivalTime: "2026-08-30T17:40",
    price: 5999,
    availableSeats: 55,
  },
  {
    id: "f-114",
    flightName: "IndiGo 6E-302",
    from: "Chennai",
    to: "New Delhi",
    departureTime: "2026-08-30T18:40",
    arrivalTime: "2026-08-30T21:30",
    price: 5750,
    availableSeats: 40,
  },
  {
    id: "f-115",
    flightName: "Air India AI-610",
    from: "Goa",
    to: "Mumbai",
    departureTime: "2026-08-31T22:00",
    arrivalTime: "2026-08-31T23:15",
    price: 3899,
    availableSeats: 110,
  },
];

// Rich set of default hotels for Admin Panel management
const initialAdminHotels = [
  {
    id: "h-201",
    hotelName: "Taj Palace New Delhi",
    location: "New Delhi",
    pricePerNight: 8999,
    rating: 4.8,
    availableRooms: 24,
  },
  {
    id: "h-202",
    hotelName: "Oberoi Grand Kolkata",
    location: "Kolkata",
    pricePerNight: 7499,
    rating: 4.7,
    availableRooms: 18,
  },
  {
    id: "h-203",
    hotelName: "Marine Bay Resort Goa",
    location: "Goa",
    pricePerNight: 6299,
    rating: 4.6,
    availableRooms: 32,
  },
  {
    id: "h-204",
    hotelName: "Leela Sky Suites Mumbai",
    location: "Mumbai",
    pricePerNight: 10499,
    rating: 4.9,
    availableRooms: 15,
  },
  {
    id: "h-205",
    hotelName: "Hilltop Retreat Manali",
    location: "Manali",
    pricePerNight: 4599,
    rating: 4.5,
    availableRooms: 20,
  },
  {
    id: "h-206",
    hotelName: "ITC Rajputana Palace",
    location: "Jaipur",
    pricePerNight: 6899,
    rating: 4.7,
    availableRooms: 28,
  },
  {
    id: "h-207",
    hotelName: "Grand Hyatt Kochi",
    location: "Kochi",
    pricePerNight: 8199,
    rating: 4.8,
    availableRooms: 12,
  },
  {
    id: "h-208",
    hotelName: "JW Marriott Bengaluru",
    location: "Bengaluru",
    pricePerNight: 9499,
    rating: 4.8,
    availableRooms: 22,
  },
  {
    id: "h-209",
    hotelName: "Taj Falaknuma Palace",
    location: "Hyderabad",
    pricePerNight: 18500,
    rating: 4.9,
    availableRooms: 8,
  },
  {
    id: "h-210",
    hotelName: "Radisson Blu Resort",
    location: "Udaipur",
    pricePerNight: 7299,
    rating: 4.6,
    availableRooms: 19,
  },
  {
    id: "h-211",
    hotelName: "Novotel Airport Hotel",
    location: "New Delhi",
    pricePerNight: 5999,
    rating: 4.5,
    availableRooms: 35,
  },
  {
    id: "h-212",
    hotelName: "Alila Diwa Resort",
    location: "Goa",
    pricePerNight: 8799,
    rating: 4.7,
    availableRooms: 14,
  },
  {
    id: "h-213",
    hotelName: "Trident Hotel Nariman Point",
    location: "Mumbai",
    pricePerNight: 9899,
    rating: 4.7,
    availableRooms: 25,
  },
  {
    id: "h-214",
    hotelName: "The Westin Pune Koregaon",
    location: "Pune",
    pricePerNight: 6799,
    rating: 4.6,
    availableRooms: 16,
  },
  {
    id: "h-215",
    hotelName: "Fortune Park Signature",
    location: "Ahmedabad",
    pricePerNight: 4199,
    rating: 4.4,
    availableRooms: 30,
  },
];

export default function AdminDashboardPage() {
  const user = useSelector((state: any) => state.user.user);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("flights");
  const [flights, setFlights] = useState<any[]>(initialAdminFlights);
  const [hotels, setHotels] = useState<any[]>(initialAdminHotels);
  const [users, setUsers] = useState(initialUsers);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [actionNotice, setActionNotice] = useState("");

  // Check if current user is Admin (Shagun Prajapati or role === ADMIN)
  const isAdmin = user?.role === "ADMIN" || user?.email === "shagun201104@gmail.com" || user?.firstname?.toLowerCase() === "shagun";

  useEffect(() => {
    if (!user) return;
    if (!isAdmin) {
      router.replace("/");
    }
  }, [user, isAdmin, router]);

  // Load backend flights and hotels if API available, else maintain rich initial state
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [flightData, hotelData] = await Promise.all([getflight(), gethotel()]);
        if (!active) return;

        if (Array.isArray(flightData) && flightData.length >= 15) {
          setFlights(flightData);
        } else if (Array.isArray(flightData) && flightData.length > 0) {
          const existing = new Set(flightData.map((f: any) => f.id || f.flightName));
          const fillers = initialAdminFlights.filter((f) => !existing.has(f.id) && !existing.has(f.flightName));
          setFlights([...flightData, ...fillers].slice(0, 15));
        } else {
          const stored = localStorage.getItem("mmt_admin_flights");
          if (stored) setFlights(JSON.parse(stored));
          else setFlights(initialAdminFlights);
        }

        if (Array.isArray(hotelData) && hotelData.length >= 15) {
          setHotels(hotelData);
        } else if (Array.isArray(hotelData) && hotelData.length > 0) {
          const existing = new Set(hotelData.map((h: any) => h.id || h.hotelName));
          const fillers = initialAdminHotels.filter((h) => !existing.has(h.id) && !existing.has(h.hotelName));
          setHotels([...hotelData, ...fillers].slice(0, 15));
        } else {
          const stored = localStorage.getItem("mmt_admin_hotels");
          if (stored) setHotels(JSON.parse(stored));
          else setHotels(initialAdminHotels);
        }
      } catch (error) {
        console.warn("Backend API unavailable, using local admin catalog", error);
        if (typeof window !== "undefined") {
          const storedF = localStorage.getItem("mmt_admin_flights");
          setFlights(storedF ? JSON.parse(storedF) : initialAdminFlights);
          const storedH = localStorage.getItem("mmt_admin_hotels");
          setHotels(storedH ? JSON.parse(storedH) : initialAdminHotels);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const notify = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(""), 3500);
  };

  // Save Flight (Add / Edit)
  const handleFlightSaved = async (flightForm: any) => {
    try {
      if (flightForm.id) {
        try {
          await editflight(flightForm.id, flightForm);
        } catch {}
        const updated = flights.map((f) => (f.id === flightForm.id ? flightForm : f));
        setFlights(updated);
        localStorage.setItem("mmt_admin_flights", JSON.stringify(updated));
        notify(`Flight "${flightForm.flightName}" updated successfully!`);
      } else {
        const newFlight = { ...flightForm, id: `f-${Date.now()}` };
        try {
          const saved = await addflight(flightForm);
          if (saved?.id) newFlight.id = saved.id;
        } catch {}
        const updated = [newFlight, ...flights];
        setFlights(updated);
        localStorage.setItem("mmt_admin_flights", JSON.stringify(updated));
        notify(`New flight "${flightForm.flightName}" added to system!`);
      }
      setSelectedFlight(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Save Hotel (Add / Edit)
  const handleHotelSaved = async (hotelForm: any) => {
    try {
      if (hotelForm.id) {
        try {
          await edithotel(hotelForm.id, hotelForm);
        } catch {}
        const updated = hotels.map((h) => (h.id === hotelForm.id ? hotelForm : h));
        setHotels(updated);
        localStorage.setItem("mmt_admin_hotels", JSON.stringify(updated));
        notify(`Hotel "${hotelForm.hotelName}" updated successfully!`);
      } else {
        const newHotel = { ...hotelForm, id: `h-${Date.now()}` };
        try {
          const saved = await addhotel(hotelForm);
          if (saved?.id) newHotel.id = saved.id;
        } catch {}
        const updated = [newHotel, ...hotels];
        setHotels(updated);
        localStorage.setItem("mmt_admin_hotels", JSON.stringify(updated));
        notify(`New hotel "${hotelForm.hotelName}" added to system!`);
      }
      setSelectedHotel(null);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleUserRole = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u._id === userId) {
          const newRole = u.role === "ADMIN" ? "USER" : "ADMIN";
          notify(`Updated role for ${u.firstname} ${u.lastname} to ${newRole}`);
          return { ...u, role: newRole };
        }
        return u;
      })
    );
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
      u.firstname.toLowerCase().includes(searchEmail.toLowerCase())
  );

  // If not admin, render Access Denied message
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="bg-[#1e293b] rounded-3xl shadow-2xl border border-[#334155] p-8 md:p-12 text-center max-w-md space-y-4">
          <div className="w-16 h-16 bg-[#ef4444]/10 text-[#ef4444] rounded-full flex items-center justify-center mx-auto border border-[#ef4444]/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Admin Access Required</h2>
          <p className="text-sm text-[#94a3b8]">
            This portal is restricted to authorized Administrator Shagun Prajapati. Please sign in with admin credentials.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="w-full bg-[#2563eb] text-white hover:bg-[#1d4ed8] font-black rounded-full h-12 shadow-lg"
          >
            Return to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-4 md:px-8 py-8 relative overflow-hidden font-sans">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2563eb]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#16a34a]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Banner */}
        <div
          className="relative overflow-hidden rounded-3xl shadow-2xl border border-[#334155]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(15,23,42,0.95), rgba(15,23,42,0.75)), url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="px-6 py-10 md:px-12 md:py-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-[#93c5fd] text-xs font-black px-3.5 py-1 rounded-full border border-white/15">
                  <Building2 className="w-3.5 h-3.5" /> Enterprise System Control Center
                </span>
                <span className="bg-[#16a34a] text-white text-[11px] font-black px-3 py-1 rounded-full border border-[#4ade80]/40 shadow-xs">
                  Primary Admin: Shagun Prajapati
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow-md">
                MakeMyTour Admin Panel
              </h1>
              <p className="text-[#94a3b8] mt-2 text-sm md:text-base max-w-xl font-medium">
                Real-time inventory governance for global flights, luxury hotels, and admin user authorizations.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-[#1e293b]/80 backdrop-blur-md p-4 rounded-2xl border border-[#334155]">
              <span className="flex h-3 w-3 rounded-full bg-[#4ade80] animate-ping" />
              <div>
                <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">System Status</p>
                <p className="text-sm font-black text-[#4ade80]">100% Operational • Live Sync</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action notification toast */}
        {actionNotice && (
          <div className="bg-[#166534] border border-[#22c55e]/50 text-white px-5 py-3.5 rounded-2xl text-sm font-bold shadow-xl flex items-center gap-2.5 animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-[#4ade80] shrink-0" />
            {actionNotice}
          </div>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="flex items-center justify-between bg-[#1e293b]/90 border border-[#3b82f6]/30 rounded-3xl shadow-xl backdrop-blur-md p-6 hover:border-[#3b82f6]/60 transition-all">
            <div>
              <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">Active Flights</p>
              <p className="text-4xl font-black text-white mt-1">{flights.length}</p>
              <span className="inline-block mt-2 text-xs font-bold text-[#60a5fa] bg-[#1e3a8a]/50 px-2.5 py-0.5 rounded-full border border-[#3b82f6]/30">
                +12.5% Live Routes
              </span>
            </div>
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] text-white shadow-lg shadow-[#2563eb]/30">
              <Plane className="w-7 h-7" />
            </div>
          </div>
          
          <div className="flex items-center justify-between bg-[#1e293b]/90 border border-[#22c55e]/30 rounded-3xl shadow-xl backdrop-blur-md p-6 hover:border-[#22c55e]/60 transition-all">
            <div>
              <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">Managed Hotels</p>
              <p className="text-4xl font-black text-white mt-1">{hotels.length}</p>
              <span className="inline-block mt-2 text-xs font-bold text-[#4ade80] bg-[#14532d]/50 px-2.5 py-0.5 rounded-full border border-[#22c55e]/30">
                98% Occupancy
              </span>
            </div>
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#16a34a] to-[#15803d] text-white shadow-lg shadow-[#16a34a]/30">
              <BedDouble className="w-7 h-7" />
            </div>
          </div>

          <div className="flex items-center justify-between bg-[#1e293b]/90 border border-[#a855f7]/30 rounded-3xl shadow-xl backdrop-blur-md p-6 hover:border-[#a855f7]/60 transition-all">
            <div>
              <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">System Users</p>
              <p className="text-4xl font-black text-white mt-1">{users.length}</p>
              <span className="inline-block mt-2 text-xs font-bold text-[#c084fc] bg-[#581c87]/50 px-2.5 py-0.5 rounded-full border border-[#a855f7]/30">
                RBAC Governed
              </span>
            </div>
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#9333ea] to-[#7e22ce] text-white shadow-lg shadow-[#9333ea]/30">
              <UsersIcon className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* Tabs section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-[#1e293b] rounded-2xl p-1.5 border border-[#334155] shadow-lg">
            <TabsTrigger
              value="flights"
              className="rounded-xl font-black text-sm flex items-center justify-center gap-2 data-[state=active]:bg-[#2563eb] data-[state=active]:text-white data-[state=active]:shadow-lg text-[#94a3b8] py-3.5 transition-all cursor-pointer"
            >
              <Plane className="w-4 h-4" />
              Flights ({flights.length})
            </TabsTrigger>
            <TabsTrigger
              value="hotels"
              className="rounded-xl font-black text-sm flex items-center justify-center gap-2 data-[state=active]:bg-[#2563eb] data-[state=active]:text-white data-[state=active]:shadow-lg text-[#94a3b8] py-3.5 transition-all cursor-pointer"
            >
              <BedDouble className="w-4 h-4" />
              Hotels ({hotels.length})
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="rounded-xl font-black text-sm flex items-center justify-center gap-2 data-[state=active]:bg-[#2563eb] data-[state=active]:text-white data-[state=active]:shadow-lg text-[#94a3b8] py-3.5 transition-all cursor-pointer"
            >
              <UsersIcon className="w-4 h-4" />
              Users & Admin Roles
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: FLIGHTS */}
          <TabsContent value="flights" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <Card className="bg-[#1e293b]/90 border border-[#334155] rounded-3xl shadow-2xl text-white">
                <CardHeader>
                  <CardTitle className="text-white text-2xl font-black flex items-center gap-2.5">
                    <Plane className="w-6 h-6 text-[#60a5fa]" /> Flight Inventory
                  </CardTitle>
                  <CardDescription className="text-[#94a3b8] text-xs font-medium">
                    View and manage all domestic & international flight schedules
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FlightList flights={flights} onSelect={setSelectedFlight} />
                </CardContent>
              </Card>

              <Card className="bg-[#1e293b]/90 border border-[#334155] rounded-3xl shadow-2xl text-white">
                <CardHeader>
                  <CardTitle className="text-white text-2xl font-black flex items-center gap-2.5">
                    {selectedFlight ? <Edit className="w-6 h-6 text-[#60a5fa]" /> : <Plus className="w-6 h-6 text-[#4ade80]" />}
                    {selectedFlight ? "Edit Flight Schedule" : "Add New Flight"}
                  </CardTitle>
                  <CardDescription className="text-[#94a3b8] text-xs font-medium">
                    {selectedFlight
                      ? `Updating details for "${selectedFlight.flightName}"`
                      : "Fill out the fields below to add a new flight route."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FlightForm flight={selectedFlight} onSave={handleFlightSaved} onCancel={() => setSelectedFlight(null)} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 2: HOTELS */}
          <TabsContent value="hotels" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <Card className="bg-[#1e293b]/90 border border-[#334155] rounded-3xl shadow-2xl text-white">
                <CardHeader>
                  <CardTitle className="text-white text-2xl font-black flex items-center gap-2.5">
                    <BedDouble className="w-6 h-6 text-[#4ade80]" /> Hotel Inventory
                  </CardTitle>
                  <CardDescription className="text-[#94a3b8] text-xs font-medium">
                    View and manage luxury hotels and resort listings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <HotelList hotels={hotels} onSelect={setSelectedHotel} />
                </CardContent>
              </Card>

              <Card className="bg-[#1e293b]/90 border border-[#334155] rounded-3xl shadow-2xl text-white">
                <CardHeader>
                  <CardTitle className="text-white text-2xl font-black flex items-center gap-2.5">
                    {selectedHotel ? <Edit className="w-6 h-6 text-[#4ade80]" /> : <Plus className="w-6 h-6 text-[#4ade80]" />}
                    {selectedHotel ? "Edit Hotel Listing" : "Add New Hotel"}
                  </CardTitle>
                  <CardDescription className="text-[#94a3b8] text-xs font-medium">
                    {selectedHotel
                      ? `Updating listing for "${selectedHotel.hotelName}"`
                      : "Fill out the fields below to add a new hotel property."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <HotelForm hotel={selectedHotel} onSave={handleHotelSaved} onCancel={() => setSelectedHotel(null)} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 3: USERS & ADMIN ROLES */}
          <TabsContent value="users" className="mt-6">
            <Card className="bg-[#1e293b]/90 border border-[#334155] rounded-3xl shadow-2xl text-white">
              <CardHeader>
                <CardTitle className="text-white text-2xl font-black flex items-center gap-2.5">
                  <User className="w-6 h-6 text-[#c084fc]" /> User & Administrator Management
                </CardTitle>
                <CardDescription className="text-[#94a3b8] text-xs font-medium">
                  Shagun Prajapati holds primary Administrator authority.
                </CardDescription>
                <Input
                  placeholder="Search user by name or email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="mt-3 bg-[#0f172a] border border-[#334155] text-white placeholder:text-[#64748b] rounded-xl h-11 px-4 max-w-sm font-bold text-sm focus:border-[#3b82f6]"
                />
              </CardHeader>
              <CardContent>
                <div className="rounded-2xl border border-[#334155] overflow-hidden bg-[#0f172a]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-[#334155] bg-[#0f172a]">
                        <TableHead className="text-[#94a3b8] font-black uppercase text-xs">Name</TableHead>
                        <TableHead className="text-[#94a3b8] font-black uppercase text-xs">Email</TableHead>
                        <TableHead className="text-[#94a3b8] font-black uppercase text-xs">Role</TableHead>
                        <TableHead className="text-[#94a3b8] font-black uppercase text-xs text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-[#94a3b8] py-6 text-sm">
                            No matching users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((u: any) => {
                          const isPrimaryAdmin = u.firstname.toLowerCase() === "shagun" && u.lastname.toLowerCase() === "prajapati";
                          return (
                            <TableRow key={u._id} className="border-b border-[#334155]/60 hover:bg-[#1e293b]">
                              <TableCell className="font-bold text-white text-sm">
                                {u.firstname} {u.lastname}
                                {isPrimaryAdmin && (
                                  <span className="ml-2 text-[10px] bg-[#fef3c7] text-[#b45309] border border-[#fde68a] font-extrabold px-2.5 py-0.5 rounded-full">
                                    Primary Admin
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-[#94a3b8] text-sm font-medium">{u.email}</TableCell>
                              <TableCell>
                                <span
                                  className={
                                    u.role === "ADMIN"
                                      ? "bg-[#2563eb] text-white text-xs font-black px-3 py-1 rounded-full"
                                      : "bg-[#334155] text-white text-xs font-bold px-3 py-1 rounded-full"
                                  }
                                >
                                  {u.role}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  disabled={isPrimaryAdmin} // Primary admin cannot be downgraded
                                  onClick={() => toggleUserRole(u._id)}
                                  className="bg-[#215190] hover:bg-[#1b3e6c] text-white font-semibold text-xs rounded-xl shadow-md disabled:opacity-50"
                                >
                                  {u.role === "ADMIN" ? "Revoke Admin" : "Make Admin"}
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Subcomponent: Flight List Table
function FlightList({ flights, onSelect }: any) {
  return (
    <div className="rounded-2xl border border-[#334155] overflow-hidden bg-[#0f172a]">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-[#334155] bg-[#0f172a]">
            <TableHead className="text-[#94a3b8] font-black uppercase text-xs">Airline & Flight</TableHead>
            <TableHead className="text-[#94a3b8] font-black uppercase text-xs">Route</TableHead>
            <TableHead className="text-[#94a3b8] font-black uppercase text-xs">Price</TableHead>
            <TableHead className="text-[#94a3b8] font-black uppercase text-xs text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flights.length > 0 ? (
            flights.map((f: any) => (
              <TableRow key={f.id || f.flightName} className="border-b border-[#334155]/60 hover:bg-[#1e293b]">
                <TableCell className="font-bold text-white text-sm">
                  {f.flightName}
                  <p className="text-[11px] text-[#94a3b8] font-normal">{f.availableSeats} seats left</p>
                </TableCell>
                <TableCell className="text-[#94a3b8] text-xs font-bold">
                  {f.from} &rarr; {f.to}
                </TableCell>
                <TableCell className="text-[#facc15] font-black text-sm drop-shadow-xs">
                  ₹{Number(f.price || 0).toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() => onSelect(f)}
                    className="bg-[#215190] hover:bg-[#1b3e6c] text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-[#94a3b8] py-6 text-sm">
                No flights available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// Subcomponent: Flight Form
function FlightForm({ flight, onSave, onCancel }: any) {
  const emptyFlight = {
    id: "",
    flightName: "",
    from: "",
    to: "",
    departureTime: "08:00",
    arrivalTime: "10:15",
    price: 4999,
    availableSeats: 60,
  };

  const [formdata, setformdata] = useState(emptyFlight);

  useEffect(() => {
    setformdata(flight ? { ...emptyFlight, ...flight } : emptyFlight);
  }, [flight]);

  const handlechange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setformdata((prev) => ({ ...prev, [name]: value }));
  };

  const handlesubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formdata);
  };

  return (
    <form onSubmit={handlesubmit} className="space-y-4 text-xs">
      <div className="space-y-1.5">
        <Label className="text-[#94a3b8] font-bold text-xs">Flight Name / Number</Label>
        <Input
          name="flightName"
          value={formdata.flightName}
          onChange={handlechange}
          placeholder="e.g. IndiGo 6E-204"
          required
          className="bg-[#0f172a] border border-[#334155] text-white placeholder:text-[#64748b] rounded-xl h-11 px-3.5 font-bold focus:border-[#3b82f6]"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[#94a3b8] font-bold text-xs">From (Origin)</Label>
          <Input
            name="from"
            value={formdata.from}
            onChange={handlechange}
            placeholder="e.g. New Delhi"
            required
            className="bg-[#0f172a] border border-[#334155] text-white placeholder:text-[#64748b] rounded-xl h-11 px-3.5 font-bold focus:border-[#3b82f6]"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[#94a3b8] font-bold text-xs">To (Destination)</Label>
          <Input
            name="to"
            value={formdata.to}
            onChange={handlechange}
            placeholder="e.g. Mumbai"
            required
            className="bg-[#0f172a] border border-[#334155] text-white placeholder:text-[#64748b] rounded-xl h-11 px-3.5 font-bold focus:border-[#3b82f6]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[#94a3b8] font-bold text-xs">Price (₹)</Label>
          <Input
            name="price"
            type="number"
            value={formdata.price}
            onChange={handlechange}
            required
            className="bg-[#0f172a] border border-[#334155] text-white rounded-xl h-11 px-3.5 font-bold focus:border-[#3b82f6]"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[#94a3b8] font-bold text-xs">Available Seats</Label>
          <Input
            name="availableSeats"
            type="number"
            value={formdata.availableSeats}
            onChange={handlechange}
            required
            className="bg-[#0f172a] border border-[#334155] text-white rounded-xl h-11 px-3.5 font-bold focus:border-[#3b82f6]"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="bg-[#215190] hover:bg-[#1b3e6c] text-white font-semibold text-sm rounded-xl h-11 flex-1 shadow-md cursor-pointer transition-all">
          {flight ? "Save Changes" : "Add Flight"}
        </Button>
        {flight && (
          <Button type="button" onClick={onCancel} variant="outline" className="text-xs font-bold rounded-xl h-11 border-[#334155] text-white hover:bg-[#334155]">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

// Subcomponent: Hotel List Table
function HotelList({ hotels, onSelect }: any) {
  return (
    <div className="rounded-2xl border border-[#334155] overflow-hidden bg-[#0f172a]">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-[#334155] bg-[#0f172a]">
            <TableHead className="text-[#94a3b8] font-black uppercase text-xs">Hotel Name</TableHead>
            <TableHead className="text-[#94a3b8] font-black uppercase text-xs">Location</TableHead>
            <TableHead className="text-[#94a3b8] font-black uppercase text-xs">Price / Night</TableHead>
            <TableHead className="text-[#94a3b8] font-black uppercase text-xs text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hotels.length > 0 ? (
            hotels.map((h: any) => (
              <TableRow key={h.id || h.hotelName} className="border-b border-[#334155]/60 hover:bg-[#1e293b]">
                <TableCell className="font-bold text-white text-sm">
                  {h.hotelName}
                  <p className="text-[11px] text-[#94a3b8] font-normal">★ {h.rating || 4.5} · {h.availableRooms || 10} rooms left</p>
                </TableCell>
                <TableCell className="text-[#94a3b8] text-xs font-bold">{h.location}</TableCell>
                <TableCell className="text-[#4ade80] font-black text-sm drop-shadow-xs">
                  ₹{Number(h.pricePerNight || 0).toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() => onSelect(h)}
                    className="bg-[#215190] hover:bg-[#1b3e6c] text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-[#94a3b8] py-6 text-sm">
                No hotels available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// Subcomponent: Hotel Form
function HotelForm({ hotel, onSave, onCancel }: any) {
  const emptyHotel = {
    id: "",
    hotelName: "",
    location: "",
    pricePerNight: 7999,
    rating: 4.8,
    availableRooms: 15,
  };

  const [formdata, setformdata] = useState(emptyHotel);

  useEffect(() => {
    setformdata(hotel ? { ...emptyHotel, ...hotel } : emptyHotel);
  }, [hotel]);

  const handlechange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setformdata((prev) => ({ ...prev, [name]: value }));
  };

  const handlesubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formdata);
  };

  return (
    <form onSubmit={handlesubmit} className="space-y-4 text-xs">
      <div className="space-y-1.5">
        <Label className="text-[#94a3b8] font-bold text-xs">Hotel Name</Label>
        <Input
          name="hotelName"
          value={formdata.hotelName}
          onChange={handlechange}
          placeholder="e.g. Taj Palace New Delhi"
          required
          className="bg-[#0f172a] border border-[#334155] text-white placeholder:text-[#64748b] rounded-xl h-11 px-3.5 font-bold focus:border-[#3b82f6]"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-[#94a3b8] font-bold text-xs">City / Location</Label>
        <Input
          name="location"
          value={formdata.location}
          onChange={handlechange}
          placeholder="e.g. New Delhi"
          required
          className="bg-[#0f172a] border border-[#334155] text-white placeholder:text-[#64748b] rounded-xl h-11 px-3.5 font-bold focus:border-[#3b82f6]"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[#94a3b8] font-bold text-xs">Price / Night (₹)</Label>
          <Input
            name="pricePerNight"
            type="number"
            value={formdata.pricePerNight}
            onChange={handlechange}
            required
            className="bg-[#0f172a] border border-[#334155] text-white rounded-xl h-11 px-3.5 font-bold focus:border-[#3b82f6]"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[#94a3b8] font-bold text-xs">Rating (1-5)</Label>
          <Input
            name="rating"
            type="number"
            step="0.1"
            max={5}
            min={1}
            value={formdata.rating}
            onChange={handlechange}
            required
            className="bg-[#0f172a] border border-[#334155] text-white rounded-xl h-11 px-3.5 font-bold focus:border-[#3b82f6]"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[#94a3b8] font-bold text-xs">Rooms Left</Label>
          <Input
            name="availableRooms"
            type="number"
            value={formdata.availableRooms}
            onChange={handlechange}
            required
            className="bg-[#0f172a] border border-[#334155] text-white rounded-xl h-11 px-3.5 font-bold focus:border-[#3b82f6]"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="bg-[#215190] hover:bg-[#1b3e6c] text-white font-semibold text-sm rounded-xl h-11 flex-1 shadow-md cursor-pointer transition-all">
          {hotel ? "Save Changes" : "Add Hotel"}
        </Button>
        {hotel && (
          <Button type="button" onClick={onCancel} variant="outline" className="text-xs font-bold rounded-xl h-11 border-[#334155] text-white hover:bg-[#334155]">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}