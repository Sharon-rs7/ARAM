import os
import time
from typing import Dict, Any, List, Optional
from llm.qwen_provider import qwen_provider
from llm.gemini_provider import gemini_provider
from llm.response_validator import grounding_validator, ValidationResult
from rag.schemas.rag_response import RAGRetrievalResult, LegalChunkProvenance

DOMAIN_LEGAL_KNOWLEDGE = {
    "PROPERTY_DISPUTE": {
        "act": "Registration Act, 1908 & Transfer of Property Act, 1882 / Information Technology Act, 2000",
        "section": "Section 17 & Section 82 (Registration Act) / Section 54 (Transfer of Property) / Section 66D (IT Act)",
        "explanation_ta": "சொத்து ஆவண விவரங்களை தவறாகப் பயன்படுத்தி அனுமதியற்ற முறையில் உரிமை மாற்றம் செய்ய முயல்வது அல்லது போலி ஆவணம் தயாரிப்பது பதிவுச் சட்டம் 1908 பிரிவு 82 மற்றும் தகவல் தொழில்நுட்ப சட்டம் பிரிவு 66D-ன் கீழ் தண்டனைக்குரிய குற்றமாகும். உங்கள் அசல் கிரய பத்திரம் உங்களிடம் இருக்கும் பட்சத்தில், உடனடியாக TNREGINET இணையதளம் வழியாக வில்லங்க சான்றிதழ் (Encumbrance Certificate - EC) சரிபார்த்து, சம்பந்தப்பட்ட சார்-பதிவாளர் (Sub-Registrar) அலுவலகத்தில் பதிவு மறுப்பு / ஆட்சேபனை மனு தாக்கல் செய்ய வேண்டும்; ஆன்லைன் மோசடி முயற்சிக்கு தேசிய சைபர் குற்றப்பிரிவு (1930 / cybercrime.gov.in) மற்றும் காவல் நிலையத்தில் புகார் அளிக்க வேண்டும்.",
        "explanation_en": "Unauthorized attempts to execute ownership transfer or misuse property document details constitute fraudulent registration offenses under Section 82 of the Registration Act, 1908 and cyber impersonation/fraud under Section 66D of the Information Technology Act, 2000. If you hold the original registered Sale Deed, immediately verify the Encumbrance Certificate (EC) via the TNREGINET portal, lodge a formal objection / protest petition before the Jurisdictional Sub-Registrar, and report the unauthorized online attempt to the National Cyber Crime Helpline (1930 / cybercrime.gov.in) and District Legal Services Authority (DLSA).",
        "explanation_hi": "संपत्ति के दस्तावेजों का दुरुपयोग कर अनधिकृत रूप से स्वामित्व हस्तांतरण का प्रयास पंजीकरण अधिनियम की धारा 82 और आईटी अधिनियम की धारा 66D के तहत दंडनीय है। अपने मूल बैनामे (Sale Deed) के साथ तुरंत भारमुक्त प्रमाणपत्र (EC) की जांच करें और उप-पंजीयक (Sub-Registrar) तथा साइबर सेल (1930) में शिकायत दर्ज करें।",
        "penalty_en": "Imprisonment up to 7 years and fine under Section 82 of Registration Act, 1908, along with penal consequences for cheating by personation under Section 66D IT Act.",
        "penalty_ta": "பதிவுச் சட்டம் பிரிவு 82-ன் கீழ் 7 ஆண்டுகள் வரை சிறைத்தண்டனை மற்றும் அபராதம்; தகவல் தொழில்நுட்ப சட்டம் 66D-ன் கீழ் ஆள்மாறாட்ட மோசடி தண்டனை.",
        "penalty_hi": "पंजीकरण अधिनियम की धारा 82 के तहत 7 वर्ष तक का कारावास एवं जुर्माना, तथा आईटी अधिनियम धारा 66D के तहत दंड।",
        "authority": "Sub-Registrar Office (Registration Dept, TN) / Cyber Crime Police Station (1930 / cybercrime.gov.in) / Tahsildar / DLSA",
        "docs": ["Original Sale Deed (அசல் கிரய பத்திரம்)", "Encumbrance Certificate (EC - வில்லங்க சான்றிதழ் via tnreginet)", "Patta / Chitta Revenue Records (பட்டா / சிட்டா)", "Evidence of Suspicious / Unauthorized Online Transaction Attempt (Screenshots / Portal Reference Logs)", "Identity Proof (Aadhaar / Voter ID)"],
        "steps_ta": [
            "உடனடியாக TNREGINET (tnreginet.gov.in) இணையதளத்தில் சமீபத்திய வில்லங்க சான்றிதழ் (EC) மற்றும் ஆவண நிலவரத்தை சரிபார்க்கவும்.",
            "சம்பந்தப்பட்ட சார்-பதிவாளர் அலுவலகத்தில் (Sub-Registrar Office) உங்கள் அசல் கிரய பத்திர நகலுடன் பதிவு ஆட்சேபனை / எச்சரிக்கை மனு (Protest Petition) சமர்ப்பிக்கவும்.",
            "அனுமதியற்ற ஆன்லைன் பரிவர்த்தனை முயற்சி குறித்து தேசிய சைபர் குற்றப்பிரிவு உதவி எண் 1930 அல்லது cybercrime.gov.in தளத்தில் பதிவு செய்து CSR / ஒப்புகை எண் பெறவும்.",
            "மாவட்ட சட்டப்பணிகள் ஆணைக்குழு (DLSA) அல்லது காவல் நிலையத்தில் எழுத்துப்பூர்வ புகார் அளித்து சட்ட உதவி பெறவும்."
        ],
        "steps_en": [
            "Check and download the latest Encumbrance Certificate (EC) and certified copies on the TNREGINET portal (tnreginet.gov.in) to verify whether any unauthorized encumbrance or entry has been registered.",
            "Submit a written Protest / Objection Petition along with a copy of your Original Sale Deed before the Jurisdictional Sub-Registrar Office to block any fraudulent registration.",
            "Report the unauthorized online transaction attempt on the National Cyber Crime Reporting Portal (cybercrime.gov.in) or call Cyber Helpline 1930 to obtain an official Cyber Acknowledgement/CSR.",
            "Approach the District Legal Services Authority (DLSA) or Jurisdictional Police Station for immediate legal aid and protective injunction if required."
        ],
        "steps_hi": [
            "TNREGINET पोर्टल पर नवीनतम भारमुक्त प्रमाणपत्र (EC) की जांच करें कि कोई अनधिकृत प्रविष्टि तो नहीं हुई है।",
            "संबंधित उप-पंजीयक (Sub-Registrar) कार्यालय में मूल बैनामे की प्रति के साथ धोखाधड़ी रोकने हेतु आपत्ति याचिका दायर करें।",
            "राष्ट्रीय साइबर अपराध पोर्टल (cybercrime.gov.in / हेल्पलाइन 1930) पर अनधिकृत ऑनलाइन प्रयास की रिपोर्ट दर्ज करें।",
            "जिला विधिक सेवा प्राधिकरण (DLSA) या संबंधित थाने में लिखित शिकायत प्रस्तुत करें।"
        ]
    },
    "PROPERTY_CIVIL_DISPUTE": {
        "act": "Transfer of Property Act, 1882 & Specific Relief Act, 1963",
        "section": "Section 54 & Section 38 (Injunction)",
        "explanation_ta": "சொத்து உரிமை தகராறுகள், பாகப்பிரிவினை மற்றும் அத்துமீறல் வழக்குகளுக்கு உரிமையியல் நீதிமன்றம் அல்லது மாவட்ட சட்டப்பணிகள் ஆணைக்குழுவை அணுகலாம்.",
        "explanation_en": "Title declarations, partition suits, and injunction reliefs are adjudicated under the Specific Relief Act and Transfer of Property Act.",
        "penalty_en": "Civil court decree of declaration, permanent injunction, and mesne profits.",
        "penalty_ta": "உரிமை பிரகடனம் மற்றும் நிரந்தர உறுத்துக்கட்டளை ஆணை.",
        "authority": "Civil Court / Sub-Court / District Legal Services Authority",
        "docs": ["Registered Sale Deed", "Patta / Chitta", "Encumbrance Certificate (EC)", "FMB Sketch"],
        "steps_ta": ["ஆவணங்களை சரிபார்த்து DLSA முன் சமரச மனு தாக்கல் செய்யவும்.", "உரிமையியல் நீதிமன்றத்தில் வழக்கு தாக்கல் செய்யவும்."],
        "steps_en": ["Organize parent title deeds and certified survey sketches.", "Approach DLSA for pre-litigation conciliation or file regular civil suit."]
    },
    "TENANCY_DISPUTE": {
        "act": "Tamil Nadu Regulation of Rights and Responsibilities of Landlords and Tenants Act, 2017",
        "section": "Section 4 & Section 21",
        "explanation_ta": "வாடகை முன்வைப்பு தொகை (Security Deposit) திரும்பப் பெறுதல் மற்றும் அநியாய காலி செய்தல் தொடர்பான பிரச்சனைகள் வாடகைதாரர் உரிமைகள் சட்டம் 2017 மூலம் பாதுகாக்கப்படுகின்றன. வாடகை தீர்ப்பாயத்தை (Rent Court) அணுகலாம்.",
        "explanation_en": "Recovery of refundable security deposit, protection against unlawful eviction, and tenancy violations are adjudicated by the Rent Court / Rent Tribunal.",
        "explanation_hi": "किराया सुरक्षा जमा (Security Deposit) वापसी और अवैध बेदखली के विवाद किराया अधिकरण (Rent Tribunal) द्वारा निपटाए जाते हैं।",
        "penalty_en": "Mandatory refund of security deposit with statutory interest and penalty for unlawful withholding.",
        "penalty_ta": "முன்வைப்பு தொகையை வட்டியுடன் திரும்ப அளிக்கும் உத்தரவு.",
        "penalty_hi": "ब्याज सहित सुरक्षा राशि वापसी का आदेश।",
        "authority": "Rent Court / Rent Tribunal / Taluk Legal Services Committee",
        "docs": ["Rental Agreement", "Security Deposit Receipts / Bank Transfers", "Notice to Vacate", "Utility Bills"],
        "steps_ta": [
            "வாடகை ஒப்பந்தம் மற்றும் வங்கி பரிவர்த்தனை ஆதாரங்களை ஒருங்கிணைக்கவும்.",
            "வீட்டு உரிமையாளருக்கு முன்வைப்பு தொகையை கோரி எழுத்துப்பூர்வ அறிவிப்பு அனுப்பவும்.",
            "தீர்வு கிடைக்காவிடில் வாடகை நீதிமன்றம் அல்லது தாலுகா சட்டப்பணிகள் குழுவில் முறையிடவும்."
        ],
        "steps_en": [
            "Organize signed rental agreement and security deposit payment receipts.",
            "Issue a formal legal notice demanding refund within a stipulated 15-day period.",
            "File an application before the Rent Court or District Legal Services Authority (DLSA)."
        ],
        "steps_hi": [
            "किराया अनुबंध और जमा भुगतान की रसीदें एकत्रित करें।",
            "जमा राशि की वापसी हेतु मकान मालिक को कानूनी नोटिस भेजें।",
            "समाधान न होने पर किराया अधिकरण या डीएलएसए में शिकायत दर्ज करें।"
        ]
    },
    "RENT_TENANT_DISPUTE": {
        "act": "Tamil Nadu Regulation of Rights and Responsibilities of Landlords and Tenants Act, 2017",
        "section": "Section 4 & Section 21",
        "explanation_ta": "வாடகை ஒப்பந்தம் மற்றும் வாடகை முன்வைப்பு தொகை பிரச்சனைகளுக்கு வாடகை நீதிமன்றத்தை அணுகலாம்.",
        "explanation_en": "Tenancy agreements and deposit refunds are governed by the Tenancy Act, 2017.",
        "penalty_en": "Statutory recovery of deposit and protection from illegal eviction.",
        "penalty_ta": "முன்வைப்பு தொகை மீட்பு மற்றும் சட்டப்படியான நிவாரணம்.",
        "authority": "Rent Court / Rent Controller Office / DLSA",
        "docs": ["Rental Agreement", "Payment Slips", "Notice"],
        "steps_ta": ["வங்கி ஆதாரங்களை திரட்டவும்.", "வாடகை நீதிமன்றத்தில் மனு தாக்கல் செய்யவும்."],
        "steps_en": ["Collect tenancy contract and payment proofs.", "File claim petition before Rent Court."]
    },
    "LABOUR_DISPUTE": {
        "act": "Payment of Wages Act, 1936 & Industrial Disputes Act, 1947",
        "section": "Section 15 (Claims out of deductions from wages)",
        "explanation_ta": "பணியாளர்களுக்கு சேரவேண்டிய ஊதிய பாக்கி, பணிக்கொடை (Gratuity) மற்றும் அநியாய பணிநீக்கம் தொடர்பான புகார்களை தொழிலாளர் உதவி ஆணையரிடம் முறையிடலாம்.",
        "explanation_en": "Unpaid salary, wrongful deductions, and unlawful termination are redressed by the District Labour Commissioner and Labour Courts.",
        "penalty_en": "Order for payment of delayed wages with compensation up to 10 times the deducted amount.",
        "penalty_ta": "நிலுவை ஊதியம் மற்றும் இழப்பீடு வழங்கும் உத்தரவு.",
        "authority": "District Labour Commissioner / Labour Court / DLSA",
        "docs": ["Salary Slips", "Offer Letter / ID Card", "Bank Statement", "Attendance Records"],
        "steps_ta": [
            "பணி நியமன ஆணை மற்றும் சம்பள சீட்டுகளை சேகரிக்கவும்.",
            "மாவட்ட தொழிலாளர் உதவி ஆணையரிடம் (Labour Officer) முறைப்படி மனு அளிக்கவும்.",
            "தொழிலாளர் நீதிமன்றம் அல்லது DLSA சமரச அமர்வில் பங்கேற்கவும்."
        ],
        "steps_en": [
            "Collect employment contract, salary slips, and bank statements.",
            "File a formal wage recovery claim before the District Labour Commissioner.",
            "Attend conciliation proceedings at the Labour Conciliation Office or DLSA."
        ]
    },
    "CONSUMER_COMPLAINT": {
        "act": "Consumer Protection Act, 2019",
        "section": "Section 35 & Section 2(11)",
        "explanation_ta": "குறைபாடுள்ள பொருட்கள் மற்றும் சேவைகள் தொடர்பான இழப்பீட்டு மனுக்களை மாவட்ட நுகர்வோர் குறைதீர் ஆணையத்தில் இ-தாகா (e-Daakhil) மூலம் தாக்கல் செய்யலாம்.",
        "explanation_en": "Defective goods, misleading representations, and deficient services are adjudicated by the District Consumer Disputes Redressal Commission (DCDRC).",
        "penalty_en": "Full refund with interest, replacement of goods, and monetary compensation for mental agony.",
        "penalty_ta": "முழு தொகை திரும்ப அளித்தல் மற்றும் இழப்பீடு வழங்குதல்.",
        "authority": "District Consumer Disputes Redressal Commission (DCDRC)",
        "docs": ["Tax Invoice / Bill", "Warranty Card", "Email / Written Complaints to Seller", "Product Defect Proof"],
        "steps_ta": [
            "வாங்கிய ரசீது (Bill) மற்றும் உத்தரவாத அட்டையை தயார் செய்யவும்.",
            "விற்பனையாளருக்கு குறைபாட்டை சரிசெய்யக் கோரி எழுத்துப்பூர்வ அறிவிப்பு அனுப்பவும்.",
            "e-Daakhil போர்ட்டலில் மாவட்ட நுகர்வோர் ஆணையத்தில் புகார் பதிவு செய்யவும்."
        ],
        "steps_en": [
            "Gather tax invoice, warranty card, and proof of communication with seller.",
            "Issue a formal statutory notice to the seller/service provider.",
            "File a consumer complaint online via e-Daakhil portal or at District Consumer Commission."
        ]
    },
    "CYBER_CRIME": {
        "act": "Information Technology Act, 2000 & Bharatiya Nyaya Sanhita, 2023",
        "section": "Section 66D (Cheating by Personation Using Computer Resource)",
        "explanation_ta": "ஆன்லைன் பண மோசடி, ஓடிபி திருட்டு மற்றும் இணைய குற்றங்களுக்கு முதல் 24 மணி நேரத்திற்குள் 1930 எண்ணை அழைக்க வேண்டும்.",
        "explanation_en": "Online financial frauds, identity theft, and phishing scams are investigated by the Cyber Crime Police under the IT Act.",
        "penalty_en": "Freezing of fraudulent bank accounts and recovery through bank nodal officers.",
        "penalty_ta": "மோசடி கணக்குகளை முடக்குதல் மற்றும் பணத்தை மீட்டெடுத்தல்.",
        "authority": "Cyber Crime Police Station / National Cybercrime Portal (1930 / cybercrime.gov.in)",
        "docs": ["Bank Statement showing debit", "UPI / UTR Transaction IDs", "Screenshots of SMS / Chats", "Bank Dispute Form Copy"],
        "steps_ta": [
            "உடனடியாக 1930 சைபர் உதவி எண்ணை அழைத்து புகார் பதிவு செய்து கணக்கை முடக்கவும்.",
            "cybercrime.gov.in இணையதளத்தில் முழு ஆதாரங்களுடன் புகார் பதிவு செய்யவும்.",
            "வங்கி மேலாளரிடம் முறைப்படி dispute form சமர்ப்பித்து புகார் நகல் அளிக்கவும்."
        ],
        "steps_en": [
            "Immediately call Cybercrime Helpline 1930 within the golden hour to freeze fraudulent funds.",
            "Register formal FIR/complaint on cybercrime.gov.in with all transaction proofs.",
            "Submit dispute form and cyber police acknowledgement to your bank branch."
        ]
    },
    "MOTOR_ACCIDENT_CLAIM": {
        "act": "Motor Vehicles Act, 1988 (as amended in 2019)",
        "section": "Section 166 (Application for compensation) & Section 161 (Hit and Run)",
        "explanation_ta": "வாகன விபத்து இழப்பீடு, மருத்துவ செலவுகள் மற்றும் ஊனமுற்றோருக்கான இழப்பீட்டை மோட்டார் விபத்து இழப்பீட்டு தீர்ப்பாயத்தில் (MACT) கோரலாம்.",
        "explanation_en": "Victims of road accidents can claim compensation for medical expenses, permanent disability, and loss of income before the Motor Accident Claims Tribunal (MACT).",
        "penalty_en": "Statutory compensation award with interest payable by insurer/vehicle owner.",
        "penalty_ta": "காப்பீட்டு நிறுவனம் மூலம் இழப்பீட்டுத் தொகை வழங்கும் தீர்ப்பு.",
        "authority": "Motor Accident Claims Tribunal (MACT) / DLSA Lok Adalat",
        "docs": ["FIR / Police CSR Copy", "Medical Discharge Summary & Treatment Bills", "Vehicle RC Book & Insurance Policy", "Driving License Copy"],
        "steps_ta": [
            "காவல் நிலையத்தில் விபத்து தொடர்பாக FIR/CSR பதிவு செய்யவும்.",
            "அனைத்து மருத்துவ சிகிச்சைக் குறிப்புகள் மற்றும் கட்டண ரசீதுகளை ஒருங்கிணைக்கவும்.",
            "மாவட்ட முதன்மை நீதிமன்றத்தில் உள்ள MACT தீர்ப்பாயத்தில் இழப்பீட்டு மனு தாக்கல் செய்யவும்."
        ],
        "steps_en": [
            "Obtain certified copies of FIR and Motor Vehicle Inspection (MVI) report from Police.",
            "Collate all hospital discharge summaries, medical bills, and disability certificates.",
            "File a formal Claim Petition before the jurisdictional MACT Tribunal."
        ]
    },
    "MEDICAL_NEGLIGENCE": {
        "act": "Consumer Protection Act, 2019 & National Medical Commission Act, 2019",
        "section": "Section 2(11) (Deficiency in Medical Service) & Section 35 (Claim for Damages)",
        "explanation_ta": "மருத்துவ அலட்சியம், தவறான அறுவை சிகிச்சை மற்றும் சிகிச்சைக் குறைபாடுகளுக்கு நுகர்வோர் ஆணையத்தில் நஷ்டஈடு கோரலாம் மற்றும் மருத்துவ கவுன்சிலில் ஒழுங்கு நடவடிக்கை எடுக்கலாம்.",
        "explanation_en": "Medical negligence, professional malpractice, and deficient hospital care are actionable for damages under Consumer Protection Act and disciplinary action before State Medical Council.",
        "penalty_en": "Monetary compensation for physical/mental suffering and suspension of medical license.",
        "penalty_ta": "இழப்பீட்டுத் தொகை வழங்குதல் மற்றும் மருத்துவ உரிமம் இடைநீக்கம்.",
        "authority": "State Medical Council / District Consumer Disputes Redressal Commission / DLSA",
        "docs": ["Hospital Discharge Summary", "Prescription Sheets & Diagnostic Test Reports", "Itemized Treatment Invoices & Receipts", "Doctor Case Notes"],
        "steps_ta": [
            "மருத்துவமனை சிகிச்சையின் முழு மருத்துவக் குறிப்புகளின் சான்றளிக்கப்பட்ட நகலை கோரவும்.",
            "நிபுணர் மருத்துவக் குழுவின் அறிக்கையைப் பெற்று நுகர்வோர் ஆணையத்தில் மனு தாக்கல் செய்யவும்.",
            "மாநில மருத்துவ கவுன்சிலில் மருத்துவர் மீது ஒழுங்கு நடவடிக்கை புகார் சமர்ப்பிக்கவும்."
        ],
        "steps_en": [
            "Request complete certified indoor case records and diagnostic charts from hospital.",
            "Obtain independent medical expert opinion regarding departure from standard of care.",
            "File complaint before District/State Consumer Commission seeking compensation."
        ]
    },
    "BANKING_DISPUTE": {
        "act": "Banking Regulation Act, 1949 & RBI Integrated Ombudsman Scheme, 2021",
        "section": "Clause 8 (Grounds of Complaint before Ombudsman)",
        "explanation_ta": "அனுமதியற்ற வங்கி பிடித்தங்கள், ஏடிஎம் பணம் வராமல் பிடித்தம் செய்யப்படுதல் மற்றும் கடன் வசூல் துன்புறுத்தல்களுக்கு ரிசர்வ் வங்கி ஆம்புட்ஸ்மேனிடம் புகார் செய்யலாம்.",
        "explanation_en": "Unauthorized transactions, ATM debit failures, and unfair recovery practices are redressed through the RBI Integrated Ombudsman Scheme.",
        "penalty_en": "Full reversal of unauthorized debits with compensation for harassment up to Rs. 1 Lakh.",
        "penalty_ta": "பிடித்தம் செய்யப்பட்ட தொகையை முழுமையாக திருப்பி அளித்தல் மற்றும் இழப்பீடு.",
        "authority": "Banking Ombudsman (Reserve Bank of India) / cms.rbi.org.in",
        "docs": ["Bank Statement / Passbook Copy", "Written Representation submitted to Branch Manager", "Transaction Proof / Dispute Form Copy"],
        "steps_ta": [
            "வங்கி கிளை மேலாளரிடம் எழுத்துப்பூர்வமாக புகார் அளித்து ஒப்புகைச் சீட்டு பெறவும்.",
            "30 நாட்களுக்குள் தீர்வு கிடைக்காவிடில் cms.rbi.org.in தளத்தில் ஆம்புட்ஸ்மேனிடம் புகார் பதிவு செய்யவும்."
        ],
        "steps_en": [
            "Submit written complaint to branch manager and obtain acknowledgement reference.",
            "If unresolved within 30 days, lodge grievance on RBI CMS portal (cms.rbi.org.in)."
        ]
    },
    "INSURANCE_CLAIM": {
        "act": "Insurance Act, 1938 & Insurance Ombudsman Rules, 2017",
        "section": "Rule 13 (Manner in which complaint shall be made)",
        "explanation_ta": "நியாயமற்ற காரணங்களுக்காக மருத்துவ அல்லது வாகன காப்பீட்டு கோரிக்கைகள் நிராகரிக்கப்பட்டால் இன்சூரன்ஸ் ஆம்புட்ஸ்மேனிடம் மேல்முறையீடு செய்யலாம்.",
        "explanation_en": "Repudiation of health, life, or motor insurance claims without valid statutory cause is appealable before the Insurance Ombudsman.",
        "penalty_en": "Direction to settle full claim amount with penal interest.",
        "penalty_ta": "முழு காப்பீட்டுத் தொகையை வட்டியுடன் விடுவிக்க உத்தரவு.",
        "authority": "Insurance Ombudsman / District Consumer Disputes Redressal Commission",
        "docs": ["Insurance Policy Document", "Claim Rejection Letter / Repudiation Notice", "Hospital / Loss Proofs", "Premium Payment Receipts"],
        "steps_ta": [
            "காப்பீட்டு நிறுவனத்தின் குறைதீர் அலுவலரிடம் (GRO) மறுஆய்வு மனு சமர்ப்பிக்கவும்.",
            "மறுக்கப்பட்டால் இன்சூரன்ஸ் கவுன்சில் ஆம்புட்ஸ்மேன் (cioins.co.in) முன் மனு தாக்கல் செய்யவும்."
        ],
        "steps_en": [
            "Escalate matter to Grievance Redressal Officer (GRO) of insurance company.",
            "If repudiation sustained, file appeal before Insurance Ombudsman (cioins.co.in)."
        ]
    },
    "RTI_APPLICATION": {
        "act": "Right to Information Act, 2005",
        "section": "Section 6 (Request for Information) & Section 19 (First Appeal)",
        "explanation_ta": "அரசு அலுவலகங்கள் மற்றும் பொது அதிகார அமைப்புகளிடமிருந்து பொது ஆவணங்கள் மற்றும் தகவல்களைப் பெற RTI சட்டம் பிரிவு 6-ன் கீழ் விண்ணப்பிக்கலாம். 30 நாட்களில் தகவல் கிடைக்காவிடில் முதல் மேல்முறையீடு செய்யலாம்.",
        "explanation_en": "Citizens have a statutory right to inspect public works and obtain certified government records within 30 days under RTI Act, 2005.",
        "penalty_en": "Statutory penalty of Rs. 250 per day (up to Rs. 25,000) on defaulting Public Information Officer.",
        "penalty_ta": "தகவல் தராத அதிகாரிக்கு நாள் ஒன்றுக்கு ரூ.250 வரை அபராதம்.",
        "authority": "Public Information Officer (PIO) / First Appellate Authority / State Information Commission",
        "docs": ["Copy of RTI Application (Form A)", "Proof of Dispatch / Speed Post Receipt", "RTI Fee Challan / IPO Receipt"],
        "steps_ta": [
            "பிரிவு 6(1)-ன் கீழ் பொது தகவல் அலுவலருக்கு (PIO) ₹10 கட்டணத்துடன் விண்ணப்பம் அனுப்பவும்.",
            "30 நாட்களுக்குள் பதில் வராவிடில் பிரிவு 19(1)-ன் கீழ் முதல் மேல்முறையீட்டு அதிகாரியிடம் மேல்முறையீடு செய்யவும்."
        ],
        "steps_en": [
            "Submit RTI Form A with Rs. 10 fee to concerned Public Information Officer (PIO).",
            "If reply not received within 30 days, file First Appeal under Sec 19(1) to Senior Officer."
        ]
    },
    "EDUCATION_DISPUTE": {
        "act": "Right of Children to Free and Compulsory Education Act, 2009 & TN Schools (Fixation of Fee) Act, 2009",
        "section": "Section 13 (No Capitation Fee) & Section 7 (Fee Regulation)",
        "explanation_ta": "அங்கீகரிக்கப்படாத கூடுதல் கல்விக் கட்டணம், மாற்றுச் சான்றிதழ் (TC) நிறுத்தி வைத்தல் மற்றும் மாணவர் சேர்க்கை முறைகேடுகளுக்கு முதன்மைக் கல்வி அலுவலரிடம் முறையிடலாம்.",
        "explanation_en": "Demands for capitation fees, withholding Transfer Certificates (TC), and arbitrary fee hikes violate statutory education regulations.",
        "penalty_en": "Refund of excess fees collected and penalty on institution management.",
        "penalty_ta": "கூடுதல் கட்டணத்தை திருப்பி அளித்தல் மற்றும் பள்ளி நிர்வாகம் மீது நடவடிக்கை.",
        "authority": "Chief Educational Officer (CEO) / Fee Fixation Committee / High Court",
        "docs": ["Fee Demand Receipts / Notices", "School Allotment Letter", "Bonafide Certificate", "Complaint to Management Copy"],
        "steps_ta": [
            "பள்ளி நிர்வாகம் கோரிய கட்டண ரசீதுகளை பாதுகாக்கவும்.",
            "மாவட்ட முதன்மைக் கல்வி அலுவலர் (CEO) மற்றும் கட்டண நிர்ணயக் குழுவிடம் எழுத்துப்பூர்வ புகார் அளிக்கவும்."
        ],
        "steps_en": [
            "Collect itemized fee demand receipts and communications with school management.",
            "Submit formal grievance to Chief Educational Officer (CEO) and Private School Fee Determination Committee."
        ]
    },
    "SENIOR_CITIZEN_ABUSE": {
        "act": "Maintenance and Welfare of Parents and Senior Citizens Act, 2007",
        "section": "Section 4 (Maintenance Claim) & Section 23 (Voiding of Property Transfer)",
        "explanation_ta": "முதியோர்களை கைவிடுதல் அல்லது ஏமாற்றி சொத்து எழுதி வாங்கிய வழக்குகளில் கோட்டாட்சியர் (RDO/SDM) தீர்ப்பாயத்தில் மனு செய்து சொத்தை ரத்து செய்து மீட்டெடுக்கலாம்.",
        "explanation_en": "Senior citizens are entitled to monthly maintenance from children/legal heirs, and conditional property transfers can be declared void under Section 23.",
        "penalty_en": "Cancellation of property transfer deed, monthly maintenance order, and imprisonment for abandonment.",
        "penalty_ta": "சொத்து பத்திரத்தை ரத்து செய்து முதியவரிடம் ஒப்படைத்தல் மற்றும் மாதாந்திர ஜீவனாம்சம்.",
        "authority": "Sub-Divisional Magistrate (SDM) / Senior Citizens Maintenance Tribunal / DLSA",
        "docs": ["Age Proof (Aadhaar / Voter ID / Pension Card)", "Property Gift Deed Copy", "Medical & Financial Dependency Proofs"],
        "steps_ta": [
            "வயது சான்று மற்றும் சொத்து பத்திர நகல்களை தயார் செய்யவும்.",
            "வருவாய் கோட்டாட்சியர் (RDO) தலைமையிலான முதியோர் பராமரிப்பு தீர்ப்பாயத்தில் மனு தாக்கல் செய்யவும்."
        ],
        "steps_en": [
            "Prepare identity/age proof and copy of registered property transfer deed.",
            "File summary application before the Sub-Divisional Magistrate (Maintenance Tribunal)."
        ]
    },
    "ELECTRICITY_UTILITY_DISPUTE": {
        "act": "The Electricity Act, 2003",
        "section": "Section 42(5) (Consumer Grievance Redressal Forum) & Section 42(6) (Electricity Ombudsman)",
        "explanation_ta": "தவறான மின் கட்டணக் கணக்கீடு, மின் அளவி (Meter) பழுது மற்றும் புதிய மின் இணைப்பு தாமதங்களுக்கு மின் நுகர்வோர் குறைதீர் மன்றம் (CGRF) மூலம் தீர்வு காணலாம்.",
        "explanation_en": "Faulty billing meters, erroneous tariff assessments, and refusal of electricity connections are adjudicated by the Consumer Grievance Redressal Forum (CGRF).",
        "penalty_en": "Adjustment/correction of inflated electricity bills and statutory compensation for supply delay.",
        "penalty_ta": "கூடுதல் கட்டணத்தை கழித்துக் கொள்ளுதல் மற்றும் இழப்பீடு.",
        "authority": "Consumer Grievance Redressal Forum (CGRF) / Electricity Ombudsman (TNERC)",
        "docs": ["Electricity Consumer Card / Service No. Proof", "Disputed Bill Receipts", "Meter Testing Application Copy"],
        "steps_ta": [
            "உதவி செயற்பொறியாளரிடம் (AEE) எழுத்துப்பூர்வ மறுசீராய்வு மனு அளிக்கவும்.",
            "தீர்வு கிடைக்காவிடில் மின் பகிர்மான வட்டத்தின் CGRF மன்றத்தில் மனு தாக்கல் செய்யவும்."
        ],
        "steps_en": [
            "Submit written representation to Assistant Executive Engineer (AEE) / Distribution Circle.",
            "If unresolved within 30 days, petition the Consumer Grievance Redressal Forum (CGRF)."
        ]
    },
    "ENVIRONMENTAL_POLLUTION": {
        "act": "Environment (Protection) Act, 1986 & Water (Prevention and Control of Pollution) Act, 1974",
        "section": "Section 15 (Penalties) & National Green Tribunal Act Section 14",
        "explanation_ta": "ஆலை கழிவு நீர் வெளியேற்றம், நச்சுப் புகை மற்றும் நீர்நிலைகள் மாசடைவதற்கு எதிராக மாசு கட்டுப்பாட்டு வாரியம் (TNPCB) அல்லது தேசிய பசுமை தீர்ப்பாயத்தில் முறையிடலாம்.",
        "explanation_en": "Illegal discharge of untreated industrial effluents, air pollution, and environmental degradation are actionable before State Pollution Control Board and National Green Tribunal.",
        "penalty_en": "Closure orders for polluting industries, environmental compensation, and criminal prosecution.",
        "penalty_ta": "ஆலையை மூடும் ஆணை மற்றும் சுற்றுச்சூழல் இழப்பீட்டுத் தொகை.",
        "authority": "Tamil Nadu Pollution Control Board (TNPCB) / National Green Tribunal (NGT) / District Collector",
        "docs": ["Photographs / Videos of Effluent Discharge", "Water / Soil Quality Reports (if available)", "Joint Petition from Affected Residents"],
        "steps_ta": [
            "கழிவு வெளியேற்றத்தை புகைப்படம்/வீடியோ ஆதாரங்களுடன் ஆவணப்படுத்தவும்.",
            "மாவட்ட சுற்றுச்சூழல் பொறியாளர் (TNPCB) மற்றும் மாவட்ட ஆட்சியரிடம் புகார் சமர்ப்பிக்கவும்."
        ],
        "steps_en": [
            "Collect photographic/video evidence and water test reports demonstrating contamination.",
            "Lodge formal petition with District Environmental Engineer (TNPCB) and National Green Tribunal."
        ]
    },
    "GOVERNMENT_PENSION_DELAY": {
        "act": "Tamil Nadu Pension Rules, 1978 & CCS (Pension) Rules",
        "section": "Statutory Interest on Delayed Payment of Gratuity and Pension",
        "explanation_ta": "ஓய்வூதியம் மற்றும் பணிக்கொடை (Gratuity) வழங்க தேவையற்ற தாமதம் செய்தால் அரசு கருவூல துறை மற்றும் நிர்வாக தீர்ப்பாயத்தில் முறையிட்டு வட்டியுடன் பெறலாம்.",
        "explanation_en": "Unjustified withholding or delay in sanctioning pension, DCRG, and commuted value of pension attracts statutory interest under Pension Rules.",
        "penalty_en": "Release of full pension arrears with statutory interest from due date.",
        "penalty_ta": "நிலுவை ஓய்வூதியத்தை வட்டியுடன் உடனடியாக விடுவிக்க உத்தரவு.",
        "authority": "Directorate of Treasuries and Accounts / Accountant General / Central Administrative Tribunal",
        "docs": ["Pension Payment Order (PPO) Application Slip", "Service Book Certificate", "Last Pay Certificate (LPC)", "No-Dues Certificate"],
        "steps_ta": [
            "ஓய்வுபெற்ற துறையின் தலைவருக்கு நிலுவை தொகையை கோரி நினைவூட்டல் கடிதம் அனுப்பவும்.",
            "நிர்வாக தீர்ப்பாயம் (CAT) அல்லது உயர்நீதிமன்றத்தில் ரிட் மனு (Writ Petition) தாக்கல் செய்யவும்."
        ],
        "steps_en": [
            "Submit detailed representation to Head of Department and Accountant General.",
            "File application before State/Central Administrative Tribunal for release with interest."
        ]
    },
    "GOVERNMENT_SCHEME": {
        "act": "National Food Security Act, 2013 & State Public Distribution System Guidelines",
        "section": "Section 15 (District Grievance Redressal Officer)",
        "explanation_ta": "ரேஷன் அட்டை (Smart Card), மகளிர் உரிமைத் தொகை மற்றும் அரசு நலத்திட்ட உதவிகள் மறுக்கப்பட்டால் தாலுகா வழங்கல் அலுவலர் அல்லது மாவட்ட ஆட்சியரிடம் முறையிடலாம்.",
        "explanation_en": "Arbitrary denial of ration cards, food security entitlements, or welfare scheme benefits is redressed by the District Grievance Redressal Officer.",
        "penalty_en": "Sanction of smart card/welfare benefits and action against erring officials.",
        "penalty_ta": "அரசு நலத்திட்ட உதவியை உடனடியாக அனுமதித்தல்.",
        "authority": "District Collectorate Grievance Cell / Taluk Supply Officer (TSO) / e-Sevai Center",
        "docs": ["Smart Ration Card Application Slip", "Income & Community Certificate", "Aadhaar Card"],
        "steps_ta": [
            "இ-சேவை மையம் மூலம் பெறப்பட்ட விண்ணப்ப ரசீதுடன் தாலுகா வழங்கல் அலுவலகத்தை அணுகவும்.",
            "மாவட்ட ஆட்சியர் குறைதீர் முகாமில் (Monday Grievance Day) மனு சமர்ப்பிக்கவும்."
        ],
        "steps_en": [
            "Submit grievance with application reference to Taluk Supply Officer (TSO).",
            "Attend District Collectorate Public Grievance Day for direct administrative redressal."
        ]
    },
    "GENERAL_LEGAL_AID": {
        "act": "Legal Services Authorities Act, 1987",
        "section": "Section 12 (Criteria for Free Legal Aid) & Section 19 (Lok Adalat)",
        "explanation_ta": "இலவச சட்ட ஆலோசனை, வழக்குரைஞர் உதவி மற்றும் நீதிமன்ற சமரசத்திற்கு மாவட்ட சட்டப்பணிகள் ஆணைக்குழுவை (DLSA) அணுகலாம்.",
        "explanation_en": "Free legal aid, counsel representation, and pre-litigation settlement through District Legal Services Authority (DLSA).",
        "penalty_en": "Statutory judicial remedy and relief as prescribed by competent court.",
        "penalty_ta": "சட்டப்படியான நிவாரணம் மற்றும் சமரச தீர்வு.",
        "authority": "District Legal Services Authority (DLSA) / Taluk Legal Services Committee",
        "docs": ["Aadhaar Card", "Income Certificate for Free Legal Aid", "Dispute Summary / Relevant Notices"],
        "steps_ta": [
            "மாவட்ட நீதிமன்ற வளாகத்தில் உள்ள DLSA மையத்தை அணுகவும்.",
            "இலவச சட்ட உதவி அல்லது லோக் அதாலத் சமரசத்திற்கு விண்ணப்பிக்கவும்."
        ],
        "steps_en": [
            "Visit the District Legal Services Authority (DLSA) located at District Court Complex.",
            "Submit application for free panel advocate or pre-litigation mediation."
        ]
    }
}

class LLMRouter:
    def __init__(self):
        self.primary_name = os.environ.get("LLM_PROVIDER_PRIMARY", "qwen").lower()
        self.fallback_name = os.environ.get("LLM_PROVIDER_FALLBACK", "gemini").lower()

    def get_provider(self, name: str):
        if name == "qwen":
            return qwen_provider
        elif name == "gemini":
            return gemini_provider
        return None

    def route_and_generate(
        self,
        query: str,
        retrieval_result: RAGRetrievalResult,
        language: str,
        category_name: str,
        recommended_authority: str,
        required_documents: List[str],
        case_summary: Optional[str] = None
    ) -> Dict[str, Any]:
        start_time = time.time()
        retrieved_context = retrieval_result.grounded_context
        chunks = retrieval_result.top_k_chunks

        # Fail-closed check: If retrieval yielded NO relevant source, do not query LLM or hallucinate
        if retrieval_result.status == "NO_RELEVANT_SOURCE" or not retrieval_result.has_sufficient_context or not chunks:
            fail_closed_res = self._build_fail_closed_response(
                query=query,
                language=language,
                category_name=category_name,
                case_summary=case_summary
            )
            fail_closed_res["latency_seconds"] = round(time.time() - start_time, 3)
            return fail_closed_res

        provider_used = "none"
        fallback_used = False
        validation_res = None
        final_output = None

        # 1. Try Primary Provider (Qwen)
        primary_provider = self.get_provider(self.primary_name)
        if primary_provider and primary_provider.is_available():
            try:
                raw_res = primary_provider.generate_guidance(
                    query=query,
                    retrieved_context=retrieved_context,
                    language=language,
                    category_name=category_name,
                    recommended_authority=recommended_authority,
                    required_documents=required_documents,
                    case_summary=case_summary,
                    is_retry=False
                )
                val = grounding_validator.validate(raw_res, chunks, retrieved_context)
                if val.is_valid:
                    final_output = val.cleaned_response
                    provider_used = self.primary_name
                    validation_res = val
            except Exception as e:
                print(f"[LLM ROUTER] Primary provider failed: {e}")

        # 2. Try Fallback Provider (Gemini)
        if final_output is None:
            fallback_provider = self.get_provider(self.fallback_name)
            if fallback_provider and fallback_provider.is_available():
                try:
                    fallback_used = True
                    raw_res = fallback_provider.generate_guidance(
                        query=query,
                        retrieved_context=retrieved_context,
                        language=language,
                        category_name=category_name,
                        recommended_authority=recommended_authority,
                        required_documents=required_documents,
                        case_summary=case_summary,
                        is_retry=False
                    )
                    val = grounding_validator.validate(raw_res, chunks, retrieved_context)
                    if val.is_valid or val.grounded_score >= 0.7:
                        final_output = val.cleaned_response
                        provider_used = self.fallback_name
                        validation_res = val
                except Exception as e:
                    print(f"[LLM ROUTER] Fallback provider failed: {e}")

        # 3. Grounded Deterministic Chunk-Based Fallback
        if final_output is None:
            provider_used = "grounded_chunk_fallback"
            fallback_used = True
            final_output = self._build_deterministic_fallback(
                query=query,
                retrieval_result=retrieval_result,
                language=language,
                category_name=category_name,
                recommended_authority=recommended_authority,
                required_documents=required_documents,
                case_summary=case_summary
            )
            validation_res = ValidationResult(True, [], final_output, 1.0)

        latency = round(time.time() - start_time, 3)
        final_output["provider"] = provider_used
        final_output["fallback_used"] = fallback_used
        final_output["latency_seconds"] = latency
        final_output["grounded"] = validation_res.is_valid if validation_res else True
        final_output["grounding_score"] = validation_res.grounded_score if validation_res else 1.0

        if "citations" not in final_output or not final_output["citations"]:
            final_output["citations"] = [
                {
                    "documentTitle": c.act_name,
                    "section": c.section,
                    "sourceChunkId": c.chunk_id,
                    "relevanceScore": retrieval_result.scores[i] if i < len(retrieval_result.scores) else 0.85
                }
                for i, c in enumerate(chunks)
            ]

        return final_output

    def _build_fail_closed_response(
        self,
        query: str,
        language: str,
        category_name: str,
        case_summary: Optional[str] = None
    ) -> Dict[str, Any]:
        summary = case_summary.strip() if (case_summary and len(case_summary.strip()) > 5) else query.strip()
        
        suggested_evidence = [
            "Relevant transaction records, receipts, or application slips",
            "Chronological communications, messages, or notices received",
            "Identity proof and any available ownership or employment records"
        ]

        if language == "ta":
            understanding_text = f"குடிமகன் விவரித்த பிரச்சனை: {summary}"
            reply_text = f"""### பிரச்சனை புரிதல்:
{understanding_text}

### சட்டப் பிரிவுகள் சரிபார்ப்பு:
• ARAM-ன் உள்ளூர் சட்டத் தரவுத்தளத்தில் (Legal Corpus) இந்த குறிப்பிட்ட பிரச்சனைக்கு நேரடியான சரிபார்க்கப்பட்ட சட்டப்பிரிவு (Verified Statutory Section) கிடைக்கவில்லை.

### நீங்கள் திரட்ட வேண்டிய நடைமுறை சான்றுகள்:
• உங்கள் வசம் உள்ள தொடர்புடைய ஆவணங்கள், ரசீதுகள் மற்றும் பரிவர்த்தனை ஆதாரங்கள்
• சம்பவம் / தொடர்பு தொடர்பான பதிவுகள், குறுஞ்செய்திகள் அல்லது கடிதங்கள்
• உங்கள் அடையாளச் சான்று நகல்

### பரிந்துரைக்கப்பட்ட அடுத்த கட்ட நடவடிக்கைகள்:
1. உங்கள் வசம் உள்ள அனைத்து ஆதார ஆவணங்களையும் வரிசைப்படுத்தி தயாராக வைக்கவும்.
2. தகுதிவாய்ந்த சட்ட உதவி மையம் அல்லது சட்ட வல்லுநரை அணுகி ஆலோசிக்கவும்.
3. இந்த வழக்கை பரிசீலிக்க ARAM உதவி வழிகாட்டியை (Legal Aid Guide) தொடர்பு கொள்ளவும்."""
            steps = [
                "உங்கள் வசம் உள்ள அனைத்து ஆதார ஆவணங்களையும் வரிசைப்படுத்தி தயாராக வைக்கவும்.",
                "தகுதிவாய்ந்த சட்ட உதவி மையம் அல்லது சட்ட வல்லுநரை அணுகி ஆலோசிக்கவும்.",
                "இந்த வழக்கை பரிசீலிக்க ARAM உதவி வழிகாட்டியை (Legal Aid Guide) தொடர்பு கொள்ளவும்."
            ]
        elif language == "hi":
            understanding_text = f"नागरिक द्वारा प्रस्तुत समस्या: {summary}"
            reply_text = f"""### समस्या की समझ:
{understanding_text}

### वैधानिक प्रावधान सत्यापन:
• ARAM के उपलब्ध कानूनी डेटाबेस (Legal Corpus) में इस विशिष्ट समस्या से संबंधित कोई प्रत्यक्ष सत्यापित वैधानिक धारा उपलब्ध नहीं है।

### एकत्रित करने योग्य व्यावहारिक साक्ष्य:
• संबंधित दस्तावेज, रसीदें एवं लेनदेन विवरण
• घटना या बातचीत से संबंधित संदेश या पत्राचार
• पहचान प्रमाण पत्र

### अनुशंसित अगले कदम:
1. स्थिति से संबंधित सभी उपलब्ध साक्ष्यों को सुरक्षित एवं व्यवस्थित करें।
2. आधिकारिक कानूनी मार्गदर्शन हेतु विधिक सहायता केंद्र या योग्य अधिवक्ता से संपर्क करें।
3. सहायता हेतु ARAM अधिकृत विधिक गाइड से जुड़ें।"""
            steps = [
                "स्थिति से संबंधित सभी उपलब्ध साक्ष्यों को सुरक्षित एवं व्यवस्थित करें।",
                "आधिकारिक कानूनी मार्गदर्शन हेतु विधिक सहायता केंद्र या योग्य अधिवक्ता से संपर्क करें।",
                "सहायता हेतु ARAM अधिकृत विधिक गाइड से जुड़ें।"
            ]
        else:
            understanding_text = f"The citizen reported the following situation: {summary}"
            reply_text = f"""### Understanding of Situation:
{understanding_text}

### Statutory Provision Verification:
• I could not verify the exact applicable statutory provisions from ARAM's available legal knowledge base for this specific situation.

### Suggested Practical Evidence to Gather:
• Keep all relevant documents, receipts, and communication records organized
• Proof of transaction or incident logs if available
• Identity proof and supporting statements

### Recommended Next Steps:
1. Collate and safeguard all chronological records and evidence.
2. Consult a qualified legal aid clinic or legal professional.
3. Request assistance from an ARAM Legal Aid Guide for authorized case review."""
            steps = [
                "Collate and safeguard all chronological records and evidence.",
                "Consult a qualified legal aid clinic or legal professional.",
                "Request assistance from an ARAM Legal Aid Guide for authorized case review."
            ]

        return {
            "language": language,
            "understanding": understanding_text,
            "problemUnderstanding": understanding_text,
            "category": category_name,
            "severity": "HIGH" if category_name in ["DOMESTIC_VIOLENCE", "WOMEN_SAFETY", "CRIMINAL_COMPLAINT"] else "MEDIUM",
            "legal_position": {
                "summary": understanding_text,
                "applicable_laws": []
            },
            "applicableLaw": None,
            "section": None,
            "explanation": understanding_text,
            "sections": [],
            "laws": [],
            "possible_consequences": [],
            "groundedPenalty": "No specific statutory penalty could be verified from available sources.",
            "what_you_can_do_now": steps,
            "documents_required": [],
            "documents": [],
            "suggestedEvidence": suggested_evidence,
            "where_to_complain": [],
            "recommendedAuthority": None,
            "authorityVerified": False,
            "procedure": steps,
            "nextSteps": steps,
            "expected_next_steps": steps,
            "emergency": category_name in ["DOMESTIC_VIOLENCE", "WOMEN_SAFETY"],
            "human_review_required": True,
            "confidence": 0.50,
            "citations": [],
            "reply": reply_text,
            "answer": reply_text,
            "disclaimer": "This information is for general legal-aid guidance and is not a substitute for advice from a qualified legal professional.",
            "provider": "fail_closed_guard",
            "grounded": True
        }

    def _build_deterministic_fallback(
        self,
        query: str,
        retrieval_result: RAGRetrievalResult,
        language: str,
        category_name: str,
        recommended_authority: str,
        required_documents: List[str],
        case_summary: Optional[str] = None
    ) -> Dict[str, Any]:
        chunks = retrieval_result.top_k_chunks
        if not chunks:
            return self._build_fail_closed_response(query, language, category_name, case_summary)

        first_chunk = chunks[0]
        act_name = first_chunk.act_name
        sec_name = f"Section {first_chunk.section}" if first_chunk.section else "Statutory Provision"
        explanation = first_chunk.text[:280].strip() + ("..." if len(first_chunk.text) > 280 else "")

        sections = []
        for c in chunks[:2]:
            s_name = f"Section {c.section}" if c.section else "Statutory Provision"
            sections.append({
                "act": c.act_name,
                "section": c.section,
                "title": s_name,
                "relevance": f"Verified statutory provision under {c.act_name}",
                "source": c.source
            })

        summary = case_summary.strip() if (case_summary and len(case_summary.strip()) > 5) else query.strip()
        authority = recommended_authority
        docs = required_documents
        steps = [
            "Organize all relevant evidentiary documents and proofs.",
            f"Submit formal representation to {authority}.",
            "Track application status using official acknowledgement number."
        ]
        penalty = f"Statutory remedies and legal provisions as enacted under {act_name}."

        if language == "ta":
            docs_formatted = "\n".join([f"• {d}" for d in docs])
            steps_formatted = "\n".join([f"{i+1}. {s}" for i, s in enumerate(steps)])
            formatted_reply = f"""### பிரச்சனை புரிதல்:
குடிமகன் விவரித்த பிரச்சனை: {summary}

### தொடர்புடைய சட்டங்கள் & பிரிவுகள்:
• **{act_name}** ({sec_name}): {explanation}

### தீர்வு / அபராதம் விபரம்:
{penalty}

### பரிந்துரைக்கப்பட்ட அதிகாரம்:
• **{authority}**

### தேவையான ஆவணங்கள்:
{docs_formatted}

### அடுத்த கட்ட நடவடிக்கைகள்:
{steps_formatted}"""
        elif language == "hi":
            docs_formatted = "\n".join([f"• {d}" for d in docs])
            steps_formatted = "\n".join([f"{i+1}. {s}" for i, s in enumerate(steps)])
            formatted_reply = f"""### समस्या की समझ:
नागरिक द्वारा प्रस्तुत समस्या: {summary}

### प्रासंगिक अधिनियम और धाराएं:
• **{act_name}** ({sec_name}): {explanation}

### समाधान / जुर्माना विवरण:
{penalty}

### अनुशंसित प्राधिकारी:
• **{authority}**

### आवश्यक दस्तावेज:
{docs_formatted}

### अगले कदम:
{steps_formatted}"""
        else:
            docs_formatted = "\n".join([f"• {d}" for d in docs])
            steps_formatted = "\n".join([f"{i+1}. {s}" for i, s in enumerate(steps)])
            formatted_reply = f"""### Understanding of Situation:
The citizen reported the following situation: {summary}

### Relevant Statutory Provisions & Acts:
• **{act_name}** ({sec_name}): {explanation}

### Statutory Penalty / Legal Consequence:
{penalty}

### Recommended Authority Routing:
• **{authority}**

### Required Evidence Documents:
{docs_formatted}

### Recommended Procedural Steps:
{steps_formatted}"""

        return {
            "language": language,
            "understanding": summary,
            "problemUnderstanding": summary,
            "category": category_name,
            "severity": "HIGH" if category_name in ["DOMESTIC_VIOLENCE", "WOMEN_SAFETY", "CRIMINAL_COMPLAINT"] else "MEDIUM",
            "legal_position": {
                "summary": summary,
                "applicable_laws": [act_name]
            },
            "applicableLaw": act_name,
            "section": first_chunk.section,
            "explanation": explanation,
            "sections": sections,
            "possible_consequences": [{"description": penalty, "legal_basis": act_name, "source": first_chunk.source}],
            "groundedPenalty": penalty,
            "what_you_can_do_now": steps,
            "documents_required": docs,
            "documents": docs,
            "where_to_complain": [authority],
            "recommendedAuthority": authority,
            "procedure": steps,
            "nextSteps": steps,
            "expected_next_steps": steps,
            "emergency": category_name in ["DOMESTIC_VIOLENCE", "WOMEN_SAFETY"],
            "human_review_required": False,
            "confidence": 0.88,
            "citations": [],
            "reply": formatted_reply,
            "answer": formatted_reply,
            "disclaimer": "This information is for general legal-aid guidance based on verified statutory sources and is not a substitute for advice from a qualified legal professional.",
            "provider": "grounded_chunk_fallback",
            "grounded": True
        }


llm_router = LLMRouter()
