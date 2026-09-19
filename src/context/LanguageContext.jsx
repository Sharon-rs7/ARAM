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
      title1: "Your Rights. Our Support.",
      title2: "A Fairer Tomorrow.",
      subtitle: "ARAM AI bridges the justice gap by translating complex Indian laws, penal codes, and government schemes into clear, actionable steps in Tamil, English, and Hindi.",
      askAi: "Ask ARAM AI",
      speakProblem: "Speak Problem",
      listening: "Listening... Click to Finish",
      uploadDoc: "Upload Document",
      connectGuide: "Connect Guide"
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
      title1: "உங்கள் உரிமை. எங்கள் ஆதரவு.",
      title2: "நீதியான எதிர்காலம்.",
      subtitle: "அறம் AI சிக்கலான இந்திய சட்டங்கள், குற்றவியல் பிரிவுகள் மற்றும் அரசு திட்டங்களை தமிழ், ஆங்கிலம் மற்றும் இந்தியில் எளிய, தெளிவான நடைமுறைகளாக மாற்றி அனைவருக்கும் சமநீதி கிடைக்க வழிவகுக்கிறது.",
      askAi: "அறம் AI-யிடம் கேட்க",
      speakProblem: "குரலில் கூற",
      listening: "கேட்கிறது... முடிக்க கிளிக் செய்யவும்",
      uploadDoc: "ஆவணம் பதிவேற்ற",
      connectGuide: "சட்ட வழிகாட்டியை அணுக"
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
      title1: "आपके अधिकार। हमारा समर्थन।",
      title2: "एक न्यायपूर्ण कल।",
      subtitle: "ARAM AI जटिल भारतीय कानूनों, दंड संहिताओं और सरकारी योजनाओं को तमिल, अंग्रेजी और हिंदी में स्पष्ट, व्यावहारिक कदमों में बदलकर न्याय को सभी के लिए सुलभ बनाता है।",
      askAi: "ARAM AI से पूछें",
      speakProblem: "समस्या बोलें",
      listening: "सुन रहा है... समाप्त करने के लिए क्लिक करें",
      uploadDoc: "दस्तावेज़ अपलोड करें",
      connectGuide: "मार्गदर्शक से जुड़ें"
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
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("aram_lang") || "en-IN";
  });

  const changeLanguage = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem("aram_lang", newLang);
  };

  const t = (key, fallback = "") => {
    const langObj = translations[language] || translations["en-IN"];
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
