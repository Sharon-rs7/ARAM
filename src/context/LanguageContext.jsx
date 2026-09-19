import React, { createContext, useContext, useState } from "react";

const LanguageContext = createContext();

export const availableLanguages = [
  { code: "en-IN", label: "English", nativeLabel: "English" },
  { code: "ta-IN", label: "Tamil", nativeLabel: "தமிழ்" },
  { code: "hi-IN", label: "Hindi", nativeLabel: "हिंदी" }
];

export const translations = {
  "en-IN": {
    nav: {
      home: "Home",
      about: "About",
      services: "Services",
      trackGrievance: "Track Grievance",
      contact: "Contact",
      signIn: "Sign In",
      dashboard: "Dashboard"
    },
    hero: {
      badge: "CIVIC LEGAL AID & GRIEVANCE TRIAGE",
      eyebrow: "Accessible Justice for Every Citizen",
      title1: "Your Rights. Our Support.",
      title2: "A Fairer Tomorrow.",
      subtitle: "ARAM AI bridges the justice gap by translating complex Indian laws, penal codes, and government schemes into clear, actionable steps in Tamil, English, and Hindi.",
      askAi: "Ask ARAM AI",
      fileGrievance: "File a Grievance",
      trackCase: "Track My Case",
      speakProblem: "Speak Problem",
      listening: "Listening... Click to Finish",
      uploadDoc: "Upload Document",
      connectGuide: "Connect Guide"
    },
    trustStrip: {
      multilingual: "Multilingual Legal Assistance",
      multilingualDesc: "Tamil • English • Hindi",
      verified: "Grounded in Verified Statutes",
      verifiedDesc: "Certified Indian law provisions",
      humanSupport: "Human Guide & DLSA Support",
      humanSupportDesc: "Accredited legal escalation",
      districtAware: "District-Aware Guidance",
      districtAwareDesc: "All 38 Tamil Nadu districts"
    },
    aiHuman: {
      tag: "AI + Human Synergy",
      title: "AI When Possible. Human When Necessary.",
      subtitle: "The speed of intelligent legal triage combined with the trusted judgment of certified human legal guides.",
      desc1: "ARAM AI immediately organizes your dispute, identifies applicable statutory sections, prepares required evidence checklists, and checks document readiness.",
      desc2: "When your matter requires formal legal drafting, statutory filing, or DLSA representation, verified human Legal Guides and accredited advocates step in directly to support you.",
      bullet1: "Instant 24x7 preliminary statutory analysis and rights explanation",
      bullet2: "Zero automated dismissal — every complex case has human escalation",
      bullet3: "Direct coordination with Taluk and District Legal Services Authorities (DLSA)"
    },
    immediateHelp: {
      tag: "Emergency & Statutory Support",
      title: "Need Immediate Assistance?",
      subtitle: "Official government helplines for urgent emergencies, women safety, cybercrime, and free legal aid.",
      emergency: "Emergency Services",
      emergencySub: "Police, Fire & Ambulance (24x7)",
      women: "Women Helpline",
      womenSub: "Safety & Domestic Violence (24x7)",
      cyber: "Cyber Crime Helpline",
      cyberSub: "National Financial Fraud Reporting",
      legalAid: "NALSA Legal Aid",
      legalAidSub: "Free Legal Aid & DLSA Services"
    },
    howItWorks: {
      tag: "Seamless Journey",
      title: "Four Steps to Legal Resolution",
      step1Title: "Speak or Type Grievance",
      step1Desc: "Explain your issue naturally in your preferred language.",
      step2Title: "AI Statutory Triage",
      step2Desc: "ARAM maps your dispute to certified Indian legal codes and penalties.",
      step3Title: "Verify Evidence",
      step3Desc: "Upload agreements or notices for instant OCR validation.",
      step4Title: "Connect Legal Guide",
      step4Desc: "Get assigned an authorized legal guide or DLSA representative."
    },
    features: {
      tag: "Engineered for Justice",
      title: "How ARAM AI Protects Your Legal Rights",
      subtitle: "Strictly grounded against certified Indian law provisions with zero synthetic hallucination.",
      f1Title: "11-Part Structured Legal Triage",
      f1Desc: "Every query receives grounded statutory citation, section applicability, next steps, document checklists, and DLSA authority routing.",
      f2Title: "Multilingual Voice Assistant",
      f2Desc: "Direct voice input in Tamil (தமிழ்), Hindi (हिंदी), and English for hands-free grievance registration and guidance.",
      f3Title: "OCR Document Readiness Checker",
      f3Desc: "Automated optical character verification of sale deeds, partition agreements, and notices with legal readiness scoring.",
      f4Title: "Certified Legal Guide Workflow",
      f4Desc: "Seamless escalation from AI triage to verified local paralegal guides and District Legal Services Authorities (DLSA)."
    },
    about: {
      tag: "Our Mission",
      title: "Democratizing Legal Rights for Every Citizen",
      desc1: "ARAM (அறம்) is built on the fundamental belief that access to justice should not be barred by language, geography, or economic standing.",
      desc2: "By connecting citizens directly with grounded statutory knowledge and verified legal guides, ARAM ensures equitable legal awareness.",
      commitmentsTitle: "ARAM Core Commitments",
      c1: "Zero Hallucination: All legal advice is verified against certified statutes.",
      c2: "Privacy Protection: Automatic PII masking of Aadhaar and personal details.",
      c3: "Official Email Gateway: Centralized communication from ouraramsupport@gmail.com."
    },
    whoCanUse: {
      title: "Who Can Use ARAM",
      subtitle: "Built for every stakeholder involved in the legal assistance ecosystem.",
      u1Title: "Citizens",
      u1Desc: "Submit complaints and receive AI guidance.",
      u2Title: "Legal Volunteers",
      u2Desc: "Assist citizens and provide legal support.",
      u3Title: "Government Officials",
      u3Desc: "Review and resolve assigned complaints.",
      u4Title: "Administrators",
      u4Desc: "Monitor platform activities and analytics."
    },
    cta: {
      title: "Ready to Understand Your Rights?",
      subtitle: "Ask your first legal question, verify evidence documents, or connect with a verified legal guide today.",
      button: "Start Free Legal Triage"
    },
    sidebar: {
      portalTitle: "Legal Aid Portal",
      dashboard: "Dashboard",
      askAi: "Ask ARAM AI",
      submitGrievance: "Submit Grievance",
      myGrievances: "My Grievances",
      documentsEvidence: "Documents & Evidence",
      trackStatus: "Track Status",
      supportSettings: "Support & Settings",
      notifications: "Notifications",
      helpRights: "Help & Rights Guide",
      profileSettings: "Profile & Settings",
      signOut: "Sign Out"
    },
    topbar: {
      searchCitizen: "Ask ARAM AI legal questions (e.g., land title, RTI, 498A)...",
      searchAdmin: "Search grievances across all 38 districts (ID, citizen, keyword)...",
      searchGuide: "Search assigned cases or legal topics...",
      lightMode: "Switch to Light Mode",
      darkMode: "Switch to Dark Mode",
      notifications: "Notifications"
    },
    citizenDashboard: {
      portalBadge: "Tamil Nadu Public Legal Aid & Grievance Portal",
      heroGreeting: "Hello, {name}. How can ARAM assist you today?",
      heroDescription: "Describe any grievance, legal issue, or dispute in Tamil, English, or Hindi to receive immediate verified guidance, document requirements, and assigned legal guide assistance.",
      askLegalAssistant: "Ask ARAM Legal Assistant",
      speakGrievance: "Speak Grievance (Voice)",
      stopTranscribe: "Stop & Transcribe",
      listening: "Listening... Click to Finish",
      cardSubmitTitle: "Submit Grievance",
      cardSubmitDesc: "File a structured complaint with AI document analysis.",
      cardUploadTitle: "Upload Evidence",
      cardUploadDesc: "Verify deeds, agreements & FIRs via OCR readiness.",
      cardTrackTitle: "Track Status",
      cardTrackDesc: "Milestone progress timeline & guide action plans.",
      cardRightsTitle: "Legal Rights Guide",
      cardRightsDesc: "DLSA contacts, government schemes & helplines.",
      exploreDomainTitle: "Explore Legal Rights by Domain",
      askAnyTopic: "Ask any topic >",
      domainWomenTitle: "Women & Family Law",
      domainWomenDesc: "Maintenance, 498A, DV Act, Custody",
      domainLandTitle: "Land & Property",
      domainLandDesc: "Patta, Encroachment, Boundary disputes",
      domainConsumerTitle: "Consumer & RTI",
      domainConsumerDesc: "Product defect, RTI filing, Fair trade",
      domainLabourTitle: "Labour & Wage Rights",
      domainLabourDesc: "Unpaid dues, Gratuity, PF settlement",
      domainCyberTitle: "Emergency & Cyber Aid",
      domainCyberDesc: "Online fraud, 1930 Helpline, Harassment",
      activeGrievancesTitle: "My Active Grievances",
      activeGrievancesDesc: "Track your submitted complaints and legal guide notes.",
      viewAllGrievances: "View All Grievances →",
      loadingGrievances: "Loading your grievances...",
      noGrievancesTitle: "No active grievances found.",
      noGrievancesDesc: "Whenever you submit a grievance or request legal guide representation, your case details will appear here.",
      submitFirstGrievance: "Submit First Grievance"
    },
    submitComplaint: {
      headerTitle: "Citizen Grievance & Legal Filing",
      headerSubtitle: "Tamil Nadu Legal Services Authority • Official Grievance & Redressal Registry",
      aiGuidedTab: "AI-Guided Filing (5 Stages)",
      directFormTab: "Direct Form (Single Page)",
      stageOf: "Stage {step} of 5",
      stageNames: {
        tellAram: "Tell ARAM",
        aiUnderstanding: "AI Understanding",
        documents: "Documents",
        safetyGuides: "Safety & Guides",
        reviewSubmit: "Review & Submit"
      },
      stage1Title: "Tell ARAM what happened",
      stage1Desc: "Explain your problem naturally. You can type or speak in your language.",
      tellUsLabel: "Tell us what happened...",
      minChars: "Minimum 15 characters",
      tellUsPlaceholder: "Tell us what happened in your own words... (You can type or speak in Tamil, Tanglish, English, or Hindi)",
      speakProblem: "Speak your problem",
      listeningClickStop: "Listening... (Click to stop)",
      processingSpeech: "Processing speech...",
      languageLabel: "Language:",
      autoDetect: "✨ Auto-Detect",
      primaryBadge: "Primary",
      transcribedNarrative: "Transcribed Problem Narrative",
      speechBadge: "{lang} Speech",
      reviewEditTip: "Review & Edit: You can edit names, amounts, or dates directly in the text box above before clicking Analyse with ARAM.",
      yourDistrict: "Your District",
      districtHelp: "Your district helps ARAM connect you with the appropriate local assistance at the {district} District Legal Aid Desk.",
      clearText: "Clear text",
      analyzingLegal: "Analyzing Legal Context...",
      analyzeWithAram: "Analyse with ARAM →",
      stage2Title: "ARAM AI Case Assessment",
      listenSummary: "Listen Summary",
      stopAudio: "Stop Audio",
      formulatedTitle: "Formulated Problem Title",
      doneEditing: "Done Editing",
      editTitle: "Edit Title",
      priorityLabel: "Priority: {priority}",
      caseOverview: "Case Situation & Legal Overview",
      partiesIdentified: "Parties Identified",
      disputeClaimAmount: "Dispute Claim Amount",
      timelineDate: "Timeline / Incident Date",
      reliefQuestion: "What specific outcome or relief are you seeking?",
      reliefSubtitle: "Your requested resolution",
      reliefPlaceholder: "Example: I want formal mediation by TNSLSA to direct the landlord to refund my ₹50,000 security deposit with no illegal deductions.",
      speakBtn: "Speak",
      recordingBtn: "Recording...",
      applicableRemedies: "Applicable Statutory Remedies",
      backBtn: "Back",
      continueDocsBtn: "Continue to Documents & Evidence →",
      stage3Title: "Documents & Supporting Proof",
      stage3Desc: "Attach deeds, notices, receipts or agreements for automated readiness review.",
      ocrIntegrityReview: "Evidence Readiness & Document Integrity Review",
      continueSafetyBtn: "Continue to Safety & Assistance →",
      stage4Title: "Safety, Vulnerability & Legal Guide Representation",
      stage4Desc: "Configure sensitive protection rules and assign verified District Legal Services Authority representation.",
      continueReviewBtn: "Continue to Review & Submit →",
      stage5Title: "Review Grievance & Statutory Submission",
      stage5Desc: "Final verification before assigning case number and blockchain audit block logging.",
      declarationText: "I declare that the information provided is true to the best of my knowledge under legal aid provisions.",
      submitGrievanceBtn: "Submit Grievance to Legal Aid Desk →",
      submittingBtn: "Submitting to Legal Registry...",
      successTitle: "Grievance Successfully Filed!",
      successDesc: "Your grievance has been securely registered with Tamil Nadu Legal Services Authority and logged to the blockchain audit block.",
      officialRef: "Official Case Reference:",
      trackGrievanceBtn: "Track Grievance Status",
      returnDashboardBtn: "Return to Dashboard"
    },
    complaintHistory: {
      title: "My Grievance History",
      subtitle: "Track status, evidence verification, and legal guide notes for all submitted cases.",
      newGrievanceBtn: "New Grievance",
      searchPlaceholder: "Search complaints by title, ID, or description...",
      filterAll: "All Statuses",
      filterSubmitted: "Submitted",
      filterInProgress: "In Progress",
      filterResolved: "Resolved",
      noComplaintsTitle: "No grievances found",
      noComplaintsDesc: "You haven't filed any grievances yet or none match your filter.",
      fileFirstGrievance: "File First Grievance"
    },
    evidenceVault: {
      title: "Documents & Evidence Vault",
      subtitle: "Upload deeds, agreements, notices, and FIRs for instant OCR readiness validation and SHA-256 encrypted storage.",
      analyzerTitle: "OCR Document Legal Readiness Analyzer",
      analyzerSubtitle: "Verify registration numbers, survey boundaries, and statutory stamp seals before formal submission.",
      uploadBoxTitle: "Click to upload or drag and drop",
      uploadBoxSubtitle: "PDF, JPG, JPEG, PNG (Max 15MB)",
      verifyBtn: "Verify Document Readiness",
      verifyingBtn: "Analyzing Document OCR...",
      readinessScore: "Legal Readiness Score",
      detectedEntities: "Detected Legal Entities"
    },
    trackComplaint: {
      title: "Track Grievance Milestone Status",
      subtitle: "Enter your ARAM case reference ID to inspect official review progress, assigned guide, and next action plan.",
      inputPlaceholder: "Enter Case Reference ID (e.g., ARAM-2026-000001 or 1)...",
      trackBtn: "Track Case",
      trackingBtn: "Searching...",
      step1Title: "Grievance Filed",
      step1Desc: "Submitted securely to ARAM official registry",
      step2Title: "AI Triage & Categorization",
      step2Desc: "Applicable legal sections and checklists identified",
      step3Title: "Legal Guide Assignment",
      step3Desc: "Verified legal guide assigned for assistance",
      step4Title: "Authority Resolution",
      step4Desc: "Taluk / District legal action completed"
    },
    helpCenter: {
      title: "Legal Rights & Emergency Help Center",
      subtitle: "Certified statutory helplines, District Legal Services Authority (DLSA) access, and dispute guidelines.",
      nalsaTitle: "National Legal Services (NALSA)",
      nalsaDesc: "Free legal aid for eligible citizens under Legal Services Authorities Act",
      womenTitle: "Women Helpline",
      womenDesc: "24x7 support for domestic violence and emergency protection",
      cyberTitle: "National Cyber Crime Reporting",
      cyberDesc: "Financial fraud and cyber harassment immediate reporting",
      seniorTitle: "Senior Citizen Helpline",
      seniorDesc: "Elder abuse and maintenance dispute legal assistance",
      gatewayTitle: "Official ARAM Support Gateway",
      gatewayDesc: "For formal petition drafting inquiries or system support, email our dedicated gateway at"
    }
  },
  "ta-IN": {
    nav: {
      home: "முகப்பு",
      about: "அறிமுகம்",
      services: "சேவைகள்",
      trackGrievance: "புகாரைக் கண்காணிக்க",
      contact: "தொடர்புக்கு",
      signIn: "உள்நுழைக",
      dashboard: "டாஷ்போர்டு"
    },
    hero: {
      badge: "குடிமக்கள் சட்ட உதவி & குறைதீர்க்கும் தளம்",
      eyebrow: "ஒவ்வொரு குடிமகனுக்கும் சமமான நீதி",
      title1: "உங்கள் உரிமை. எங்கள் ஆதரவு.",
      title2: "நீதியான எதிர்காலம்.",
      subtitle: "அறம் AI சிக்கலான இந்திய சட்டங்கள், குற்றவியல் பிரிவுகள் மற்றும் அரசு திட்டங்களை தமிழ், ஆங்கிலம் மற்றும் இந்தியில் எளிய, தெளிவான நடைமுறைகளாக மாற்றி அனைவருக்கும் சமநீதி கிடைக்க வழிவகுக்கிறது.",
      askAi: "அறம் AI-யிடம் கேட்க",
      fileGrievance: "புகார் பதிவு செய்க",
      trackCase: "வழக்கைக் கண்காணிக்க",
      speakProblem: "குரலில் கூற",
      listening: "கேட்கிறது... முடிக்க கிளிக் செய்யவும்",
      uploadDoc: "ஆவணம் பதிவேற்ற",
      connectGuide: "சட்ட வழிகாட்டியை அணுக"
    },
    trustStrip: {
      multilingual: "மும்மொழி சட்ட உதவி",
      multilingualDesc: "தமிழ் • ஆங்கிலம் • இந்தி",
      verified: "உறுதிப்படுத்தப்பட்ட சட்ட விதிகள்",
      verifiedDesc: "சான்றளிக்கப்பட்ட இந்திய சட்டப் பிரிவுகள்",
      humanSupport: "மனித வழிகாட்டி & DLSA ஆதரவு",
      humanSupportDesc: "அங்கீகரிக்கப்பட்ட சட்டப் பிரதிநிதித்துவம்",
      districtAware: "38 மாவட்ட வழிகாட்டல்",
      districtAwareDesc: "தமிழ்நாட்டின் அனைத்து மாவட்டங்களுக்கும்"
    },
    aiHuman: {
      tag: "AI மற்றும் மனித ஒருங்கிணைப்பு",
      title: "சாத்தியமான இடங்களில் AI. தேவையான போது சட்ட வழிகாட்டி.",
      subtitle: "விரைவான AI சட்டப் பகுப்பாய்வும், அனுபவமிக்க சட்ட வழிகாட்டிகளின் நம்பிக்கையான ஆதரவும்.",
      desc1: "அறம் AI உடனடியாக உங்கள் வழக்கின் விவரங்களை ஒழுங்கமைத்து, பொருத்தமான சட்டப் பிரிவுகளைக் கண்டறிந்து, தேவையான ஆவணங்களை வகைப்படுத்துகிறது.",
      desc2: "மனு வரைவு, சட்டப்பூர்வ மனுத் தாக்கல் அல்லது DLSA பிரதிநிதித்துவம் தேவைப்படும் போது, அங்கீகரிக்கப்பட்ட சட்ட வழிகாட்டிகள் நேரடியாக உங்களுடன் இணைகிறார்கள்.",
      bullet1: "24x7 உடனடி முதற்கட்ட சட்ட ஆய்வு மற்றும் உரிமை விளக்கம்",
      bullet2: "தானியங்கி நிராகரிப்பு இல்லை — சிக்கலான வழக்குகளுக்கு மனித வழிகாட்டி ஆய்வு",
      bullet3: "வட்டார மற்றும் மாவட்ட சட்டப் பணிகள் ஆணைக்குழுவுடன் (DLSA) நேரடி ஒருங்கிணைப்பு"
    },
    immediateHelp: {
      tag: "அவசர மற்றும் சட்ட உதவி எண்கள்",
      title: "உடனடி அவசர உதவி தேவையா?",
      subtitle: "அவசர விபத்து, மகளிர் பாதுகாப்பு, இணையக் குற்றங்கள் மற்றும் இலவச சட்ட உதவிக்கான அதிகாரப்பூர்வ அரசு எண்கள்.",
      emergency: "அவசரக் காவல் & மருத்துவ உதவி",
      emergencySub: "காவல்துறை, தீயணைப்பு & ஆம்புலன்ஸ் (24x7)",
      women: "மகளிர் உதவி எண்",
      womenSub: "பாதுகாப்பு & குடும்ப வன்முறை தடுப்பு (24x7)",
      cyber: "இணையக் குற்றப் பிரிவு",
      cyberSub: "தேசிய நிதி மோசடி தடுப்பு உதவி எண்",
      legalAid: "இலவச சட்ட உதவி (NALSA)",
      legalAidSub: "இலவச சட்ட உதவி & DLSA மையம்"
    },
    howItWorks: {
      tag: "எளிய வழிமுறை",
      title: "சட்டத் தீர்வுக்கு 4 எளிய படிகள்",
      step1Title: "புகாரை பேசவும் அல்லது எழுதவும்",
      step1Desc: "உங்கள் பிரச்சினையை உங்களுக்கு விருப்பமான மொழியில் இயல்பாக விளக்குங்கள்.",
      step2Title: "AI சட்ட ஆய்வு & வகைப்பாடு",
      step2Desc: "அறம் உங்கள் புகாரை உரிய இந்திய சட்டப் பிரிவுகளுடன் இணைத்து பகுப்பாய்வு செய்கிறது.",
      step3Title: "ஆதாரங்களை சரிபார்க்கவும்",
      step3Desc: "ஒப்பந்தங்கள் அல்லது அறிவிப்புகளை பதிவேற்றி உடனடி OCR சரிபார்ப்பைப் பெறுங்கள்.",
      step4Title: "சட்ட வழிகாட்டியை அணுகவும்",
      step4Desc: "அங்கீகரிக்கப்பட்ட சட்ட வழிகாட்டி அல்லது DLSA அதிகாரியின் ஆதரவைப் பெறுங்கள்."
    },
    features: {
      tag: "நீதிக்காக உருவாக்கப்பட்டது",
      title: "அறம் AI உங்கள் சட்ட உரிமைகளை எவ்வாறு பாதுகாக்கிறது",
      subtitle: "சான்றளிக்கப்பட்ட இந்திய சட்டப் பிரிவுகளின் அடிப்படையில் துல்லியமான, பொய்யற்ற சட்ட வழிகாட்டல்.",
      f1Title: "11-அடுக்கு சட்ட பகுப்பாய்வு",
      f1Desc: "ஒவ்வொரு கேள்விக்கும் உரிய சட்டப் பிரிவு, அடுத்த கட்ட நடைமுறைகள், ஆவணப் பட்டியல் மற்றும் DLSA வழிகாட்டல் வழங்கப்படுகிறது.",
      f2Title: "பன்மொழி குரல் உதவியாளர்",
      f2Desc: "தமிழ், இந்தி மற்றும் ஆங்கிலத்தில் நேரடியாகப் பேசி உடனடி சட்ட வழிகாட்டல் பெறலாம்.",
      f3Title: "OCR ஆவண சரிபார்ப்பு",
      f3Desc: "பத்திரம், பாகப்பிரிவினை மற்றும் நோட்டீஸ் போன்ற ஆவணங்களின் தயார்நிலை மதிப்பீடு.",
      f4Title: "சான்றளிக்கப்பட்ட சட்ட வழிகாட்டிகள்",
      f4Desc: "AI மதிப்பீட்டிலிருந்து நேரடி உள்ளூர் சட்ட வழிகாட்டிகள் மற்றும் மாவட்ட சட்டப் பணிகள் ஆணைக்குழுவுக்கு (DLSA) விரைவுப் பகிர்வு."
    },
    about: {
      tag: "எங்கள் நோக்கம்",
      title: "அனைத்து குடிமக்களுக்கும் சட்ட உரிமைகளை எளிதாக்குதல்",
      desc1: "மொழி, இருப்பிடம் அல்லது பொருளாதார நிலை நீதிக்கான தடையாக இருக்கக்கூடாது என்ற உயரிய நோக்கில் அறம் உருவாக்கப்பட்டது.",
      desc2: "சட்ட அறிவையும், சான்றளிக்கப்பட்ட வழிகாட்டிகளையும் நேரடியாக குடிமக்களிடம் கொண்டுசேர்ப்பதே அறத்தின் முதன்மைப் பணி.",
      commitmentsTitle: "அறத்தின் அடிப்படைக் கொள்கைகள்",
      c1: "துல்லியமான தகவல்: அனைத்து சட்ட ஆலோசனைகளும் சான்றளிக்கப்பட்ட சட்ட விதிகளின்படி சரிபார்க்கப்படுகிறது.",
      c2: "தனிநபர் பாதுகாப்பு: ஆதார் உள்ளிட்ட தனிப்பட்ட விவரங்களின் தானியங்கி பாதுகாப்பு.",
      c3: "அதிகாரப்பூர்வ தொடர்பு: ouraramsupport@gmail.com மூலம் முறையான மின்னஞ்சல் அறிவிப்புகள்."
    },
    whoCanUse: {
      title: "அறம் தளத்தை யார் பயன்படுத்தலாம்?",
      subtitle: "சட்ட உதவி சுற்றுச்சூழல் அமைப்பில் உள்ள ஒவ்வொருவருக்கும் ஏற்றவாறு உருவாக்கப்பட்டது.",
      u1Title: "குடிமக்கள்",
      u1Desc: "புகார்களைப் பதிவு செய்து AI சட்ட வழிகாட்டல் பெறலாம்.",
      u2Title: "சட்ட தன்னார்வலர்கள்",
      u2Desc: "குடிமக்களுக்கு களப்பணி மற்றும் சட்ட உதவி வழங்கலாம்.",
      u3Title: "அரசு அலுவலர்கள்",
      u3Desc: "ஒதுக்கப்பட்ட புகார்களை ஆய்வு செய்து தீர்வு காணலாம்.",
      u4Title: "நிர்வாகிகள்",
      u4Desc: "தளத்தின் நடவடிக்கைகள் மற்றும் பகுப்பாய்வுகளைக் கண்காணிக்கலாம்."
    },
    cta: {
      title: "உங்கள் சட்ட உரிமைகளைத் தெரிந்துகொள்ளத் தயாரா?",
      subtitle: "உங்கள் முதல் சட்டக் கேள்வியைக் கேளுங்கள், ஆவணங்களைச் சரிபாருங்கள், அல்லது சட்ட வழிகாட்டியை இன்றே அணுகுங்கள்.",
      button: "இலவச சட்ட வழிகாட்டலைத் தொடங்குக"
    },
    sidebar: {
      portalTitle: "சட்ட உதவி தளம்",
      dashboard: "டாஷ்போர்டு",
      askAi: "அறம் AI-யிடம் கேளுங்கள்",
      submitGrievance: "குறை சமர்ப்பிக்க",
      myGrievances: "எனது புகார்கள்",
      documentsEvidence: "ஆவணங்கள் & ஆதாரங்கள்",
      trackStatus: "நிலையைக் கண்காணிக்க",
      supportSettings: "ஆதரவு & அமைப்புகள்",
      notifications: "அறிவிப்புகள்",
      helpRights: "உதவி & உரிமைகள் வழிகாட்டி",
      profileSettings: "சுயவிவரம் & அமைப்புகள்",
      signOut: "வெளியேறு"
    },
    topbar: {
      searchCitizen: "அறம் AI-யிடம் சட்டக் கேள்விகளைக் கேளுங்கள் (எ.கா. நில உரிமை, RTI, 498A)...",
      searchAdmin: "38 மாவட்ட புகார்களையும் தேட (எண், குடிமகன், தலைப்பு)...",
      searchGuide: "ஒதுக்கப்பட்ட வழக்குகள் அல்லது சட்ட தலைப்புகளைத் தேட...",
      lightMode: "வெளிச்ச பயன்முறைக்கு மாறுக",
      darkMode: "இரவு பயன்முறைக்கு மாறுக",
      notifications: "அறிவிப்புகள்"
    },
    citizenDashboard: {
      portalBadge: "தமிழ்நாடு பொது சட்ட உதவி & குறைதீர்க்கும் தளம்",
      heroGreeting: "வணக்கம், {name}. அறம் இன்று உங்களுக்கு எவ்வாறு உதவ முடியும்?",
      heroDescription: "தமிழ், ஆங்கிலம் அல்லது இந்தியில் உங்கள் சட்டச் சிக்கல் அல்லது புகாரை விளக்கி, உடனடி சரிபார்க்கப்பட்ட வழிகாட்டுதல், தேவையான ஆவணப் பட்டியல் மற்றும் சட்ட வழிகாட்டி உதவியைப் பெறுங்கள்.",
      askLegalAssistant: "அறம் சட்ட உதவியாளரிடம் கேளுங்கள்",
      speakGrievance: "குறையைப் பேசுங்கள் (குரல்வழி)",
      stopTranscribe: "நிறுத்தி உரை பெறுக",
      listening: "கேட்கிறது... முடிக்க கிளிக் செய்யவும்",
      cardSubmitTitle: "குறை சமர்ப்பிக்க",
      cardSubmitDesc: "AI ஆவண பகுப்பாய்வுடன் முறையான புகாரைப் பதிவு செய்யுங்கள்.",
      cardUploadTitle: "ஆதாரம் பதிவேற்ற",
      cardUploadDesc: "பத்திரங்கள், ஒப்பந்தங்கள் & FIR நகல்களை OCR மூலம் சரிபார்க்கவும்.",
      cardTrackTitle: "நிலையைக் கண்காணிக்க",
      cardTrackDesc: "வழக்கின் முன்னேற்ற காலவரிசை & வழிகாட்டி செயல் திட்டங்கள்.",
      cardRightsTitle: "சட்ட உரிமைகள் வழிகாட்டி",
      cardRightsDesc: "DLSA தொடர்புகள், அரசு திட்டங்கள் & உதவி எண்கள்.",
      exploreDomainTitle: "துறை வாரியாக சட்ட உரிமைகளை அறிக",
      askAnyTopic: "எந்த தலைப்பையும் கேட்கலாம் >",
      domainWomenTitle: "பெண்கள் & குடும்ப சட்டம்",
      domainWomenDesc: "ஜீவனாம்சம், 498A, குடும்ப வன்முறை சட்டம், குழந்தை பராமரிப்பு",
      domainLandTitle: "நிலம் & சொத்துரிமை",
      domainLandDesc: "பட்டா, ஆக்கிரமிப்பு, எல்லை தகராறுகள்",
      domainConsumerTitle: "நுகர்வோர் & தகவல் அறியும் உரிமை (RTI)",
      domainConsumerDesc: "குறைபாடுள்ள பொருள், RTI மனு, நியாயமான வணிகம்",
      domainLabourTitle: "தொழிலாளர் & ஊதிய உரிமைகள்",
      domainLabourDesc: "நிலுவை ஊதியம், பணிக்கொடை, PF தீர்வு",
      domainCyberTitle: "அவசர உதவி & சைபர் குற்றங்கள்",
      domainCyberDesc: "ஆன்லைன் மோசடி, 1930 உதவி எண், தொல்லைகள்",
      activeGrievancesTitle: "எனது தற்போதைய புகார்கள்",
      activeGrievancesDesc: "உங்கள் புகார்கள் மற்றும் வழிகாட்டி குறிப்புகளைக் கண்காணிக்கவும்.",
      viewAllGrievances: "அனைத்து புகார்களையும் பார்க்க →",
      loadingGrievances: "உங்கள் புகார்கள் ஏற்றப்படுகின்றன...",
      noGrievancesTitle: "செயலில் உள்ள புகார்கள் எதுவும் இல்லை.",
      noGrievancesDesc: "நீங்கள் புகாரைப் பதிவு செய்யும்போதோ அல்லது வழிகாட்டியை கோரும்போதோ விவரங்கள் இங்கே தோன்றும்.",
      submitFirstGrievance: "முதல் புகாரைப் பதிவு செய்க"
    },
    submitComplaint: {
      headerTitle: "குடிமக்கள் குறை & சட்டப் பதிவு",
      headerSubtitle: "தமிழ்நாடு சட்டப் பணிகள் ஆணைக்குழு • அதிகாரப்பூர்வ குறைதீர்ப்புப் பதிவகம்",
      aiGuidedTab: "AI வழிகாட்டுதல் பதிவு (5 நிலைகள்)",
      directFormTab: "நேரடி படிவம் (ஒற்றைப் பக்கம்)",
      stageOf: "நிலை {step} / 5",
      stageNames: {
        tellAram: "விளக்கம்",
        aiUnderstanding: "AI பகுப்பாய்வு",
        documents: "ஆவணங்கள்",
        safetyGuides: "பாதுகாப்பு & வழிகாட்டி",
        reviewSubmit: "சரிபார்த்து சமர்ப்பித்தல்"
      },
      stage1Title: "நடந்ததை அறத்திடம் கூறுங்கள்",
      stage1Desc: "உங்கள் பிரச்சினையை இயல்பாக விளக்குங்கள். உங்கள் மொழியில் தட்டச்சு செய்யலாம் அல்லது பேசலாம்.",
      tellUsLabel: "நடந்த விவரத்தைக் கூறுங்கள்...",
      minChars: "குறைந்தது 15 எழுத்துகள்",
      tellUsPlaceholder: "நடந்ததை உங்கள் சொந்த வார்த்தைகளில் விளக்குங்கள்... (தமிழ், ஆங்கிலம் அல்லது இந்தியில் பேசலாம் அல்லது எழுதலாம்)",
      speakProblem: "குரலில் கூறவும்",
      listeningClickStop: "கேட்கிறது... (நிறுத்த கிளிக் செய்க)",
      processingSpeech: "பேச்சு உரையாக்கம் செய்யப்படுகிறது...",
      languageLabel: "மொழி:",
      autoDetect: "✨ தானியங்கி கண்டறிதல்",
      primaryBadge: "முதன்மை",
      transcribedNarrative: "உரையாக்கப்பட்ட பிரச்சினை விளக்கம்",
      speechBadge: "{lang} பேச்சு",
      reviewEditTip: "✨ சரிபார்த்து திருத்துக: 'அறம் மூலம் ஆய்வு செய்க' என்பதை கிளிக் செய்வதற்கு முன் பெயர்கள், தொகைகள் அல்லது தேதிகளை நேரடியாக மேலே உள்ள பெட்டியில் திருத்தலாம்.",
      yourDistrict: "உங்கள் மாவட்டம்",
      districtHelp: "உங்கள் மாவட்டம், {district} மாவட்ட சட்ட உதவி மையத்தின் பொருத்தமான உள்ளூர் உதவியை அறம் இணைக்க உதவுகிறது.",
      clearText: "உரையை அழிக்க",
      analyzingLegal: "சட்ட விவரங்கள் ஆய்வு செய்யப்படுகின்றன...",
      analyzeWithAram: "அறம் மூலம் ஆய்வு செய்க →",
      stage2Title: "அறம் AI வழக்கு மதிப்பீடு",
      listenSummary: "சுருக்கத்தைக் கேட்க",
      stopAudio: "ஆடியோவை நிறுத்த",
      formulatedTitle: "உருவாக்கப்பட்ட பிரச்சினைத் தலைப்பு",
      doneEditing: "முடிந்தது",
      editTitle: "தலைப்பைத் திருத்து",
      priorityLabel: "முன்னுரிமை: {priority}",
      caseOverview: "வழக்கு சூழல் & சட்ட மேலோட்டம்",
      partiesIdentified: "அடையாளம் காணப்பட்ட நபர்கள்",
      disputeClaimAmount: "தகராறு கோரிக்கை தொகை",
      timelineDate: "காலவரிசை / நிகழ்வு தேதி",
      reliefQuestion: "நீங்கள் எதிர்பார்க்கும் குறிப்பிட்ட தீர்வு அல்லது நிவாரணம் என்ன?",
      reliefSubtitle: "உங்கள் கோரிக்கை முடிவு",
      reliefPlaceholder: "எடுத்துக்காட்டு: சட்டவிரோத பிடித்தங்கள் ஏதுமின்றி எனது ₹50,000 முன்பணத்தை நில உரிமையாளர் திருப்பித் தர சட்டப் பணிகள் ஆணைக்குழு மூலம் தீர்வு வேண்டும்.",
      speakBtn: "பேசவும்",
      recordingBtn: "பதிவாகிறது...",
      applicableRemedies: "பொருந்தக்கூடிய சட்டப் பரிகாரங்கள்",
      backBtn: "பின்செல்ல",
      continueDocsBtn: "ஆவணங்கள் & ஆதாரங்களுக்குத் தொடரவும் →",
      stage3Title: "ஆவணங்கள் & துணை ஆதாரங்கள்",
      stage3Desc: "தானியங்கி தயார்நிலை மதிப்பாய்விற்கு பத்திரங்கள், அறிவிப்புகள், ரசீதுகள் அல்லது ஒப்பந்தங்களை இணைக்கவும்.",
      ocrIntegrityReview: "ஆதார தயார்நிலை & ஆவண ஒருமைப்பாடு ஆய்வு",
      continueSafetyBtn: "பாதுகாப்பு & உதவிக்குத் தொடரவும் →",
      stage4Title: "பாதுகாப்பு & சட்ட வழிகாட்டி பிரதிநிதித்துவம்",
      stage4Desc: "பாதுகாப்பு விதிகளை அமைத்து சரிபார்க்கப்பட்ட மாவட்ட சட்ட சேவைகள் அதிகார பிரதிநிதித்துவத்தைப் பெறுங்கள்.",
      continueReviewBtn: "சரிபார்த்து சமர்ப்பித்தலுக்குத் தொடரவும் →",
      stage5Title: "குறையைச் சரிபார்த்து சமர்ப்பித்தல்",
      stage5Desc: "வழக்கு எண் ஒதுக்கீடு மற்றும் பிளாக்செயின் தணிக்கைப் பதிவுக்கு முந்தைய இறுதி சரிபார்ப்பு.",
      declarationText: "சட்ட உதவி விதிகளின்படி நான் வழங்கிய தகவல்கள் அனைத்தும் எனது அறிவுக்கு எட்டியவரை உண்மை என உறுதியளிக்கிறேன்.",
      submitGrievanceBtn: "சட்ட உதவி மையத்தில் குறையைச் சமர்ப்பிக்க →",
      submittingBtn: "சட்டப் பதிவகத்தில் பதிவு செய்யப்படுகிறது...",
      successTitle: "குறை வெற்றிகரமாக பதிவு செய்யப்பட்டது!",
      successDesc: "உங்கள் குறை தமிழ்நாடு சட்டப் பணிகள் ஆணைக்குழுவில் பதிவு செய்யப்பட்டு, பிளாக்செயின் தணிக்கைத் தொகுதியில் பாதுகாப்பாகப் பதியப்பட்டுள்ளது.",
      officialRef: "அதிகாரப்பூர்வ வழக்கு குறிப்பு எண்:",
      trackGrievanceBtn: "புகார் நிலையை அறிய",
      returnDashboardBtn: "டாஷ்போர்டுக்குத் திரும்ப"
    },
    complaintHistory: {
      title: "எனது புகார்களின் வரலாறு",
      subtitle: "பதிவு செய்யப்பட்ட அனைத்து வழக்குகளின் நிலை, ஆதார சரிபார்ப்பு மற்றும் சட்ட வழிகாட்டி குறிப்புகளைக் கண்காணிக்கவும்.",
      newGrievanceBtn: "புதிய குறை சமர்ப்பிக்க",
      searchPlaceholder: "தலைப்பு, எண் அல்லது விவரம் மூலம் தேடவும்...",
      filterAll: "அனைத்து நிலைகளும்",
      filterSubmitted: "சமர்ப்பிக்கப்பட்டது",
      filterInProgress: "செயலில் உள்ளது",
      filterResolved: "தீர்வு காணப்பட்டது",
      noComplaintsTitle: "செயலில் உள்ள புகார்கள் ஏதுமில்லை",
      noComplaintsDesc: "நீங்கள் இன்னும் எந்தப் புகாரையும் பதிவு செய்யவில்லை அல்லது உங்கள் தேடலுடன் பொருந்தவில்லை.",
      fileFirstGrievance: "முதல் புகாரைப் பதிவு செய்க"
    },
    evidenceVault: {
      title: "ஆவணங்கள் & ஆதாரப் பெட்டகம்",
      subtitle: "பத்திரங்கள், ஒப்பந்தங்கள், நோட்டீஸ் மற்றும் FIR நகல்களை உடனடி OCR சரிபார்ப்பிற்கு பதிவேற்றி குறியாக்கப்பட்ட பாதுகாப்பில் சேமிக்கவும்.",
      analyzerTitle: "OCR ஆவண சட்ட தயார்நிலை மதிப்பாய்வி",
      analyzerSubtitle: "பதிவு எண்கள், எல்லை விவரங்கள் மற்றும் அரசு முத்திரைகளை சமர்ப்பிப்பதற்கு முன் சரிபார்க்கவும்.",
      uploadBoxTitle: "பதிவேற்ற கிளிக் செய்யவும் அல்லது கோப்பை இழுத்துப் போடவும்",
      uploadBoxSubtitle: "PDF, JPG, JPEG, PNG (அதிகபட்சம் 15MB)",
      verifyBtn: "ஆவணத் தயார்நிலையைச் சரிபார்க்க",
      verifyingBtn: "ஆவணம் OCR ஆய்வு செய்யப்படுகிறது...",
      readinessScore: "சட்டத் தயார்நிலை மதிப்பீடு",
      detectedEntities: "கண்டறியப்பட்ட சட்ட விவரங்கள்"
    },
    trackComplaint: {
      title: "புகார் மைல்கல் நிலையைக் கண்காணிக்க",
      subtitle: "உங்கள் வழக்கு முன்னேற்றம், நியமிக்கப்பட்ட வழிகாட்டி மற்றும் அடுத்த கட்ட நடவடிக்கைகளை அறிய ARAM குறிப்பு எண்ணை உள்ளிடவும்.",
      inputPlaceholder: "வழக்கு குறிப்பு எண்ணை உள்ளிடவும் (எ.கா. ARAM-2026-000001 அல்லது 1)...",
      trackBtn: "நிலையை அறிய",
      trackingBtn: "தேடுகிறது...",
      step1Title: "குறை பதிவு செய்யப்பட்டது",
      step1Desc: "அறம் அதிகாரப்பூர்வ பதிவகத்தில் பாதுகாப்பாகச் சமர்ப்பிக்கப்பட்டது",
      step2Title: "AI ஆய்வு & வகைப்பாடு",
      step2Desc: "பொருந்தக்கூடிய சட்டப் பிரிவுகள் மற்றும் ஆவணப் பட்டியல் கண்டறியப்பட்டது",
      step3Title: "சட்ட வழிகாட்டி நியமனம்",
      step3Desc: "உதவிக்காக சரிபார்க்கப்பட்ட சட்ட வழிகாட்டி ஒதுக்கப்பட்டுள்ளார்",
      step4Title: "அதிகாரப்பூர்வ தீர்வு",
      step4Desc: "வட்டம் / மாவட்ட சட்ட நடவடிக்கைகள் நிறைவடைந்தன"
    },
    helpCenter: {
      title: "சட்ட உரிமைகள் & அவசர உதவி மையம்",
      subtitle: "சான்றளிக்கப்பட்ட சட்ட உதவி எண்கள், மாவட்ட சட்ட சேவைகள் ஆணையம் (DLSA) மற்றும் வழிகாட்டுதல்கள்.",
      nalsaTitle: "தேசிய சட்ட சேவைகள் ஆணையம் (NALSA)",
      nalsaDesc: "சட்ட சேவைகள் அதிகாரச் சட்டத்தின் கீழ் தகுதியுடைய குடிமக்களுக்கு இலவச சட்ட உதவி",
      womenTitle: "பெண்கள் உதவி எண்",
      womenDesc: "குடும்ப வன்முறை மற்றும் அவசரப் பாதுகாப்பிற்கான 24x7 நேரடி உதவி",
      cyberTitle: "தேசிய சைபர் குற்றப் பதிவு மையம்",
      cyberDesc: "நிதி மோசடி மற்றும் இணைய துன்புறுத்தல் குறித்த உடனடிப் புகார்",
      seniorTitle: "மூத்த குடிமக்கள் உதவி எண்",
      seniorDesc: "முதியோர் வன்கொடுமை மற்றும் பராமரிப்பு தகராறுகளுக்கான சட்ட உதவி",
      gatewayTitle: "அறம் அதிகாரப்பூர்வ ஆதரவு நுழைவாயில்",
      gatewayDesc: "மனு வரைவு தொடர்பான கேள்விகள் அல்லது தொழில்நுட்ப உதவிக்கு எங்களை மின்னஞ்சல் மூலம் தொடர்பு கொள்ளவும்:"
    }
  },
  "hi-IN": {
    nav: {
      home: "होम",
      about: "परिचय",
      services: "सेवाएं",
      trackGrievance: "शिकायत ट्रैक करें",
      contact: "संपर्क",
      signIn: "साइन इन",
      dashboard: "डैशबोर्ड"
    },
    hero: {
      badge: "नागरिक कानूनी सहायता और शिकायत निवारण",
      eyebrow: "हर नागरिक के लिए सुलभ न्याय",
      title1: "आपके अधिकार। हमारा समर्थन।",
      title2: "एक न्यायपूर्ण कल।",
      subtitle: "ARAM AI जटिल भारतीय कानूनों, दंड संहिताओं और सरकारी योजनाओं को तमिल, अंग्रेजी और हिंदी में स्पष्ट, व्यावहारिक कदमों में बदलकर न्याय को सभी के लिए सुलभ बनाता है।",
      askAi: "ARAM AI से पूछें",
      fileGrievance: "शिकायत दर्ज करें",
      trackCase: "मामला ट्रैक करें",
      speakProblem: "समस्या बोलें",
      listening: "सुन रहा है... समाप्त करने के लिए क्लिक करें",
      uploadDoc: "दस्तावेज़ अपलोड करें",
      connectGuide: "मार्गदर्शक से जुड़ें"
    },
    trustStrip: {
      multilingual: "त्रिभाषी कानूनी सहायता",
      multilingualDesc: "तमिल • अंग्रेजी • हिंदी",
      verified: "सत्यापित कानूनी स्रोतों पर आधारित",
      verifiedDesc: "प्रमाणित भारतीय कानूनी धाराएं",
      humanSupport: "मानव मार्गदर्शक एवं DLSA सहायता",
      humanSupportDesc: "अधिकृत कानूनी प्रतिनिधित्व",
      districtAware: "38 जिलों के लिए मार्गदर्शन",
      districtAwareDesc: "तमिलनाडु के सभी 38 जिले"
    },
    aiHuman: {
      tag: "AI और मानवीय सहयोग",
      title: "जहाँ संभव हो AI। जहाँ आवश्यक हो मानवीय सहायता।",
      subtitle: "बुद्धिमान AI विश्लेषण की गति और प्रमाणित कानूनी मार्गदर्शकों का विश्वसनीय निर्णय।",
      desc1: "ARAM AI तुरंत आपके मामले के तथ्यों को व्यवस्थित करता है, प्रासंगिक धाराओं की पहचान करता है, आवश्यक साक्ष्य चेकलिस्ट तैयार करता है और दस्तावेजों की जांच करता है।",
      desc2: "जब आपके मामले में कानूनी मसौदा तैयार करने, औपचारिक याचिका दायर करने या DLSA प्रतिनिधित्व की आवश्यकता होती है, तो प्रमाणित कानूनी मार्गदर्शक सीधे आपकी सहायता करते हैं।",
      bullet1: "24x7 तत्काल प्रारंभिक कानूनी विश्लेषण और अधिकारों की स्पष्ट व्याख्या",
      bullet2: "कोई स्वचालित अस्वीकृति नहीं — प्रत्येक जटिल मामले के लिए मानवीय समीक्षा",
      bullet3: "तालुक और जिला विधिक सेवा प्राधिकरण (DLSA) के साथ सीधा समन्वय"
    },
    immediateHelp: {
      tag: "आपातकालीन एवं वैधानिक हेल्पलाइन",
      title: "क्या आपको तत्काल सहायता चाहिए?",
      subtitle: "आपातकाल, महिला सुरक्षा, साइबर अपराध और मुफ्त कानूनी सहायता के लिए आधिकारिक सरकारी हेल्पलाइन।",
      emergency: "आपातकालीन सेवाएं (पुलिस / एम्बुलेंस)",
      emergencySub: "पुलिस, अग्निशमन और एम्बुलेंस (24x7)",
      women: "महिला हेल्पलाइन",
      womenSub: "सुरक्षा एवं घरेलू हिंसा निवारण (24x7)",
      cyber: "साइबर अपराध रिपोर्टिंग",
      cyberSub: "राष्ट्रीय वित्तीय धोखाधड़ी हेल्पलाइन",
      legalAid: "मुफ्त कानूनी सहायता (NALSA)",
      legalAidSub: "विधिक सेवा प्राधिकरण (DLSA) सेवाएं"
    },
    howItWorks: {
      tag: "सहज प्रक्रिया",
      title: "कानूनी समाधान के 4 आसान चरण",
      step1Title: "शिकायत बोलें या लिखें",
      step1Desc: "अपनी पसंदीदा भाषा में स्वाभाविक रूप से अपनी समस्या बताएं।",
      step2Title: "AI कानूनी विश्लेषण",
      step2Desc: "ARAM आपके विवाद को प्रमाणित भारतीय कानूनी धाराओं और दंड प्रावधानों से जोड़ता है।",
      step3Title: "सबूत सत्यापित करें",
      step3Desc: "त्वरित OCR सत्यापन के लिए अनुबंध या नोटिस अपलोड करें।",
      step4Title: "कानूनी मार्गदर्शक से जुड़ें",
      step4Desc: "अधिकृत कानूनी मार्गदर्शक या DLSA प्रतिनिधि से सीधी सहायता प्राप्त करें।"
    },
    features: {
      tag: "न्याय के लिए समर्पित",
      title: "ARAM AI आपके कानूनी अधिकारों की रक्षा कैसे करता है",
      subtitle: "प्रमाणित भारतीय कानूनों के आधार पर सटीक और त्रुटिहीन कानूनी मार्गदर्शन।",
      f1Title: "11-भाग संरचित कानूनी विश्लेषण",
      f1Desc: "प्रत्येक प्रश्न पर कानूनी धाराएं, अगले कदम, दस्तावेज़ चेकलिस्ट और DLSA मार्गदर्शन दिया जाता है।",
      f2Title: "बहुभाषी वॉयस असिस्टेंट",
      f2Desc: "तमिल, हिंदी और अंग्रेजी में सीधे बोलकर शिकायत दर्ज करें और मार्गदर्शन पाएं।",
      f3Title: "दस्तावेज़ OCR सत्यापन",
      f3Desc: "दस्तावेजों की स्वचालित जांच और कानूनी तत्परता स्कोरिंग।",
      f4Title: "प्रमाणित कानूनी मार्गदर्शक",
      f4Desc: "AI विश्लेषण से सीधे स्थानीय कानूनी मार्गदर्शकों और DLSA को त्वरित अग्रेषण।"
    },
    about: {
      tag: "हमारा उद्देश्य",
      title: "हर नागरिक के लिए कानूनी अधिकारों का लोकतंत्रीकरण",
      desc1: "ARAM (अறம்) इस मूल विश्वास पर आधारित है कि भाषा, क्षेत्र या आर्थिक स्थिति न्याय में बाधा नहीं बननी चाहिए।",
      desc2: "नागरिकों को प्रमाणित कानूनी ज्ञान और सत्यापित मार्गदर्शकों से जोड़कर ARAM समान न्याय सुनिश्चित करता है।",
      commitmentsTitle: "ARAM की मुख्य प्रतिबद्धताएं",
      c1: "सटीक मार्गदर्शन: सभी कानूनी सलाह प्रमाणित कानूनों के अनुसार सत्यापित हैं।",
      c2: "गोपनीयता सुरक्षा: आधार और व्यक्तिगत विवरणों की स्वचालित सुरक्षा।",
      c3: "आधिकारिक ईमेल: ouraramsupport@gmail.com से सुरक्षित व नियमित संचार।"
    },
    whoCanUse: {
      title: "ARAM का उपयोग कौन कर सकता है?",
      subtitle: "कानूनी सहायता पारिस्थितिकी तंत्र से जुड़े सभी हितधारकों के लिए निर्मित।",
      u1Title: "नागरिक",
      u1Desc: "शिकायतें दर्ज करें और AI कानूनी मार्गदर्शन प्राप्त करें।",
      u2Title: "कानूनी स्वयंसेवक",
      u2Desc: "नागरिकों की सहायता करें और कानूनी मार्गदर्शन प्रदान करें।",
      u3Title: "सरकारी अधिकारी",
      u3Desc: "आवंटित शिकायतों की समीक्षा करें और समाधान निकालें।",
      u4Title: "प्रशासक",
      u4Desc: "मंच की गतिविधियों और विश्लेषण की निगरानी करें।"
    },
    cta: {
      title: "क्या आप अपने अधिकारों को जानने के लिए तैयार हैं?",
      subtitle: "अपना पहला कानूनी प्रश्न पूछें, दस्तावेज़ सत्यापित करें या आज ही मार्गदर्शक से जुड़ें।",
      button: "निःशुल्क कानूनी मार्गदर्शन शुरू करें"
    },
    sidebar: {
      portalTitle: "कानूनी सहायता पोर्टल",
      dashboard: "डैशबोर्ड",
      askAi: "ARAM AI से पूछें",
      submitGrievance: "शिकायत दर्ज करें",
      myGrievances: "मेरी शिकायतें",
      documentsEvidence: "दस्तावेज़ और साक्ष्य",
      trackStatus: "स्थिति ट्रैक करें",
      supportSettings: "सहायता और सेटिंग्स",
      notifications: "सूचनाएं",
      helpRights: "सहायता और अधिकार मार्गदर्शिका",
      profileSettings: "प्रोफाइल और सेटिंग्स",
      signOut: "साइन आउट"
    },
    topbar: {
      searchCitizen: "ARAM AI से कानूनी प्रश्न पूछें (उदा. भूमि विवाद, RTI, 498A)...",
      searchAdmin: "सभी 38 जिलों में शिकायतें खोजें (आईडी, नागरिक, कीवर्ड)...",
      searchGuide: "आवंटित मामले या कानूनी विषय खोजें...",
      lightMode: "लाइट मोड पर स्विच करें",
      darkMode: "डार्क मोड पर स्विच करें",
      notifications: "सूचनाएं"
    },
    citizenDashboard: {
      portalBadge: "तमिलनाडु सार्वजनिक कानूनी सहायता और शिकायत निवारण पोर्टल",
      heroGreeting: "नमस्ते, {name}। आज ARAM आपकी क्या सहायता कर सकता है?",
      heroDescription: "तमिल, अंग्रेजी या हिंदी में किसी भी शिकायत, कानूनी समस्या या विवाद का विवरण दें और तत्काल सत्यापित मार्गदर्शन, दस्तावेज़ आवश्यकताएं और कानूनी सहायता प्राप्त करें।",
      askLegalAssistant: "ARAM कानूनी सहायक से पूछें",
      speakGrievance: "शिकायत बोलें (आवाज़)",
      stopTranscribe: "रोकें और ट्रांसक्राइब करें",
      listening: "सुन रहा है... समाप्त करने के लिए क्लिक करें",
      cardSubmitTitle: "शिकायत दर्ज करें",
      cardSubmitDesc: "AI दस्तावेज़ विश्लेषण के साथ संरचित शिकायत दर्ज करें।",
      cardUploadTitle: "साक्ष्य अपलोड करें",
      cardUploadDesc: "OCR तत्परता से विलेख, अनुबंध और FIR सत्यापित करें।",
      cardTrackTitle: "स्थिति ट्रैक करें",
      cardTrackDesc: "प्रगति समयरेखा और कानूनी मार्गदर्शक की कार्य योजनाएं।",
      cardRightsTitle: "कानूनी अधिकार मार्गदर्शिका",
      cardRightsDesc: "DLSA संपर्क, सरकारी योजनाएं और हेल्पलाइन नंबर।",
      exploreDomainTitle: "क्षेत्र के अनुसार कानूनी अधिकार जानें",
      askAnyTopic: "कोई भी विषय पूछें >",
      domainWomenTitle: "महिला एवं परिवार कानून",
      domainWomenDesc: "भरण-पोषण, 498A, घरेलू हिंसा, बाल अभिरक्षा",
      domainLandTitle: "भूमि एवं संपत्ति",
      domainLandDesc: "पट्टा, अतिक्रमण, सीमा विवाद",
      domainConsumerTitle: "उपभोक्ता एवं RTI",
      domainConsumerDesc: "दोषपूर्ण उत्पाद, RTI आवेदन, निष्पक्ष व्यापार",
      domainLabourTitle: "श्रम एवं वेतन अधिकार",
      domainLabourDesc: "बकाया वेतन, ग्रेच्युटी, PF निपटान",
      domainCyberTitle: "आपातकालीन एवं साइबर सहायता",
      domainCyberDesc: "ऑनलाइन धोखाधड़ी, 1930 हेल्पलाइन, उत्पीड़न",
      activeGrievancesTitle: "मेरी सक्रिय शिकायतें",
      activeGrievancesDesc: "अपनी दर्ज शिकायतों और कानूनी मार्गदर्शक नोट्स को ट्रैक करें।",
      viewAllGrievances: "सभी शिकायतें देखें →",
      loadingGrievances: "आपकी शिकायतें लोड हो रही हैं...",
      noGrievancesTitle: "कोई सक्रिय शिकायत नहीं मिली।",
      noGrievancesDesc: "जब भी आप कोई शिकायत दर्ज करेंगे या कानूनी सहायता का अनुरोध करेंगे, विवरण यहां दिखाई देंगे।",
      submitFirstGrievance: "पहली शिकायत दर्ज करें"
    },
    submitComplaint: {
      headerTitle: "नागरिक शिकायत और कानूनी याचिका",
      headerSubtitle: "तमिलनाडु कानूनी सेवा प्राधिकरण • आधिकारिक शिकायत एवं निवारण रजिस्ट्री",
      aiGuidedTab: "AI-निर्देशित याचिका (5 चरण)",
      directFormTab: "सीधा फॉर्म (एकल पृष्ठ)",
      stageOf: "चरण {step} / 5",
      stageNames: {
        tellAram: "विवरण",
        aiUnderstanding: "AI समझ",
        documents: "दस्तावेज़",
        safetyGuides: "सुरक्षा और मार्गदर्शक",
        reviewSubmit: "समीक्षा और सबमिट"
      },
      stage1Title: "ARAM को बताएं क्या हुआ",
      stage1Desc: "अपनी समस्या स्वाभाविक रूप से बताएं। आप अपनी भाषा में टाइप या बोल सकते हैं।",
      tellUsLabel: "हमें बताएं क्या हुआ...",
      minChars: "न्यूनतम 15 वर्ण",
      tellUsPlaceholder: "अपने शब्दों में बताएं क्या हुआ... (आप तमिल, अंग्रेजी या हिंदी में बोल या लिख सकते हैं)",
      speakProblem: "समस्या बोलें",
      listeningClickStop: "सुन रहा है... (रोकने के लिए क्लिक करें)",
      processingSpeech: "आवाज़ संसाधित हो रही है...",
      languageLabel: "भाषा:",
      autoDetect: "✨ स्वतः पहचान",
      primaryBadge: "प्राथमिक",
      transcribedNarrative: "ट्रांसक्राइब किया गया समस्या विवरण",
      speechBadge: "{lang} वाणी",
      reviewEditTip: "✨ समीक्षा और संपादन: 'ARAM से विश्लेषण करें' पर क्लिक करने से पहले आप सीधे ऊपर दिए गए टेक्स्ट बॉक्स में नाम, राशि या तिथियां संपादित कर सकते हैं।",
      yourDistrict: "आपका जिला",
      districtHelp: "आपका जिला, ARAM को {district} जिला कानूनी सहायता डेस्क पर उचित स्थानीय सहायता से जोड़ने में मदद करता है।",
      clearText: "टेक्स्ट साफ़ करें",
      analyzingLegal: "कानूनी संदर्भ का विश्लेषण किया जा रहा है...",
      analyzeWithAram: "ARAM से विश्लेषण करें →",
      stage2Title: "ARAM AI मामला मूल्यांकन",
      listenSummary: "सारांश सुनें",
      stopAudio: "ऑडियो रोकें",
      formulatedTitle: "निर्मित समस्या शीर्षक",
      doneEditing: "संपादन पूर्ण",
      editTitle: "शीर्षक संपादित करें",
      priorityLabel: "प्राथमिकता: {priority}",
      caseOverview: "मामले की स्थिति और कानूनी अवलोकन",
      partiesIdentified: "पहचाने गए पक्ष",
      disputeClaimAmount: "विवाद दावा राशि",
      timelineDate: "समयरेखा / घटना तिथि",
      reliefQuestion: "आप क्या विशिष्ट परिणाम या राहत चाहते हैं?",
      reliefSubtitle: "आपका अनुरोधित समाधान",
      reliefPlaceholder: "उदाहरण: मैं चाहता हूं कि TNSLSA मकान मालिक को बिना किसी अवैध कटौती के मेरी ₹50,000 की सुरक्षा जमा राशि वापस करने का निर्देश दे।",
      speakBtn: "बोलें",
      recordingBtn: "रिकॉर्ड हो रहा है...",
      applicableRemedies: "लागू होने वाले कानूनी उपचार",
      backBtn: "पीछे",
      continueDocsBtn: "दस्तावेज़ और साक्ष्य पर आगे बढ़ें →",
      stage3Title: "दस्तावेज़ और सहायक साक्ष्य",
      stage3Desc: "स्वचालित तत्परता समीक्षा के लिए विलेख, नोटिस, रसीदें या अनुबंध संलग्न करें।",
      ocrIntegrityReview: "साक्ष्य तत्परता और दस्तावेज़ अखंडता समीक्षा",
      continueSafetyBtn: "सुरक्षा और सहायता पर आगे बढ़ें →",
      stage4Title: "सुरक्षा और कानूनी मार्गदर्शक प्रतिनिधित्व",
      stage4Desc: "सुरक्षा नियम निर्धारित करें और सत्यापित जिला विधिक सेवा प्राधिकरण का प्रतिनिधित्व प्राप्त करें।",
      continueReviewBtn: "समीक्षा और सबमिट पर आगे बढ़ें →",
      stage5Title: "शिकायत की समीक्षा और वैधानिक सबमिशन",
      stage5Desc: "मामला संख्या आवंटन और ब्लॉकचेन ऑडिट ब्लॉक लॉगिंग से पहले अंतिम सत्यापन।",
      declarationText: "मैं प्रमाणित करता/करती हूं कि कानूनी सहायता प्रावधानों के तहत प्रदान की गई जानकारी मेरे ज्ञान के अनुसार सत्य है।",
      submitGrievanceBtn: "कानूनी सहायता डेस्क पर शिकायत दर्ज करें →",
      submittingBtn: "कानूनी रजिस्ट्री में दर्ज किया जा रहा है...",
      successTitle: "शिकायत सफलतापूर्वक दर्ज की गई!",
      successDesc: "आपकी शिकायत तमिलनाडु कानूनी सेवा प्राधिकरण में पंजीकृत हो गई है और ब्लॉकचेन ऑडिट ब्लॉक में सुरक्षित रूप से दर्ज कर दी गई है।",
      officialRef: "आधिकारिक मामला संदर्भ संख्या:",
      trackGrievanceBtn: "शिकायत की स्थिति ट्रैक करें",
      returnDashboardBtn: "डैशबोर्ड पर लौटें"
    },
    complaintHistory: {
      title: "मेरी शिकायतों का इतिहास",
      subtitle: "दर्ज मामलों की स्थिति, साक्ष्य सत्यापन और कानूनी मार्गदर्शक नोट्स को ट्रैक करें।",
      newGrievanceBtn: "नई शिकायत दर्ज करें",
      searchPlaceholder: "शीर्षक, आईडी या विवरण द्वारा खोजें...",
      filterAll: "सभी स्थितियां",
      filterSubmitted: "दर्ज की गई",
      filterInProgress: "प्रगति पर",
      filterResolved: "समाधान हुआ",
      noComplaintsTitle: "कोई शिकायत नहीं मिली",
      noComplaintsDesc: "आपने अभी तक कोई शिकायत दर्ज नहीं की है या आपके फ़िल्टर से कोई मेल नहीं खाता।",
      fileFirstGrievance: "पहली शिकायत दर्ज करें"
    },
    evidenceVault: {
      title: "दस्तावेज़ और साक्ष्य वॉल्ट",
      subtitle: "त्वरित OCR तत्परता सत्यापन और एन्क्रिप्टेड स्टोरेज के लिए विलेख, अनुबंध और FIR अपलोड करें।",
      analyzerTitle: "OCR दस्तावेज़ कानूनी तत्परता विश्लेषक",
      analyzerSubtitle: "औपचारिक सबमिशन से पहले पंजीकरण संख्या, सीमाएं और वैधानिक मुहरों को सत्यापित करें।",
      uploadBoxTitle: "अपलोड करने के लिए क्लिक करें या फ़ाइल खींचें और छोड़ें",
      uploadBoxSubtitle: "PDF, JPG, JPEG, PNG (अधिकतम 15MB)",
      verifyBtn: "दस्तावेज़ तत्परता सत्यापित करें",
      verifyingBtn: "दस्तावेज़ OCR विश्लेषण हो रहा है...",
      readinessScore: "कानूनी तत्परता स्कोर",
      detectedEntities: "पहचाने गए कानूनी विवरण"
    },
    trackComplaint: {
      title: "शिकायत की स्थिति ट्रैक करें",
      subtitle: "समीक्षा प्रगति, आवंटित मार्गदर्शक और अगली कार्य योजना की जांच के लिए अपना ARAM केस आईडी दर्ज करें।",
      inputPlaceholder: "केस संदर्भ आईडी दर्ज करें (उदा. ARAM-2026-000001 या 1)...",
      trackBtn: "केस ट्रैक करें",
      trackingBtn: "खोज रहा है...",
      step1Title: "शिकायत दर्ज",
      step1Desc: "ARAM आधिकारिक रजिस्ट्री में सुरक्षित रूप से दर्ज की गई",
      step2Title: "AI विश्लेषण और वर्गीकरण",
      step2Desc: "लागू कानूनी धाराएं और चेकलिस्ट पहचानी गईं",
      step3Title: "कानूनी मार्गदर्शक आवंटन",
      step3Desc: "सहायता के लिए सत्यापित कानूनी मार्गदर्शक नियुक्त किया गया",
      step4Title: "प्राधिकरण समाधान",
      step4Desc: "तालुका / जिला कानूनी कार्रवाई पूर्ण हुई"
    },
    helpCenter: {
      title: "कानूनी अधिकार और आपातकालीन सहायता केंद्र",
      subtitle: "प्रमाणित वैधानिक हेल्पलाइन, जिला विधिक सेवा प्राधिकरण (DLSA) और विवाद दिशानिर्देश।",
      nalsaTitle: "राष्ट्रीय विधिक सेवा प्राधिकरण (NALSA)",
      nalsaDesc: "विधिक सेवा प्राधिकरण अधिनियम के तहत पात्र नागरिकों के लिए निःशुल्क कानूनी सहायता",
      womenTitle: "महिला हेल्पलाइन",
      womenDesc: "घरेलू हिंसा और आपातकालीन सुरक्षा के लिए 24x7 सहायता",
      cyberTitle: "राष्ट्रीय साइबर अपराध रिपोर्टिंग",
      cyberDesc: "वित्तीय धोखाधड़ी और साइबर उत्पीड़न की तत्काल रिपोर्टिंग",
      seniorTitle: "वरिष्ठ नागरिक हेल्पलाइन",
      seniorDesc: "बुजुर्गों के साथ दुर्व्यवहार और भरण-पोषण विवादों के लिए कानूनी सहायता",
      gatewayTitle: "आधिकारिक ARAM सहायता गेटवे",
      gatewayDesc: "औपचारिक याचिका प्रारूपण पूछताछ या तकनीकी सहायता के लिए ईमेल करें:"
    }
  }
};

const normalizeLang = (code) => {
  if (!code) return "en-IN";
  const lower = String(code).toLowerCase();
  if (lower.startsWith("ta")) return "ta-IN";
  if (lower.startsWith("hi")) return "hi-IN";
  return "en-IN";
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return normalizeLang(localStorage.getItem("aram_lang") || "en-IN");
  });

  const changeLanguage = (newLang) => {
    const normalized = normalizeLang(newLang);
    setLanguage(normalized);
    localStorage.setItem("aram_lang", normalized);
  };

  const t = (key, fallback = "") => {
    const activeCode = normalizeLang(language);
    const langObj = translations[activeCode] || translations["en-IN"];
    const keys = key.split(".");
    let val = langObj;
    for (const k of keys) {
      if (val && typeof val === "object" && k in val) {
        val = val[k];
      } else {
        val = null;
        break;
      }
    }
    if (val !== null && val !== undefined) return val;

    let enVal = translations["en-IN"];
    for (const k of keys) {
      if (enVal && typeof enVal === "object" && k in enVal) {
        enVal = enVal[k];
      } else {
        enVal = null;
        break;
      }
    }
    return enVal !== null && enVal !== undefined ? enVal : fallback;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, availableLanguages, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: "en-IN",
      changeLanguage: () => {},
      availableLanguages,
      t: (key, fallback = "") => fallback
    };
  }
  return context;
};

export default LanguageContext;
