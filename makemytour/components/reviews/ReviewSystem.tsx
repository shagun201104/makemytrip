"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  ThumbsUp,
  MessageSquare,
  Flag,
  Upload,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  ShieldAlert,
  XCircle,
  Plus,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { reviewEngine, type Review, type ReviewReply } from "@/app/lib/reviewEngine";

interface ReviewSystemProps {
  itemId?: string;
  itemName?: string;
  itemType?: "FLIGHT" | "HOTEL";
  showModerationTab?: boolean;
}

export function ReviewSystem({
  itemId = "taj-palace",
  itemName = "Taj Palace New Delhi",
  itemType = "HOTEL",
  showModerationTab = true,
}: ReviewSystemProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<"REVIEWS" | "WRITE" | "MODERATION">("REVIEWS");

  // Sorting & Filtering
  const [sortBy, setSortBy] = useState<"most_helpful" | "newest" | "highest_rated" | "lowest_rated">("most_helpful");
  const [filterStar, setFilterStar] = useState<number | "ALL">("ALL");
  const [onlyPhotos, setOnlyPhotos] = useState<boolean>(false);

  // New Review Form
  const [rating, setRating] = useState<number>(5);
  const [authorName, setAuthorName] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Reply state
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>("");

  // Flag Modal state
  const [flaggingReview, setFlaggingReview] = useState<Review | null>(null);
  const [flagReason, setFlagReason] = useState<string>("Inappropriate or offensive content");

  // Flagged reviews queue for moderation
  const [flaggedQueue, setFlaggedQueue] = useState<Review[]>([]);

  const loadReviews = () => {
    const data = reviewEngine.getReviews(itemId, itemType);
    setReviews(data);
    setFlaggedQueue(reviewEngine.getFlaggedReviews());
  };

  useEffect(() => {
    loadReviews();
  }, [itemId, itemType]);

  // Handle Photo Upload Preview
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName || !title || !comment) return;

    reviewEngine.addReview({
      itemId,
      itemType,
      itemName,
      authorName,
      rating,
      title,
      comment,
      photos: photoDataUrl ? [photoDataUrl] : undefined,
    });

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setAuthorName("");
      setTitle("");
      setComment("");
      setPhotoDataUrl(null);
      setActiveTab("REVIEWS");
      loadReviews();
    }, 1500);
  };

  // Submit Reply
  const handleAddReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    reviewEngine.addReply(reviewId, replyText, "Verified Traveller");
    setReplyText("");
    setReplyingToId(null);
    loadReviews();
  };

  // Vote Helpful
  const handleVoteHelpful = (reviewId: string) => {
    reviewEngine.voteHelpful(reviewId);
    loadReviews();
  };

  // Flag Review
  const handleConfirmFlag = () => {
    if (flaggingReview) {
      reviewEngine.flagReview(flaggingReview.id, flagReason);
      setFlaggingReview(null);
      loadReviews();
    }
  };

  // Moderate Action
  const handleModerateAction = (reviewId: string, action: "APPROVE" | "REMOVE") => {
    reviewEngine.moderateReview(reviewId, action);
    loadReviews();
  };

  // Compute Statistics
  const totalCount = reviews.length;
  const avgRating = totalCount > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1) : "5.0";
  const starCounts = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: reviews.filter((r) => r.rating === s).length,
  }));

  // Process Filtered and Sorted Reviews
  let processedReviews = [...reviews];
  if (filterStar !== "ALL") {
    processedReviews = processedReviews.filter((r) => r.rating === filterStar);
  }
  if (onlyPhotos) {
    processedReviews = processedReviews.filter((r) => r.photos && r.photos.length > 0);
  }

  processedReviews.sort((a, b) => {
    if (sortBy === "most_helpful") return b.helpfulVotes - a.helpfulVotes;
    if (sortBy === "newest") return b.createdAt - a.createdAt;
    if (sortBy === "highest_rated") return b.rating - a.rating;
    if (sortBy === "lowest_rated") return a.rating - b.rating;
    return 0;
  });

  return (
    <div className="bg-white rounded-2xl border border-[#d5e2f0] p-6 shadow-sm space-y-6">
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eef2f7] pb-4">
        <div>
          <h3 className="text-xl font-bold text-[#0f1a2e]">Reviews & Guest Experiences</h3>
          <p className="text-xs text-[#7c8ba3]">{itemName} · Verified Ratings</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("REVIEWS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "REVIEWS"
                ? "bg-[#0f1a2e] text-white shadow-xs"
                : "bg-[#f1f5f9] text-[#64748b] hover:text-[#0f1a2e]"
            }`}
          >
            All Reviews ({totalCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("WRITE")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === "WRITE"
                ? "bg-[#5b9bd5] text-white shadow-xs"
                : "bg-[#eaf3fb] text-[#5b9bd5] hover:bg-[#5b9bd5] hover:text-white"
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Write Review
          </button>

          {showModerationTab && (
            <button
              type="button"
              onClick={() => setActiveTab("MODERATION")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                activeTab === "MODERATION"
                  ? "bg-[#ef4444] text-white"
                  : "bg-[#fef2f2] text-[#ef4444] hover:bg-[#ef4444] hover:text-white"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" /> Moderation ({flaggedQueue.length})
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: ALL REVIEWS */}
      {activeTab === "REVIEWS" && (
        <div className="space-y-6">
          {/* Summary Ratings & Distribution Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#f8fafc] p-5 rounded-2xl border border-[#e2e8f0]">
            {/* Score Box */}
            <div className="flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-[#e2e8f0] pr-0 md:pr-6 pb-4 md:pb-0">
              <span className="text-4xl font-extrabold text-[#0f1a2e]">{avgRating}</span>
              <div className="flex items-center gap-1 my-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(Number(avgRating))
                        ? "text-[#f59e0b] fill-[#f59e0b]"
                        : "text-[#cbd5e1]"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-[#7c8ba3]">Based on {totalCount} verified reviews</span>
            </div>

            {/* Distribution Bars */}
            <div className="md:col-span-2 space-y-1.5 justify-center flex flex-col">
              {starCounts.map(({ star, count }) => {
                const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3 text-xs">
                    <span className="w-8 text-[#475569] font-medium flex items-center gap-0.5">
                      {star} <Star className="w-3 h-3 text-[#f59e0b] fill-[#f59e0b]" />
                    </span>
                    <div className="flex-1 h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#f59e0b] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-[#94a3b8]">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls Bar: Sort & Filter */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#f1f5f9] px-4 py-3 rounded-xl text-xs">
            {/* Filter by star rating */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#5b9bd5]" />
              <span className="font-semibold text-[#475569]">Filter:</span>
              <button
                type="button"
                onClick={() => setFilterStar("ALL")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  filterStar === "ALL" ? "bg-[#0f1a2e] text-white" : "bg-white text-[#64748b]"
                }`}
              >
                All
              </button>
              {[5, 4, 3, 2, 1].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilterStar(s)}
                  className={`px-2 py-1 rounded-lg font-bold flex items-center gap-0.5 transition-all ${
                    filterStar === s ? "bg-[#0f1a2e] text-white" : "bg-white text-[#64748b]"
                  }`}
                >
                  {s} <Star className="w-3 h-3 text-[#f59e0b] fill-[#f59e0b]" />
                </button>
              ))}
              <label className="flex items-center gap-1 ml-3 cursor-pointer text-[#475569] font-medium">
                <input
                  type="checkbox"
                  checked={onlyPhotos}
                  onChange={(e) => setOnlyPhotos(e.target.checked)}
                  className="rounded border-gray-300 text-[#5b9bd5] focus:ring-[#5b9bd5]"
                />
                With Photos Only
              </label>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#5b9bd5]" />
              <span className="font-semibold text-[#475569]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-white border border-[#cbd5e1] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#0f1a2e] outline-none"
              >
                <option value="most_helpful">Most Helpful</option>
                <option value="newest">Newest First</option>
                <option value="highest_rated">Highest Rated</option>
                <option value="lowest_rated">Lowest Rated</option>
              </select>
            </div>
          </div>

          {/* Review List */}
          {processedReviews.length === 0 ? (
            <div className="text-center py-12 bg-[#f8fafc] rounded-2xl border border-dashed border-[#cbd5e1]">
              <MessageSquare className="w-8 h-8 text-[#94a3b8] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#0f1a2e]">No reviews found matching criteria</p>
              <p className="text-xs text-[#7c8ba3] mt-1">Be the first to write a review!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {processedReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs space-y-3 hover:border-[#cbd5e1] transition-all"
                >
                  {/* Reviewer Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#e2e8f0] text-[#0f1a2e] font-extrabold text-sm flex items-center justify-center">
                        {rev.authorName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#0f1a2e]">{rev.authorName}</h4>
                        <span className="text-[10px] text-[#7c8ba3]">
                          {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Star Rating Badge */}
                    <div className="flex items-center gap-1 bg-[#fef3c7] px-2.5 py-1 rounded-full border border-[#fde68a]">
                      <span className="text-xs font-extrabold text-[#b45309]">{rev.rating}.0</span>
                      <Star className="w-3.5 h-3.5 text-[#f59e0b] fill-[#f59e0b]" />
                    </div>
                  </div>

                  {/* Title & Comment */}
                  <div>
                    <h5 className="font-bold text-sm text-[#0f1a2e] mb-1">{rev.title}</h5>
                    <p className="text-xs text-[#334155] leading-relaxed">{rev.comment}</p>
                  </div>

                  {/* User Uploaded Photos */}
                  {rev.photos && rev.photos.length > 0 && (
                    <div className="flex gap-2 pt-1">
                      {rev.photos.map((photo, i) => (
                        <img
                          key={i}
                          src={photo}
                          alt="Review attachment"
                          className="w-20 h-20 rounded-xl object-cover border border-[#cbd5e1]"
                        />
                      ))}
                    </div>
                  )}

                  {/* Actions Bar: Helpful Vote, Reply, Flag */}
                  <div className="flex items-center justify-between border-t border-[#f1f5f9] pt-3 text-xs text-[#64748b]">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => handleVoteHelpful(rev.id)}
                        className="flex items-center gap-1.5 hover:text-[#5b9bd5] transition-colors font-medium"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" /> Helpful ({rev.helpfulVotes})
                      </button>

                      <button
                        type="button"
                        onClick={() => setReplyingToId(replyingToId === rev.id ? null : rev.id)}
                        className="flex items-center gap-1.5 hover:text-[#0f1a2e] transition-colors font-medium"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Reply ({rev.replies.length})
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setFlaggingReview(rev)}
                      className="flex items-center gap-1 text-[#94a3b8] hover:text-[#ef4444] transition-colors"
                      title="Report inappropriate content"
                    >
                      <Flag className="w-3.5 h-3.5" /> Flag
                    </button>
                  </div>

                  {/* Threaded Replies */}
                  {rev.replies.length > 0 && (
                    <div className="ml-6 mt-3 space-y-2 border-l-2 border-[#e2e8f0] pl-4">
                      {rev.replies.map((reply) => (
                        <div key={reply.id} className="bg-[#f8fafc] p-3 rounded-xl text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#0f1a2e] flex items-center gap-1">
                              {reply.authorName}
                              {reply.isOwner && (
                                <span className="bg-[#5b9bd5] text-white text-[9px] px-1.5 py-0.2 rounded font-semibold">
                                  Response
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-[#94a3b8]">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[#334155]">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input Box */}
                  {replyingToId === rev.id && (
                    <div className="ml-6 mt-3 flex gap-2">
                      <Input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="text-xs h-9 bg-white"
                      />
                      <Button
                        type="button"
                        onClick={() => handleAddReply(rev.id)}
                        className="h-9 px-4 text-xs font-bold bg-[#0f1a2e] text-white rounded-xl"
                      >
                        Reply
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WRITE A REVIEW */}
      {activeTab === "WRITE" && (
        <form onSubmit={handleSubmitReview} className="space-y-5 max-w-xl mx-auto py-4">
          <h4 className="text-lg font-bold text-[#0f1a2e]">Share Your Experience</h4>

          {submitSuccess && (
            <div className="bg-[#dcfce7] border border-[#86efac] text-[#15803d] p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Your review has been submitted successfully!
            </div>
          )}

          {/* Star Selector */}
          <div>
            <label className="text-xs font-bold text-[#334155] mb-2 block">Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? "text-[#f59e0b] fill-[#f59e0b]" : "text-[#cbd5e1]"
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm font-bold text-[#0f1a2e] ml-2">{rating} out of 5 Stars</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#334155] mb-1 block">Your Name</label>
            <Input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. Rahul Verma"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#334155] mb-1 block">Review Headline</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Great location, clean rooms!"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#334155] mb-1 block">Detailed Review</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell other travelers about your stay, cleanliness, service, etc."
              rows={4}
              required
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="text-xs font-bold text-[#334155] mb-1.5 block">Attach Photos (Optional)</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#334155] px-4 py-2 rounded-xl text-xs font-bold cursor-pointer border border-[#cbd5e1] transition-all">
                <Upload className="w-4 h-4 text-[#5b9bd5]" /> Choose Photo
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
              {photoDataUrl && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#cbd5e1]">
                  <img src={photoDataUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-[#0f1a2e] text-white hover:bg-[#1a2947] font-bold rounded-xl text-sm"
          >
            Submit Review
          </Button>
        </form>
      )}

      {/* TAB 3: MODERATION QUEUE FOR TRUST & SAFETY */}
      {activeTab === "MODERATION" && (
        <div className="space-y-4">
          <div className="bg-[#fef2f2] border border-[#fecaca] p-4 rounded-xl text-xs text-[#991b1b]">
            <h4 className="font-bold text-sm mb-1 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Trust & Safety Moderation Queue
            </h4>
            Reviews reported by community members are held here for moderator review before approval or deletion.
          </div>

          {flaggedQueue.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#94a3b8] italic">
              No flagged reviews in queue. All clean!
            </div>
          ) : (
            <div className="space-y-3">
              {flaggedQueue.map((rev) => (
                <div key={rev.id} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-xs text-[#0f1a2e]">{rev.authorName}</span>
                      <span className="text-[10px] text-[#ef4444] font-bold ml-2">
                        Flag Reason: {rev.flagReason || "Inappropriate content"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleModerateAction(rev.id, "APPROVE")}
                        className="bg-[#22c55e] text-white text-xs h-7 px-3 rounded-lg"
                      >
                        Approve
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleModerateAction(rev.id, "REMOVE")}
                        className="bg-[#ef4444] text-white text-xs h-7 px-3 rounded-lg"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-[#334155] italic">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Flag Report Modal */}
      <Dialog open={Boolean(flaggingReview)} onOpenChange={(open) => !open && setFlaggingReview(null)}>
        <DialogContent className="sm:max-w-[420px] p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#0f1a2e] flex items-center gap-2">
              <Flag className="w-5 h-5 text-[#ef4444]" /> Flag Inappropriate Content
            </DialogTitle>
            <DialogDescription className="text-xs text-[#64748b]">
              Help maintain a trusted community by reporting inappropriate reviews.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-bold text-[#334155] mb-1 block">Reason for Reporting</label>
              <select
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                className="w-full border border-[#cbd5e1] rounded-xl px-3 py-2 text-xs font-medium outline-none bg-white text-[#0f1a2e]"
              >
                <option value="Inappropriate or offensive content">Inappropriate or offensive content</option>
                <option value="Spam or promotional material">Spam or promotional material</option>
                <option value="Fake or misleading review">Fake or misleading review</option>
                <option value="Conflict of interest">Conflict of interest</option>
              </select>
            </div>

            <Button
              type="button"
              onClick={handleConfirmFlag}
              className="w-full bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold text-xs h-10 rounded-xl"
            >
              Submit Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
