export type RefundStatus = "pending" | "processing" | "completed";

export interface CancellationRecord {
  id: string;
  bookingId: string;
  bookingType: "FLIGHT" | "HOTEL";
  itemName: string;
  bookingDate: string; // ISO string representing travel/check-in date
  cancelledAt: number; // timestamp
  reason: string;
  originalAmount: number;
  refundPercentage: number;
  refundAmount: number;
  refundStatus: RefundStatus;
  estimatedCompletion: number; // timestamp when refund will be "completed"
}

export const CANCELLATION_REASONS = [
  "Change of travel plans",
  "Found a better deal",
  "Personal emergency",
  "Weather or natural disaster",
  "Health reasons",
  "Visa/documentation issues",
  "Duplicate booking",
  "Other"
];

export const REFUND_POLICIES = [
  "Within 24 hours of reservation: 50% refund",
  "Within 48 hours of reservation: 25% refund",
  "After 48 hours of reservation: 0% refund (non-refundable)",
  "Travel date > 7 days away: 80% refund",
  "Travel date 3-7 days away: 50% refund",
  "Travel date 1-3 days away: 25% refund",
  "Past travel date: 0% refund"
];

export const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const STORAGE_KEY = 'mmt_cancellations_v1';

class CancellationEngine {
  
  /**
   * Calculates the applicable refund based on booking details.
   */
  calculateRefund(booking: {
    bookingId?: string;
    date?: string;
    totalPrice?: number;
    createdDate?: string;
  }): { percentage: number; amount: number; policy: string } {
    const originalAmount = booking?.totalPrice || 0;
    const now = Date.now();
    
    // Default assumption for booking reservation time (if not provided, assume recent < 24h)
    const bookingTime = booking?.createdDate ? new Date(booking.createdDate).getTime() : now;
    const travelDate = booking?.date ? new Date(booking.date.length <= 10 ? `${booking.date}T00:00` : booking.date).getTime() : 0;
    
    const hoursSinceBooking = (now - bookingTime) / (1000 * 60 * 60);
    const daysUntilTravel = travelDate > 0 ? (travelDate - now) / (1000 * 60 * 60 * 24) : 10;
    
    let percentage = 50; // Default policy fallback for reservations within 24 hours
    let policy = "Cancelled within 24 hours of reservation: 50% refund";

    // Rule 1: Past travel date
    if (travelDate > 0 && daysUntilTravel < 0) {
      return { percentage: 0, amount: 0, policy: "Past travel date: 0% refund (Non-refundable)" };
    }

    // Rule 2: Hours since booking
    if (hoursSinceBooking <= 24) {
      percentage = 50;
      policy = "Cancelled within 24 hours of reservation: 50% refund";
    } else if (hoursSinceBooking <= 48) {
      percentage = 25;
      policy = "Cancelled within 48 hours of reservation: 25% refund";
    } else {
      percentage = 0;
      policy = "After 48 hours of reservation: 0% refund";
    }

    // Rule 3: Days until travel (if travel date is provided in future)
    if (travelDate > 0) {
      if (daysUntilTravel > 7) {
        if (80 >= percentage) {
          percentage = 80;
          policy = "Travel date is > 7 days away: 80% refund";
        }
      } else if (daysUntilTravel >= 3 && daysUntilTravel <= 7) {
        if (50 >= percentage) {
          percentage = 50;
          policy = "Travel date is 3-7 days away: 50% refund";
        }
      } else if (daysUntilTravel >= 1 && daysUntilTravel < 3) {
        if (25 >= percentage) {
          percentage = 25;
          policy = "Travel date is 1-3 days away: 25% refund";
        }
      }
    }

    const amount = Math.floor(originalAmount * (percentage / 100));
    return { percentage, amount, policy };
  }

  /**
   * Helper to get human policy description for a booking
   */
  getPolicyFor(booking: any): { description: string; percentage: number } {
    const calc = this.calculateRefund(booking);
    return {
      description: calc.policy,
      percentage: calc.percentage,
    };
  }

  /**
   * Cancels a booking and saves record to localStorage
   */
  cancelBooking(bookingOrId: any, reason: string): CancellationRecord {
    const booking = typeof bookingOrId === "string" ? { bookingId: bookingOrId } : bookingOrId;
    const calc = this.calculateRefund(booking);
    const now = Date.now();
    const estimatedCompletion = now + 5 * 60 * 1000; // 5 minutes simulation timeline

    const record: CancellationRecord = {
      id: `CANCEL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      bookingId: booking.bookingId || `MMT-${Date.now()}`,
      bookingType: booking.type || "FLIGHT",
      itemName: booking.itemName || "Travel Booking",
      bookingDate: booking.date || new Date().toISOString().split("T")[0],
      cancelledAt: now,
      reason: reason || "Change of travel plans",
      originalAmount: booking.totalPrice || 0,
      refundPercentage: calc.percentage,
      refundAmount: calc.amount,
      refundStatus: "pending",
      estimatedCompletion,
    };

    const records = this.getCancellations();
    records.unshift(record);
    this._saveCancellations(records);

    return record;
  }

  /**
   * Retrieves all cancellation records from localStorage
   */
  getCancellations(): CancellationRecord[] {
    if (typeof window === "undefined") return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const records: CancellationRecord[] = JSON.parse(stored);
      return records.map(record => ({
        ...record,
        refundStatus: this.getRefundStatus(record)
      }));
    } catch (e) {
      console.error("Failed to parse cancellations from localStorage", e);
      return [];
    }
  }

  getAllCancellations(): CancellationRecord[] {
    return this.getCancellations();
  }

  getCancellation(id: string): CancellationRecord | undefined {
    const records = this.getCancellations();
    return records.find(r => r.id === id || r.bookingId === id);
  }

  getRefundStatus(record: CancellationRecord): RefundStatus {
    const now = Date.now();
    const minutesSinceCancel = (now - record.cancelledAt) / (1000 * 60);
    
    if (minutesSinceCancel >= 5) {
      return "completed";
    } else if (minutesSinceCancel >= 2) {
      return "processing";
    } else {
      return "pending";
    }
  }

  isCancelled(bookingId: string): boolean {
    if (!bookingId) return false;
    const records = this.getCancellations();
    return records.some(r => r.bookingId === bookingId);
  }

  private _saveCancellations(records: CancellationRecord[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }
  }
}

export const cancellationEngine = new CancellationEngine();

