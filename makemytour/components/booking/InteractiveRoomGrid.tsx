"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Bed,
  Layers,
  Compass,
  Check,
  Eye,
  Maximize2,
  Image as ImageIcon,
  RotateCcw,
  VolumeX,
  Bookmark,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { preferenceEngine, type UserPreferences } from "@/app/lib/preferenceEngine";

export interface HotelRoomOption {
  id: string;
  name: string;
  badge?: string;
  upsellTag?: string;
  extraPricePerNight: number; // 0 for base
  sizeSqFt: number;
  bedType: string;
  features: string[];
  availableCount: number;
  images: string[];
  preview3DColor: string;
}

const ROOM_OPTIONS: HotelRoomOption[] = [
  {
    id: "deluxe-room",
    name: "Deluxe City View Room",
    extraPricePerNight: 0,
    sizeSqFt: 340,
    bedType: "King or Twin Bed",
    features: ["Free High-Speed Wi-Fi", "Walk-in Rain Shower", "43\" Smart TV", "City Skyline View"],
    availableCount: 4,
    images: [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    ],
    preview3DColor: "#3b82f6",
  },
  {
    id: "premier-ocean-suite",
    name: "Premier Ocean View Suite",
    badge: "Most Popular Upgrade",
    upsellTag: "Save 25% Upgrade Offer",
    extraPricePerNight: 2500,
    sizeSqFt: 520,
    bedType: "King Bed",
    features: ["Private Balcony with Panoramic Sea View", "Marble Bathroom & Soaking Tub", "Complimentary Breakfast", "Executive Lounge Access"],
    availableCount: 2,
    images: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80",
    ],
    preview3DColor: "#0ea5e9",
  },
  {
    id: "presidential-villa",
    name: "Presidential Luxury Villa & Plunge Pool",
    badge: "Ultimate Luxury",
    upsellTag: "VIP Concierge Included",
    extraPricePerNight: 6500,
    sizeSqFt: 980,
    bedType: "Super King Bed",
    features: ["Private Heated Plunge Pool", "24/7 Butler Service", "Private Terrace & Jacuzzi", "Airport Luxury Transfer"],
    availableCount: 1,
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80",
    ],
    preview3DColor: "#8b5cf6",
  },
];

interface InteractiveRoomGridProps {
  hotelName?: string;
  basePricePerNight: number;
  onSelectRoom: (room: HotelRoomOption) => void;
  selectedRoomId?: string;
}

export function InteractiveRoomGrid({
  hotelName = "Taj Palace",
  basePricePerNight,
  onSelectRoom,
  selectedRoomId = "deluxe-room",
}: InteractiveRoomGridProps) {
  const [selectedRoom, setSelectedRoom] = useState<HotelRoomOption>(
    ROOM_OPTIONS.find((r) => r.id === selectedRoomId) || ROOM_OPTIONS[0]
  );
  const [active3DModalRoom, setActive3DModalRoom] = useState<HotelRoomOption | null>(null);
  const [activeGalleryRoom, setActiveGalleryRoom] = useState<HotelRoomOption | null>(null);
  const [galleryIndex, setGalleryIndex] = useState<number>(0);

  // User preferences
  const [prefs, setPrefs] = useState<UserPreferences>(preferenceEngine.getPreferences());

  const handleRoomClick = (room: HotelRoomOption) => {
    setSelectedRoom(room);
    onSelectRoom(room);
  };

  const toggleRoomPreference = (key: keyof UserPreferences["roomPreferences"]) => {
    const updatedRoomPrefs = {
      ...prefs.roomPreferences,
      [key]: !prefs.roomPreferences[key],
    };
    const updated = preferenceEngine.savePreferences({ roomPreferences: updatedRoomPrefs });
    setPrefs(updated);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#d5e2f0] p-6 shadow-sm space-y-6">
      {/* Header & Preferences Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#eef2f7] pb-4">
        <div>
          <h3 className="text-lg font-bold text-[#0f1a2e]">Select Your Room Type</h3>
          <p className="text-xs text-[#7c8ba3]">
            {hotelName} · Includes High-Definition Visual Aids & 3D Previews
          </p>
        </div>

        {/* Preference Saving Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#f8fafc] p-2 rounded-xl border border-[#e2e8f0]">
          <span className="text-[11px] font-bold text-[#64748b] mr-1 flex items-center gap-1">
            <Bookmark className="w-3.5 h-3.5 text-[#5b9bd5]" /> Saved Room Prefs:
          </span>
          {[
            { key: "highFloor", label: "High Floor" },
            { key: "oceanView", label: "Ocean View" },
            { key: "quietRoom", label: "Quiet Room" },
            { key: "nonSmoking", label: "Non-Smoking" },
          ].map(({ key, label }) => {
            const isActive = prefs.roomPreferences[key as keyof UserPreferences["roomPreferences"]];
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleRoomPreference(key as keyof UserPreferences["roomPreferences"])}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  isActive
                    ? "bg-[#5b9bd5] text-white shadow-xs"
                    : "bg-white text-[#94a3b8] border border-[#e2e8f0]"
                }`}
              >
                {isActive ? "✓ " : ""}{label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Room Grid Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {ROOM_OPTIONS.map((room) => {
          const isSelected = selectedRoom.id === room.id;
          const totalPrice = basePricePerNight + room.extraPricePerNight;

          return (
            <div
              key={room.id}
              className={`rounded-2xl border-2 transition-all flex flex-col justify-between overflow-hidden bg-white ${
                isSelected
                  ? "border-[#0f1a2e] ring-2 ring-[#5b9bd5]/30 shadow-md"
                  : "border-[#e2e8f0] hover:border-[#cbd5e1] shadow-xs"
              }`}
            >
              <div>
                {/* Room Image Banner with Gallery & 3D buttons */}
                <div className="relative h-44 w-full bg-[#cbd5e1] overflow-hidden group">
                  <img
                    src={room.images[0]}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Badges */}
                  {room.badge && (
                    <span className="absolute top-3 left-3 bg-[#0f1a2e] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#f59e0b]" /> {room.badge}
                    </span>
                  )}

                  {/* 3D Preview & Gallery Action Overlay Buttons */}
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveGalleryRoom(room);
                        setGalleryIndex(0);
                      }}
                      className="bg-black/60 hover:bg-black/80 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg backdrop-blur-sm transition-all flex items-center gap-1"
                    >
                      <ImageIcon className="w-3.5 h-3.5" /> Gallery ({room.images.length})
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActive3DModalRoom(room);
                      }}
                      className="bg-[#5b9bd5] hover:bg-[#4a86c9] text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> 3D Tour
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h4 className="font-bold text-base text-[#0f1a2e]">{room.name}</h4>
                    <p className="text-xs text-[#7c8ba3] mt-0.5">
                      {room.sizeSqFt} sq. ft. · {room.bedType}
                    </p>
                  </div>

                  {/* Upsell tag callout */}
                  {room.upsellTag && (
                    <div className="bg-[#fef3c7] border border-[#fde68a] text-[#b45309] text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      {room.upsellTag}
                    </div>
                  )}

                  {/* Features List */}
                  <ul className="space-y-1.5 text-xs text-[#475569]">
                    {room.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Price & Selection Button */}
              <div className="p-5 pt-0 border-t border-[#f1f5f9] mt-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-[#7c8ba3] font-bold uppercase">Price per night</p>
                  <p className="text-lg font-extrabold text-[#0f1a2e]">
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </p>
                  {room.extraPricePerNight > 0 && (
                    <p className="text-[10px] text-[#5b9bd5] font-semibold">
                      +₹{room.extraPricePerNight.toLocaleString("en-IN")} upgrade
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={() => handleRoomClick(room)}
                  className={`rounded-full px-5 text-xs font-bold ${
                    isSelected
                      ? "bg-[#0f1a2e] text-white hover:bg-[#1a2947]"
                      : "bg-[#eaf3fb] text-[#5b9bd5] hover:bg-[#5b9bd5] hover:text-white"
                  }`}
                >
                  {isSelected ? "Selected" : "Select Room"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive 3D Room Virtual Tour Modal */}
      <Dialog
        open={Boolean(active3DModalRoom)}
        onOpenChange={(open) => !open && setActive3DModalRoom(null)}
      >
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
          <DialogHeader className="bg-[#0f1a2e] text-white px-6 pt-6 pb-5 text-left">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#5b9bd5]" />
              Interactive 3D Virtual Tour — {active3DModalRoom?.name}
            </DialogTitle>
            <DialogDescription className="text-white/70 text-xs">
              Drag to pan 360° around the room interior and preview amenities in real-time 3D.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 bg-[#090d16] text-white flex flex-col items-center space-y-4">
            <Interactive3DCanvas color={active3DModalRoom?.preview3DColor || "#3b82f6"} />
            <div className="flex items-center gap-4 text-xs text-white/60">
              <span className="flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5 text-[#5b9bd5]" /> Interactive 360 Rotation
              </span>
              <span className="flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5 text-[#5b9bd5]" /> High Resolution Rendering
              </span>
            </div>
            <Button
              type="button"
              onClick={() => {
                if (active3DModalRoom) handleRoomClick(active3DModalRoom);
                setActive3DModalRoom(null);
              }}
              className="bg-[#5b9bd5] text-white hover:bg-[#4a86c9] rounded-full px-8 font-bold text-xs h-10 mt-2"
            >
              Select {active3DModalRoom?.name}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Gallery Modal */}
      <Dialog
        open={Boolean(activeGalleryRoom)}
        onOpenChange={(open) => !open && setActiveGalleryRoom(null)}
      >
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
          <DialogHeader className="bg-[#0f1a2e] text-white px-6 pt-6 pb-5 text-left">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#5b9bd5]" />
              Photo Gallery — {activeGalleryRoom?.name}
            </DialogTitle>
          </DialogHeader>

          {activeGalleryRoom && (
            <div className="p-6 bg-[#0f1a2e] space-y-4">
              <div className="relative h-80 w-full rounded-xl overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={activeGalleryRoom.images[galleryIndex]}
                  alt="Gallery"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="flex justify-center gap-3">
                {activeGalleryRoom.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setGalleryIndex(idx)}
                    className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                      galleryIndex === idx ? "border-[#5b9bd5] scale-105" : "border-transparent opacity-60"
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 3D Preview Canvas Component
function Interactive3DCanvas({ color }: { color: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render simulated 3D wireframe room cube
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const size = 90;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.fillStyle = "rgba(15, 26, 46, 0.6)";

      // Rotate points
      const rad = (angle * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      // Room outline
      ctx.beginPath();
      ctx.arc(cx, cy, 140, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(91, 155, 213, 0.2)";
      ctx.stroke();

      // Bed 3D Box
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rad);

      ctx.fillStyle = color;
      ctx.globalAlpha = 0.3;
      ctx.fillRect(-size / 1.5, -size / 2, size * 1.3, size);

      ctx.strokeStyle = color;
      ctx.globalAlpha = 1.0;
      ctx.strokeRect(-size / 1.5, -size / 2, size * 1.3, size);

      // Pillows
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(-size / 1.4, -size / 2.3, size / 3, size / 3);
      ctx.fillRect(-size / 1.4, +size / 8, size / 3, size / 3);

      ctx.restore();

      // Text label inside 3D environment
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("3D Interior View (360° Rotating)", cx, cy + 130);

      setAngle((prev) => (prev + 0.8) % 360);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [angle, color]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={300}
      className="bg-[#0f1a2e] rounded-xl border border-white/10 cursor-grab active:cursor-grabbing"
    />
  );
}
