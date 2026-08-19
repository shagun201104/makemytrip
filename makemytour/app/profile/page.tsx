"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "@/app/userSlice";
import { getUserBookings, updateProfile } from "@/app/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User as UserIcon,
  Mail,
  Phone,
  Pencil,
  LogOut,
  Plane,
  Building2,
  CalendarDays,
  MapPin,
  CreditCard,
  IndianRupee,
  Check,
  X,
  Ticket,
} from "lucide-react";
import { CancelBookingButton, CancellationsPanel } from "@/components/cancellation/CancellationDialog";
import { cancellationEngine } from "@/app/lib/cancellationEngine";

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

// Show a clean date, or a friendly fallback for missing/invalid values.
const formatBookingDate = (dateStr?: string) => {
  if (!dateStr) return "Date not available";
  const d = new Date(dateStr.length <= 10 ? `${dateStr}T00:00` : dateStr);
  if (isNaN(d.getTime())) return "Date not available";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

interface Booking {
  type?: string;
  bookingId?: string;
  itemId?: string;
  itemName?: string;
  date?: string;
  quantity?: number;
  totalPrice?: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.user);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ firstname: "", lastname: "", phoneNumber: "" });
  const [cancelVer, setCancelVer] = useState(0); // bump to re-render after cancellation

  const userId = user?.id || user?._id;

  // Load the user's bookings once we know who they are.
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      try {
        const data = await getUserBookings(userId);
        if (active) setBookings(Array.isArray(data) ? data : []);
      } catch {
        if (active) setBookings([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  const startEdit = () => {
    setForm({
      firstname: user?.firstname || "",
      lastname: user?.lastname || "",
      phoneNumber: user?.phoneNumber || "",
    });
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!userId) return;
    try {
      setSaving(true);
      const updated = await updateProfile(userId, form);
      const merged = { ...user, ...updated };
      dispatch(setUser(merged));
      localStorage.setItem("user", JSON.stringify(merged));
      setEditing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    dispatch(clearUser());
    localStorage.removeItem("user");
    router.push("/");
  };

  // Not logged in.
  if (!user) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-[#eef2f7] p-10 text-center max-w-md">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#eaf3fb]">
              <UserIcon className="w-8 h-8 text-[#5b9bd5]" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0f1a2e]">You&apos;re not signed in</h1>
          <p className="text-[#3d5170] mt-2">Please log in to view your profile and bookings.</p>
          <Button
            onClick={() => router.push("/")}
            className="mt-6 bg-[#0f1a2e] text-white hover:bg-[#1a2947] font-semibold rounded-full px-8 h-11"
          >
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  const fullName = `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Traveller";

  return (
    <div className="min-h-screen bg-[#f4f7fb] px-4 md:px-6 py-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
        {/* ============ PROFILE CARD ============ */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#eef2f7] p-6 lg:sticky lg:top-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold text-[#0f1a2e]">Profile</h1>
            {!editing ? (
              <button
                onClick={startEdit}
                className="flex items-center gap-1.5 text-[#e5573f] hover:text-[#c8462f] text-sm font-semibold transition-colors"
              >
                <Pencil className="w-4 h-4" /> Edit
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="flex items-center gap-1 text-[#1f8a4c] hover:text-[#166b3a] text-sm font-semibold disabled:opacity-60"
                >
                  <Check className="w-4 h-4" /> {saving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-1 text-[#7c8ba3] hover:text-[#0f1a2e] text-sm font-semibold"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            )}
          </div>

          {!editing ? (
            <div className="mt-6 space-y-5">
              <div className="flex items-center gap-3 text-[#0f1a2e]">
                <UserIcon className="w-5 h-5 text-[#7c8ba3] shrink-0" />
                <span className="font-medium">{fullName}</span>
              </div>
              <div className="flex items-center gap-3 text-[#0f1a2e]">
                <Mail className="w-5 h-5 text-[#7c8ba3] shrink-0" />
                <span className="font-medium break-all">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-[#0f1a2e]">
                <Phone className="w-5 h-5 text-[#7c8ba3] shrink-0" />
                <span className="font-medium">{user.phoneNumber || "—"}</span>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 text-[#e5573f] hover:text-white hover:bg-[#e5573f] border border-[#f3d3cc] rounded-full py-2.5 font-semibold transition-all"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[#2c3e57] text-sm font-medium">First Name</Label>
                  <Input
                    value={form.firstname}
                    onChange={(e) => setForm({ ...form, firstname: e.target.value })}
                    className="bg-white border border-[#d5e2f0] rounded-lg h-11 px-3 focus-visible:ring-2 focus-visible:ring-[#5b9bd5]/40"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#2c3e57] text-sm font-medium">Last Name</Label>
                  <Input
                    value={form.lastname}
                    onChange={(e) => setForm({ ...form, lastname: e.target.value })}
                    className="bg-white border border-[#d5e2f0] rounded-lg h-11 px-3 focus-visible:ring-2 focus-visible:ring-[#5b9bd5]/40"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[#2c3e57] text-sm font-medium">Email</Label>
                <Input
                  value={user.email}
                  disabled
                  className="bg-[#f4f7fb] border border-[#e2e8f0] rounded-lg h-11 px-3 text-[#7c8ba3]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[#2c3e57] text-sm font-medium">Phone Number</Label>
                <Input
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  className="bg-white border border-[#d5e2f0] rounded-lg h-11 px-3 focus-visible:ring-2 focus-visible:ring-[#5b9bd5]/40"
                />
              </div>
            </div>
          )}
        </div>

        {/* ============ MY BOOKINGS ============ */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#eef2f7] p-6 md:p-7">
          <h2 className="text-2xl font-extrabold text-[#0f1a2e] mb-5">My Bookings</h2>

          {loading ? (
            <div className="space-y-4">
              {[0, 1].map((i) => (
                <div key={i} className="h-24 rounded-xl bg-[#f4f7fb] animate-pulse" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#eaf3fb]">
                  <Ticket className="w-8 h-8 text-[#5b9bd5]" />
                </div>
              </div>
              <p className="text-lg font-bold text-[#0f1a2e]">No bookings yet</p>
              <p className="text-[#7c8ba3] mt-1">
                Your flight and hotel bookings will appear here.
              </p>
              <Button
                onClick={() => router.push("/")}
                className="mt-6 bg-[#0f1a2e] text-white hover:bg-[#1a2947] font-semibold rounded-full px-8 h-11"
              >
                Start Booking
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b, idx) => {
                const isFlight = (b.type || "").toUpperCase() === "FLIGHT";
                const Icon = isFlight ? Plane : Building2;
                const title = b.itemName || (isFlight ? "Flight" : "Hotel");
                return (
                  <div
                    key={b.bookingId || idx}
                    className="rounded-xl border border-[#eef2f7] hover:border-[#d5e2f0] hover:shadow-md transition-all p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${
                            isFlight ? "bg-[#eaf3fb]" : "bg-[#e6f4ea]"
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 ${
                              isFlight ? "text-[#5b9bd5]" : "text-[#1f8a4c]"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-bold text-[#0f1a2e]">{title}</p>
                          <p className="text-xs text-[#7c8ba3] mt-0.5 break-all">
                            Booking ID: {b.bookingId || "—"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="flex items-center justify-end font-extrabold text-[#0f1a2e]">
                          <IndianRupee className="w-4 h-4" />
                          {(b.totalPrice || 0).toLocaleString("en-IN")}
                        </p>
                        <p className="text-xs text-[#7c8ba3] mt-0.5">
                          {isFlight ? "Flight" : "Hotel"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-sm text-[#5c6675]">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4 text-[#9aa8bd]" />
                        {formatBookingDate(b.date)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#9aa8bd]" />
                        {isFlight ? "Flight" : "Hotel"}
                      </span>
                      {cancellationEngine.isCancelled(b.bookingId || "") ? (
                        <span className="flex items-center gap-1.5 text-[#e5573f] font-medium">
                          <X className="w-4 h-4" /> Cancelled
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-[#1f8a4c] font-medium">
                          <CreditCard className="w-4 h-4" /> Paid
                        </span>
                      )}
                    </div>

                    {/* Cancel button — only show if not already cancelled */}
                    {!cancellationEngine.isCancelled(b.bookingId || "") && (
                      <div className="mt-3 flex justify-end">
                        <CancelBookingButton
                          booking={{
                            bookingId: b.bookingId || "",
                            type: (b.type || "FLIGHT") as "FLIGHT" | "HOTEL",
                            itemName: b.itemName || "Booking",
                            date: b.date || "",
                            totalPrice: b.totalPrice || 0,
                          }}
                          onCancelled={() => setCancelVer((v) => v + 1)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ============ CANCELLATIONS & REFUND TRACKER ============ */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-[#eef2f7] p-6 md:p-7">
          <CancellationsPanel />
        </div>
      </div>
    </div>
  );
}
