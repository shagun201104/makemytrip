"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Info,
  Compass,
  Check,
  Star,
  MapPin,
  Plane,
  Building2,
  RefreshCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  recommendationEngine,
  type RecommendationItem,
} from "@/app/lib/recommendationEngine";

export function PersonalizedRecommendations() {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [activeTooltipItem, setActiveTooltipItem] = useState<RecommendationItem | null>(null);
  const [feedbackFeedbackNotice, setFeedbackNotice] = useState<string>("");

  const loadRecs = () => {
    setRecommendations(recommendationEngine.getRecommendations());
  };

  useEffect(() => {
    loadRecs();
  }, []);

  const handleFeedback = (id: string, feedback: "HELPFUL" | "IRRELEVANT") => {
    recommendationEngine.saveFeedback(id, feedback);
    if (feedback === "HELPFUL") {
      setFeedbackNotice("Thanks for your feedback! We'll show more recommendations like this.");
    } else {
      setFeedbackNotice("Got it! We'll adjust your recommendation weights to avoid similar suggestions.");
    }
    loadRecs();
    setTimeout(() => setFeedbackNotice(""), 4000);
  };

  if (recommendations.length === 0) {
    return (
      <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-6 text-center text-xs text-[#64748b]">
        <RefreshCcw className="w-5 h-5 mx-auto mb-2 text-[#5b9bd5]" />
        Your recommendation profile is currently retraining based on your latest feedback.
      </div>
    );
  }

  return (
    <div className="bg-[#f0f7ff]/70 border border-[#b8daff]/60 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#bcd9f2]/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#f59e0b]" />
            <h3 className="text-xl font-extrabold text-[#0f1a2e]">Just For You</h3>
            <span className="bg-[#5b9bd5] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              AI Personalized
            </span>
          </div>
          <p className="text-xs text-[#5b6b82] mt-0.5">
            Curated recommendations matching your travel preferences, past reviews & search vectors.
          </p>
        </div>
      </div>

      {feedbackFeedbackNotice && (
        <div className="bg-[#dcfce7] border border-[#86efac] text-[#15803d] text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          {feedbackFeedbackNotice}
        </div>
      )}

      {/* Recommendation Grid — 2 COLUMNS ON MOBILE */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {recommendations.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              if (item.kind === "FLIGHT") {
                window.location.href = `/booking/flight?code=${encodeURIComponent(item.id)}&price=${item.price}&from=New%20Delhi&to=${encodeURIComponent(item.location)}`;
              } else {
                window.location.href = `/booking/hotel?name=${encodeURIComponent(item.title)}&city=${encodeURIComponent(item.location)}&nightly=${item.price}`;
              }
            }}
            className="bg-white rounded-2xl border border-[#d5e2f0] overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div>
              {/* Image Banner */}
              <div className="relative h-40 w-full bg-[#cbd5e1] overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Match Score Badge */}
                <span className="absolute top-3 left-3 bg-[#0f1a2e]/90 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full backdrop-blur-sm shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#f59e0b]" /> {item.matchScore}% Match
                </span>

                {/* Kind Icon Badge */}
                <span className="absolute top-3 right-3 bg-white/90 text-[#0f1a2e] text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm shadow-sm">
                  {item.kind === "FLIGHT" ? (
                    <Plane className="w-3 h-3 inline mr-1 text-[#5b9bd5]" />
                  ) : (
                    <Building2 className="w-3 h-3 inline mr-1 text-[#22c55e]" />
                  )}
                  {item.kind}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-2">
                <h4 className="font-bold text-base text-[#0f1a2e] leading-snug line-clamp-1 group-hover:text-[#5b9bd5] transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-[#5b6b82] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#94a3b8] shrink-0" /> {item.location}
                </p>

                {/* Contextual Reason Badge */}
                <div className="bg-[#fef3c7] text-[#b45309] text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-[#fde68a] flex items-center justify-between">
                  <span className="truncate mr-1">{item.reason}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTooltipItem(item);
                    }}
                    className="text-[#b45309] hover:text-[#78350f] shrink-0"
                    title="Why this recommendation?"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 pt-0 border-t border-[#f1f5f9] mt-2 space-y-3">
              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="text-[10px] text-[#7c8ba3] font-bold uppercase">Starting at</p>
                  <p className="text-lg font-extrabold text-[#0f1a2e]">
                    ₹{item.price.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-[#0f1a2e] bg-[#fef3c7] px-2 py-1 rounded-md">
                  <Star className="w-3.5 h-3.5 text-[#f59e0b] fill-[#f59e0b]" /> {item.rating}
                </div>
              </div>

              <Button
                type="button"
                className="w-full bg-[#5b9bd5] hover:bg-[#4a86c9] text-white font-bold text-xs rounded-xl h-10 shadow-md transition-all flex items-center justify-center gap-2"
              >
                Book Now &rarr;
              </Button>

              {/* Feedback Loop Buttons: Helpful / Irrelevant */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-between bg-[#f8fafc] px-3 py-1.5 rounded-xl text-xs border border-[#e2e8f0]"
              >
                <span className="text-[10px] font-bold text-[#64748b]">Was this helpful?</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleFeedback(item.id, "HELPFUL")}
                    className="p-1 text-[#94a3b8] hover:text-[#22c55e] transition-colors"
                    title="Helpful recommendation"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFeedback(item.id, "IRRELEVANT")}
                    className="p-1 text-[#94a3b8] hover:text-[#ef4444] transition-colors"
                    title="Not relevant to me"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* "Why This Recommendation?" Transparent Modal */}
      <Dialog
        open={Boolean(activeTooltipItem)}
        onOpenChange={(open) => !open && setActiveTooltipItem(null)}
      >
        <DialogContent className="sm:max-w-[460px] p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#0f1a2e] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#f59e0b]" /> Why this recommendation?
            </DialogTitle>
            <DialogDescription className="text-xs text-[#64748b]">
              We believe in full transparency behind our AI scoring algorithm.
            </DialogDescription>
          </DialogHeader>

          {activeTooltipItem && (
            <div className="space-y-4 py-2 text-xs text-[#334155]">
              <div className="bg-[#f0f7ff] border border-[#bcd9f2] p-4 rounded-xl space-y-2">
                <h4 className="font-bold text-sm text-[#0f1a2e]">{activeTooltipItem.title}</h4>
                <p className="text-[#5b6b82]">{activeTooltipItem.detailedExplanation}</p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-[#0f1a2e] uppercase text-[10px] tracking-wider">
                  Algorithm Score Breakdown
                </h5>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span>Category Interest Vector</span>
                    <span className="font-bold text-[#22c55e]">95% Match</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Collaborative Traveler Similarity</span>
                    <span className="font-bold text-[#5b9bd5]">92% Match</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saved Preference Alignment</span>
                    <span className="font-bold text-[#0f1a2e]">100% Match</span>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setActiveTooltipItem(null)}
                className="w-full bg-[#0f1a2e] text-white font-bold h-10 rounded-xl"
              >
                Got it
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
