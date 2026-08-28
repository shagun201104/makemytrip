"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Check, Info, RefreshCw, Bookmark, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { preferenceEngine, type UserPreferences } from "@/app/lib/preferenceEngine";

export interface Seat {
  id: string; // e.g. "4A"
  row: number;
  col: string; // "A", "B", "C", "D", "E", "F"
  type: "STANDARD" | "LEGROOM" | "BUSINESS" | "EMERGENCY";
  price: number; // surcharge in INR
  status: "AVAILABLE" | "OCCUPIED" | "SELECTED";
  isWindow: boolean;
  isAisle: boolean;
}

interface InteractiveSeatMapProps {
  flightCode?: string;
  onSeatSelect: (seat: Seat | null) => void;
  selectedSeatId?: string | null;
}

export function InteractiveSeatMap({
  flightCode = "6E-204",
  onSeatSelect,
  selectedSeatId: externalSelectedId = null,
}: InteractiveSeatMapProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(
    preferenceEngine.getPreferences()
  );
  const [autoSelectedMessage, setAutoSelectedMessage] = useState<string>("");
  const [isUpdatingRealTime, setIsUpdatingRealTime] = useState<boolean>(false);

  // Generate deterministic seat map for a standard 18-row narrowbody (A320/B737)
  useEffect(() => {
    const cols = ["A", "B", "C", "D", "E", "F"];
    const generated: Seat[] = [];

    // Pre-determine occupied seats deterministically based on flightCode
    const occupiedSet = new Set<string>([
      "1B", "2C", "3D", "4A", "6F", "7C", "9B", "10E", "12A", "14F", "15D"
    ]);

    for (let r = 1; r <= 18; r++) {
      for (const col of cols) {
        const id = `${r}${col}`;
        let type: Seat["type"] = "STANDARD";
        let price = 0;

        if (r <= 2) {
          type = "BUSINESS";
          price = 2500;
        } else if (r === 12 || r === 13) {
          type = "EMERGENCY";
          price = 1200;
        } else if (r <= 5) {
          type = "LEGROOM";
          price = 800;
        }

        const isWin = col === "A" || col === "F";
        const isAisle = col === "C" || col === "D";
        const isOccupied = occupiedSet.has(id);

        generated.push({
          id,
          row: r,
          col,
          type,
          price,
          status: isOccupied ? "OCCUPIED" : id === externalSelectedId ? "SELECTED" : "AVAILABLE",
          isWindow: isWin,
          isAisle: isAisle,
        });
      }
    }
    setSeats(generated);
  }, [flightCode, externalSelectedId]);

  // Real-time updates simulation pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setIsUpdatingRealTime(true);
      setSeats((prev) => {
        if (prev.length === 0) return prev;
        // Randomly pick an unselected non-occupied seat to toggle for live realism
        const available = prev.filter((s) => s.status === "AVAILABLE");
        if (available.length === 0) return prev;
        const randomSeat = available[Math.floor(Math.random() * available.length)];
        
        return prev.map((s) => {
          if (s.id === randomSeat.id) {
            return { ...s, status: "OCCUPIED" };
          }
          return s;
        });
      });
      setTimeout(() => setIsUpdatingRealTime(false), 800);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  // Handle seat click
  const handleSeatClick = (seat: Seat) => {
    if (seat.status === "OCCUPIED") return;

    if (selectedSeat?.id === seat.id) {
      // Deselect
      setSelectedSeat(null);
      onSeatSelect(null);
      setSeats((prev) =>
        prev.map((s) => (s.id === seat.id ? { ...s, status: "AVAILABLE" } : s))
      );
    } else {
      // Select
      const updatedSeat: Seat = { ...seat, status: "SELECTED" };
      setSelectedSeat(updatedSeat);
      onSeatSelect(updatedSeat);
      setSeats((prev) =>
        prev.map((s) => {
          if (s.id === seat.id) return { ...s, status: "SELECTED" };
          if (s.status === "SELECTED") return { ...s, status: "AVAILABLE" };
          return s;
        })
      );
    }
  };

  // Auto-apply saved seat preference
  const applySavedPreference = () => {
    const pref = preferences.seatPreference;
    let match: Seat | undefined;

    if (pref === "WINDOW") {
      match = seats.find((s) => s.status === "AVAILABLE" && s.isWindow);
    } else if (pref === "AISLE") {
      match = seats.find((s) => s.status === "AVAILABLE" && s.isAisle);
    } else if (pref === "EXTRA_LEGROOM") {
      match = seats.find((s) => s.status === "AVAILABLE" && (s.type === "LEGROOM" || s.type === "EMERGENCY"));
    }

    if (!match) {
      match = seats.find((s) => s.status === "AVAILABLE");
    }

    if (match) {
      handleSeatClick(match);
      setAutoSelectedMessage(`Auto-selected seat ${match.id} based on your saved '${pref}' preference!`);
      setTimeout(() => setAutoSelectedMessage(""), 4000);
    }
  };

  // Update saved preference
  const updatePreference = (pref: UserPreferences["seatPreference"]) => {
    const updated = preferenceEngine.savePreferences({ seatPreference: pref });
    setPreferences(updated);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#d5e2f0] p-6 shadow-sm space-y-6">
      {/* Header & Upsell Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#eef2f7] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-[#0f1a2e]">Select Your Seat</h3>
            {isUpdatingRealTime && (
              <span className="flex items-center gap-1 text-[11px] text-[#5b9bd5] bg-[#eaf3fb] px-2 py-0.5 rounded-full animate-pulse font-medium">
                <RefreshCw className="w-3 h-3 animate-spin" /> Live Updates Active
              </span>
            )}
          </div>
          <p className="text-xs text-[#7c8ba3]">Flight {flightCode} · Interactive Airbus A320 Cabin</p>
        </div>

        {/* Saved Preference Action */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={applySavedPreference}
            className="text-xs font-semibold border-[#5b9bd5]/40 text-[#5b9bd5] hover:bg-[#eaf3fb] rounded-full"
          >
            <Bookmark className="w-3.5 h-3.5 mr-1" />
            Auto-apply Pref ({preferences.seatPreference})
          </Button>
        </div>
      </div>

      {autoSelectedMessage && (
        <div className="bg-[#eaf6f0] border border-[#bfe2d2] text-[#2f6b55] text-xs font-medium px-4 py-2.5 rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          {autoSelectedMessage}
        </div>
      )}

      {/* Seat Category Legend & Upselling Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f8fafc] p-3 rounded-xl border border-[#e2e8f0]">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-4 h-4 rounded bg-white border border-[#cbd5e1] inline-block" />
          <div>
            <p className="font-semibold text-[#0f1a2e]">Standard</p>
            <p className="text-[10px] text-[#7c8ba3]">Included (Free)</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-4 h-4 rounded bg-[#fef3c7] border border-[#f59e0b] inline-block" />
          <div>
            <p className="font-semibold text-[#b45309] flex items-center gap-0.5">
              <Sparkles className="w-3 h-3" /> Legroom
            </p>
            <p className="text-[10px] text-[#b45309] font-bold">+₹800</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-4 h-4 rounded bg-[#f3e8ff] border border-[#a855f7] inline-block" />
          <div>
            <p className="font-semibold text-[#7e22ce] flex items-center gap-0.5">
              <Star className="w-3 h-3" /> Business
            </p>
            <p className="text-[10px] text-[#7e22ce] font-bold">+₹2,500</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-4 h-4 rounded bg-[#dcfce7] border border-[#22c55e] inline-block" />
          <div>
            <p className="font-semibold text-[#15803d]">Exit Row</p>
            <p className="text-[10px] text-[#15803d] font-bold">+₹1,200</p>
          </div>
        </div>
      </div>

      {/* Saved Preference Quick Selector */}
      <div className="flex items-center justify-between text-xs bg-[#f1f5f9] px-4 py-2 rounded-xl">
        <span className="text-[#475569] font-medium">Default Seat Preference:</span>
        <div className="flex gap-1.5">
          {(["WINDOW", "AISLE", "EXTRA_LEGROOM"] as const).map((pref) => (
            <button
              key={pref}
              type="button"
              onClick={() => updatePreference(pref)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                preferences.seatPreference === pref
                  ? "bg-[#0f1a2e] text-white shadow-sm"
                  : "bg-white text-[#64748b] hover:text-[#0f1a2e]"
              }`}
            >
              {pref.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Aircraft Cabin Diagram */}
      <div className="relative max-w-md mx-auto bg-[#f8fafc] border-2 border-[#cbd5e1] rounded-3xl p-6 shadow-inner">
        {/* Sleek Aircraft Cockpit Nose Header */}
        <div className="relative w-52 mx-auto mb-6 flex flex-col items-center">
          <div className="w-40 h-14 bg-gradient-to-b from-[#1e3a8a] via-[#0f1a2e] to-[#0f1a2e] text-white rounded-t-full border-t-2 border-x-2 border-[#60a5fa]/60 shadow-lg flex flex-col items-center justify-center text-center px-3 py-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">✈️</span>
              <span className="text-[11px] font-black tracking-widest text-[#60a5fa] uppercase">FRONT / COCKPIT</span>
            </div>
            <span className="text-[9px] text-white/75 font-bold tracking-tight">Flight Deck &amp; Pilots Cabin</span>
          </div>
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent mt-1" />
        </div>

        {/* Row Labels & Cabin Grid */}
        <div className="space-y-2">
          {Array.from({ length: 18 }, (_, i) => i + 1).map((rowNum) => {
            const rowSeats = seats.filter((s) => s.row === rowNum);
            const leftCluster = rowSeats.filter((s) => ["A", "B", "C"].includes(s.col));
            const rightCluster = rowSeats.filter((s) => ["D", "E", "F"].includes(s.col));
            const isExit = rowNum === 12 || rowNum === 13;

            return (
              <div key={rowNum} className="flex items-center justify-between gap-2">
                {/* Left seats A, B, C */}
                <div className="flex gap-1.5">
                  {leftCluster.map((seat) => {
                    const isSelected = selectedSeat?.id === seat.id;
                    const isOcc = seat.status === "OCCUPIED";

                    let bgCls = "bg-white border-[#cbd5e1] text-[#334155] hover:border-[#5b9bd5]";
                    if (isOcc) bgCls = "bg-[#e2e8f0] border-[#cbd5e1] text-[#94a3b8] cursor-not-allowed";
                    else if (isSelected) bgCls = "bg-[#0f1a2e] border-[#0f1a2e] text-white font-bold ring-2 ring-[#5b9bd5]";
                    else if (seat.type === "LEGROOM") bgCls = "bg-[#fef3c7] border-[#f59e0b] text-[#b45309]";
                    else if (seat.type === "BUSINESS") bgCls = "bg-[#f3e8ff] border-[#a855f7] text-[#7e22ce]";
                    else if (seat.type === "EMERGENCY") bgCls = "bg-[#dcfce7] border-[#22c55e] text-[#15803d]";

                    return (
                      <button
                        key={seat.id}
                        type="button"
                        disabled={isOcc}
                        onClick={() => handleSeatClick(seat)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all shadow-xs ${bgCls}`}
                        title={`${seat.id} (${seat.type}) - ${seat.price ? `+₹${seat.price}` : "Free"}`}
                      >
                        {isOcc ? "×" : seat.col}
                      </button>
                    );
                  })}
                </div>

                {/* Aisle & Row Number */}
                <div className="w-8 text-center text-[11px] font-bold text-[#94a3b8]">
                  {isExit ? <span className="text-[#22c55e] text-[9px]">EXIT</span> : rowNum}
                </div>

                {/* Right seats D, E, F */}
                <div className="flex gap-1.5">
                  {rightCluster.map((seat) => {
                    const isSelected = selectedSeat?.id === seat.id;
                    const isOcc = seat.status === "OCCUPIED";

                    let bgCls = "bg-white border-[#cbd5e1] text-[#334155] hover:border-[#5b9bd5]";
                    if (isOcc) bgCls = "bg-[#e2e8f0] border-[#cbd5e1] text-[#94a3b8] cursor-not-allowed";
                    else if (isSelected) bgCls = "bg-[#0f1a2e] border-[#0f1a2e] text-white font-bold ring-2 ring-[#5b9bd5]";
                    else if (seat.type === "LEGROOM") bgCls = "bg-[#fef3c7] border-[#f59e0b] text-[#b45309]";
                    else if (seat.type === "BUSINESS") bgCls = "bg-[#f3e8ff] border-[#a855f7] text-[#7e22ce]";
                    else if (seat.type === "EMERGENCY") bgCls = "bg-[#dcfce7] border-[#22c55e] text-[#15803d]";

                    return (
                      <button
                        key={seat.id}
                        type="button"
                        disabled={isOcc}
                        onClick={() => handleSeatClick(seat)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all shadow-xs ${bgCls}`}
                        title={`${seat.id} (${seat.type}) - ${seat.price ? `+₹${seat.price}` : "Free"}`}
                      >
                        {isOcc ? "×" : seat.col}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Seat Summary Card */}
      {selectedSeat ? (
        <div className="bg-[#f0f7ff] border border-[#b8daff] rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#5b9bd5] font-semibold">Selected Seat</p>
            <p className="text-base font-extrabold text-[#0f1a2e]">
              Seat {selectedSeat.id} · <span className="capitalize">{selectedSeat.type.toLowerCase()}</span>
            </p>
            <p className="text-xs text-[#64748b] mt-0.5">
              {selectedSeat.isWindow ? "Window Seat" : selectedSeat.isAisle ? "Aisle Seat" : "Middle Seat"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#64748b]">Seat Charge</p>
            <p className="text-lg font-bold text-[#0f1a2e]">
              {selectedSeat.price > 0 ? `+₹${selectedSeat.price.toLocaleString("en-IN")}` : "FREE"}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center p-3 text-xs text-[#94a3b8] italic">
          Click any available seat above to select.
        </div>
      )}
    </div>
  );
}
