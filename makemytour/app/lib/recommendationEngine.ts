export interface RecommendationItem {
  id: string;
  kind: "HOTEL" | "FLIGHT" | "DESTINATION";
  title: string;
  subtitle: string;
  location: string;
  category: "BEACH" | "HERITAGE" | "LUXURY" | "MOUNTAIN" | "CITY";
  price: number;
  rating: number;
  matchScore: number; // percentage e.g. 96
  reason: string; // "You liked beaches! Try Bali."
  detailedExplanation: string; // Explains algorithmic reasoning for transparency
  imageUrl: string;
}

export interface RecommendationFeedback {
  recommendationId: string;
  feedback: "HELPFUL" | "IRRELEVANT";
  timestamp: number;
}

const STORAGE_KEY = "mmt_recommendation_feedback_v1";

const RECOMMENDATION_CATALOG: RecommendationItem[] = [
  {
    id: "rec-bali-beach",
    kind: "DESTINATION",
    title: "Bali Tropical Beach Escape",
    subtitle: "Flight + Luxury Villa Package",
    location: "Bali, Indonesia",
    category: "BEACH",
    price: 34999,
    rating: 4.9,
    matchScore: 96,
    reason: "You liked beaches! Try Bali.",
    detailedExplanation: "Based on your 5-star review of coastal hotels in Goa and your preference for ocean views (85% category weight match).",
    imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "rec-taj-lake",
    kind: "HOTEL",
    title: "Taj Lake Palace",
    subtitle: "Heritage Royal Suite",
    location: "Udaipur, Rajasthan",
    category: "HERITAGE",
    price: 18500,
    rating: 4.9,
    matchScore: 92,
    reason: "Recommended based on luxury hotel searches.",
    detailedExplanation: "Collaborative filtering: 89% of travelers who booked Taj Palace Delhi also booked Taj Lake Palace Udaipur within 30 days.",
    imageUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "rec-flight-goa",
    kind: "FLIGHT",
    title: "Non-stop Morning Flight to Goa",
    subtitle: "IndiGo A320neo · Extra Legroom Available",
    location: "New Delhi → Goa",
    category: "BEACH",
    price: 4999,
    rating: 4.8,
    matchScore: 89,
    reason: "Frequently paired with your beach preferences.",
    detailedExplanation: "Matched with your saved 'Window Seat' & 'Morning Departures' preference vector.",
    imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "rec-swiss-alps",
    kind: "DESTINATION",
    title: "Swiss Alps Mountain Resort",
    subtitle: "Scenic Train & Chalet Experience",
    location: "Interlaken, Switzerland",
    category: "MOUNTAIN",
    price: 68900,
    rating: 4.95,
    matchScore: 85,
    reason: "Popular among travelers with high review scores.",
    detailedExplanation: "Content-based match: High satisfaction index for quiet rooms and scenic balconies.",
    imageUrl: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80",
  },
];

class RecommendationEngine {
  getRecommendations(): RecommendationItem[] {
    const feedbacks = this.getFeedbackHistory();
    const irrelevantIds = new Set(
      feedbacks.filter((f) => f.feedback === "IRRELEVANT").map((f) => f.recommendationId)
    );

    // Filter out items user marked as irrelevant
    return RECOMMENDATION_CATALOG.filter((item) => !irrelevantIds.has(item.id));
  }

  saveFeedback(recommendationId: string, feedback: "HELPFUL" | "IRRELEVANT"): void {
    const current = this.getFeedbackHistory();
    // Remove previous feedback for same item if exists
    const updated = current.filter((f) => f.recommendationId !== recommendationId);
    updated.push({ recommendationId, feedback, timestamp: Date.now() });

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  }

  getFeedbackHistory(): RecommendationFeedback[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}

export const recommendationEngine = new RecommendationEngine();
