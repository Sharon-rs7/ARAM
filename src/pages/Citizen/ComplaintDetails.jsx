import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/common/DashboardLayout";
import { useNavigate, useParams } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  User,
  Building2,
  ShieldCheck,
  BrainCircuit,
  Paperclip,
  Download,
  ArrowLeft,
  Clock3,
  FileText,
  BadgeAlert,
  Printer,
  Timer,
  Scale,
  QrCode,
  ChevronRight,
  ExternalLink,
  PhoneCall,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { complaintService } from "@/services/complaintService";
import { toast } from "sonner";
import ReadAloudButton from "@/components/common/voice/ReadAloudButton";
import CaseChatPanel from "@/components/guide/CaseChatPanel";
import AuthorityLocationCard from "@/components/citizen/AuthorityLocationCard";

const TRANSLATIONS = {
  "ta-IN": {
    title: "உங்கள் வழக்கு — எளிய விளக்கம்",
    subtext: "ARAM உங்கள் புகாரை புரிந்து கொண்டு, அடுத்து என்ன செய்யலாம் என்பதை எளிமையாக விளக்கியுள்ளது.",
    complaintId: "வழக்கு எண்",
    status: "தற்போதைய நிலை",
    location: "சம்பவம் நடந்த இடம்",
    language: "மொழி",
    toldTitle: "நீங்கள் எங்களிடம் கூறியது",
    understoodTitle: "ARAM புரிந்து கொண்டது",
    problemType: "பிரச்சனை வகை",
    partiesTitle: "தொடர்புடையவர்கள்",
    timelineTitle: "வழக்கு காலவரிசை",
    noTimeline: "காலவரிசை தகவல்கள் எதுவும் கிடைக்கவில்லை.",
    caseProgressJourney: "வழக்கு முன்னேற்ற காலவரிசை",
    triageCategory: "சட்ட வகைப்பாடு",
    urgencyLevel: "தீர்வு கால அவகாசம் (SLA)",
    legalGuide: "ஒதுக்கப்பட்ட சட்ட வழிகாட்டி",
    dateSubmitted: "சமர்ப்பிக்கப்பட்ட தேதி",
    whatHappensNext: "அடுத்து என்ன நடக்கும்?",
    originalDescription: "நீங்கள் சமர்ப்பித்த புகார் விவரம்",
    awaitingAssignment: "வழிகாட்டி ஒதுக்கீடு பரிசீலனையில் உள்ளது",
    citizenPerspective: "புகார்தாரர் கருத்து & எதிர்பார்ப்பு",
    requiredEvidence: "தேவையான ஆவணங்கள் / ஆதாரங்கள்",
    suggestedGuidance: "ARAM AI சட்ட வழிகாட்டுதல் & அடுத்த படிகள்",
    legalGuideActionPlan: "சட்ட வழிகாட்டியின் செயல் திட்டம்",
    grievanceSummary: "புகார் சுருக்கம்",
    estimatedExpenses: "மதிப்பிடப்பட்ட செலவு",
    problemExplanation: "பிரச்சனை விளக்கம்",
    propertyExplanation: "இது வாடகை / வீட்டு உரிமையாளர் தொடர்பான பிரச்சனையாக தெரிகிறது.",
    generalExplanation: "நீங்கள் வழங்கிய தகவல்களின் அடிப்படையில் இந்த பிரச்சனை சட்ட உதவிக்கு தகுதியானதாக இருக்கலாம்.",
    keyFacts: "முக்கிய உண்மைகள்",
    evidenceTitle: "உங்கள் வழக்கிற்கு உதவக்கூடிய ஆவணங்கள்",
    evidenceDesc: "இந்த ஆவணங்கள் உங்கள் வழக்கை மேலும் பலப்படுத்த உதவும்.",
    uploadButton: "ஆவணம் சேர்க்க",
    actionPlanTitle: "இப்போது நீங்கள் என்ன செய்யலாம்?",
    stepTitle: "படி",
    templateTitle: "மாதிரி செய்தி / கடிதம்",
    templateDesc: "இந்த செய்தியை நகலெடுத்து மற்ற தரப்பினருக்கு அனுப்பலாம்.",
    copyButton: "நகலெடு",
    copied: "நகலெடுக்கப்பட்டது!",
    authorityTitle: "அதிகாரபூர்வ உதவி மையம்",
    authorityDesc: "மேலும் உதவி தேவைப்பட்டால், இந்த அதிகாரப்பூர்வ அமைப்பை நீங்கள் அணுகலாம்.",
    mapsButton: "Google Maps-ல் பார்க்க",
    locationNotProvided: "சம்பவம் நடந்த இடம் வழங்கப்படவில்லை.",
    selfHelpTitle: "சுய உதவி வழிமுறைகள்",
    selfHelpDesc: "இந்த எளிய வழிமுறைகளைப் பின்பற்றி உங்கள் பிரச்சனையை நீங்களே தீர்க்க முயற்சி செய்யலாம்.",
    selfHelpItems: [
      "தேவையான அனைத்து ஆவணங்களையும் தயார் நிலையில் வைத்திருங்கள்.",
      "மற்ற தரப்பினருடன் எழுத்துப்பூர்வமாக தொடர்பு கொள்ளுங்கள்.",
      "அதிகாரப்பூர்வ அமைப்புகளின் விவரங்களை சேகரியுங்கள்.",
      "வழக்கு எண் மற்றும் ஆதாரங்களை பாதுகாப்பாக வையுங்கள்."
    ],
    guideRequestTitle: "உங்களுக்கு ARAM Legal Guide உதவி தேவையா?",
    guideRequestDesc: "இந்த வழிமுறைகள் உங்களுக்கு புரியவில்லை என்றால், ஆவணங்களைத் தயாரிப்பு செய்ய உதவி தேவைப்பட்டால் அல்லது உங்கள் வழக்கை தொடர்ந்து வழிகாட்ட ஒருவர் தேவைப்பட்டால் ARAM Legal Guide-ஐ கேட்கலாம்.",
    noGuideBtn: "இல்லை, நானே தொடர்கிறேன்",
    yesGuideBtn: "ஆம், ARAM Legal Guide வேண்டும்",
    guideRequestedStatus: "Legal Guide உதவி கோரப்பட்டுள்ளது. மாவட்ட நிர்வாகி விரைவில் ஒருவரை உங்களுக்கு நியமிப்பார்.",
    guideAssignedStatus: "Legal Guide நியமிக்கப்பட்டுள்ளார். உங்கள் வழக்கு விவாத பேனலில் தொடர்புகொள்ளலாம்.",
    termsTitle: "விதிமுறைகள் & நிபந்தனைகள்",
    termsCheck: "ARAM சட்ட தகவல்களையும் உதவிகளையும் மட்டுமே வழங்குகிறது, குறிப்பிட்ட சட்ட முடிவுகளுக்கு உத்தரவாதம் அளிக்காது என்பதை நான் ஒப்புக்கொள்கிறேன். மேலும் இந்த AI-வழிகாட்டுதல் தகவல் மட்டுமே என்பதை புரிந்து கொள்கிறேன்.",
    readAll: "முழு வழக்கையும் கேட்க",
    readAloud: "கேட்க",
    play: "விளையாடு",
    pause: "நிறுத்து",
    stop: "முடி",
    backBtn: "பின்செல்",
    printBtn: "அச்சிடுக",
    activeStatus: "செயலில் உள்ளது",
    resolvedStatus: "தீர்க்கப்பட்டது",
    pendingStatus: "மதிப்பாய்வில் உள்ளது",
    unassignedStatus: "ஒதுக்கப்படவில்லை",
    statusText: {
      SUBMITTED: "உங்கள் வழக்கு சமர்ப்பிக்கப்பட்டுள்ளது. ARAM AI மற்றும் மாவட்ட நிர்வாகி இதனை ஆய்வு செய்கின்றனர்.",
      AWAITING_ADMIN_REVIEW: "புகார் சமர்ப்பிக்கப்பட்டது. நிர்வாகி மதிப்பாய்விற்காக காத்திருக்கிறது.",
      UNDER_REVIEW: "உங்கள் வழக்கு தற்போது நிர்வாகியால் பரிசீலிக்கப்பட்டு வருகிறது.",
      GUIDE_ASSIGNED: "வழிகாட்டி நியமிக்கப்பட்டுள்ளார். நீங்கள் அவருடன் அரட்டையடிக்கலாம்.",
      RESOLVED: "வழக்கு வெற்றிகரமாக தீர்க்கப்பட்டது.",
      CLOSED: "வழக்கு மூடப்பட்டது."
    },
    journeySteps: [
      { title: "வழக்கு சமர்ப்பிக்கப்பட்டது", desc: "உங்கள் புகார் வெற்றிகரமாக பதிவு செய்யப்பட்டுள்ளது." },
      { title: "AI ஆய்வு", desc: "ARAM AI உங்கள் வழக்கை வகைப்படுத்தி பகுப்பாய்வு செய்துள்ளது." },
      { title: "நிர்வாகி மதிப்பாய்வு", desc: "மாவட்ட நிர்வாகி உங்கள் வழக்கை ஆய்வு செய்கிறார்." },
      { title: "வழிகாட்டி நியமனம்", desc: "சட்ட வழிகாட்டி நியமிக்கப்பட்டு உங்களுக்கு உதவத் தயாராக உள்ளார்." },
      { title: "ஆவணங்கள் சரிபார்ப்பு", desc: "தேவையான ஆதாரங்கள் சேகரிக்கப்பட்டு சரிபார்க்கப்படுகின்றன." },
      { title: "தீர்வு நிலை", desc: "வழக்கு வெற்றிகரமாக தீர்க்கப்பட்டு மூடப்பட்டது." }
    ],
    sla: {
      critical: "24 மணிநேரம் (முக்கியமானது)",
      high: "3 நாட்கள் (அவசரம்)",
      medium: "7 நாட்கள் (சாதாரணமானது)",
      low: "14 நாட்கள் (குறைந்த முன்னுரிமை)"
    }
  },
  "hi-IN": {
    title: "आपका मामला — सरल स्पष्टीकरण",
    subtext: "ARAM ने आपकी शिकायत को समझ लिया है और आगे क्या करना है, इसे सरलता से समझाया है।",
    complaintId: "मामला आईडी",
    status: "वर्तमान स्थिति",
    location: "घटना का स्थान",
    language: "भाषा",
    toldTitle: "आपने हमसे क्या कहा",
    understoodTitle: "ARAM ने क्या समझा",
    problemType: "समस्या का प्रकार",
    partiesTitle: "संबंधित पक्ष",
    timelineTitle: "मामले की समयरेखा",
    noTimeline: "समयरेखा की कोई जानकारी उपलब्ध नहीं है।",
    caseProgressJourney: "मामला प्रगति यात्रा",
    triageCategory: "कानूनी श्रेणी",
    urgencyLevel: "समाधान समय सीमा (SLA)",
    legalGuide: "नियुक्त कानूनी गाइड",
    dateSubmitted: "दर्ज करने की तिथि",
    whatHappensNext: "आगे क्या होगा?",
    originalDescription: "शिकायत का मूल विवरण",
    awaitingAssignment: "गाइड आवंटन की प्रतीक्षा है",
    citizenPerspective: "नागरिक का दृष्टिकोण",
    requiredEvidence: "आवश्यक दस्तावेज / साक्ष्य",
    suggestedGuidance: "ARAM AI कानूनी मार्गदर्शन",
    legalGuideActionPlan: "कानूनी गाइड कार्य योजना",
    grievanceSummary: "शिकायत सारांश",
    estimatedExpenses: "अनुमानित खर्च",
    problemExplanation: "समस्या का स्पष्टीकरण",
    propertyExplanation: "यह किराएदार / मकान मालिक से संबंधित समस्या प्रतीत होती है।",
    generalExplanation: "आपके द्वारा दी गई जानकारी के आधार पर, यह मामला कानूनी सहायता के योग्य हो सकता है।",
    keyFacts: "महत्वपूर्ण तथ्य",
    evidenceTitle: "दस्तावेज जो आपके मामले में मदद कर सकते हैं",
    evidenceDesc: "ये दस्तावेज आपके मामले को मजबूत करने में मदद कर सकते हैं।",
    uploadButton: "दस्तावेज जोड़ें",
    actionPlanTitle: "अब आप क्या कर सकते हैं?",
    stepTitle: "चरण",
    templateTitle: "संदेश / पत्र का प्रारूप",
    templateDesc: "आप इस संदेश को कॉपी करके दूसरे पक्ष को भेज सकते हैं।",
    copyButton: "कॉपी करें",
    copied: "कॉपी किया गया!",
    authorityTitle: "आधिकारिक सहायता केंद्र",
    authorityDesc: "यदि आपको अतिरिक्त सहायता की आवश्यकता है, तो आप इस आधिकारिक निकाय से संपर्क कर सकते हैं।",
    mapsButton: "Google Maps पर देखें",
    locationNotProvided: "घटना का स्थान प्रदान नहीं किया गया है।",
    selfHelpTitle: "स्व-सहायता निर्देश",
    selfHelpDesc: "इन सरल चरणों का पालन करके आप अपनी समस्या को स्वयं हल करने का प्रयास कर सकते हैं।",
    selfHelpItems: [
      "सभी आवश्यक दस्तावेजों को तैयार रखें।",
      "दूसरे पक्ष के साथ लिखित में संवाद करें।",
      "आधिकारिक निकायों के विवरण एकत्र करें।",
      "मामला संदर्भ आईडी और सबूतों को सुरक्षित रखें।"
    ],
    guideRequestTitle: "क्या आपको ARAM Legal Guide की सहायता चाहिए?",
    guideRequestDesc: "यदि आप इन निर्देशों को नहीं समझते हैं, दस्तावेजों को तैयार करने में मदद चाहिए, या अपने मामले में निरंतर मार्गदर्शन की आवश्यकता है, तो आप ARAM Legal Guide से मदद ले सकते हैं।",
    noGuideBtn: "नहीं, मैं स्वयं प्रयास करूँगा",
    yesGuideBtn: "हाँ, मुझे ARAM Legal Guide चाहिए",
    guideRequestedStatus: "Legal Guide की सहायता का अनुरोध किया गया है। जिला प्रशासक जल्द ही एक गाइड नियुक्त करेंगे।",
    guideAssignedStatus: "Legal Guide नियुक्त किया गया है। आप चर्चा पैनल में उनसे संपर्क कर सकते हैं।",
    termsTitle: "नियम और शर्तें",
    termsCheck: "मैं स्वीकार करता हूँ कि ARAM केवल कानूनी जानकारी और सहायता प्रदान करता है और किसी विशेष कानूनी परिणाम की गारंटी नहीं देता है। मैं यह भी समझता हूँ कि AI-जनित मार्गदर्शन केवल सूचनात्मक है।",
    readAll: "पूरा मामला सुनें",
    readAloud: "सुनें",
    play: "चलाएं",
    pause: "रोकें",
    stop: "बंद करें",
    backBtn: "वापस जाएं",
    printBtn: "प्रिंट करें",
    activeStatus: "सक्रिय",
    resolvedStatus: "सुलझाया गया",
    pendingStatus: "समीक्षा के अधीन",
    unassignedStatus: "अनिर्धारित",
    statusText: {
      SUBMITTED: "आपकी शिकायत दर्ज कर ली गई है। ARAM AI और जिला प्रशासक इसकी समीक्षा कर रहे हैं।",
      AWAITING_ADMIN_REVIEW: "शिकायत दर्ज। व्यवस्थापक समीक्षा की प्रतीक्षा है।",
      UNDER_REVIEW: "आपकी शिकायत वर्तमान में व्यवस्थापक द्वारा समीक्षा के अधीन है।",
      GUIDE_ASSIGNED: "कानूनी गाइड नियुक्त किया गया है। आप चर्चा पैनल में बातचीत कर सकते हैं।",
      RESOLVED: "मामला सफलतापूर्वक सुलझा लिया गया है।",
      CLOSED: "मामला बंद कर दिया गया है।"
    },
    journeySteps: [
      { title: "मामला दर्ज", desc: "आपकी शिकायत सफलतापूर्वक दर्ज कर ली गई है।" },
      { title: "AI समीक्षा", desc: "ARAM AI ने आपके मामले का वर्गीकरण और विश्लेषण किया है।" },
      { title: "व्यवस्थापक समीक्षा", desc: "जिला प्रशासक आपके मामले की समीक्षा कर रहे हैं।" },
      { title: "गाइड आवंटन", desc: "कानूनी गाइड नियुक्त किया गया है और वह आपकी सहायता के लिए तैयार है।" },
      { title: "दस्तावेज़ सत्यापन", desc: "आवश्यक साक्ष्य एकत्र और सत्यापित किए जा रहे हैं।" },
      { title: "समाधान स्थिति", desc: "मामला सफलतापूर्वक सुलझा लिया गया है और बंद कर दिया गया है।" }
    ],
    sla: {
      critical: "24 घंटे (गंभीर)",
      high: "3 दिन (उच्च)",
      medium: "7 दिन (सामान्य)",
      low: "14 दिन (कम प्राथमिकता)"
    }
  },
  "en-IN": {
    title: "Your Case — Explained Simply",
    subtext: "ARAM has understood your grievance and simplified what you can do next.",
    complaintId: "Complaint ID",
    status: "Current Status",
    location: "Location of Incident",
    language: "Language",
    toldTitle: "What you told us",
    understoodTitle: "What ARAM Understood",
    problemType: "Issue Category",
    partiesTitle: "Parties Involved",
    timelineTitle: "Case Timeline",
    noTimeline: "No timeline details are currently registered.",
    caseProgressJourney: "Complaint Progress Journey",
    triageCategory: "Legal Category",
    urgencyLevel: "Resolution SLA",
    legalGuide: "Assigned Legal Guide",
    dateSubmitted: "Date Submitted",
    whatHappensNext: "What happens next?",
    originalDescription: "Original Grievance Description",
    awaitingAssignment: "Awaiting Volunteer Assignment",
    citizenPerspective: "Citizen Perspective & Desired Relief",
    requiredEvidence: "Required Supporting Documents",
    suggestedGuidance: "ARAM AI Legal Guidance & Next Steps",
    legalGuideActionPlan: "Legal Guide Action Plan",
    grievanceSummary: "Grievance Summary",
    estimatedExpenses: "Estimated Expenses",
    problemExplanation: "Problem Explanation",
    propertyExplanation: "Based on your description, this appears to be a dispute related to rental/tenancy agreements.",
    generalExplanation: "Based on the information provided, this issue could fall within standard legal aid assistance.",
    keyFacts: "Key Extracted Facts",
    evidenceTitle: "Documents that can help your case",
    evidenceDesc: "These supporting files help build credibility for your claim.",
    uploadButton: "Upload Document",
    actionPlanTitle: "What can you do now?",
    stepTitle: "Step",
    templateTitle: "Draft Message / Communication Template",
    templateDesc: "You can copy and send this draft text to communicate with the opposing party.",
    copyButton: "Copy Draft",
    copied: "Copied!",
    authorityTitle: "Recommended Authority / Action Center",
    authorityDesc: "If the issue remains unresolved, you can file a formal complaint at this authority office.",
    mapsButton: "View on Google Maps",
    locationNotProvided: "Location was not provided.",
    selfHelpTitle: "Self-Help Guidelines",
    selfHelpDesc: "Follow these general recommendations to resolve the issue independently before legal escalation.",
    selfHelpItems: [
      "Keep all agreement letters, messages, and receipts organized.",
      "Communicate with the opposing party in writing.",
      "Collect information about verified authority centers.",
      "Securely note your case reference ID."
    ],
    guideRequestTitle: "Do you need an ARAM Legal Guide?",
    guideRequestDesc: "If you feel overwhelmed, need help preparing documents, or want direct professional representation, you can request an ARAM Legal Guide.",
    noGuideBtn: "No, I will handle it myself",
    yesGuideBtn: "Yes, Request Legal Guide assistance",
    guideRequestedStatus: "Legal Guide requested. A Regional Admin will assign a local representative shortly.",
    guideAssignedStatus: "Legal Guide assigned. You can connect directly in the case discussion panel.",
    termsTitle: "Terms & Conditions",
    termsCheck: "I understand that ARAM provides legal information and assistance and does not guarantee a particular legal outcome. I agree that AI-generated guidance is informational.",
    readAll: "Listen to entire case",
    readAloud: "Listen",
    play: "Play",
    pause: "Pause",
    stop: "Stop",
    backBtn: "Back",
    printBtn: "Print",
    activeStatus: "Active",
    resolvedStatus: "Resolved",
    pendingStatus: "Under Review",
    unassignedStatus: "Unassigned",
    statusText: {
      SUBMITTED: "Your complaint has been submitted. ARAM AI and the district administrator are reviewing it.",
      AWAITING_ADMIN_REVIEW: "Complaint submitted. Waiting for admin review.",
      UNDER_REVIEW: "Your complaint is currently under review by the administrator.",
      GUIDE_ASSIGNED: "A Legal Guide has been assigned. You can chat with them directly.",
      RESOLVED: "The case has been resolved successfully.",
      CLOSED: "The case has been closed."
    },
    journeySteps: [
      { title: "Complaint Submitted", desc: "Your complaint has been registered successfully." },
      { title: "AI Analysis", desc: "ARAM AI has classified and analyzed your case." },
      { title: "Admin Review", desc: "District Administrator is reviewing your case details." },
      { title: "Guide Assigned", desc: "Legal Guide assigned and ready to assist you." },
      { title: "Evidence Verification", desc: "Required evidence files are collected and verified." },
      { title: "Case Resolution", desc: "The case has been successfully resolved and closed." }
    ],
    sla: {
      critical: "24 hours (Critical)",
      high: "3 days (High)",
      medium: "7 days (Medium)",
      low: "14 days (Low Priority)"
    }
  }
};

const getLocalizedCategory = (cat, lang) => {
  if (!cat) return "";
  const cleanCat = cat.replace(/_/g, " ").toUpperCase();
  const map = {
    "ta-IN": {
      "PROPERTY CIVIL DISPUTE": "சொத்து / சிவில் தகராறு",
      "LABOUR DISPUTE": "தொழிலாளர் / வேலைவாய்ப்பு தகராறு",
      "CYBER CRIME": "சைபர் குற்றம்",
      "CONSUMER COMPLAINT": "நுகர்வோர் குறைபாடு",
      "WOMEN SAFETY DOMESTIC VIOLENCE": "பெண்கள் பாதுகாப்பு / குடும்ப वன்முறை",
      "CRIMINAL COMPLAINT": "குற்றவியல் புகார்"
    },
    "hi-IN": {
      "PROPERTY CIVIL DISPUTE": "संपत्ति / नागरिक विवाद",
      "LABOUR DISPUTE": "श्रम / रोजगार विवाद",
      "CYBER CRIME": "साइबर अपराध",
      "CONSUMER COMPLAINT": "उपभोगता शिकायत",
      "WOMEN SAFETY DOMESTIC VIOLENCE": "महिला सुरक्षा / घरेलू हिंसा",
      "CRIMINAL COMPLAINT": "आपराधिक शिकायत"
    },
    "en-IN": {
      "PROPERTY CIVIL DISPUTE": "Property / Civil Dispute",
      "LABOUR DISPUTE": "Labour / Employment Dispute",
      "CYBER CRIME": "Cyber Crime",
      "CONSUMER COMPLAINT": "Consumer Complaint",
      "WOMEN SAFETY DOMESTIC VIOLENCE": "Women Safety / Domestic Violence",
      "CRIMINAL COMPLAINT": "Criminal Complaint"
    }
  };
  return map[lang]?.[cleanCat] || map["en-IN"]?.[cleanCat] || cleanCat;
};

// Update 1: Legal glossary tooltip component
const GLOSSARY = {
  SLA: "Service Level Agreement — the guaranteed response time for your case based on its urgency level.",
  Mediation: "A structured discussion between two parties facilitated by a neutral Legal Guide to reach a mutual agreement.",
  Escalation: "The process of raising your complaint to a higher authority for faster action when normal review is delayed.",
  Triage: "The AI analysis step where your complaint is categorized by legal type and urgency automatically.",
  "Action Plan": "A step-by-step legal guidance document prepared by your assigned Legal Guide to resolve your issue.",
  OCR: "Optical Character Recognition — the technology used to automatically read and extract text from your uploaded documents.",
  DLSA: "District Legal Services Authority — the government body providing free legal aid in each district.",
};

const GlossaryTip = ({ term }) => (
  <span
    title={GLOSSARY[term] || term}
    className="border-b border-dashed border-indigo-400 text-indigo-700 cursor-help font-semibold"
  >
    {term}
  </span>
);


const ComplaintDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionPlan, setActionPlan] = useState(null);
  const [offices, setOffices] = useState([]);
  const [costEstimate, setCostEstimate] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const [docRequests, setDocRequests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [caseNotes, setCaseNotes] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackHelpful, setFeedbackHelpful] = useState(true);
  const [submittingFlow, setSubmittingFlow] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        const data = await complaintService.getComplaintById(Number(id) || id);
        setComplaint(data);
      } catch (err) {
        console.error("Failed to load complaint details:", err);
        toast.error("Failed to load complaint details.");
        setLoading(false);
        return;
      }

      // Fetch auxiliary data with silent graceful fallbacks
      try {
        const planData = await complaintService.getActionPlan(id);
        setActionPlan(planData);
      } catch (e) {}

      try {
        const officesData = await complaintService.getAuthorityLocations(id);
        setOffices(officesData || []);
      } catch (e) {}

      try {
        const costData = await complaintService.getCostEstimate(id);
        setCostEstimate(costData);
      } catch (e) {}

      try {
        const docReqsData = await complaintService.getDocumentRequests(id);
        setDocRequests(docReqsData || []);
      } catch (e) {}

      try {
        const appsData = await complaintService.getAppointments(id);
        setAppointments(appsData || []);
      } catch (e) {}

      try {
        const notesData = await complaintService.getCaseNotes(id);
        setCaseNotes(notesData || []);
      } catch (e) {}

      setLoading(false);
    };
    fetchDetails();
  }, [id]);

  const handleUploadDocument = async (requestId, file) => {
    if (!file) return;
    setSubmittingFlow(true);
    toast.loading("Uploading requested document...");
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      await complaintService.uploadRequestedDocument(requestId, id, uploadFormData);
      toast.dismiss();
      toast.success("Document uploaded successfully!");
      const docReqsData = await complaintService.getDocumentRequests(id);
      setDocRequests(docReqsData);
    } catch (err) {
      toast.dismiss();
      toast.error("Document upload failed.");
    } finally {
      setSubmittingFlow(false);
    }
  };

  const handleRequestCall = async (mode, preferredTime, note) => {
    setSubmittingFlow(true);
    try {
      await complaintService.requestCall({
        complaintId: id,
        mode,
        preferredTime,
        note
      });
      toast.success("Call/Appointment requested successfully!");
      const appsData = await complaintService.getAppointments(id);
      setAppointments(appsData);
    } catch (err) {
      toast.error("Failed to request call.");
    } finally {
      setSubmittingFlow(false);
    }
  };

  const handleConfirmResolution = async () => {
    setSubmittingFlow(true);
    try {
      await complaintService.submitFeedback({
        complaintId: id,
        rating: feedbackRating,
        comment: feedbackComment,
        helpful: feedbackHelpful
      });
      const updated = await complaintService.updateWorkflowStatus(id, {
        status: "CLOSED_BY_USER",
        details: "Citizen confirmed case resolved successfully"
      });
      setComplaint(updated);
      setShowFeedbackModal(false);
      toast.success("Case resolved and closed! Thank you for your feedback.");
    } catch (err) {
      toast.error("Failed to close complaint.");
    } finally {
      setSubmittingFlow(false);
    }
  };

  const handleReopenCase = async () => {
    if (!reopenReason.trim()) {
      toast.error("Please enter a reason to reopen your case.");
      return;
    }
    setSubmittingFlow(true);
    try {
      const updated = await complaintService.updateWorkflowStatus(id, {
        status: "REOPEN_REQUESTED",
        details: reopenReason.trim()
      });
      setComplaint(updated);
      setShowReopenModal(false);
      toast.success("Case reopen request submitted to Admin.");
    } catch (err) {
      toast.error("Failed to reopen case.");
    } finally {
      setSubmittingFlow(false);
    }
  };

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng });
        toast.success("Location retrieved! Sorting nearest offices...");
        try {
          const officesData = await complaintService.getAuthorityLocations(id, lat, lng);
          setOffices(officesData);
        } catch (err) {
          toast.error("Failed to load sorted locations.");
        }
      },
      (error) => {
        toast.error("Location access denied.");
        console.error(error);
      }
    );
  };
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#163D32]"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!complaint) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center text-[#65736D] space-y-4">
          <p>Complaint not found.</p>
          <button onClick={() => navigate("/citizen/history")} className="btn-aram-primary">
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Resolve case language first
  const caseLang = complaint?.language || "en-IN";
  const normalizedLang = caseLang.toLowerCase().includes("tamil") || caseLang.startsWith("ta")
    ? "ta-IN"
    : caseLang.toLowerCase().includes("hindi") || caseLang.startsWith("hi")
    ? "hi-IN"
    : "en-IN";
  const t = TRANSLATIONS[normalizedLang] || TRANSLATIONS["en-IN"];

  const categoryRaw = complaint.categoryLabel || complaint.category || "GENERAL_LEGAL_AID";
  const category = getLocalizedCategory(categoryRaw, normalizedLang);
  const priority = complaint.priority || "MEDIUM";
  const status = complaint.status || "SUBMITTED";
  const desc = complaint.description || "";
  const docs = complaint.aiResult?.requiredDocuments || ["Aadhaar Card"];
  const steps = complaint.aiResult?.nextSteps || ["Awaiting volunteer assignment review."];
  const visibility = complaint.identityVisibility || "VISIBLE";

  const getActiveStepIndex = () => {
    if (status === "RESOLVED" || status === "CLOSED" || status === "RESOLVED_BY_GUIDE" || status === "CLOSED_BY_USER") return 6; // Resolved
    
    const hasDocs = docRequests && docRequests.length > 0;
    const allDocsDone = hasDocs && docRequests.every(r => r.status === "VERIFIED" || r.status === "UPLOADED");
    if (allDocsDone) return 5; // Documents
    
    if (actionPlan) return 4; // Action Plan
    if (complaint.assignedHelperId) return 3; // Legal Guide Assigned
    if (status === "UNDER_REVIEW") return 2; // Admin Review
    return 1; // AI Checked (Step 1 is Submitted, Step 2 is AI Checked)
  };
  
  const activeStep = getActiveStepIndex();

  const getWhatHappensNextExplanation = () => {
    const s = (status || "SUBMITTED").toUpperCase();
    const map = {
      SUBMITTED: {
        title: "Initial AI Triage & District Review",
        desc: t.statusText?.SUBMITTED || "Your complaint has been submitted. ARAM AI and the district administrator are reviewing it."
      },
      UNDER_REVIEW: {
        title: "District Administrator Jurisdiction Review",
        desc: t.statusText?.UNDER_REVIEW || "Your complaint is currently under review by the district administrator."
      },
      HELPER_ASSIGNED: {
        title: "Legal Guide Assigned & Active",
        desc: t.statusText?.GUIDE_ASSIGNED || "A Legal Guide has been assigned. You can chat with them directly."
      },
      GUIDE_ASSIGNED: {
        title: "Legal Guide Assigned & Active",
        desc: t.statusText?.GUIDE_ASSIGNED || "A Legal Guide has been assigned. You can chat with them directly."
      },
      IN_PROGRESS: {
        title: "Action Plan In Progress",
        desc: "Your assigned Legal Guide is working on your case roadmap and evidence verification."
      },
      RESOLVED: {
        title: "Case Successfully Resolved",
        desc: t.statusText?.RESOLVED || "The case has been resolved successfully."
      },
      RESOLVED_BY_GUIDE: {
        title: "Case Resolved by Guide",
        desc: "Legal Guide has submitted resolution. Please verify and confirm to close the case."
      },
      CLOSED: {
        title: "Case Closed",
        desc: t.statusText?.CLOSED || "The case has been closed."
      },
      CLOSED_BY_USER: {
        title: "Closed by Citizen",
        desc: "You have verified and confirmed resolution of this complaint."
      }
    };
    return map[s] || map["SUBMITTED"];
  };

  const nextHelp = getWhatHappensNextExplanation();
  
  const journeySteps = t.journeySteps;

  const getSlaDeadline = (priorityVal) => {
    const sla = t.sla;
    switch (priorityVal?.toUpperCase()) {
      case "CRITICAL":
        return sla.critical;
      case "HIGH":
        return sla.high;
      case "MEDIUM":
        return sla.medium;
      case "LOW":
      default:
        return sla.low;
    }
  };

  const handleWhatsAppShare = () => {
    const formattedId = `ARAM-2026-${String(complaint.id).replace("cmp-", "").padStart(6, "0")}`;
    const text = `My ARAM complaint ID is ${formattedId} and its status is ${status}. You can check updates on the ARAM tracking portal.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    toast.success("Opened WhatsApp share link!");
  };

  const drawMockQRCode = () => (
    <svg width="100" height="100" viewBox="0 0 100 100" className="mx-auto border border-slate-200 p-1.5 bg-white rounded-lg">
      <rect width="10" height="10" x="5" y="5" fill="black" />
      <rect width="10" height="10" x="85" y="5" fill="black" />
      <rect width="10" height="10" x="5" y="85" fill="black" />
      <rect width="10" height="10" x="20" y="20" fill="black" />
      <rect width="10" height="10" x="40" y="10" fill="black" />
      <rect width="10" height="10" x="60" y="40" fill="black" />
      <rect width="10" height="10" x="30" y="60" fill="black" />
      <rect width="10" height="10" x="70" y="20" fill="black" />
      <rect width="10" height="10" x="50" y="70" fill="black" />
      <rect width="10" height="10" x="80" y="80" fill="black" />
      <rect width="10" height="10" x="5" y="45" fill="black" />
      <rect width="10" height="10" x="45" y="5" fill="black" />
      <rect width="10" height="10" x="85" y="45" fill="black" />
      <rect width="10" height="10" x="45" y="85" fill="black" />
    </svg>
  );

  const formattedRefId = complaint.complaintCustomId || complaint.formattedComplaintId || `CMP-2026-${String(complaint.id).replace("cmp-", "").padStart(6, "0")}`;

  // 24-Hour Emergency SLA Calculation for Sensitive & High Risk Cases
  const isEmergencyCase = Boolean(
    complaint.highRisk ||
    priority === "CRITICAL" ||
    priority === "URGENT" ||
    categoryRaw.toUpperCase().includes("DOMESTIC") ||
    categoryRaw.toUpperCase().includes("WOMEN")
  );
  const createdTimestamp = new Date(complaint.createdAt).getTime();
  const slaDeadlineMs = createdTimestamp + 24 * 60 * 60 * 1000;
  const nowMs = Date.now();
  const slaRemainingMs = slaDeadlineMs - nowMs;
  const slaHoursLeft = Math.max(0, Math.floor(slaRemainingMs / (1000 * 60 * 60)));
  const slaMinsLeft = Math.max(0, Math.floor((slaRemainingMs % (1000 * 60 * 60)) / (1000 * 60)));
  const isSlaBreached = isEmergencyCase && slaRemainingMs <= 0;

  // 14-Day Lok Adalat Statutory Escalation Gateway (Sec 19, LSA Act 1987)
  const daysSinceFiling = Math.max(0, Math.floor((nowMs - createdTimestamp) / (1000 * 60 * 60 * 24)));
  const isLokAdalatEligible = daysSinceFiling >= 14 || ["SUBMITTED", "AWAITING_ADMIN_REVIEW", "UNDER_REVIEW"].includes(status);

  return (
    <DashboardLayout>
      {/* Official Bilingual TNSLSA Statutory Legal Aid Petition */}
      <div id="print-packet" className="hidden print:block p-8 font-serif text-slate-900 text-sm space-y-6 max-w-4xl mx-auto bg-white">
        <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
          <div className="text-xs font-bold tracking-widest uppercase text-slate-700">
            தமிழ்நாடு மாநில சட்டப் பணிகள் ஆணைக்குழு
          </div>
          <h1 className="text-xl font-black tracking-wider uppercase">
            TAMIL NADU STATE LEGAL SERVICES AUTHORITY (TNSLSA)
          </h1>
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-800">
            DISTRICT LEGAL SERVICES AUTHORITY (DLSA) — {complaint.district?.toUpperCase() || "DISTRICT"} DESK
          </h2>
          <p className="text-[11px] font-bold tracking-wider text-slate-700 mt-1">
            FORM-1: APPLICATION FOR LEGAL SERVICES / PRE-LITIGATION PETITION
          </p>
          <p className="text-[10px] italic text-slate-600">
            [Under Section 12 & 13 of the Legal Services Authorities Act, 1987]
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 border border-slate-800 p-3 text-xs bg-slate-50">
          <div><strong>ARAM Petition Ref:</strong> <span className="font-mono font-bold">{formattedRefId}</span></div>
          <div><strong>District Jurisdiction:</strong> {complaint.district || "Tamil Nadu"}</div>
          <div><strong>Date of Registration:</strong> {new Date(complaint.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          <div><strong>Statutory SLA:</strong> {getSlaDeadline(priority)}</div>
          <div><strong>Dispute Category:</strong> {category}</div>
          <div><strong>Registry Status:</strong> {status}</div>
        </div>

        <div className="space-y-1.5">
          <h3 className="font-bold text-xs uppercase tracking-wider border-b border-slate-400 pb-1">
            Section I: Particulars of the Applicant (மனுதாரர் விவரங்கள்)
          </h3>
          <table className="w-full text-xs border-collapse border border-slate-300">
            <tbody>
              <tr className="border border-slate-300">
                <td className="w-1/3 p-2 font-semibold bg-slate-100">Full Name of Applicant:</td>
                <td className="p-2 font-bold">{complaint.userName || "Verified Citizen"}</td>
              </tr>
              <tr className="border border-slate-300">
                <td className="p-2 font-semibold bg-slate-100">District / Taluk of Residence:</td>
                <td className="p-2">{complaint.district || "Tamil Nadu"}</td>
              </tr>
              <tr className="border border-slate-300">
                <td className="p-2 font-semibold bg-slate-100">Legal Aid Eligibility Status:</td>
                <td className="p-2 font-medium text-emerald-800">Qualified Citizen under Section 12 of LSA Act 1987 (Free Legal Aid Scheme)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="space-y-1.5">
          <h3 className="font-bold text-xs uppercase tracking-wider border-b border-slate-400 pb-1">
            Section II: Statement of Facts & Grievance (புகார் விவரங்கள்)
          </h3>
          <div className="p-3 border border-slate-300 rounded text-xs leading-relaxed whitespace-pre-line text-justify bg-slate-50/50">
            {desc}
          </div>
          {complaint.citizenOpinion && (
            <div className="p-2.5 border border-slate-200 rounded text-xs bg-slate-50">
              <strong>Relief Sought by Citizen:</strong> {complaint.citizenOpinion}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <h3 className="font-bold text-xs uppercase tracking-wider border-b border-slate-400 pb-1">
            Section III: Supporting Evidence & Documents (இணைக்கப்பட்ட ஆவணங்கள்)
          </h3>
          <ol className="list-decimal list-inside text-xs space-y-1 pl-2">
            {docs.map((d, i) => (
              <li key={i}><span className="font-semibold">{d}</span> — Verified through ARAM OCR Pipeline</li>
            ))}
          </ol>
        </div>

        {actionPlan && (
          <div className="space-y-1.5">
            <h3 className="font-bold text-xs uppercase tracking-wider border-b border-slate-400 pb-1">
              Section IV: Legal Aid Guide Conciliation Roadmap
            </h3>
            <div className="p-2.5 border border-slate-200 rounded text-xs bg-slate-50">
              <p><strong>Immediate Steps:</strong> {actionPlan.immediateSteps || actionPlan.planText || actionPlan.description}</p>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-400 space-y-4">
          <p className="text-[11px] leading-relaxed text-justify">
            <strong>VERIFICATION:</strong> I hereby solemnly verify and affirm that the contents of this petition are true to my knowledge and belief. I pray that the District Legal Services Authority provide legal guidance, appoint a panel counsel, or place the dispute before the Lok Adalat for amicable pre-litigation settlement.
          </p>
          
          <div className="flex justify-between items-end pt-4">
            <div className="space-y-1">
              <div className="w-52 border-b border-slate-800"></div>
              <p className="text-[10px] font-bold uppercase tracking-wider">Signature / Thumb Impression of Applicant</p>
              <p className="text-[9px] text-slate-500">Date: {new Date().toLocaleDateString("en-IN")}</p>
            </div>

            <div className="flex items-center gap-3 border-2 border-[#163D32] p-2 rounded-lg bg-[#DCEBDD]/20">
              <div className="shrink-0">{drawMockQRCode()}</div>
              <div className="text-left text-[9px] text-[#163D32] font-sans space-y-0.5">
                <p className="font-black tracking-wider uppercase">ARAM TAMPER-PROOF DIGITAL SEAL</p>
                <p>Govt. of Tamil Nadu • DLSA Legal Aid Network</p>
                <p className="font-mono text-[8px] text-slate-600">CERT: {formattedRefId}-DLSA-TN</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="print:hidden space-y-6 max-w-4xl mx-auto">
        {/* 24-Hour Sensitive Case Emergency SLA Countdown Banner */}
        {isEmergencyCase && (
          <div className="rounded-2xl border-2 border-[#C94B4B]/30 bg-gradient-to-r from-red-50 via-[#FFFDF8] to-red-50 p-5 text-xs text-red-950 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-[#C94B4B] text-white flex items-center justify-center font-bold text-sm shrink-0 animate-pulse">
                  <Timer size={18} />
                </div>
                <div>
                  <span className="font-black text-xs uppercase tracking-wider text-[#C94B4B] block">
                    24-Hour Statutory Emergency SLA Active
                  </span>
                  <span className="text-[11px] text-[#65736D] font-medium">
                    Priority Triage Protocol under Section 12, Legal Services Authorities Act
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase ${
                  isSlaBreached ? "bg-red-700 text-white animate-bounce" : "bg-red-100 text-[#C94B4B] border border-red-300"
                }`}>
                  {isSlaBreached ? "⚠️ SLA Escalated to DLSA" : `⏱️ ${slaHoursLeft}h ${slaMinsLeft}m Remaining`}
                </span>
              </div>
            </div>

            <p className="leading-relaxed font-semibold text-[#18332B]">
              This complaint involves sensitive rights protection. The District Admin and Regional Legal Aid desk are statutory-bound to review and assign intervention within 24 hours.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 font-bold">
              <a href="tel:181" className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 rounded-xl hover:bg-red-50 text-red-900 transition text-[11px] shadow-2xs cursor-pointer">
                <PhoneCall size={13} className="text-[#C94B4B]" /> Women Helpline (181)
              </a>
              <a href="tel:112" className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 rounded-xl hover:bg-red-50 text-red-900 transition text-[11px] shadow-2xs cursor-pointer">
                <PhoneCall size={13} className="text-[#C94B4B]" /> Police Emergency (112)
              </a>
              <a href="tel:1930" className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 rounded-xl hover:bg-red-50 text-red-900 transition text-[11px] shadow-2xs cursor-pointer">
                <PhoneCall size={13} className="text-[#C94B4B]" /> Cyber Crime Helpline (1930)
              </a>
              <button
                type="button"
                onClick={() => toast.success("Priority SLA notice sent to District Legal Aid Secretary.")}
                className="ml-auto px-3.5 py-1.5 bg-[#163D32] hover:bg-[#1F5948] text-white rounded-xl text-[11px] font-bold transition shadow-2xs cursor-pointer"
              >
                Notify District Desk ⚡
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E1D8] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#65736D] font-bold uppercase tracking-wider mb-1">
              <button
                type="button"
                onClick={() => navigate("/citizen/history")}
                className="hover:text-[#163D32] flex items-center gap-1 transition cursor-pointer"
              >
                <ArrowLeft size={14} /> My Complaints
              </button>
              <span>/</span>
              <span className="text-[#163D32]">{complaint.complaintCustomId || formattedRefId}</span>
            </div>
            <h1 className="text-2xl font-black text-[#163D32] tracking-tight">
              {complaint.title || `${category} — Case #${complaint.id}`}
            </h1>
            <p className="text-xs text-[#65736D] mt-0.5 font-medium">
              ID: <strong className="text-[#163D32]">{complaint.complaintCustomId || formattedRefId}</strong> • Jurisdiction: <strong className="text-[#163D32]">{complaint.district || "Coimbatore"}</strong> • Status: <span className="font-bold text-[#1F5948] bg-[#DCEBDD] px-2 py-0.5 rounded-full">{status}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-xs font-bold text-white transition bg-[#163D32] hover:bg-[#1F5948] px-4 py-2.5 rounded-xl border border-[#163D32] cursor-pointer shadow-sm"
            >
              <FileText size={14} /> Official Petition (PDF) ⚖️
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 transition bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2.5 rounded-xl border border-emerald-200 cursor-pointer"
            >
              Share via WhatsApp
            </button>
          </div>
        </div>

        {/* Visibility Alert if partial/hidden */}
        {visibility !== "VISIBLE" && (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-900 text-xs flex items-center gap-2">
            <BadgeAlert size={16} className="text-amber-600 shrink-0" />
            <span>
              <strong>Identity Visibility Shield Enabled:</strong> Your profile is configured as <strong>{visibility}</strong>. Volunteers will not see your personal details.
            </span>
          </div>
        )}

        {/* End-to-End Encryption Banner */}
        <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 text-emerald-950 text-xs flex items-center gap-3 shadow-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <strong className="block text-emerald-900">🔒 End-to-End Encrypted Complaint</strong>
            <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
              Your grievance text and uploaded evidence are fully protected by industry-standard end-to-end cryptographic shielding. Only you, your assigned Legal Guide, and reviewing administrators can read or decrypt this complaint.
            </p>
          </div>
        </div>

        {/* One-page complaint journey step tracker */}
        <div className="rounded-3xl bg-[#FFFDF8] p-6 shadow-sm border border-[#E6E1D8] space-y-4">
          <h3 className="text-xs font-extrabold text-[#163D32] uppercase tracking-wider mb-2">{t.caseProgressJourney}</h3>
          
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-2">
            {/* Connection line for desktop */}
            <div className="hidden md:block absolute left-6 right-6 top-5 h-[2.5px] bg-[#E6E1D8] -z-0">
              <div 
                className="h-full bg-[#163D32] transition-all duration-500" 
                style={{ width: `${(activeStep / (journeySteps.length - 1)) * 100}%` }}
              ></div>
            </div>
            
            {journeySteps.map((step, idx) => {
              const isCompleted = idx <= activeStep;
              const isCurrent = idx === activeStep;
              return (
                <div key={idx} className="flex md:flex-col items-center gap-3.5 md:gap-2 relative z-10 flex-1 w-full md:w-auto">
                  {/* Circle element */}
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-black text-xs border-2 transition-all duration-300 ${
                    isCompleted 
                      ? "bg-[#163D32] border-[#163D32] text-white shadow-sm" 
                      : "bg-[#FFFDF8] border-[#E6E1D8] text-[#8B9690]"
                  } ${isCurrent ? "ring-4 ring-[#DCEBDD]" : ""}`}>
                    {isCompleted && idx < activeStep ? "✓" : idx + 1}
                  </div>
                  
                  {/* Label */}
                  <div className="text-left md:text-center">
                    <span className={`block text-xs font-bold ${isCompleted ? "text-[#18332B]" : "text-[#8B9690]"}`}>{step.title}</span>
                    <span className="block text-[10px] text-[#65736D] font-medium mt-0.5 max-w-[130px] leading-tight">{step.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#E6E1D8] bg-[#FFFDF8] p-5 shadow-sm">
            <p className="text-[10px] text-[#65736D] font-bold uppercase tracking-wider">{t.triageCategory}</p>
            <h3 className="text-sm font-black text-[#163D32] mt-1">{category}</h3>
          </div>
          <div className="rounded-2xl border border-[#E6E1D8] bg-[#FFFDF8] p-5 shadow-sm">
            <p className="text-[10px] text-[#65736D] font-bold uppercase tracking-wider">{t.urgencyLevel}</p>
            <h3 className="text-sm font-black text-[#B96845] mt-1">{getSlaDeadline(priority)}</h3>
          </div>
          <div className="rounded-2xl border border-[#E6E1D8] bg-[#FFFDF8] p-5 shadow-sm">
            <p className="text-[10px] text-[#65736D] font-bold uppercase tracking-wider">{t.legalGuide}</p>
            <h3 className="text-sm font-black text-[#1F5948] mt-1">{complaint.assignedHelperName || t.awaitingAssignment}</h3>
          </div>
          <div className="rounded-2xl border border-[#E6E1D8] bg-[#FFFDF8] p-5 shadow-sm">
            <p className="text-[10px] text-[#65736D] font-bold uppercase tracking-wider">{t.dateSubmitted}</p>
            <h3 className="text-sm font-black text-[#18332B] mt-1">{new Date(complaint.createdAt).toLocaleDateString()}</h3>
          </div>
        </div>

        {/* What happens next card */}
        <div className="rounded-2xl border border-[#DCEBDD] bg-[#DCEBDD]/30 p-5 text-xs text-[#18332B] space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="text-base">📋</span>
            <span className="font-bold uppercase tracking-wider text-[#163D32]">{t.whatHappensNext}</span>
          </div>
          <div className="pl-6 space-y-1">
            <strong className="text-[#18332B] font-bold block">{nextHelp.title}</strong>
            <p className="leading-relaxed text-[#65736D] font-medium">{nextHelp.desc}</p>
          </div>
        </div>

        {/* 14-Day DLSA & Lok Adalat Conciliation Escalation Gateway (Sec 19, LSA Act 1987) */}
        <div className="rounded-2xl border-2 border-[#D4AF37]/40 bg-gradient-to-br from-[#FFFDF8] via-amber-50/20 to-[#FFFDF8] p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E1D8] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-[#C58A25]/15 text-[#C58A25] flex items-center justify-center font-bold text-sm shrink-0">
                <Scale size={18} />
              </div>
              <div>
                <h3 className="font-black text-xs uppercase tracking-wider text-[#163D32]">
                  DLSA Lok Adalat Pre-Litigation Escalation Gateway
                </h3>
                <p className="text-[11px] text-[#65736D] font-medium">
                  Statutory Conciliation under Section 19 & 20, Legal Services Authorities Act, 1987
                </p>
              </div>
            </div>

            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider self-start sm:self-auto ${
              daysSinceFiling >= 14 
                ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                : "bg-amber-100 text-[#B96845] border border-amber-300"
            }`}>
              {daysSinceFiling >= 14 
                ? `Eligible for Lok Adalat Hearing (${daysSinceFiling} Days Active)`
                : `Conciliation Window: Day ${daysSinceFiling} of 14`}
            </span>
          </div>

          <p className="text-xs text-[#18332B] leading-relaxed font-medium">
            Under Section 19 of the LSA Act 1987, citizens residing in <strong>{complaint.district || "Tamil Nadu"}</strong> are entitled to free, binding dispute conciliation through the District Legal Services Authority (DLSA) Lok Adalat bench without filing court fees.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#F7F1E6]/60 rounded-xl border border-[#E6E1D8] space-y-1">
              <span className="text-[10px] font-bold text-[#65736D] uppercase block">Regional Bench Venue</span>
              <span className="font-bold text-[#163D32] block">
                District Combined Court Complex, {complaint.district || "District Desk"}, Tamil Nadu
              </span>
            </div>
            <div className="p-3 bg-[#F7F1E6]/60 rounded-xl border border-[#E6E1D8] space-y-1">
              <span className="text-[10px] font-bold text-[#65736D] uppercase block">DLSA Pre-Litigation Benefits</span>
              <span className="font-bold text-emerald-800 block">
                Zero Court Fees • Free Legal Aid Counsel • Non-Adversarial Settlement
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#163D32] hover:bg-[#1F5948] text-white rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <FileText size={14} /> Download Lok Adalat Pre-Litigation Dossier
            </button>
            <button
              type="button"
              onClick={() => toast.success(`Referral docket queued for DLSA Secretary, ${complaint.district || "District"} Desk.`)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#FFFDF8] hover:bg-[#F7F1E6] text-[#163D32] border border-[#D4AF37] rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <Scale size={14} className="text-[#C58A25]" /> Request Lok Adalat Referral
            </button>
          </div>
        </div>

        {/* Description Panel */}
        <div className="rounded-2xl border border-[#E6E1D8] bg-[#FFFDF8] p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#18332B] uppercase tracking-wider">{t.originalDescription}</h3>
            <ReadAloudButton text={desc} language={normalizedLang} />
          </div>
          <div className="rounded-xl bg-[#F7F1E6]/50 p-4 text-xs leading-relaxed text-[#18332B] border border-[#E6E1D8] whitespace-pre-line">
            {desc}
          </div>
        </div>

        {/* Citizen Opinion / Additional Details Panel */}
        {(complaint.citizenOpinion || complaint.additionalDetails) && (
          <div className="rounded-2xl border border-[#DCEBDD] bg-[#DCEBDD]/20 p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#163D32] uppercase tracking-wider">{t.citizenPerspective}</h3>
            {complaint.citizenOpinion && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#65736D] uppercase">Citizen Opinion / Desired Relief:</span>
                <p className="rounded-xl bg-[#FFFDF8] p-3.5 text-xs leading-relaxed text-[#18332B] border border-[#E6E1D8]">
                  {complaint.citizenOpinion}
                </p>
              </div>
            )}
            {complaint.additionalDetails && (
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold text-[#65736D] uppercase">Additional Context:</span>
                <p className="rounded-xl bg-[#FFFDF8] p-3.5 text-xs leading-relaxed text-[#18332B] border border-[#E6E1D8]">
                  {complaint.additionalDetails}
                </p>
              </div>
            )}
          </div>
        )}

        {/* AI Analysis Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Required Evidence */}
          <div className="rounded-2xl border border-[#E6E1D8] bg-[#FFFDF8] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#18332B] uppercase tracking-wider">{t.requiredEvidence}</h3>
              <ReadAloudButton text={`${t.requiredEvidence}: ${docs.join(", ")}`} language={normalizedLang} />
            </div>
            <div className="space-y-2">
              {docs.map((doc, idx) => (
                <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F7F1E6]/50 border border-[#E6E1D8] text-xs font-semibold text-[#18332B]">
                  <FileText size={16} className="text-[#1F5948] shrink-0" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Next Steps */}
          <div className="rounded-2xl border border-[#E6E1D8] bg-[#FFFDF8] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#18332B] uppercase tracking-wider">{t.suggestedGuidance}</h3>
              <ReadAloudButton text={steps.join(". ")} language={normalizedLang} />
            </div>
            <div className="space-y-2">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F7F1E6]/50 border border-[#E6E1D8] text-xs text-[#18332B]">
                  <span className="h-5 w-5 shrink-0 bg-[#DCEBDD] text-[#163D32] rounded-full flex items-center justify-center font-bold text-[10px]">{idx + 1}</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Next Action Plan Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 mt-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-805 tracking-tight flex items-center gap-2 uppercase">
              <span>📋</span> {t.legalGuideActionPlan}
            </h3>
            {actionPlan && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-green-50 text-green-700">
                Active Plan
              </span>
            )}
          </div>

          {!actionPlan ? (
            <div className="text-center py-6 text-slate-500 space-y-2">
              <p className="text-xs font-medium">
                Your Legal Guide is currently reviewing your case details and will share your custom step-by-step Next Action Plan shortly.
              </p>
              <p className="text-[10px] text-slate-400">
                You will be notified once next steps are shared.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary */}
              {actionPlan.summary && (
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Solution Summary</h4>
                  <p className="text-xs leading-relaxed text-slate-650 bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
                    {actionPlan.summary}
                  </p>
                </div>
              )}

              {/* Immediate Steps Checklist */}
              {actionPlan.immediateSteps && actionPlan.immediateSteps.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Immediate Steps (Checklist)</h4>
                  <div className="space-y-2">
                    {actionPlan.immediateSteps.filter(s => s && s.trim()).map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium">
                        <input
                          type="checkbox"
                          className="h-4 w-4 shrink-0 rounded border-slate-200 text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                        />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Required Documents Checklist */}
              {actionPlan.documentChecklist && actionPlan.documentChecklist.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Required Evidence / Documents</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {actionPlan.documentChecklist.filter(d => d && d.trim()).map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-50/30 border border-indigo-100/50 text-xs text-indigo-900 font-semibold">
                        <span className="h-5 w-5 shrink-0 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Authority & Location Matcher */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recommended Authority</h4>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">
                      {actionPlan.recommendedAuthorityName || "Not Specified"}
                    </p>
                  </div>
                  {/* Location Consent Control */}
                  {!userLocation ? (
                    <button
                      onClick={handleRequestLocation}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] font-bold text-slate-650 bg-white hover:bg-slate-50 transition shrink-0 cursor-pointer"
                    >
                      📍 Find Nearest Office
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg">
                      Sorted by Distance
                    </span>
                  )}
                </div>

                {/* Consent Text */}
                {!userLocation && (
                  <p className="text-[10px] text-slate-400 leading-normal">
                    💡 <em>ARAM uses your location only to suggest nearby offices. Your exact location is not shared with the Legal Guide.</em>
                  </p>
                )}

                {/* Offices Directory Display */}
                {offices && offices.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {offices.map((office) => {
                      const distVal = userLocation ? office.distance : null;
                      return (
                        <AuthorityLocationCard
                          key={office.id}
                          office={office}
                          distance={distVal}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No local authority offices configured for your district.</p>
                )}
              </div>

              {/* Extra notes */}
              <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t border-slate-100 text-xs">
                {actionPlan.expectedTimeline && (
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Expected Resolution Timeline</span>
                    <p className="text-slate-700 font-semibold mt-0.5">{actionPlan.expectedTimeline}</p>
                  </div>
                )}
                {actionPlan.visitRequired !== undefined && (
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Office Visit Required?</span>
                    <p className="text-slate-700 font-semibold mt-0.5">
                      {actionPlan.visitRequired ? "Yes, physical submission or hearing required" : "No, can be resolved online"}
                    </p>
                  </div>
                )}
                {actionPlan.safetyNote && (
                  <div className="sm:col-span-2 p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-900">
                    <span className="font-bold text-amber-950 uppercase tracking-wider text-[10px] block">Safety instructions</span>
                    <p className="mt-0.5 leading-relaxed font-medium">{actionPlan.safetyNote}</p>
                  </div>
                )}
                {actionPlan.legalGuideNote && (
                  <div className="sm:col-span-2 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 text-indigo-950">
                    <span className="font-bold text-indigo-950 uppercase tracking-wider text-[10px] block">Personal Note from Legal Guide</span>
                    <p className="mt-0.5 leading-relaxed font-medium">{actionPlan.legalGuideNote}</p>
                  </div>
                )}
              </div>

              {/* Cost Estimation Card */}
              {costEstimate && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Case Cost & Legal Aid</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Approximate estimates to proceed with this authority</p>
                    </div>
                    {costEstimate.freeLegalAidAvailable && (
                      <span className="text-[10px] font-extrabold uppercase bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-100">
                        Free Legal Aid Available
                      </span>
                    )}
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-2xl font-black text-slate-800 flex items-baseline gap-1">
                        {costEstimate.currency || "₹"} {costEstimate.estimatedMinAmount} - {costEstimate.estimatedMaxAmount}
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider ml-1">Est. Total</span>
                      </div>
                      <p className="text-xs text-slate-550 leading-relaxed max-w-md">
                        <strong>Includes:</strong> {costEstimate.includes || "Document print/photocopy/travel"}
                        <br />
                        <strong>Excludes:</strong> {costEstimate.excludes || "Professional advocate fees"}
                      </p>
                    </div>
                    
                    <div className="shrink-0 bg-white border border-slate-150 p-3 rounded-xl max-w-[280px]">
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Next Action Notes</span>
                      <p className="text-[11px] text-slate-600 font-semibold mt-1 leading-normal italic">
                        "{costEstimate.notes || "No extra cost notes added by guide."}"
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    ℹ️ <em>Important: The amount shown above is an approximate cost range estimate for filing/travel, NOT a final lawyer fee. Under Indian legal aid rules, eligible citizens are entitled to free counsel.</em>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Case Updates / Notes Section */}
        {caseNotes.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 mt-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2 uppercase">
                <span>📢</span> Case Updates & Progress Notes
              </h3>
            </div>
            <div className="space-y-4">
              {caseNotes.map((note) => (
                <div key={note.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                    <span>Legal Guide</span>
                    <span>{new Date(note.createdAt).toLocaleString("en-IN")}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-semibold whitespace-pre-line">
                    {note.noteText}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resolution Summary Card */}
        {(complaint.resolutionSummary || status === "RESOLVED_BY_GUIDE") && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/10 p-6 shadow-sm space-y-4 mt-6">
            <div className="flex items-center gap-2 border-b border-emerald-100 pb-2">
              <span className="text-lg">✅</span>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Case Resolution Shared</h3>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resolution Summary</span>
              <p className="text-xs leading-relaxed text-slate-700 bg-white p-4 border border-emerald-100 rounded-xl whitespace-pre-line shadow-sm">
                {complaint.resolutionSummary || "Legal Guide has confirmed this grievance is successfully resolved."}
              </p>
            </div>
            {status === "RESOLVED_BY_GUIDE" && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer"
                >
                  Confirm & Close Case
                </button>
                <button
                  onClick={() => setShowReopenModal(true)}
                  className="px-4 py-2 border border-red-200 bg-white hover:bg-red-50 text-red-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Need More Help (Reopen)
                </button>
              </div>
            )}
            {status === "CLOSED_BY_USER" && (
              <span className="inline-block text-[10px] font-extrabold text-emerald-750 bg-emerald-100/60 px-3 py-1 rounded-full uppercase tracking-wider mt-2">
                Closed by User ✓
              </span>
            )}
          </div>
        )}

        {/* Requested Documents Tracker Card */}
        {docRequests && docRequests.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 mt-6">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2 uppercase border-b border-slate-100 pb-3">
              <span>📂</span> Requested Evidence & Documents
            </h3>
            <div className="space-y-3">
              {docRequests.map((req) => (
                <div key={req.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-200 text-slate-700">
                      {req.status}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800">{req.documentName}</h4>
                    {req.reason && <p className="text-[10px] text-slate-500 italic">{req.reason}</p>}
                    {req.status === "REJECTED" && (
                      <p className="text-[10px] text-red-650 font-semibold mt-0.5">⚠️ Rejection Reason: {req.rejectionReason}</p>
                    )}
                  </div>
                  <div className="shrink-0">
                    {(req.status === "REQUESTED" || req.status === "REJECTED") ? (
                      <label className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer">
                        Upload Document
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleUploadDocument(req.id, e.target.files[0])}
                        />
                      </label>
                    ) : (
                      <span className="text-xs font-semibold text-slate-500">
                        {req.status === "UPLOADED" ? "Awaiting Verification" : "Verified ✓"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Appointment Scheduler / Call Request */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 mt-6">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2 uppercase border-b border-slate-100 pb-3">
            <span>📞</span> Legal Guide Call Scheduler
          </h3>
          
          {/* Active Call Schedules */}
          {appointments && appointments.length > 0 && (
            <div className="space-y-3 pb-4 border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Schedules List</span>
              {appointments.map((app) => (
                <div key={app.id} className="p-3 bg-indigo-50/20 border border-indigo-100/50 rounded-xl text-xs flex justify-between items-center gap-4">
                  <div>
                    <p className="font-bold text-slate-850">Call mode: {app.mode} ({app.preferredTime})</p>
                    {app.scheduledAt ? (
                      <p className="text-[10.5px] text-indigo-750 font-semibold mt-0.5">
                        Scheduled for: {new Date(app.scheduledAt).toLocaleString()}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400 mt-0.5">Status: Pending Schedule Confirmation</p>
                    )}
                    {app.note && <p className="text-[10px] text-slate-500 mt-1 italic">Note: "{app.note}"</p>}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-indigo-105 text-indigo-700">
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Form to Request Call */}
          <div className="space-y-3 bg-slate-50/50 p-4 border border-slate-150 rounded-xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Request a New Call</span>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Preferred Safe Contact Mode</label>
                <select id="callModeSelect" className="h-9 w-full rounded-lg border border-slate-200 px-3 outline-none text-slate-805 text-xs bg-white cursor-pointer">
                  <option value="IN_APP">In-App Secure Chat</option>
                  <option value="PHONE">Phone Call (Prefers Privacy Masking)</option>
                  <option value="WHATSAPP">WhatsApp Message</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Preferred Call Time Slot</label>
                <select id="callTimeSelect" className="h-9 w-full rounded-lg border border-slate-200 px-3 outline-none text-slate-805 text-xs bg-white cursor-pointer">
                  <option value="ANYTIME">Anytime (Free to pick)</option>
                  <option value="MORNING">Morning (9 AM - 12 PM)</option>
                  <option value="AFTERNOON">Afternoon (12 PM - 4 PM)</option>
                  <option value="EVENING">Evening (4 PM - 8 PM)</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Reason or Agenda Note</label>
                <input
                  id="callNoteInput"
                  type="text"
                  placeholder="e.g. Discussing the required document slips..."
                  className="h-9 w-full rounded-lg border border-slate-200 px-3 outline-none text-slate-850 text-xs bg-white"
                />
              </div>
            </div>
            <button
              onClick={() => {
                const mode = document.getElementById("callModeSelect").value;
                const time = document.getElementById("callTimeSelect").value;
                const note = document.getElementById("callNoteInput").value;
                handleRequestCall(mode, time, note);
                document.getElementById("callNoteInput").value = "";
              }}
              disabled={submittingFlow}
              className="mt-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer disabled:opacity-50"
            >
              Submit Call Request
            </button>
          </div>
        </div>

        {/* Feedback Rating Dialog Modal */}
        {showFeedbackModal && (
          <div className="fixed inset-0 z-50 bg-slate-905/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Rate Legal Triage Support</h3>
              <p className="text-xs text-slate-500">How would you rate the assistance provided by your ARAM Legal Guide?</p>
              
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className={`text-2xl transition hover:scale-110 cursor-pointer ${star <= feedbackRating ? "text-amber-400" : "text-slate-200"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Comments (Optional)</label>
                  <textarea
                    rows={3}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Write a brief comment about the solution provided..."
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none text-slate-800"
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-150">
                  <span className="text-xs font-semibold text-slate-700">Was namma Legal Guide helpful?</span>
                  <button
                    type="button"
                    onClick={() => setFeedbackHelpful(!feedbackHelpful)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition uppercase ${feedbackHelpful ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}
                  >
                    {feedbackHelpful ? "Yes" : "No"}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmResolution}
                  disabled={submittingFlow}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  Submit & Close Case
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reopen Explaining Modal */}
        {showReopenModal && (
          <div className="fixed inset-0 z-50 bg-slate-905/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Explain Reason to Reopen Case</h3>
              <p className="text-xs text-slate-500">Provide details on what steps or guidance was missing so our admin panel can assign a reviewer.</p>
              
              <textarea
                rows={4}
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                placeholder="Describe your remaining grievance details in simple terms..."
                className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none text-slate-800"
              />

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setShowReopenModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReopenCase}
                  disabled={submittingFlow}
                  className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  Submit Reopen Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Secure Communication Panel */}
        {complaint.assignedHelperId && (
          <div className="mt-6">
            <CaseChatPanel complaintId={complaint.id} userRole="CITIZEN" />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ComplaintDetails;