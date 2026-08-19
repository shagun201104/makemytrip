export interface ReviewReply {
  id: string;
  authorName: string;
  avatarUrl?: string;
  isOwner?: boolean;
  content: string;
  createdAt: number;
}

export interface Review {
  id: string;
  itemId: string; // e.g. flight code or hotel name/id
  itemType: "FLIGHT" | "HOTEL";
  itemName: string;
  authorName: string;
  authorEmail?: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  photos?: string[]; // Data URLs or image URLs
  helpfulVotes: number;
  createdAt: number;
  replies: ReviewReply[];
  isFlagged?: boolean;
  flagReason?: string;
  status: "APPROVED" | "FLAGGED" | "REMOVED";
}

const STORAGE_KEY = "mmt_reviews_v1";

const INITIAL_SEED_REVIEWS: Review[] = [
  {
    id: "rev-1",
    itemId: "delhi-mumbai",
    itemType: "FLIGHT",
    itemName: "IndiGo 6E-204",
    authorName: "Rohan Sharma",
    rating: 5,
    title: "Smooth and punctual flight!",
    comment: "Flight departed right on time. Cabin crew was extremely courteous and seat legroom was surprisingly spacious.",
    helpfulVotes: 14,
    createdAt: Date.now() - 86400000 * 3,
    status: "APPROVED",
    replies: [
      {
        id: "rep-1",
        authorName: "IndiGo Customer Care",
        isOwner: true,
        content: "Thank you Rohan! We are glad you enjoyed flying with us.",
        createdAt: Date.now() - 86400000 * 2,
      },
    ],
  },
  {
    id: "rev-2",
    itemId: "taj-palace",
    itemType: "HOTEL",
    itemName: "Taj Palace New Delhi",
    authorName: "Ananya Iyer",
    rating: 5,
    title: "Exceptional hospitality & ocean view!",
    comment: "The room service and swimming pool were world class. Loved the ocean suite upgrade!",
    photos: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80",
    ],
    helpfulVotes: 28,
    createdAt: Date.now() - 86400000 * 5,
    status: "APPROVED",
    replies: [],
  },
  {
    id: "rev-3",
    itemId: "taj-palace",
    itemType: "HOTEL",
    itemName: "Taj Palace New Delhi",
    authorName: "Praveen Kumar",
    rating: 4,
    title: "Great breakfast buffet, minor check-in delay",
    comment: "Overall pleasant stay. Check-in took 15 mins due to rush, but the breakfast spread made up for it.",
    helpfulVotes: 7,
    createdAt: Date.now() - 86400000 * 1,
    status: "APPROVED",
    replies: [],
  },
];

class ReviewEngine {
  getReviews(itemId?: string, itemType?: "FLIGHT" | "HOTEL"): Review[] {
    if (typeof window === "undefined") return INITIAL_SEED_REVIEWS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let reviews: Review[] = stored ? JSON.parse(stored) : INITIAL_SEED_REVIEWS;
      
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_REVIEWS));
      }

      // Filter out REMOVED reviews for standard view
      reviews = reviews.filter((r) => r.status !== "REMOVED");

      if (itemId) {
        reviews = reviews.filter((r) => r.itemId === itemId || r.itemName.toLowerCase().includes(itemId.toLowerCase()));
      }
      if (itemType) {
        reviews = reviews.filter((r) => r.itemType === itemType);
      }

      return reviews;
    } catch {
      return INITIAL_SEED_REVIEWS;
    }
  }

  addReview(newRev: Omit<Review, "id" | "helpfulVotes" | "createdAt" | "replies" | "status">): Review {
    const reviews = this.getReviews();
    const created: Review = {
      ...newRev,
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      helpfulVotes: 0,
      createdAt: Date.now(),
      replies: [],
      status: "APPROVED",
    };

    reviews.unshift(created);
    this._save(reviews);
    return created;
  }

  addReply(reviewId: string, replyContent: string, authorName: string = "User", isOwner: boolean = false): ReviewReply | null {
    const reviews = this.getReviews();
    const target = reviews.find((r) => r.id === reviewId);
    if (!target) return null;

    const reply: ReviewReply = {
      id: `rep-${Date.now()}`,
      authorName,
      isOwner,
      content: replyContent,
      createdAt: Date.now(),
    };

    target.replies.push(reply);
    this._save(reviews);
    return reply;
  }

  voteHelpful(reviewId: string): number {
    const reviews = this.getReviews();
    const target = reviews.find((r) => r.id === reviewId);
    if (!target) return 0;

    target.helpfulVotes += 1;
    this._save(reviews);
    return target.helpfulVotes;
  }

  flagReview(reviewId: string, reason: string): boolean {
    const reviews = this.getReviews();
    const target = reviews.find((r) => r.id === reviewId);
    if (!target) return false;

    target.isFlagged = true;
    target.flagReason = reason;
    target.status = "FLAGGED";
    this._save(reviews);
    return true;
  }

  getFlaggedReviews(): Review[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const reviews: Review[] = stored ? JSON.parse(stored) : INITIAL_SEED_REVIEWS;
      return reviews.filter((r) => r.status === "FLAGGED");
    } catch {
      return [];
    }
  }

  moderateReview(reviewId: string, action: "APPROVE" | "REMOVE"): boolean {
    if (typeof window === "undefined") return false;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const reviews: Review[] = stored ? JSON.parse(stored) : INITIAL_SEED_REVIEWS;
      const target = reviews.find((r) => r.id === reviewId);
      if (!target) return false;

      if (action === "APPROVE") {
        target.status = "APPROVED";
        target.isFlagged = false;
      } else {
        target.status = "REMOVED";
      }

      this._save(reviews);
      return true;
    } catch {
      return false;
    }
  }

  private _save(reviews: Review[]) {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    }
  }
}

export const reviewEngine = new ReviewEngine();
