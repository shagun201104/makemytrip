"use client";

import React, { useState, useEffect } from "react";
import {
  XCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Hourglass,
  Ban,
  RefreshCw,
  Info
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cancellationEngine, CANCELLATION_REASONS, type CancellationRecord } from "@/app/lib/cancellationEngine";

export function CancelBookingButton({
  booking,
  onCancelled
}: {
  booking: any;
  onCancelled: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-[#9c3535] border-[#f2bcbc] hover:bg-[#fdeaea]"
        onClick={() => setOpen(true)}
      >
        <Ban className="w-3.5 h-3.5 mr-1.5" />
        Cancel Booking
      </Button>
      
      <CancellationDialog
        booking={booking}
        open={open}
        onOpenChange={setOpen}
        onCancelled={onCancelled}
      />
    </>
  );
}

export function CancellationDialog({
  booking,
  open,
  onOpenChange,
  onCancelled,
}: {
  booking: any;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCancelled: () => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [reason, setReason] = useState<string>("");
  const [isCancelling, setIsCancelling] = useState(false);

  // Safety fallback if no booking is provided yet
  if (!booking) return null;

  const policy = cancellationEngine.getPolicyFor(booking);
  const refundCalc = cancellationEngine.calculateRefund(booking);
  const refundAmount = refundCalc.amount;

  const handleConfirm = async () => {
    if (!reason) return;
    setIsCancelling(true);
    try {
      cancellationEngine.cancelBooking(booking, reason);
      setStep(2);
      onCancelled();
    } catch (err) {
      console.error("Failed to cancel booking:", err);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    if (step === 2) {
      setTimeout(() => setStep(1), 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        <DialogHeader 
          className={`px-6 pt-6 pb-5 text-left ${
            step === 1 
              ? "bg-gradient-to-br from-[#fdf1e6] to-[#f4d3b0]" 
              : "bg-gradient-to-br from-[#eaf6f0] to-[#bfe2d2]"
          }`}
        >
          <DialogTitle className="text-xl font-bold text-[#0f1a2e] flex items-center gap-2">
            {step === 1 ? (
              <>
                <AlertTriangle className="w-5 h-5 text-[#8a5a30]" />
                Cancel Booking
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-[#2f6b55]" />
                Cancellation Confirmed
              </>
            )}
          </DialogTitle>
          <DialogDescription className={step === 1 ? "text-[#8a5a30]/80" : "text-[#2f6b55]/80"}>
            {step === 1 
              ? "Review your refund details before confirming." 
              : "Your booking has been cancelled successfully."}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5">
          {step === 1 ? (
            <div className="space-y-5">
              <div className="bg-[#f9fbfe] rounded-xl p-4 border border-[#e4ecf6]">
                <h4 className="text-sm font-bold text-[#0f1a2e] mb-1">{booking.itemName}</h4>
                <p className="text-xs text-[#7c8ba3]">Date: {booking.date || "N/A"} · ID: {booking.bookingId}</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-[#9aa8bd] uppercase tracking-wide">Total Paid</p>
                  <p className="text-lg font-bold text-[#0f1a2e]">
                    ₹{booking.totalPrice?.toLocaleString() ?? 0}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold text-[#2f8f6b] uppercase tracking-wide">Estimated Refund ({refundCalc.percentage}%)</p>
                  <p className="text-2xl font-bold text-[#2f8f6b]">
                    ₹{refundAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-[#bcd9f2] bg-[#eef4fb] p-3 flex gap-3">
                <Info className="w-4 h-4 text-[#5b9bd5] shrink-0 mt-0.5" />
                <p className="text-xs text-[#5b6b82] leading-snug">
                  {policy?.description || "Cancellation rules apply based on the standard policy."}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1a3a6b] mb-1.5 block">Cancellation Reason (Required)</label>
                <select 
                  className="w-full text-sm border border-[#d5e2f0] rounded-xl px-3 py-2.5 outline-none focus:border-[#5b9bd5] bg-white text-[#0f1a2e]"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option value="" disabled>Select a reason</option>
                  {CANCELLATION_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <Button 
                onClick={handleConfirm} 
                disabled={!reason || isCancelling}
                className="w-full h-11 rounded-xl bg-[#0f1a2e] text-white hover:bg-[#1c3454] font-bold"
              >
                {isCancelling ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                Confirm Cancellation
              </Button>
            </div>
          ) : (
            <div className="space-y-5 text-center">
              <div className="mx-auto w-12 h-12 bg-[#eaf6f0] text-[#2f6b55] rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm text-[#5b6b82]">
                We've initiated a refund of <strong className="text-[#0f1a2e]">₹{refundAmount.toLocaleString()}</strong> to your original payment method.
              </p>
              
              <div className="bg-[#f9fbfe] border border-[#e4ecf6] rounded-xl p-4 text-left">
                <p className="text-xs font-bold text-[#1a3a6b] mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#5b9bd5]" />
                  Timeline
                </p>
                <div className="text-xs text-[#7c8ba3] space-y-2">
                  <div className="flex justify-between">
                    <span>Cancellation Request</span>
                    <span className="text-[#0f1a2e] font-semibold">Immediate</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Refund Processing</span>
                    <span className="text-[#0f1a2e] font-semibold">In Progress (2-5 mins)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Completion</span>
                    <span className="text-[#0f1a2e] font-semibold">Within 5 Minutes</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleClose} 
                variant="outline" 
                className="w-full rounded-xl h-11 font-bold text-[#0f1a2e]"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function RefundTracker({ cancellation }: { cancellation: CancellationRecord }) {
  const status = cancellation.refundStatus || "pending";
  
  const steps = ["pending", "processing", "completed"];
  const currentStep = steps.indexOf(status) !== -1 ? steps.indexOf(status) : 0;

  const colorCls = status === "completed" 
    ? "text-[#2f6b55] bg-[#eaf6f0] border-[#bfe2d2]" 
    : status === "processing" 
    ? "text-[#2f6bb3] bg-[#eef4fb] border-[#bcd9f2]" 
    : "text-[#8a5a30] bg-[#fdf1e6] border-[#f4d3b0]";

  const now = Date.now();
  const secondsLeft = Math.max(0, Math.ceil((cancellation.estimatedCompletion - now) / 1000));
  const minsLeft = Math.ceil(secondsLeft / 60);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${colorCls} capitalize flex items-center gap-1`}>
          {status === "completed" ? <CheckCircle2 className="w-3.5 h-3.5 text-[#2f6b55]" /> : <Hourglass className="w-3.5 h-3.5 animate-spin" />}
          Status: {status}
        </span>
        {status !== "completed" && minsLeft > 0 && (
          <span className="text-[11px] text-[#7c8ba3]">
            Est. ~{minsLeft} min left
          </span>
        )}
      </div>
      
      <div className="relative h-2 bg-[#e4ecf6] rounded-full overflow-hidden">
        <div 
          className={`absolute top-0 left-0 h-full transition-all duration-500 rounded-full ${
            status === "completed" ? "bg-[#2f8f6b] w-full" : 
            status === "processing" ? "bg-[#5b9bd5] w-2/3" : 
            "bg-[#d97706] w-1/3"
          }`}
        />
      </div>
      <div className="flex justify-between text-[10px] font-semibold text-[#9aa8bd]">
        <span className={currentStep >= 0 ? "text-[#0f1a2e]" : ""}>Pending</span>
        <span className={currentStep >= 1 ? "text-[#0f1a2e]" : ""}>Processing</span>
        <span className={currentStep >= 2 ? "text-[#2f6b55] font-bold" : ""}>Completed</span>
      </div>
    </div>
  );
}

export function CancellationsPanel() {
  const [cancellations, setCancellations] = useState<CancellationRecord[]>([]);

  useEffect(() => {
    const fetchCancellations = () => {
      setCancellations(cancellationEngine.getAllCancellations());
    };

    fetchCancellations();

    const interval = setInterval(fetchCancellations, 1000);
    return () => clearInterval(interval);
  }, []);

  if (cancellations.length === 0) {
    return (
      <div className="rounded-2xl border border-[#d5e2f0] bg-white p-8 text-center shadow-sm">
        <Ban className="w-8 h-8 text-[#9aa8bd] mx-auto mb-3" />
        <h3 className="text-sm font-bold text-[#0f1a2e]">No Cancellations</h3>
        <p className="text-xs text-[#7c8ba3] mt-1">You have no cancelled bookings at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-[#0f1a2e]">Cancelled Bookings & Refund Status</h3>
      {cancellations.map((c) => (
        <div key={c.id || c.bookingId} className="rounded-2xl border border-[#d5e2f0] bg-white shadow-sm overflow-hidden flex flex-col md:flex-row">
          <div className="p-4 border-b md:border-b-0 md:border-r border-[#e4ecf6] flex-1 bg-[#f9fbfe]">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#0f1a2e] mb-1">{c.itemName}</h4>
              <span className="text-[10px] font-bold bg-[#eef4fb] text-[#5b9bd5] px-2 py-0.5 rounded-full border border-[#bcd9f2]">
                {c.bookingType}
              </span>
            </div>
            <p className="text-xs text-[#7c8ba3]">
              ID: {c.bookingId} · Cancelled on {new Date(c.cancelledAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] font-bold text-[#9aa8bd] uppercase">Original Paid</p>
                <p className="text-xs font-semibold text-[#0f1a2e]">₹{c.originalAmount?.toLocaleString() ?? 0}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#9aa8bd] uppercase">Refund ({c.refundPercentage}%)</p>
                <p className="text-sm font-bold text-[#2f8f6b]">₹{c.refundAmount?.toLocaleString() ?? 0}</p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <p className="text-[10px] font-bold text-[#9aa8bd] uppercase">Reason</p>
                <p className="text-xs font-medium text-[#5b6b82] truncate">{c.reason}</p>
              </div>
            </div>
          </div>
          <div className="p-4 md:w-64 shrink-0 flex flex-col justify-center bg-white">
            <RefundTracker cancellation={c} />
          </div>
        </div>
      ))}
    </div>
  );
}

