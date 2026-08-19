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
  {
    _id: "2",
    firstname: "John",
    lastname: "Doe",
    email: "john.doe@example.com",
    role: "USER",
  },
  {
    _id: "3",
    firstname: "Aisha",
    lastname: "Khan",
    email: "aisha.khan@example.com",
    role: "USER",
  },
  {
    _id: "4",
    firstname: "Rahul",
    lastname: "Sharma",
    email: "rahul.sharma@example.com",
    role: "USER",
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

        if (Array.isArray(flightData) && flightData.length > 0) {
          setFlights(flightData);
        } else {
          // Store initial in local storage if empty
          const stored = localStorage.getItem("mmt_admin_flights");
          if (stored) setFlights(JSON.parse(stored));
        }

        if (Array.isArray(hotelData) && hotelData.length > 0) {
          setHotels(hotelData);
        } else {
          const stored = localStorage.getItem("mmt_admin_hotels");
          if (stored) setHotels(JSON.parse(stored));
        }
      } catch (error) {
        console.warn("Backend API unavailable, using local admin catalog", error);
        if (typeof window !== "undefined") {
          const storedF = localStorage.getItem("mmt_admin_flights");
          if (storedF) setFlights(JSON.parse(storedF));
          const storedH = localStorage.getItem("mmt_admin_hotels");
          if (storedH) setHotels(JSON.parse(storedH));
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
      <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl border border-[#e2e8f0] p-8 md:p-12 text-center max-w-md space-y-4">
          <div className="w-16 h-16 bg-[#fef2f2] text-[#ef4444] rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#0f1a2e]">Admin Access Required</h2>
          <p className="text-sm text-[#64748b]">
            This portal is restricted to authorized Administrator Shagun Prajapati. Please sign in with admin credentials.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="w-full bg-[#0f1a2e] text-white hover:bg-[#1a2947] font-bold rounded-full h-11"
          >
            Return to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3daf0] via-[#a3cef0] to-[#96bfe3] text-[#0f1a2e] px-4 md:px-8 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Banner */}
        <div
          className="relative overflow-hidden rounded-3xl shadow-2xl"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(15,26,46,0.88), rgba(43,62,87,0.65)), url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="px-6 py-10 md:px-12 md:py-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30">
                  <Building2 className="w-3.5 h-3.5" /> Official Control Center
                </span>
                <span className="bg-[#22c55e] text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                  Admin: Shagun Prajapati
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
                MakeMyTour Admin Panel
              </h1>
              <p className="text-[#dbe8f7] mt-2 text-sm md:text-base max-w-xl">
                Manage global flights, luxury hotel inventory, and user privileges across all systems.
              </p>
            </div>
          </div>
        </div>

        {/* Action notification toast */}
        {actionNotice && (
          <div className="bg-[#dcfce7] border border-[#86efac] text-[#15803d] px-5 py-3 rounded-2xl text-sm font-bold shadow-md flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            {actionNotice}
          </div>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="flex items-center gap-4 bg-white/70 border border-white/80 rounded-2xl shadow-lg backdrop-blur-md p-5">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5b9bd5] to-[#4a86c9] text-white shadow-md">
              <Plane className="w-7 h-7" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-[#0f1a2e] leading-none">{flights.length}</p>
              <p className="text-[#3d5170] text-sm font-medium mt-1">Active Flights</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-white/70 border border-white/80 rounded-2xl shadow-lg backdrop-blur-md p-5">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6bb39a] to-[#4f9c7f] text-white shadow-md">
              <BedDouble className="w-7 h-7" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-[#0f1a2e] leading-none">{hotels.length}</p>
              <p className="text-[#3d5170] text-sm font-medium mt-1">Managed Hotels</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/70 border border-white/80 rounded-2xl shadow-lg backdrop-blur-md p-5">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c99bd5] to-[#a86dc9] text-white shadow-md">
              <UsersIcon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-[#0f1a2e] leading-none">{users.length}</p>
              <p className="text-[#3d5170] text-sm font-medium mt-1">System Users</p>
            </div>
          </div>
        </div>

        {/* Tabs section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-white/50 rounded-2xl p-1.5 backdrop-blur-md border border-white/60">
            <TabsTrigger
              value="flights"
              className="rounded-xl font-bold flex items-center justify-center gap-2 data-[state=active]:bg-[#0f1a2e] data-[state=active]:text-white data-[state=active]:shadow-md text-[#2c3e57] py-3 transition-all"
            >
              <Plane className="w-4 h-4" />
              Flights ({flights.length})
            </TabsTrigger>
            <TabsTrigger
              value="hotels"
              className="rounded-xl font-bold flex items-center justify-center gap-2 data-[state=active]:bg-[#0f1a2e] data-[state=active]:text-white data-[state=active]:shadow-md text-[#2c3e57] py-3 transition-all"
            >
              <BedDouble className="w-4 h-4" />
              Hotels ({hotels.length})
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="rounded-xl font-bold flex items-center justify-center gap-2 data-[state=active]:bg-[#0f1a2e] data-[state=active]:text-white data-[state=active]:shadow-md text-[#2c3e57] py-3 transition-all"
            >
              <UsersIcon className="w-4 h-4" />
              Users & Admin Roles
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: FLIGHTS */}
          <TabsContent value="flights" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <Card className="bg-white/70 border border-white/80 rounded-2xl shadow-xl backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-[#0f1a2e] text-2xl font-extrabold flex items-center gap-2">
                    <Plane className="w-5 h-5 text-[#5b9bd5]" /> Flight Inventory
                  </CardTitle>
                  <CardDescription className="text-[#3d5170] text-xs">
                    View and manage all domestic & international flight schedules
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FlightList flights={flights} onSelect={setSelectedFlight} />
                </CardContent>
              </Card>

              <Card className="bg-white/70 border border-white/80 rounded-2xl shadow-xl backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-[#0f1a2e] text-2xl font-extrabold flex items-center gap-2">
                    {selectedFlight ? <Edit className="w-5 h-5 text-[#5b9bd5]" /> : <Plus className="w-5 h-5 text-[#22c55e]" />}
                    {selectedFlight ? "Edit Flight Schedule" : "Add New Flight"}
                  </CardTitle>
                  <CardDescription className="text-[#3d5170] text-xs">
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
              <Card className="bg-white/70 border border-white/80 rounded-2xl shadow-xl backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-[#0f1a2e] text-2xl font-extrabold flex items-center gap-2">
                    <BedDouble className="w-5 h-5 text-[#22c55e]" /> Hotel Inventory
                  </CardTitle>
                  <CardDescription className="text-[#3d5170] text-xs">
                    View and manage luxury hotels and resort listings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <HotelList hotels={hotels} onSelect={setSelectedHotel} />
                </CardContent>
              </Card>

              <Card className="bg-white/70 border border-white/80 rounded-2xl shadow-xl backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-[#0f1a2e] text-2xl font-extrabold flex items-center gap-2">
                    {selectedHotel ? <Edit className="w-5 h-5 text-[#22c55e]" /> : <Plus className="w-5 h-5 text-[#22c55e]" />}
                    {selectedHotel ? "Edit Hotel Listing" : "Add New Hotel"}
                  </CardTitle>
                  <CardDescription className="text-[#3d5170] text-xs">
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
            <Card className="bg-white/70 border border-white/80 rounded-2xl shadow-xl backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-[#0f1a2e] text-2xl font-extrabold flex items-center gap-2">
                  <User className="w-5 h-5 text-[#a86dc9]" /> User & Administrator Management
                </CardTitle>
                <CardDescription className="text-[#3d5170] text-xs">
                  Only Shagun Prajapati holds primary Administrator authority.
                </CardDescription>
                <Input
                  placeholder="Search user by name or email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="mt-3 bg-white border border-[#b8cde4] text-[#0f1a2e] placeholder:text-[#7c8ba3] rounded-xl h-10 px-3 max-w-sm"
                />
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-white/80 overflow-x-auto bg-white/50">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-[#e2e8f0] bg-white/70">
                        <TableHead className="text-[#0f1a2e] font-extrabold uppercase text-xs">Name</TableHead>
                        <TableHead className="text-[#0f1a2e] font-extrabold uppercase text-xs">Email</TableHead>
                        <TableHead className="text-[#0f1a2e] font-extrabold uppercase text-xs">Role</TableHead>
                        <TableHead className="text-[#0f1a2e] font-extrabold uppercase text-xs text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-[#3d5170] py-6 text-sm">
                            No matching users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((u: any) => {
                          const isPrimaryAdmin = u.firstname.toLowerCase() === "shagun" && u.lastname.toLowerCase() === "prajapati";
                          return (
                            <TableRow key={u._id} className="border-b border-[#e2e8f0]/60 hover:bg-white/60">
                              <TableCell className="font-bold text-[#0f1a2e] text-sm">
                                {u.firstname} {u.lastname}
                                {isPrimaryAdmin && (
                                  <span className="ml-2 text-[10px] bg-[#fef3c7] text-[#b45309] border border-[#fde68a] font-extrabold px-2 py-0.5 rounded-full">
                                    Primary Admin
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-[#2c3e57] text-sm">{u.email}</TableCell>
                              <TableCell>
                                <span
                                  className={
                                    u.role === "ADMIN"
                                      ? "bg-[#0f1a2e] text-white text-xs font-bold px-3 py-1 rounded-full"
                                      : "bg-white text-[#2c3e57] text-xs font-bold px-3 py-1 rounded-full border border-[#cbd5e1]"
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
                                  className="bg-[#0f1a2e] text-white hover:bg-[#1a2947] font-bold text-xs rounded-xl shadow-xs disabled:opacity-50"
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
    <div className="rounded-xl border border-white/80 overflow-x-auto bg-white/50">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-[#e2e8f0] bg-white/70">
            <TableHead className="text-[#0f1a2e] font-extrabold uppercase text-xs">Airline & Flight</TableHead>
            <TableHead className="text-[#0f1a2e] font-extrabold uppercase text-xs">Route</TableHead>
            <TableHead className="text-[#0f1a2e] font-extrabold uppercase text-xs">Price</TableHead>
            <TableHead className="text-[#0f1a2e] font-extrabold uppercase text-xs text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flights.length > 0 ? (
            flights.map((f: any) => (
              <TableRow key={f.id || f.flightName} className="border-b border-[#e2e8f0]/60 hover:bg-white/60">
                <TableCell className="font-bold text-[#0f1a2e] text-sm">
                  {f.flightName}
                  <p className="text-[10px] text-[#7c8ba3] font-normal">{f.availableSeats} seats left</p>
                </TableCell>
                <TableCell className="text-[#2c3e57] text-xs font-semibold">
                  {f.from} &rarr; {f.to}
                </TableCell>
                <TableCell className="text-[#0f1a2e] font-bold text-xs">
                  ₹{Number(f.price || 0).toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() => onSelect(f)}
                    className="bg-[#5b9bd5] text-white hover:bg-[#4a86c9] font-bold text-xs rounded-xl shadow-xs"
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-[#3d5170] py-6 text-sm">
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
    <form onSubmit={handlesubmit} className="space-y-3 text-xs">
      <div className="space-y-1">
        <Label className="text-[#2c3e57] font-semibold text-xs">Flight Name / Number</Label>
        <Input
          name="flightName"
          value={formdata.flightName}
          onChange={handlechange}
          placeholder="e.g. IndiGo 6E-204"
          required
          className="bg-white border border-[#cbd5e1] text-[#0f1a2e] rounded-xl h-10 px-3"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-[#2c3e57] font-semibold text-xs">From (Origin)</Label>
          <Input
            name="from"
            value={formdata.from}
            onChange={handlechange}
            placeholder="e.g. New Delhi"
            required
            className="bg-white border border-[#cbd5e1] text-[#0f1a2e] rounded-xl h-10 px-3"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[#2c3e57] font-semibold text-xs">To (Destination)</Label>
          <Input
            name="to"
            value={formdata.to}
            onChange={handlechange}
            placeholder="e.g. Mumbai"
            required
            className="bg-white border border-[#cbd5e1] text-[#0f1a2e] rounded-xl h-10 px-3"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-[#2c3e57] font-semibold text-xs">Price (₹)</Label>
          <Input
            name="price"
            type="number"
            value={formdata.price}
            onChange={handlechange}
            required
            className="bg-white border border-[#cbd5e1] text-[#0f1a2e] rounded-xl h-10 px-3"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[#2c3e57] font-semibold text-xs">Available Seats</Label>
          <Input
            name="availableSeats"
            type="number"
            value={formdata.availableSeats}
            onChange={handlechange}
            required
            className="bg-white border border-[#cbd5e1] text-[#0f1a2e] rounded-xl h-10 px-3"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="bg-[#0f1a2e] text-white hover:bg-[#1a2947] font-bold text-xs rounded-xl h-10 flex-1">
          {flight ? "Save Changes" : "Add Flight"}
        </Button>
        {flight && (
          <Button type="button" onClick={onCancel} variant="outline" className="text-xs font-bold rounded-xl h-10">
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
    <div className="rounded-xl border border-white/80 overflow-x-auto bg-white/50">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-[#e2e8f0] bg-white/70">
            <TableHead className="text-[#0f1a2e] font-extrabold uppercase text-xs">Hotel Name</TableHead>
            <TableHead className="text-[#0f1a2e] font-extrabold uppercase text-xs">Location</TableHead>
            <TableHead className="text-[#0f1a2e] font-extrabold uppercase text-xs">Price / Night</TableHead>
            <TableHead className="text-[#0f1a2e] font-extrabold uppercase text-xs text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hotels.length > 0 ? (
            hotels.map((h: any) => (
              <TableRow key={h.id || h.hotelName} className="border-b border-[#e2e8f0]/60 hover:bg-white/60">
                <TableCell className="font-bold text-[#0f1a2e] text-sm">
                  {h.hotelName}
                  <p className="text-[10px] text-[#7c8ba3] font-normal">★ {h.rating || 4.5} · {h.availableRooms || 10} rooms left</p>
                </TableCell>
                <TableCell className="text-[#2c3e57] text-xs font-semibold">{h.location}</TableCell>
                <TableCell className="text-[#1a6b52] font-extrabold text-xs">
                  ₹{Number(h.pricePerNight || 0).toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() => onSelect(h)}
                    className="bg-[#22c55e] text-white hover:bg-[#16a34a] font-bold text-xs rounded-xl shadow-xs"
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-[#3d5170] py-6 text-sm">
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
    <form onSubmit={handlesubmit} className="space-y-3 text-xs">
      <div className="space-y-1">
        <Label className="text-[#2c3e57] font-semibold text-xs">Hotel Name</Label>
        <Input
          name="hotelName"
          value={formdata.hotelName}
          onChange={handlechange}
          placeholder="e.g. Taj Palace New Delhi"
          required
          className="bg-white border border-[#cbd5e1] text-[#0f1a2e] rounded-xl h-10 px-3"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-[#2c3e57] font-semibold text-xs">City / Location</Label>
        <Input
          name="location"
          value={formdata.location}
          onChange={handlechange}
          placeholder="e.g. New Delhi"
          required
          className="bg-white border border-[#cbd5e1] text-[#0f1a2e] rounded-xl h-10 px-3"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label className="text-[#2c3e57] font-semibold text-xs">Price / Night (₹)</Label>
          <Input
            name="pricePerNight"
            type="number"
            value={formdata.pricePerNight}
            onChange={handlechange}
            required
            className="bg-white border border-[#cbd5e1] text-[#0f1a2e] rounded-xl h-10 px-3"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[#2c3e57] font-semibold text-xs">Rating (1-5)</Label>
          <Input
            name="rating"
            type="number"
            step="0.1"
            max={5}
            min={1}
            value={formdata.rating}
            onChange={handlechange}
            required
            className="bg-white border border-[#cbd5e1] text-[#0f1a2e] rounded-xl h-10 px-3"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[#2c3e57] font-semibold text-xs">Rooms Left</Label>
          <Input
            name="availableRooms"
            type="number"
            value={formdata.availableRooms}
            onChange={handlechange}
            required
            className="bg-white border border-[#cbd5e1] text-[#0f1a2e] rounded-xl h-10 px-3"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="bg-[#0f1a2e] text-white hover:bg-[#1a2947] font-bold text-xs rounded-xl h-10 flex-1">
          {hotel ? "Save Changes" : "Add Hotel"}
        </Button>
        {hotel && (
          <Button type="button" onClick={onCancel} variant="outline" className="text-xs font-bold rounded-xl h-10">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}