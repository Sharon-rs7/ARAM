import re
from typing import Dict, Any, List

def generate_problem_title(text: str, category: str, district: str, language_code: str = "en") -> str:
    """
    Generates a clean, formal legal problem title based on citizen complaint text, category and district.
    """
    lower = (text or "").lower()
    dist = (district or "").strip().title()
    
    is_ta = (language_code or "en").lower().startswith("ta")
    is_hi = (language_code or "en").lower().startswith("hi")

    # 1. Tenancy / Security Deposit
    if any(k in lower for k in ["deposit", "advance", "security deposit", "vaadagai", "rent advance", "வாடகை முன்பணம்", "டெபாசிட்", "முன்பணம்"]):
        if any(k in lower for k in ["refund", "thara maattanga", "return", "refusing", "திருப்பி", "தரவில்லை", "கொடுக்கவில்லை"]):
            if is_ta:
                return f"வாடகை முன்பணம் திரும்பப் பெறுதல் புகார் ({dist})" if dist else "வாடகை முன்பணம் திரும்பப் பெறுதல் புகார்"
            elif is_hi:
                return f"सुरक्षा जमा राशि वापसी शिकायत ({dist})" if dist else "सुरक्षा जमा राशि वापसी शिकायत"
            return f"Security Deposit Refund Grievance ({dist})" if dist else "Security Deposit Refund Grievance"
        if is_ta:
            return f"வாடகை மற்றும் முன்பணத் தகராறு ({dist})" if dist else "வாடகை மற்றும் முன்பணத் தகராறு"
        elif is_hi:
            return f"किराया एवं सुरक्षा जमा विवाद ({dist})" if dist else "किराया एवं सुरक्षा जमा विवाद"
        return f"Tenancy & Security Deposit Dispute ({dist})" if dist else "Tenancy & Security Deposit Dispute"
    
    # 2. Unpaid Salary / Wages / Labour
    if any(k in lower for k in ["salary", "sambalam", "wages", "unpaid salary", "pay", "bonus", "சம்பளம்", "கூலி", "வேலை"]):
        if any(k in lower for k in ["pending", "unpaid", "thara", "not paid", "பாக்கி", "தரவில்லை"]):
            if is_ta:
                return f"ஊதிய பாக்கி மற்றும் தொழிலாளர் உரிமை கோரிக்கை ({dist})" if dist else "ஊதிய பாக்கி கோரிக்கை"
            elif is_hi:
                return f"बकाया वेतन एवं श्रम अधिकार दावा ({dist})" if dist else "बकाया वेतन दावा"
            return f"Unpaid Salary & Wage Claim ({dist})" if dist else "Unpaid Salary & Wage Claim"
        if is_ta:
            return f"தொழிலாளர் மற்றும் வேலைவாய்ப்பு உரிமை தகராறு ({dist})" if dist else "தொழிலாளர் உரிமை தகராறு"
        elif is_hi:
            return f"श्रम एवं रोजगार अधिकार विवाद ({dist})" if dist else "श्रम अधिकार विवाद"
        return f"Labour & Employment Rights Dispute ({dist})" if dist else "Labour & Employment Rights Dispute"
    
    # 3. Financial Scam / Cyber Crime / Banking Fraud
    if any(k in lower for k in ["cyber", "otp", "phishing", "scam", "fraud", "hacked", "gpay", "phonepe", "bank account", "மோசடி", "பணம் பறிப்பு", "ஏமாற்று"]):
        if is_ta:
            return f"நிதி மோசடி மற்றும் சைபர் குற்றப் புகார் ({dist})" if dist else "நிதி மோசடி புகார்"
        elif is_hi:
            return f"वित्तीय साइबर धोखाधड़ी शिकायत ({dist})" if dist else "साइबर धोखाधड़ी शिकायत"
        return f"Financial Cyber Scam & Fraud Dispute ({dist})" if dist else "Financial Cyber Scam Dispute"
        
    # 4. Land / Property / Boundary / Document
    if any(k in lower for k in ["patta", "land", "property", "document", "boundary", "encroachment", "sale deed", "chitta", "பத்திரம்", "பட்டா", "நிலம்", "சொத்து"]):
        if any(k in lower for k in ["document", "pattiram", "registration", "fraud", "misuse", "பத்திரம்", "பதிவு", "போலி"]):
            if is_ta:
                return f"சொத்து ஆவண மற்றும் உரிமைப் பதிவு தகராறு ({dist})" if dist else "சொத்து ஆவண தகராறு"
            elif is_hi:
                return f"संपत्ति दस्तावेज एवं पंजीकरण विवाद ({dist})" if dist else "संपत्ति दस्तावेज विवाद"
            return f"Property Document & Title Registration Dispute ({dist})" if dist else "Property Document Dispute"
        elif any(k in lower for k in ["boundary", "varamppu", "encroachment", "border", "ஆக்கிரமிப்பு", "எல்லை"]):
            if is_ta:
                return f"நில எல்லை மற்றும் ஆக்கிரமிப்பு புகார் ({dist})" if dist else "நில எல்லை ஆக்கிரமிப்பு புகார்"
            elif is_hi:
                return f"भूमि सीमा एवं अतिक्रमण शिकायत ({dist})" if dist else "भूमि अतिक्रमण शिकायत"
            return f"Land Boundary & Encroachment Grievance ({dist})" if dist else "Land Boundary Grievance"
        if is_ta:
            return f"சொத்து மற்றும் நில உரிமை தகராறு ({dist})" if dist else "நில உரிமை தகராறு"
        elif is_hi:
            return f"संपत्ति एवं भूमि स्वामित्व विवाद ({dist})" if dist else "भूमि स्वामित्व विवाद"
        return f"Property & Title Ownership Dispute ({dist})" if dist else "Property & Title Dispute"
        
    # 5. Consumer / Defective Goods
    if any(k in lower for k in ["consumer", "defective", "warranty", "bill", "product", "damaged", "repair", "service center", "பழுது", "நுகர்வோர்"]):
        if is_ta:
            return f"பழுதடைந்த பொருள் மற்றும் நுகர்வோர் இழப்பீடு ({dist})" if dist else "நுகர்வோர் புகார்"
        elif is_hi:
            return f"दोषपूर्ण उत्पाद एवं उपभोक्ता निवारण ({dist})" if dist else "उपभोक्ता शिकायत"
        return f"Defective Product & Consumer Redressal ({dist})" if dist else "Consumer Redressal Grievance"
        
    # 6. Domestic / Women Safety
    if any(k in lower for k in ["domestic", "violence", "dowry", "harassment", "abuse", "வன்முறை", "வரதட்சணை", "கொடுமை"]):
        if is_ta:
            return f"குடும்ப வன்முறை மற்றும் பெண்கள் பாதுகாப்பு மனு ({dist})" if dist else "பெண்கள் பாதுகாப்பு மனு"
        elif is_hi:
            return f"घरेलू सुरक्षा एवं महिला कानूनी संरक्षण ({dist})" if dist else "महिला सुरक्षा शिकायत"
        return f"Domestic Safety & Legal Protection ({dist})" if dist else "Domestic Safety Grievance"
        
    # 7. Category based fallback titles
    if is_ta:
        cat_titles = {
            "LABOUR_DISPUTE": f"தொழிலாளர் உரிமை தகராறு ({dist})" if dist else "தொழிலாளர் உரிமை தகராறு",
            "CONSUMER_COMPLAINT": f"நுகர்வோர் குறைதீர்ப்பு மனு ({dist})" if dist else "நுகர்வோர் குறைதீர்ப்பு மனு",
            "CYBER_CRIME": f"சைபர் குற்றப் புகார் ({dist})" if dist else "சைபர் குற்றப் புகார்",
            "PROPERTY_CIVIL_DISPUTE": f"சொத்து மற்றும் உரிமையியல் தகராறு ({dist})" if dist else "சொத்து உரிமையியல் தகராறு",
            "WOMEN_SAFETY_DOMESTIC_VIOLENCE": f"பெண்கள் பாதுகாப்பு சட்ட உதவி ({dist})" if dist else "பெண்கள் பாதுகாப்பு சட்ட உதவி",
            "CRIMINAL_COMPLAINT": f"குற்றவியல் புகார் மற்றும் காவல் நடவடிக்கை ({dist})" if dist else "குற்றவியல் புகார்",
            "GENERAL_LEGAL_AID": f"குடிமக்கள் சட்ட உதவி மனு ({dist})" if dist else "குடிமக்கள் சட்ட உதவி மனு"
        }
        return cat_titles.get(category, f"குடிமக்கள் சட்ட உதவி மனு ({dist})" if dist else "குடிமக்கள் சட்ட உதவி மனு")
    elif is_hi:
        cat_titles = {
            "LABOUR_DISPUTE": f"श्रम अधिकार विवाद ({dist})" if dist else "श्रम अधिकार विवाद",
            "CONSUMER_COMPLAINT": f"उपभोक्ता शिकायत एवं निवारण ({dist})" if dist else "उपभोक्ता शिकायत",
            "CYBER_CRIME": f"साइबर अपराध शिकायत ({dist})" if dist else "साइबर अपराध शिकायत",
            "PROPERTY_CIVIL_DISPUTE": f"संपत्ति एवं दीवानी विवाद ({dist})" if dist else "संपत्ति दीवानी विवाद",
            "WOMEN_SAFETY_DOMESTIC_VIOLENCE": f"महिला सुरक्षा कानूनी सहायता ({dist})" if dist else "महिला सुरक्षा सहायता",
            "CRIMINAL_COMPLAINT": f"आपराधिक शिकायत एवं पुलिस निवारण ({dist})" if dist else "आपराधिक शिकायत",
            "GENERAL_LEGAL_AID": f"नागरिक कानूनी सहायता शिकायत ({dist})" if dist else "नागरिक कानूनी सहायता शिकायत"
        }
        return cat_titles.get(category, f"नागरिक कानूनी सहायता शिकायत ({dist})" if dist else "नागरिक कानूनी सहायता शिकायत")

    cat_titles = {
        "LABOUR_DISPUTE": f"Employment & Labour Rights Dispute ({dist})" if dist else "Labour Rights Dispute",
        "CONSUMER_COMPLAINT": f"Consumer Grievance & Redressal ({dist})" if dist else "Consumer Grievance",
        "CYBER_CRIME": f"Cyber Crime & Online Fraud Grievance ({dist})" if dist else "Cyber Crime Grievance",
        "PROPERTY_CIVIL_DISPUTE": f"Property & Civil Dispute ({dist})" if dist else "Property & Civil Dispute",
        "WOMEN_SAFETY_DOMESTIC_VIOLENCE": f"Women Safety & Legal Protection ({dist})" if dist else "Women Safety Legal Aid",
        "CRIMINAL_COMPLAINT": f"Criminal Grievance & Police Redressal ({dist})" if dist else "Criminal Grievance",
        "GENERAL_LEGAL_AID": f"Citizen Legal Aid & Redressal Request ({dist})" if dist else "Citizen Legal Aid Request"
    }
    return cat_titles.get(category, f"Citizen Legal Aid Grievance ({dist})" if dist else "Citizen Legal Aid Grievance")

def generate_case_summary_details(
    title: str,
    description: str,
    category: str,
    district: str,
    language_code: str,
    required_docs: List[str]
) -> Dict[str, Any]:
    text = f"{title} {description}"
    lang = (language_code or "en").lower()
    if "ta-in" in lang:
        lang = "ta"


    # Extract dates
    date_patterns = [
        r'\b\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}\b',
        r'\b\d+\s*(?:days?|weeks?|months?|years?|days|maasam|varusham|நாட்கள்|மாதங்கள்|வருடங்கள்|மாதம்|வருடம்)\b',
        r'\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s*\d{1,2}?(?:,\s*\d{4})?\b'
    ]
    dates = []
    for pat in date_patterns:
        for m in re.finditer(pat, text, re.IGNORECASE):
            val = m.group(0).strip()
            if val not in dates:
                dates.append(val)

    # Extract amounts
    amount_patterns = [
        r'(?:Rs\.?|₹|inr|ரூபாய்|ரூ)\.?\s*\d+(?:,\d+)*(?:\.\d+)?',
        r'\b\d+,\d{3,}(?:\.\d+)?\b'
    ]
    amounts = []
    for pat in amount_patterns:
        for m in re.finditer(pat, text, re.IGNORECASE):
            val = m.group(0).strip()
            if val not in amounts:
                amounts.append(val)

    # Extract entities
    entities_keywords = [
        ("landlord", ["landlord", "owner", "house owner", "land lord", "வீட்டு உரிமையாளர்", "உரிமையாளர்"]),
        ("tenant", ["tenant", "renter", "வாடகைதாரர்"]),
        ("employer", ["employer", "boss", "manager", "company", "office", "வேலை அளிப்பவர்", "மேலாளர்", "நிறுவனம்"]),
        ("bank", ["bank", "upi", "gpay", "phonepe", "card", "வங்கி", "ஏடிஎம்"]),
        ("police", ["police", "cop", "station", "காவல்துறை", "போலீஸ்"])
    ]
    entities = []
    lower_text = text.lower()
    for label, keywords in entities_keywords:
        if any(kw in lower_text for kw in keywords):
            entities.append(label)

    # Clean duplicates
    dates = dates[:3]
    amounts = amounts[:3]
    entities = entities[:3]

    # Category Display Mapping
    category_display_en = {
        "LABOUR_DISPUTE": "Labour Dispute",
        "CONSUMER_COMPLAINT": "Consumer Complaint",
        "CYBER_CRIME": "Cyber Crime",
        "PROPERTY_CIVIL_DISPUTE": "Property / Civil Dispute",
        "WOMEN_SAFETY_DOMESTIC_VIOLENCE": "Women Safety / Domestic Violence",
        "CRIMINAL_COMPLAINT": "Criminal Complaint",
        "GENERAL_LEGAL_AID": "General Legal Aid"
    }.get(category, "General Legal Aid")

    category_display_ta = {
        "LABOUR_DISPUTE": "தொழிலாளர் வேலைவாய்ப்பு தகராறு",
        "CONSUMER_COMPLAINT": "நுகர்வோர் குறைபாடு புகார்",
        "CYBER_CRIME": "சைபர் குற்ற மோசடி",
        "PROPERTY_CIVIL_DISPUTE": "சொத்து / சிவில் தகராறு",
        "WOMEN_SAFETY_DOMESTIC_VIOLENCE": "பெண்கள் பாதுகாப்பு / குடும்ப வன்முறை",
        "CRIMINAL_COMPLAINT": "குற்றவியல் புகார்",
        "GENERAL_LEGAL_AID": "சட்ட உதவி மற்றும் ஆலோசனை"
    }.get(category, "சட்ட உதவி மற்றும் ஆலோசனை")

    category_display_ta_en = {
        "LABOUR_DISPUTE": "Labour / Velai prachanai Dispute",
        "CONSUMER_COMPLAINT": "Consumer Complaint",
        "CYBER_CRIME": "Cyber Crime Fraud",
        "PROPERTY_CIVIL_DISPUTE": "Property / Nilam / Rent Civil Dispute",
        "WOMEN_SAFETY_DOMESTIC_VIOLENCE": "Women Safety / Domestic Violence",
        "CRIMINAL_COMPLAINT": "Criminal Complaint",
        "GENERAL_LEGAL_AID": "General Legal Aid"
    }.get(category, "General Legal Aid")

    # Document Evidence defaults based on category
    evidence_map_en = {
        "LABOUR_DISPUTE": ["Employment Contract / Offer Letter", "Salary Slips or Bank Transfer Statements", "Correspondence (Emails/Chats) with employer", "Attendance records or Identity Card"],
        "CONSUMER_COMPLAINT": ["Purchase Bill / Invoice", "Warranty Card / Service Receipts", "Photographs of defective product", "Copy of written complaint sent to merchant"],
        "CYBER_CRIME": ["Bank Statement showing transactions", "Screenshots of phishing links/messages/calls", "Transaction ID / Reference receipts", "National Cyber Crime portal complaint copy"],
        "PROPERTY_CIVIL_DISPUTE": ["Rental / Lease Agreement", "Rent Receipts or Bank transfers", "Communication records (WhatsApp/Emails)", "Property Patta / Sale deed copy (if applicable)"],
        "WOMEN_SAFETY_DOMESTIC_VIOLENCE": ["WhatsApp messages / Call logs / Threat screenshots", "Medical reports / Prescription (if physical abuse occurred)", "Previous police CSR/complaint copy (if any)", "Witness statement names"],
        "CRIMINAL_COMPLAINT": ["First Information Report (FIR) copy or CSR receipt", "Photos or Videos of the incident", "Threat messages or call recordings", "Eyewitness names and contact details"],
        "GENERAL_LEGAL_AID": ["Identity proof (Aadhaar / Voter ID)", "Relevant letters, notices or documents", "Written explanation of dispute dates", "Opposing party details"]
    }

    evidence_map_ta = {
        "LABOUR_DISPUTE": ["வேலை ஒப்பந்தப் பத்திரம்", "சம்பளச் சீட்டு அல்லது வங்கிப் பரிவர்த்தனை சான்று", "மேலாளருடன் நடந்த வாட்ஸ்அப்/மின்னஞ்சல் உரையாடல்கள்", "பணி அடையாள அட்டை"],
        "CONSUMER_COMPLAINT": ["வாங்கியதற்கான அசல் பில் / ரசீது", "உத்தரவாத அட்டை (Warranty Card)", "பழுதடைந்த பொருளின் புகைப்படங்கள்", "வணிகருக்கு அனுப்பிய புகார் நகல்"],
        "CYBER_CRIME": ["வங்கி கணக்கு அறிக்கை (Bank Statement)", "ஏமாற்றிய மோசடி குறுஞ்செய்திகள் / அழைப்பு விவரங்களின் ஸ்கிரீன்ஷாட்கள்", "பரிவர்த்தனை குறிப்பு எண் (Transaction ID) ரசீது", "சைபர் கிரைம் புகார் நகல்"],
        "PROPERTY_CIVIL_DISPUTE": ["வாடகை அல்லது குத்தகை ஒப்பந்தப் பத்திரம் (Rental Agreement)", "வாடகை செலுத்தியதற்கான ரசீது அல்லது வங்கிப் பரிவர்த்தனை விவரங்கள்", "உரிமையாளருடன் பேசிய வாட்ஸ்அப் / மின்னஞ்சல் விவரங்கள்", "நிலப் பட்டா / சொத்து பத்திர நகல்"],
        "WOMEN_SAFETY_DOMESTIC_VIOLENCE": ["வாட்ஸ்அப் உரையாடல்கள் / மிரட்டல் குறுஞ்செய்திகளின் ஸ்கிரீன்ஷாட்கள்", "மருத்துவச் சான்றிதழ்கள் / காய அறிக்கை (ஏதேனும் இருந்தால்)", "காவல் நிலையத்தில் அளித்த புகார் நகல்", "சாட்சிகளின் விவரங்கள்"],
        "CRIMINAL_COMPLAINT": ["காவல்துறை ரசீது (CSR) அல்லது முதல் தகவல் அறிக்கை (FIR) நகல்", "சம்பவம் நடந்த இடத்தின் புகைப்படங்கள் அல்லது வீடியோக்கள்", "மிரட்டல் பதிவுகள் / ஆடியோ பதிவுகள்", "நேரில் பார்த்த சாட்சிகளின் விவரங்கள்"],
        "GENERAL_LEGAL_AID": ["ஆதார் அட்டை அல்லது வாக்காளர் அடையாள அட்டை", "பிரச்சனை தொடர்பான கடிதங்கள் அல்லது அறிவிப்புகள்", "விவாதப் புள்ளிகளின் ரசீதுகள்", "எதிர் தரப்பினரின் முகவரி விவரங்கள்"]
    }

    evidence_map_ta_en = {
        "LABOUR_DISPUTE": ["Employment Contract / Offer Letter", "Salary Slips or Bank Transfer proof", "Owner kooda pesina WhatsApp/Email chats", "ID Card"],
        "CONSUMER_COMPLAINT": ["Purchase Bill / Receipt", "Warranty Card", "Defective product photos", "Shop owner-ku anupina complaint copy"],
        "CYBER_CRIME": ["Bank Statement proof", "Fraud messages / Calls screenshots", "Transaction ID / receipts", "Cyber crime report copy"],
        "PROPERTY_CIVIL_DISPUTE": ["Rental / Lease Agreement copy", "Rent pay panna bank transfer proof", "House owner kooda pesina WhatsApp/Email messages", "Property Patta copy"],
        "WOMEN_SAFETY_DOMESTIC_VIOLENCE": ["Threat WhatsApp messages / call records", "Medical report / doctor prescription (if any)", "Police complaint copy (if any)", "Witness details"],
        "CRIMINAL_COMPLAINT": ["FIR copy or CSR police receipt", "Incident video or photos", "Threat recordings / messages", "Witness names"],
        "GENERAL_LEGAL_AID": ["Aadhaar / Voter ID card copy", "Dispute documents / letter notices", "Fact description receipts", "Opposite party details"]
    }

    evidence_list = required_docs if required_docs else []
    cat_evidence = []
    if lang == "ta":
        cat_evidence = evidence_map_ta.get(category, evidence_map_ta["GENERAL_LEGAL_AID"])
    elif "ta-en" in lang:
        cat_evidence = evidence_map_ta_en.get(category, evidence_map_ta_en["GENERAL_LEGAL_AID"])
    else:
        cat_evidence = evidence_map_en.get(category, evidence_map_en["GENERAL_LEGAL_AID"])

    # Combine models recommendations with friendly defaults
    for doc in cat_evidence:
        if doc not in evidence_list:
            evidence_list.append(doc)
    evidence_list = evidence_list[:5]

    # Location coords map
    loc_coords = {
        "chennai": (13.0827, 80.2707),
        "coimbatore": (11.0168, 76.9558),
        "madurai": (9.9252, 78.1198),
        "trichy": (10.7905, 78.7047),
        "tiruchirappalli": (10.7905, 78.7047),
        "salem": (11.6643, 78.1460),
        "tirunelveli": (8.7139, 77.7567),
        "vellore": (12.9165, 79.1325),
        "thanjavur": (10.7870, 79.1378),
        "thoothukudi": (8.7973, 78.1348),
        "erode": (11.3410, 77.7172)
    }

    dist_key = (district or "Chennai").strip().lower()
    lat, lon = loc_coords.get(dist_key, (13.0827, 80.2707))
    maps_link = f"https://www.google.com/maps/search/?api=1&query={lat},{lon}"

    # Multilingual dynamic output generation
    if lang == "ta":
        what_happened = f"மனுதாரர் {district} மாவட்டத்தில் நடந்த சம்பவம் பற்றி புகாரளித்துள்ளார். தனது புகாரில்: '{description[:150]}...' என்று குறிப்பிட்டுள்ளார்."
        main_problem = f"{category_display_ta} (AI மூலமாக பகுப்பாய்வு செய்யப்பட்டது)"
        
        action_plan = [
            f"படி 1: அத்தியாவசிய ஆதாரங்களைச் சேகரிக்கவும் ({', '.join(evidence_list[:2])}).",
            "படி 2: எதிர் தரப்பினரைத் தொடர்புகொண்டு உங்கள் கோரிக்கையை எழுத்துப்பூர்வமாகத் தெரிவிக்கவும்.",
            f"படி 3: {district} மாவட்ட சட்டப் பணிகள் ஆணைக்குழு (DLSA) அல்லது சம்பந்தப்பட்ட துறையை அணுகவும்.",
            "படி 4: உங்களின் புகார் மனு எண் மற்றும் சான்றுகளை பத்திரமாக வைத்திருக்கவும்.",
            "படி 5: 30 நாட்களுக்குள் தீர்வு கிடைக்கவில்லை என்றால் மேல்முறையீடு செய்யவும்."
        ]
        
        authority = f"{district} மாவட்ட சட்டப் பணிகள் ஆணைக்குழு (DLSA) / சம்பந்தப்பட்ட துறை"
        loc_desc = f"{district} மாவட்டம் (அடையாளம் காணப்பட்டது). துல்லியமான முகவரி வழங்கப்படவில்லை என்றால், வரைபடத்தில் மாவட்ட மையம் காட்டப்படும்."
        
    elif "ta-en" in lang:
        what_happened = f"Citizen {district} district la nadantha issue pathi report panni irukanga. Text description: '{description[:150]}...' nu iruku."
        main_problem = f"{category_display_ta_en} (AI analysis parsed)"
        
        action_plan = [
            f"Step 1: Core evidence-a collect panni vechukkonga ({', '.join(evidence_list[:2])}).",
            "Step 2: Opposite party-ku formal notice or WhatsApp request send pannunga.",
            f"Step 3: {district} District Legal Services Authority (DLSA) alladhu correct department-a contact pannunga.",
            "Step 4: Complaint Reference Number/Receipt-a safe-a vechukkonga.",
            "Step 5: Follow up pannunga reply varala na."
        ]
        
        authority = f"{district} District Legal Services Authority (DLSA) / Concerned Authority"
        loc_desc = f"{district} District location. Exact address collect pannala na, map-la center spot display aagum."
        
    else: # English
        what_happened = f"The citizen reported an incident in the {district} district. Key description: '{description[:150]}...'"
        main_problem = f"{category_display_en} (AI Category Classification)"
        
        action_plan = [
            f"Step 1: Collect required evidence documents ({', '.join(evidence_list[:2])}).",
            "Step 2: Reach out to the opposing party/entity with a formal written demand or request.",
            f"Step 3: Approach the {district} District Legal Services Authority (DLSA) or the relevant department.",
            "Step 4: Keep the complaint receipt and reference number safely stored.",
            "Step 5: Follow up with the legal officer or authority if unresolved within 30 days."
        ]
        
        authority = f"District Legal Services Authority (DLSA), {district} / Relevant Department"
        loc_desc = f"{district} District area (detected). If exact address is missing, default district marker is shown."

    return {
        "whatHappened": what_happened,
        "mainProblem": main_problem,
        "importantFacts": {
            "dates": dates if dates else ["As mentioned in complaint"],
            "amounts": amounts if amounts else ["Not specified"],
            "entities": entities if entities else ["Opposing party"],
            "other": ["District: " + (district or "Not Specified")]
        },
        "evidenceNeeded": evidence_list,
        "actionPlan": action_plan,
        "relevantAuthority": authority,
        "location": {
            "name": loc_desc,
            "latitude": lat,
            "longitude": lon,
            "googleMapsLink": maps_link
        }
    }
