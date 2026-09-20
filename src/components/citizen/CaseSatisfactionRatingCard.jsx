import React, { useState } from "react";
import { Star, ShieldAlert, CheckCircle2, MessageSquare, ArrowUpRight, Scale, ThumbsUp, ThumbsDown } from "lucide-react";
import { complaintService } from "@/services/complaintService";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

const CaseSatisfactionRatingCard = ({
  complaintId,
  existingFeedback,
  onFeedbackSubmitted,
  onOpenAppeal
}) => {
  const { t } = useLanguage();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [helpful, setHelpful] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If already submitted feedback exists
  if (existingFeedback && existingFeedback.rating) {
    return (
      <div className="p-6 rounded-3xl bg-[#FAF8F2] border border-[#E6E1D8] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Star size={18} className="fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#163D32]">
                {t("civicFeatures.alreadyRated", `You verified and rated this resolution (${existingFeedback.rating}/5 Stars)`).replace("{stars}", existingFeedback.rating)}
              </h3>
              <p className="text-xs text-[#65736D]">
                Statutory citizen satisfaction recorded in official case registry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={16}
                className={s <= existingFeedback.rating ? "text-amber-500 fill-amber-500" : "text-slate-300"}
              />
            ))}
          </div>
        </div>

        {existingFeedback.comment && (
          <div className="p-3.5 rounded-2xl bg-white border border-[#E6E1D8]/70 text-xs text-slate-700 italic">
            "{existingFeedback.comment}"
          </div>
        )}
      </div>
    );
  }

  const isLowRating = rating <= 2;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      toast.error("Please select a star rating");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Submit feedback
      const payload = {
        complaintId,
        rating,
        comment: comment.trim(),
        helpful
      };
      const res = await complaintService.submitFeedback(payload);
      
      // 2. Transition case status to CLOSED_BY_USER if not low rating
      if (!isLowRating) {
        try {
          await complaintService.updateWorkflowStatus(complaintId, {
            status: "CLOSED_BY_USER",
            details: "Citizen confirmed case resolution with " + rating + " star satisfaction."
          });
        } catch (statusErr) {
          console.warn("Workflow status update warning:", statusErr);
        }
      }

      toast.success("Citizen feedback submitted and officially recorded!");
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(res);
      }
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      toast.error(err?.response?.data?.message || "Failed to submit feedback rating.");
    } finally {
      setSubmitting(false);
    }
  };

  const starLabels = [
    "",
    "1 - Very Poor (மிக மோசம்)",
    "2 - Unsatisfactory (திருப்தியற்றது)",
    "3 - Average (சராசரி)",
    "4 - Good (நன்று)",
    "5 - Excellent (மிக நன்று)"
  ];

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-[#FAF8F2] border-2 border-[#163D32]/20 shadow-sm space-y-6">
      
      {/* Title */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#DCEBDD] text-[10px] font-black uppercase tracking-wider text-[#163D32]">
            <CheckCircle2 size={12} />
            <span>Resolution Review Gate</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-[#163D32] tracking-tight">
            {t("civicFeatures.ratingTitle", "Citizen Satisfaction & Resolution Feedback")}
          </h3>
          <p className="text-xs text-[#65736D]">
            {t("civicFeatures.ratingSub", "Official review of the legal assistance provided for your grievance.")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Star Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">
            {t("civicFeatures.rateExperience", "How would you rate the resolution of your grievance?")}
          </label>
          
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 rounded-xl hover:scale-110 transition duration-150 cursor-pointer"
                title={`${star} Stars`}
              >
                <Star
                  size={28}
                  className={`transition ${
                    (hoverRating || rating) >= star
                      ? "text-amber-500 fill-amber-500 drop-shadow-xs"
                      : "text-slate-300 hover:text-amber-300"
                  }`}
                />
              </button>
            ))}
            <span className="text-xs font-bold text-slate-600 ml-2 font-mono">
              {starLabels[hoverRating || rating]}
            </span>
          </div>
        </div>

        {/* Helpful Toggle */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">
            {t("civicFeatures.wasHelpful", "Was the guidance provided by the Legal Guide helpful?")}
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setHelpful(true)}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                helpful
                  ? "bg-[#163D32] text-white border-[#163D32] shadow-2xs"
                  : "bg-white text-slate-700 border-[#E6E1D8] hover:border-slate-300"
              }`}
            >
              <ThumbsUp size={14} />
              <span>{t("civicFeatures.yesHelpful", "Yes, Helpful")}</span>
            </button>

            <button
              type="button"
              onClick={() => setHelpful(false)}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                !helpful
                  ? "bg-rose-700 text-white border-rose-700 shadow-2xs"
                  : "bg-white text-slate-700 border-[#E6E1D8] hover:border-slate-300"
              }`}
            >
              <ThumbsDown size={14} />
              <span>{t("civicFeatures.noHelpful", "Needs Improvement")}</span>
            </button>
          </div>
        </div>

        {/* Comment Textarea */}
        <div className="space-y-1.5">
          <textarea
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("civicFeatures.feedbackPlaceholder", "Add any comments or observations regarding the resolution...")}
            className="w-full p-3 text-xs rounded-2xl border border-[#E6E1D8] bg-white focus:outline-none focus:border-[#163D32] focus:ring-1 focus:ring-[#163D32]"
          />
        </div>

        {/* Low Rating Appeal Banner */}
        {isLowRating && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-3">
            <div className="flex items-start gap-2.5">
              <ShieldAlert size={18} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-amber-900">
                  {t("civicFeatures.lowRatingAlert", "Dissatisfied with this resolution?")}
                </h4>
                <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                  {t("civicFeatures.lowRatingDesc", "If your grievance was not resolved satisfactorily, you have the statutory right to appeal and reopen this case for District Admin review.")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenAppeal && onOpenAppeal(rating, comment)}
              className="w-full py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Scale size={14} />
              <span>{t("civicFeatures.btnAppealReopen", "File Formal Appeal / Reopen Case")}</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-2xl bg-[#163D32] hover:bg-[#1F5948] disabled:opacity-50 text-white text-xs sm:text-sm font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <CheckCircle2 size={16} />
          <span>{submitting ? "Submitting..." : t("civicFeatures.btnSubmitRating", "Confirm Resolution & Submit Feedback")}</span>
        </button>

      </form>

    </div>
  );
};

export default CaseSatisfactionRatingCard;
