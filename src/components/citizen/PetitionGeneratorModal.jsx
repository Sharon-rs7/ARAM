import React, { useState } from "react";
import { X, Printer, Copy, Check, FileText, Scale, Building2, MapPin, Calendar, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

const PetitionGeneratorModal = ({ isOpen, onClose, complaint, user }) => {
  const { t, currentLanguage } = useLanguage();
  const [draftLang, setDraftLang] = useState(currentLanguage === "ta-IN" ? "ta" : "en");
  const [copied, setCopied] = useState(false);

  if (!isOpen || !complaint) return null;

  const citizenName = complaint.userName || user?.name || "Citizen / Petitioner";
  const citizenMobile = complaint.userMobile || user?.mobile || "Not specified";
  const citizenAddress = complaint.location || user?.address || "Salem District, Tamil Nadu";
  const district = complaint.district || user?.district || "Salem District";
  const caseId = complaint.complaintCustomId || `ARM-2026-${String(complaint.id || 1).padStart(6, "0")}`;
  const currentDate = new Date().toLocaleDateString(draftLang === "ta" ? "ta-IN" : "en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  // Determine appropriate authority based on complaint problem type or category
  const getAuthority = () => {
    const cat = (complaint.category || complaint.problemType || "").toLowerCase();
    if (draftLang === "ta") {
      if (cat.includes("land") || cat.includes("patta") || cat.includes("property")) {
        return {
          title: "வட்டாட்சியர் / வருவாய் கோட்டாட்சியர் (RDO)",
          dept: "வருவாய்த்துறை & நில அளவை அலுவலகம்",
          dist: `${district}, தமிழ்நாடு`
        };
      }
      if (cat.includes("police") || cat.includes("crime") || cat.includes("assault")) {
        return {
          title: "காவல் ஆய்வாளர் / காவல் கண்காணிப்பாளர் (SP)",
          dept: "மாவட்ட காவல் அலுவலகம்",
          dist: `${district}, தமிழ்நாடு`
        };
      }
      if (cat.includes("consumer")) {
        return {
          title: "தலைவர், மாவட்ட நுகர்வோர் குறைதீர் ஆணையம்",
          dept: "நுகர்வோர் பாதுகாப்பு நீதிமன்ற வளாகம்",
          dist: `${district}, தமிழ்நாடு`
        };
      }
      return {
        title: "செயலாளர், மாவட்ட சட்ட சேவைகள் ஆணையம் (DLSA)",
        dept: "ஒருங்கிணைந்த நீதிமன்ற வளாகம்",
        dist: `${district}, தமிழ்நாடு`
      };
    } else {
      if (cat.includes("land") || cat.includes("patta") || cat.includes("property")) {
        return {
          title: "The Tahsildar / Revenue Divisional Officer (RDO)",
          dept: "Taluk Revenue & Land Survey Department",
          dist: `${district}, Tamil Nadu`
        };
      }
      if (cat.includes("police") || cat.includes("crime") || cat.includes("assault")) {
        return {
          title: "The Inspector of Police / Superintendent of Police",
          dept: "District Police Headquarters",
          dist: `${district}, Tamil Nadu`
        };
      }
      if (cat.includes("consumer")) {
        return {
          title: "The President, District Consumer Disputes Redressal Commission",
          dept: "District Court Complex",
          dist: `${district}, Tamil Nadu`
        };
      }
      return {
        title: "The Secretary, District Legal Services Authority (DLSA)",
        dept: "Combined Court Building",
        dist: `${district}, Tamil Nadu`
      };
    }
  };

  const authority = getAuthority();
  const summaryText = complaint.complaintSummary || complaint.description || complaint.rawText || "Grievance details as recorded in official ARAM triage.";
  const legalProvisions = complaint.statutoryCitations || complaint.legalOpinion || "Provisions of relevant statutory laws and Constitutional guarantees under Article 21 / 39A.";

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = document.getElementById("petition-document-content")?.innerText;
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(t("civicFeatures.btnCopyPetition", "Petition text copied to clipboard."));
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-[#FAF8F2] rounded-3xl border border-[#E6E1D8] shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto print:max-w-none print:w-full print:shadow-none print:border-none print:max-h-none print:rounded-none">
        
        {/* Modal Header (Hidden on Print) */}
        <div className="p-5 sm:p-6 bg-[#163D32] text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                {t("civicFeatures.petitionTitle", "Ready-to-File Legal Representation")}
              </h2>
              <p className="text-xs text-white/70">
                {t("civicFeatures.petitionSub", "Formal statutory petition draft formatted for submission to the competent authority.")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <div className="flex items-center bg-white/10 rounded-xl p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setDraftLang("ta")}
                className={`px-3 py-1 rounded-lg transition ${draftLang === "ta" ? "bg-[#FAF8F2] text-[#163D32] shadow-xs" : "text-white/80 hover:text-white"}`}
              >
                தமிழ்
              </button>
              <button
                type="button"
                onClick={() => setDraftLang("en")}
                className={`px-3 py-1 rounded-lg transition ${draftLang === "en" ? "bg-[#FAF8F2] text-[#163D32] shadow-xs" : "text-white/80 hover:text-white"}`}
              >
                English
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Petition Document Body */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 font-serif text-slate-800 bg-[#FFFDF9] print:p-8 print:overflow-visible">
          <div id="petition-document-content" className="max-w-2xl mx-auto space-y-6 text-sm sm:text-base leading-relaxed">
            
            {/* Document Emblem / Header */}
            <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
              <p className="text-xs uppercase font-bold tracking-widest text-slate-600 font-sans">
                {draftLang === "ta" ? "தமிழ்நாடு அரசு / சட்ட சேவைகள் ஆணையம்" : "GOVERNMENT OF TAMIL NADU / LEGAL SERVICES REDRESSAL"}
              </p>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-wide font-sans">
                {draftLang === "ta" ? "அதிகாரப்பூர்வ குறைதீர்க்கும் மனு & சட்டப்பூர்வ பிரதிநிதித்துவம்" : "MEMORANDUM OF GRIEVANCE & STATUTORY REPRESENTATION"}
              </h1>
              <div className="flex items-center justify-between text-xs text-slate-600 pt-2 font-sans">
                <span><strong>ARAM Case ID:</strong> {caseId}</span>
                <span><strong>Date:</strong> {currentDate}</span>
              </div>
            </div>

            {/* From & To Addresses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-1 border-l-2 border-slate-200 pl-3">
                <p className="text-xs font-bold uppercase font-sans text-slate-500">
                  {t("civicFeatures.petitionFrom", "From (Petitioner):")}
                </p>
                <p className="font-bold text-slate-900">{citizenName}</p>
                <p className="text-xs text-slate-700 whitespace-pre-line">{citizenAddress}</p>
                <p className="text-xs text-slate-700">Mobile: {citizenMobile}</p>
                <p className="text-xs text-slate-700">{district}</p>
              </div>

              <div className="space-y-1 border-l-2 border-[#163D32] pl-3">
                <p className="text-xs font-bold uppercase font-sans text-[#163D32]">
                  {t("civicFeatures.petitionTo", "To (Competent Authority):")}
                </p>
                <p className="font-bold text-slate-900">{authority.title}</p>
                <p className="text-xs text-slate-700">{authority.dept}</p>
                <p className="text-xs text-slate-700">{authority.dist}</p>
              </div>
            </div>

            {/* Subject Line */}
            <div className="bg-[#FAF8F2] border border-[#E6E1D8] p-3.5 rounded-xl space-y-1 print:border print:p-2">
              <p className="font-bold text-xs uppercase font-sans text-slate-600">
                {t("civicFeatures.petitionSubject", "Subject:")}
              </p>
              <p className="font-semibold text-slate-900 text-sm">
                {draftLang === "ta"
                  ? `மனுதாரர் ${citizenName} ஆகிய எனது சட்டப்பூர்வ குறைதீர்ப்பு மற்றும் உடனடி நடவடிக்கை கோருதல் சார்பாக.`
                  : `Petition regarding grievance redressal and statutory relief on behalf of the petitioner ${citizenName}.`}
              </p>
            </div>

            {/* Respect / Salutation */}
            <p className="font-semibold">
              {draftLang === "ta" ? "மதிப்பிற்குரிய ஐயா / அம்மையீர்," : "Respected Authority,"}
            </p>

            {/* Statement of Facts */}
            <div className="space-y-2">
              <p className="font-bold text-xs uppercase font-sans text-slate-700">
                1. {t("civicFeatures.petitionFacts", "Statement of Facts & Grievance:")}
              </p>
              <div className="text-slate-800 text-justify text-xs sm:text-sm pl-3 border-l border-slate-300">
                {summaryText}
              </div>
            </div>

            {/* Legal Grounds / Citations */}
            <div className="space-y-2">
              <p className="font-bold text-xs uppercase font-sans text-slate-700">
                2. {t("civicFeatures.petitionProvisions", "Statutory Provisions & Citations:")}
              </p>
              <div className="text-slate-800 text-justify text-xs sm:text-sm pl-3 border-l border-amber-300 bg-amber-50/50 p-2 rounded-r-lg">
                {legalProvisions}
              </div>
            </div>

            {/* Prayer / Relief Sought */}
            <div className="space-y-2">
              <p className="font-bold text-xs uppercase font-sans text-slate-700">
                3. {t("civicFeatures.petitionPrayer", "Prayer / Relief Sought:")}
              </p>
              <div className="text-slate-800 text-justify text-xs sm:text-sm pl-3 border-l border-emerald-400 bg-emerald-50/40 p-2 rounded-r-lg">
                {draftLang === "ta" ? (
                  <p>
                    எனவே, மதிப்பிற்குரிய அதிகாரிகள் மேற்கூறிய விவரங்களை பரிசீலித்து, உரிய கள ஆய்வு மேற்கொண்டு, என் சட்டப்பூர்வ உரிமைகளைப் பாதுகாத்து, சட்ட விதிகளின்படி தகுந்த உத்தரவை உடனடியாகப் பிறப்பிக்குமாறு பணிவுடன் வேண்டுகிறேன்.
                  </p>
                ) : (
                  <p>
                    Wherefore, it is most respectfully prayed that the competent authority may kindly consider the facts above, conduct an immediate administrative enquiry, uphold statutory guarantees, and grant appropriate relief as deemed fit in the interest of justice.
                  </p>
                )}
              </div>
            </div>

            {/* Solemn Declaration / Verification */}
            <div className="pt-4 border-t border-slate-200 text-xs text-slate-600 space-y-1 italic">
              <p>{t("civicFeatures.petitionVerification", "I hereby solemnly declare and verify that the facts stated above are true and correct to the best of my knowledge and belief.")}</p>
            </div>

            {/* Signatures & Place */}
            <div className="pt-8 flex items-end justify-between text-xs font-sans">
              <div className="space-y-1">
                <p><strong>Place:</strong> {district}</p>
                <p><strong>Date:</strong> {currentDate}</p>
                <p className="text-[10px] text-slate-500 font-mono">Verified via ARAM Public Redressal Network</p>
              </div>

              <div className="text-center space-y-8">
                <div className="w-48 border-b border-dashed border-slate-500 pb-1 text-slate-400 text-[10px]">
                  (Sign here / கையொப்பமிடுக)
                </div>
                <p className="font-bold text-slate-900 font-sans">{citizenName}</p>
                <p className="text-[10px] text-slate-500 font-sans">
                  {t("civicFeatures.petitionSignature", "Signature / Thumb Impression of Petitioner")}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer (Hidden on Print) */}
        <div className="p-4 sm:p-5 bg-[#F7F1E6] border-t border-[#E6E1D8] flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 text-xs text-[#65736D]">
            <ShieldCheck size={16} className="text-[#1F5948]" />
            <span>Official statutory draft format • Ready for physical submission</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E6E1D8] bg-white text-xs font-bold text-[#18332B] hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? "Copied!" : t("civicFeatures.btnCopyPetition", "Copy Petition Text")}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#163D32] hover:bg-[#1F5948] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Printer size={14} />
              <span>{t("civicFeatures.btnPrintPetition", "Print Petition Document")}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PetitionGeneratorModal;
