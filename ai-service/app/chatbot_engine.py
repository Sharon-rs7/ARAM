from app.cases.multi_case_engine import decompose_multi_case
import re
import os
import time
from typing import Dict, Any, Optional, List

from app.safety_filter import sanitize_chat_reply, DISCLAIMER
from app.services.embedding_service import embedding_service
from app.nlp.language_detector import language_detector
from app.conversation_manager import conversation_manager
from app.intent_classifier import classify_intent, INTENTS
from app.mongo_logger import log_ai_action

try:
    from app.ml.category_model import predict_category
except Exception:
    try:
        from app.complaint_classifier import predict_category
    except Exception:
        predict_category = lambda text: {"category": "GENERAL_LEGAL_AID", "confidence": 0.85}

from rag.retrieval.retriever import legal_retriever
from rag.retrieval.jurisdiction_filter import detect_jurisdiction_from_text
from rag.generation.response_generator import generate_rag_response
from rag.schemas.rag_response import RAGStructuredResponse

TAXONOMY_MAP = {
    "PROPERTY_DISPUTE": {
        "id": "C6",
        "name": "Property, Title & Registration Dispute",
        "authority": "Sub-Registrar Office / District Registrar (Registration Dept) / Tahsildar / Cyber Crime Police (1930) / DLSA",
        "act_en": "Registration Act, 1908 & Transfer of Property Act, 1882 / Information Technology Act, 2000",
        "section_en": "Section 17 & Section 82 (Registration Act) / Section 54 (Transfer of Property Act) / Section 66D (IT Act)",
        "documents": ["Original Sale Deed (அசல் கிரய பத்திரம்)", "Encumbrance Certificate (EC - வில்லங்க சான்றிதழ் via tnreginet)", "Patta / Chitta Revenue Records (பட்டா / சிட்டா)", "Evidence of Suspicious / Unauthorized Online Transaction Attempt (Screenshots / Logs)", "Identity Proof (Aadhaar / Voter ID)"],
        "summary_ta": "சொத்து ஆவண மோசடி, அனுமதியற்ற ஆன்லைன் உரிமை மாற்றம் முயற்சி மற்றும் எல்லை தகராறுகள் பதிவுச் சட்டம் 1908, சொத்துரிமை மாற்று சட்டம் 1882 மற்றும் தகவல் தொழில்நுட்ப சட்டம் 2000 மூலம் தீர்க்கப்படுகின்றன.",
        "summary_en": "Property document fraud, unauthorized online ownership transfer attempts, and title disputes are governed under the Registration Act, 1908, Transfer of Property Act, 1882, and Information Technology Act, 2000."
    },
    "PROPERTY_CIVIL_DISPUTE": {
        "id": "C6",
        "name": "Property Title & Land Administration Dispute",
        "authority": "Sub-Registrar Office / Tahsildar / Civil Court / DLSA",
        "act_en": "Registration Act, 1908 & Transfer of Property Act, 1882",
        "section_en": "Section 17 & Section 82 (Registration Act) & Section 54 (Transfer of Property)",
        "documents": ["Original Sale Deed", "Encumbrance Certificate (EC)", "Patta / Chitta", "Revenue / Survey Map"],
        "summary_ta": "நில உரிமை மற்றும் பதிவு ஆவணங்கள் தொடர்பான சட்ட வழிகாட்டுதல்.",
        "summary_en": "Property title verification, registration fraud objection, and revenue mutation."
    },
    "TENANCY_DISPUTE": {
        "id": "C5",
        "name": "Landlord & Tenant Dispute",
        "authority": "Rent Court / Rent Tribunal / Taluk Legal Services Committee",
        "act_en": "Tamil Nadu Regulation of Rights and Responsibilities of Landlords and Tenants Act, 2017",
        "section_en": "Section 4 (Tenancy Agreement) & Section 21 (Repossession & Security Deposit Refund)",
        "documents": ["Rental Agreement (வாடகை ஒப்பந்தம்)", "Security Deposit & Rent Receipts / UPI Statements", "Notice to Vacate / Eviction Notice", "Utility Bills"],
        "summary_ta": "வாடகை முன்வைப்பு தொகை (Security Deposit) திரும்பப் பெறுதல் மற்றும் வாடகைதாரர் உரிமைகள் தமிழ்நாடு வாடகைதாரர் உரிமைகள் சட்டம் 2017 மூலம் பாதுகாக்கப்படுகின்றன.",
        "summary_en": "Security deposit recovery, wrongful eviction, and tenancy terms are governed by the Tenancy Act, 2017."
    },
    "RENT_TENANT_DISPUTE": {
        "id": "C5",
        "name": "Landlord & Tenant Dispute",
        "authority": "Rent Court / Rent Controller / DLSA",
        "act_en": "Tamil Nadu Regulation of Rights and Responsibilities of Landlords and Tenants Act, 2017",
        "section_en": "Section 4 & Section 21",
        "documents": ["Rental Agreement", "Security Deposit Receipts", "Eviction Notice"],
        "summary_ta": "வாடகை முன்வைப்பு தொகை மற்றும் வாடகை ஒப்பந்த பிரச்சனைகள்.",
        "summary_en": "Tenancy deposit recovery and eviction procedures under Tenancy Act."
    },
    "LABOUR_DISPUTE": {
        "id": "C4",
        "name": "Labour & Wage Dispute",
        "authority": "District Labour Commissioner / Labour Court / DLSA",
        "act_en": "Payment of Wages Act, 1936 & Industrial Disputes Act, 1947",
        "section_en": "Section 15 (Claims arising out of deductions from wages)",
        "documents": ["Salary Slips / Pay Records", "Employment Offer Letter / ID Card", "Bank Statement showing salary history", "Attendance Register Copy"],
        "summary_ta": "வழங்கப்படாத ஊதியம் மற்றும் அநியாய பணிநீக்கம் தொடர்பான புகார்கள் தொழிலாளர் நல ஆணையரிடம் (Labour Commissioner) முறையிடப்பட வேண்டும்.",
        "summary_en": "Unpaid salary, wrongful termination, and gratuity claims are governed under the Payment of Wages Act and Industrial Disputes Act."
    },
    "CONSUMER_COMPLAINT": {
        "id": "C3",
        "name": "Consumer Dispute & Deficiency of Service",
        "authority": "District Consumer Disputes Redressal Commission (DCDRC)",
        "act_en": "Consumer Protection Act, 2019",
        "section_en": "Section 35 (Manner in which complaint shall be made) & Section 2(11) (Deficiency of Service)",
        "documents": ["Tax Invoice / Bill", "Warranty Card / Service Agreement", "Written Communications / Emails with Seller", "Defective Product Photographs / Video"],
        "summary_ta": "குறைபாடுள்ள பொருட்கள் மற்றும் சேவைகள் தொடர்பான புகார்களை நுகர்வோர் குறைதீர் ஆணையத்தில் (Consumer Forum) தாக்கல் செய்யலாம்.",
        "summary_en": "Defective goods, unfair trade practices, and deficient services are redressed under the Consumer Protection Act, 2019."
    },
    "CYBER_CRIME": {
        "id": "C9",
        "name": "Cybercrime & Online Financial Fraud",
        "authority": "Cyber Crime Police Station / National Cybercrime Portal (1930 / cybercrime.gov.in)",
        "act_en": "Information Technology Act, 2000 & Bharatiya Nyaya Sanhita, 2023",
        "section_en": "Section 66D (Cheating by personation using computer resource)",
        "documents": ["Bank Account Statement showing unauthorized debits", "Transaction Reference IDs (UTR/UPI)", "Screenshots of phishing SMS / WhatsApp chats / fraudulent links", "Copy of Bank Dispute Form"],
        "summary_ta": "ஆன்லைன் பண மோசடி மற்றும் இணைய குற்றங்களுக்கு உடனடியாக 1930 எண்ணை அழைக்க வேண்டும் மற்றும் cybercrime.gov.in தளத்தில் பதிவு செய்ய வேண்டும்.",
        "summary_en": "Online financial scams, identity theft, and cyber fraud must be immediately reported to National Cybercrime Helpline 1930."
    },
    "WOMEN_SAFETY_DOMESTIC_VIOLENCE": {
        "id": "C2",
        "name": "Domestic Violence & Women Protection",
        "authority": "Protection Officer / District Social Welfare Officer / Women Helpline 181",
        "act_en": "Protection of Women from Domestic Violence Act, 2005",
        "section_en": "Section 12 (Application to Magistrate) & Section 18-22 (Protection Orders & Monetary Relief)",
        "documents": ["Identity Proof", "Medical Examination Report (if physical harm)", "Marriage Proof / Proof of Shared Household", "Audio / Video / Chat Evidence"],
        "summary_ta": "பெண்கள் பாதுகாப்பு மற்றும் குடும்ப வன்முறைக்கு மகளிர் உதவி எண் 181 அல்லது பாதுகாப்பு அதிகாரியை (Protection Officer) அணுகலாம்.",
        "summary_en": "Protection orders, residence rights, and maintenance for women are strictly enforced under the PWDV Act, 2005."
    },
    "DOMESTIC_VIOLENCE": {
        "id": "C2",
        "name": "Domestic Violence & Women Protection",
        "authority": "Protection Officer / District Social Welfare Officer / Women Helpline 181",
        "act_en": "Protection of Women from Domestic Violence Act, 2005",
        "section_en": "Section 12 & Sections 18-22 (Protection & Maintenance Orders)",
        "documents": ["Identity Proof", "Medical Records", "Marriage Proof", "Witness Statements"],
        "summary_ta": "குடும்ப வன்முறைக்கு மகளிர் உதவி எண் 181 மற்றும் மாவட்ட சமூக நல அலுவலரை அணுகவும்.",
        "summary_en": "Confidential protection and relief orders under the Domestic Violence Act, 2005."
    },
    "WOMEN_SAFETY": {
        "id": "C2",
        "name": "Women Safety & Legal Protection",
        "authority": "All Women Police Station (AWPS) / Women Helpline 181 / DLSA",
        "act_en": "Bharatiya Nyaya Sanhita, 2023 & Protection of Women from Domestic Violence Act, 2005",
        "section_en": "Section 74/75 (Assault/Sexual Harassment) & PWDV Act Sec 12",
        "documents": ["Identity Proof (Aadhaar Card)", "Medical Examination Report", "Evidence / Messages", "Police CSR Receipt"],
        "summary_ta": "பெண்கள் மீதான துன்புறுத்தல் மற்றும் பாதுகாப்பு பிரச்சனைகளுக்கு அனைத்து மகளிர் காவல் நிலையம் அல்லது உதவி எண் 181-ஐ அணுகலாம்.",
        "summary_en": "Legal protection and emergency redressal for women harassment and safety."
    },
    "MOTOR_ACCIDENT_CLAIM": {
        "id": "C11",
        "name": "Motor Accident Claim & Compensation",
        "authority": "Motor Accident Claims Tribunal (MACT) / DLSA Lok Adalat",
        "act_en": "Motor Vehicles Act, 1988 (as amended in 2019)",
        "section_en": "Section 166 (Application for compensation) & Section 161 (Special provisions for hit and run)",
        "documents": ["FIR / Police CSR Copy", "Medical Discharge Summary & Treatment Bills", "Vehicle RC Book & Insurance Policy", "Driving License Copy", "Disability Certificate (if permanent injury)"],
        "summary_ta": "வாகன விபத்து இழப்பீடு மற்றும் மருத்துவ செலவு கோரிக்கைகளை மோட்டார் விபத்து இழப்பீட்டு தீர்ப்பாயத்தில் (MACT) தாக்கல் செய்யலாம்.",
        "summary_en": "Claims for medical expenses, permanent disability, and accident compensation are adjudicated by the Motor Accident Claims Tribunal (MACT)."
    },
    "MEDICAL_NEGLIGENCE": {
        "id": "C12",
        "name": "Medical Negligence & Patient Rights",
        "authority": "State Medical Council / District Consumer Disputes Redressal Commission / DLSA",
        "act_en": "Consumer Protection Act, 2019 & National Medical Commission Act, 2019",
        "section_en": "Section 2(11) (Deficiency of Service in Healthcare) & Section 35 (Compensation Claim)",
        "documents": ["Hospital Discharge Summary", "Prescriptions & Diagnostic Test Reports", "Itemized Treatment Invoices & Payment Receipts", "Doctor Treatment Notes"],
        "summary_ta": "மருத்துவ குறைபாடு, அலட்சிய சிகிச்சை மற்றும் அதிக கட்டண வசூலிப்புக்கு நுகர்வோர் குறைதீர் ஆணையம் அல்லது தமிழ்நாடு மருத்துவ கவுன்சிலில் முறையிடலாம்.",
        "summary_en": "Deficiency in medical care and professional malpractice are redressed under Consumer Protection Act and State Medical Council."
    },
    "BANKING_DISPUTE": {
        "id": "C13",
        "name": "Banking & Insurance Grievance",
        "authority": "Banking Ombudsman (Reserve Bank of India) / Insurance Ombudsman",
        "act_en": "Banking Regulation Act, 1949 & Insurance Act, 1938 / Consumer Protection Act, 2019",
        "section_en": "RBI Integrated Ombudsman Scheme, 2021",
        "documents": ["Bank Statement / Passbook Copy", "Written Representation submitted to Branch Manager", "Transaction Proof / Dispute Form", "Ombudsman Complaint Reference"],
        "summary_ta": "வங்கி சேவை குறைபாடுகள், தவறான பிடித்தங்கள் மற்றும் காப்பீட்டு கோரிக்கை நிராகரிப்புகளுக்கு ரிசர்வ் வங்கி ஆம்புட்ஸ்மேன் (Banking Ombudsman) மூலம் நிவாரணம் பெறலாம்.",
        "summary_en": "Unauthorized bank deductions, loan harassment, and repudiated insurance claims are redressed via RBI Integrated Ombudsman."
    },
    "INSURANCE_CLAIM": {
        "id": "C13",
        "name": "Insurance Claim Dispute",
        "authority": "Insurance Ombudsman / District Consumer Disputes Redressal Commission",
        "act_en": "Insurance Act, 1938 & Consumer Protection Act, 2019",
        "section_en": "Insurance Ombudsman Rules, 2017 & Section 35 CPA 2019",
        "documents": ["Insurance Policy Document", "Claim Rejection Letter", "Premium Receipts", "Hospital Bills / Loss Assessment Report"],
        "summary_ta": "காப்பீட்டுத் தொகை வழங்க மறுத்தல் அல்லது நியாயமற்ற தாமதத்திற்கு இன்சூரன்ஸ் ஆம்புட்ஸ்மேனை அணுகலாம்.",
        "summary_en": "Wrongful rejection of health, life, or vehicle insurance claims is redressed by the Insurance Ombudsman."
    },
    "FINANCIAL_FRAUD": {
        "id": "C7",
        "name": "Financial Fraud & Cheque Dishonour",
        "authority": "Judicial Magistrate Court / Police Cyber & Economic Offences Wing",
        "act_en": "Negotiable Instruments Act, 1881 & Bharatiya Nyaya Sanhita, 2023",
        "section_en": "Section 138 (Dishonour of cheque for insufficiency of funds)",
        "documents": ["Original Dishonoured Cheque & Bank Return Memo", "Statutory Demand Notice with Postal Tracking", "Loan / Transaction Agreement", "Bank Statements"],
        "summary_ta": "காசோலை திரும்புதல் (Cheque Bounce) வழக்குகளுக்கு 30 நாட்களுக்குள் சட்டப்படியான அறிவிப்பு (Legal Notice) அனுப்பி 138 சட்டத்தின் கீழ் நடவடிக்கை எடுக்கலாம்.",
        "summary_en": "Cheque bounce proceedings require statutory demand notice within 30 days under Section 138 of the NI Act."
    },
    "RTI_APPLICATION": {
        "id": "C14",
        "name": "Right to Information & Transparency",
        "authority": "Public Information Officer (PIO) / First Appellate Authority / State Information Commission (SIC)",
        "act_en": "Right to Information Act, 2005",
        "section_en": "Section 6 (Request for obtaining information) & Section 19 (First & Second Appeals)",
        "documents": ["Copy of RTI Application filed", "Proof of Speed Post Dispatch / Fee Receipt", "First Appeal Form (if 30 days elapsed without reply)"],
        "summary_ta": "அரசு துறைகளிடம் தகவல் பெற RTI சட்டம் பிரிவு 6-ன் கீழ் விண்ணப்பிக்கலாம்; 30 நாட்களில் தகவல் கிடைக்காவிடில் முதல் மேல்முறையீடு (First Appeal) செய்யலாம்.",
        "summary_en": "Citizens have a statutory right to obtain public records within 30 days under RTI Act, 2005 with right of appeal to State Information Commission."
    },
    "EDUCATION_DISPUTE": {
        "id": "C15",
        "name": "Education & Student Rights Dispute",
        "authority": "Chief Educational Officer (CEO) / Fee Fixation Committee / High Court",
        "act_en": "Right of Children to Free and Compulsory Education Act, 2009 & TN Schools (Fixation of Fee) Act, 2009",
        "section_en": "Section 13 (No capitation fee) & Section 7 (Fee Regulation)",
        "documents": ["Fee Demand Notice / Receipts", "School Admission Allotment Order", "Bonafide Certificate", "Correspondence with Management"],
        "summary_ta": "அதிகப்படியான கல்விக் கட்டணம், மாற்றுச் சான்றிதழ் (TC) வழங்க மறுத்தல் தொடர்பான புகார்களை மாவட்ட முதன்மைக் கல்வி அலுவலரிடம் (CEO) அளிக்கலாம்.",
        "summary_en": "Capitation fee demands, TC withholding, and admission irregularities are redressed by the Chief Educational Officer and Fee Fixation Committee."
    },
    "SENIOR_CITIZEN_ABUSE": {
        "id": "C16",
        "name": "Senior Citizen Protection & Maintenance",
        "authority": "Maintenance Tribunal / Sub-Divisional Magistrate (SDM) / DLSA",
        "act_en": "Maintenance and Welfare of Parents and Senior Citizens Act, 2007",
        "section_en": "Section 4 (Maintenance Claim) & Section 23 (Transfer of property void in certain circumstances)",
        "documents": ["Age Proof (Aadhaar / Voter ID / Pension Card)", "Property Transfer Deed Copy (if gifted to children)", "Medical Bills & Income Proof"],
        "summary_ta": "முதியோர்களை கைவிடுதல், பராமரிப்பு மறுத்தல் அல்லது ஏமாற்றி சொத்து வாங்கிய வழக்குகளுக்கு கோட்டாட்சியர் (RDO/SDM) தீர்ப்பாயத்தில் மனு செய்து சொத்தை மீட்கலாம்.",
        "summary_en": "Senior citizens can claim monthly maintenance and void conditional property gifts under Section 23 of the Maintenance of Parents Act."
    },
    "CHILD_WELFARE": {
        "id": "C17",
        "name": "Child Welfare & Protection",
        "authority": "Child Welfare Committee (CWC) / Child Helpline 1098 / District Child Protection Unit",
        "act_en": "Juvenile Justice (Care and Protection of Children) Act, 2015 & POCSO Act, 2012",
        "section_en": "Section 27 (Child Welfare Committee) & POCSO Act Provisions",
        "documents": ["Child Birth Certificate / School ID", "Guardian Identity Proof", "Medical Examination Report"],
        "summary_ta": "குழந்தைகள் பாதுகாப்பு, கல்வி உரிமை மறுப்பு மற்றும் ஆபத்தான சூழலில் உள்ள குழந்தைகளுக்கு உதவி எண் 1098 அல்லது CWC-ஐ அணுகலாம்.",
        "summary_en": "Child protection, custody, and welfare interventions are handled under Juvenile Justice Act and Child Helpline 1098."
    },
    "DISABILITY_RIGHTS": {
        "id": "C18",
        "name": "Rights of Persons with Disabilities",
        "authority": "State Commissioner for Persons with Disabilities / District Differently Abled Welfare Office (DDAWO)",
        "act_en": "Rights of Persons with Disabilities Act, 2016 (RPWD Act)",
        "section_en": "Section 3 (Equality and non-discrimination) & Section 80 (Powers of State Commissioner)",
        "documents": ["UDID Card / Disability Certificate", "Aadhaar Card", "Denial of Accommodation / Accessibility Proof"],
        "summary_ta": "மாற்றுத்திறனாளிகளுக்கான உரிமைகள் மறுப்பு, அணுகல் வசதியின்மை தொடர்பான புகார்களை மாநில மாற்றுத்திறனாளிகள் ஆணையரிடம் அளிக்கலாம்.",
        "summary_en": "Discrimination in employment, education, or accessibility for differently-abled persons is actionable under RPWD Act, 2016."
    },
    "CASTE_DISCRIMINATION": {
        "id": "C19",
        "name": "SC/ST Protection & Prevention of Atrocities",
        "authority": "District Collector (Vigilance Committee) / DSP / Special Court under POA Act",
        "act_en": "Scheduled Castes and Scheduled Tribes (Prevention of Atrocities) Act, 1989",
        "section_en": "Section 3 (Punishments for offences of atrocities) & Section 14 (Special Court)",
        "documents": ["Community Certificate", "Written Police Complaint Copy / CSR", "Medical / Audio-Visual Evidence"],
        "summary_ta": "சாதிய பாகுபாடு, வன்கொடுமை மற்றும் பொது வசதி மறுப்பு புகார்களுக்கு வன்கொடுமை தடுப்புச் சட்டம் 1989-ன் கீழ் உடனடி நடவடிக்கை மற்றும் நிவாரணம் பெறலாம்.",
        "summary_en": "Atrocities, discrimination, and denial of rights to SC/ST persons are prosecuted under the SC/ST (PoA) Act with statutory compensation."
    },
    "POLICE_MISCONDUCT": {
        "id": "C20",
        "name": "Police Complaints & Custodial Protection",
        "authority": "State / District Police Complaints Authority / State Human Rights Commission (SHRC)",
        "act_en": "Tamil Nadu Police Act & Protection of Human Rights Act, 1993",
        "section_en": "Section 12 (Functions of SHRC) & Police Complaints Authority Guidelines",
        "documents": ["Receipt of Complaint submitted / Speed Post Tracking", "Medical Certificate (if physical assault)", "Witness Statements / Video Evidence"],
        "summary_ta": "புகார் பதிவு செய்ய மறுத்தல் அல்லது காவல் துன்புறுத்தலுக்கு மாவட்ட காவல் புகார்கள் ஆணையம் அல்லது மனித உரிமைகள் ஆணையத்தில் முறையிடலாம்.",
        "summary_en": "Refusal to register FIR or custodial harassment is redressed by Police Complaints Authority and Human Rights Commission."
    },
    "CORRUPTION_BRIBERY": {
        "id": "C21",
        "name": "Anti-Corruption & Vigilance",
        "authority": "Directorate of Vigilance and Anti-Corruption (DVAC) / Lokayukta",
        "act_en": "Prevention of Corruption Act, 1988 (as amended in 2018)",
        "section_en": "Section 7 (Offence relating to public servant being bribed)",
        "documents": ["Details of Public Servant demanding bribe", "Audio / Video / Transaction Evidence", "Copy of Application pending with Department"],
        "summary_ta": "அரசு ஊழியர்கள் லஞ்சம் கோரினால் ஊழல் தடுப்பு மற்றும் கண்காணிப்பு இயக்ககம் (DVAC) அல்லது லோக் ஆயுக்தாவிடம் புகார் செய்யலாம்.",
        "summary_en": "Bribe demands by public servants are investigated by the Directorate of Vigilance and Anti-Corruption (DVAC) via trap proceedings."
    },
    "CIVIC_INFRASTRUCTURE": {
        "id": "C22",
        "name": "Civic Amenities & Municipal Grievances",
        "authority": "Municipal Corporation Commissioner / Municipality / District Collectorate",
        "act_en": "Tamil Nadu Urban Local Bodies Act, 1998 & Municipal Administration Rules",
        "section_en": "Statutory Duty of Municipal Authorities for Public Health & Sanitation",
        "documents": ["Photographs of Civic Problem (Road / Drainage / Water)", "Written Representation submitted to Ward Councillor / Corporation", "Property Tax Receipt"],
        "summary_ta": "குடிநீர் தட்டுப்பாடு, சாலை சேதம், பாதாள சாக்கடை அடைப்பு போன்ற புகார்களை மாநகராட்சி / நகராட்சி ஆணையரிடம் முறையிடலாம்.",
        "summary_en": "Deficiencies in roads, drainage, garbage disposal, and water supply are redressed through Municipal Grievance Redressal and Ward Committees."
    },
    "ELECTRICITY_UTILITY_DISPUTE": {
        "id": "C23",
        "name": "Electricity & Power Utility Dispute",
        "authority": "Consumer Grievance Redressal Forum (CGRF) / Electricity Ombudsman (TNERC)",
        "act_en": "The Electricity Act, 2003",
        "section_en": "Section 42(5) (Consumer Grievance Redressal Forum) & Section 42(6) (Electricity Ombudsman)",
        "documents": ["Electricity Service Connection Card / Bill Receipts", "Disputed Assessment Notice / Meter Test Report", "Copy of Written Representation to AEE / Executive Engineer"],
        "summary_ta": "தவறான மின்கட்டணம், மின் இணைப்பு மறுப்பு மற்றும் மின் அளவி (Meter) கோளாறுகளுக்கு மின் நுகர்வோர் குறைதீர் மன்றம் (CGRF) மூலம் தீர்வு காணலாம்.",
        "summary_en": "Excessive billing, meter defects, and power supply issues are redressed by the Consumer Grievance Redressal Forum (CGRF) and Electricity Ombudsman."
    },
    "ENVIRONMENTAL_POLLUTION": {
        "id": "C24",
        "name": "Environmental Pollution & Public Nuisance",
        "authority": "Tamil Nadu Pollution Control Board (TNPCB) / National Green Tribunal (NGT) / District Collector",
        "act_en": "Environment (Protection) Act, 1986 & Water / Air (Prevention & Control of Pollution) Acts",
        "section_en": "Section 15 (Penalties) & NGT Act Section 14",
        "documents": ["Photographs / Video of Toxic Discharge / Emissions", "Water / Soil Quality Reports (if available)", "Residents Association Joint Petition"],
        "summary_ta": "ஆலை கழிவு நீர் வெளியேற்றம், காற்று மாசு மற்றும் சட்டவிரோத குவாரி செயல்பாடுகளுக்கு மாசு கட்டுப்பாட்டு வாரியம் (TNPCB) அல்லது தேசிய பசுமை தீர்ப்பாயத்தில் முறையிடலாம்.",
        "summary_en": "Industrial effluent discharge, hazardous waste dumping, and air pollution are redressed through TNPCB and National Green Tribunal."
    },
    "GOVERNMENT_PENSION_DELAY": {
        "id": "C25",
        "name": "Pension & Retirement Benefits Delay",
        "authority": "Directorate of Treasuries and Accounts / Accountant General / Central Administrative Tribunal (CAT)",
        "act_en": "Tamil Nadu Pension Rules, 1978 & Central Civil Services (Pension) Rules",
        "section_en": "Rule on Timely Settlement of Superannuation Pension & Gratuity with Statutory Interest",
        "documents": ["Pension Payment Order (PPO) Application Receipt", "Service Register Extract", "Last Pay Certificate (LPC)", "No-Dues Certificate"],
        "summary_ta": "ஓய்வூதியம் (Pension), பணிக்கொடை (Gratuity) வழங்க தாமதமானால் அரசு கருவூல துறை அல்லது நிர்வாக தீர்ப்பாயத்தில் முறையிட்டு வட்டியுடன் பெறலாம்.",
        "summary_en": "Delayed pension and retirement gratuity are recoverable with statutory interest through Departmental Appeals and Administrative Tribunals."
    },
    "GOVERNMENT_SCHEME": {
        "id": "C26",
        "name": "Welfare Scheme & Public Distribution Grievance",
        "authority": "District Collectorate Grievance Cell / Taluk Supply Officer (TSO) / e-Sevai Center",
        "act_en": "National Food Security Act, 2013 & State Welfare Board Enactments",
        "section_en": "Section 15 (District Grievance Redressal Officer) & Section 16 (State Food Commission)",
        "documents": ["Smart Ration Card", "Income & Community Certificate", "Scheme Application Acknowledgement Slip", "Aadhaar Card"],
        "summary_ta": "ரேஷன் அட்டை (Ration Card), மகளிர் உரிமைத் தொகை மற்றும் அரசு நலத்திட்ட உதவிகள் மறுக்கப்பட்டால் தாலுகா வழங்கல் அலுவலர் அல்லது மாவட்ட ஆட்சியரிடம் முறையிடலாம்.",
        "summary_en": "Denial of ration supplies, welfare board benefits, or government subsidies is redressed by the District Grievance Redressal Officer."
    },
    "CRIMINAL_COMPLAINT": {
        "id": "C27",
        "name": "Criminal Grievance & Police Assistance",
        "authority": "Jurisdictional Police Station / Judicial Magistrate Court / DLSA",
        "act_en": "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS) & Bharatiya Nyaya Sanhita, 2023 (BNS)",
        "section_en": "Section 173 BNSS (Information in cognizable cases / FIR) & Section 175(3) (Magistrate Direction)",
        "documents": ["Identity Proof (Aadhaar Card)", "Copy of Written Complaint", "Medical / Injury Report (if assault)", "CCTV / Photo Evidence"],
        "summary_ta": "குற்றவியல் புகார்களுக்கு காவல் நிலையத்தில் முதல் தகவல் அறிக்கை (FIR) பதிவு செய்யப்பட வேண்டும்; மறுக்கப்பட்டால் உயர் அதிகாரி அல்லது நீதிமன்றத்தை அணுகலாம்.",
        "summary_en": "Cognizable offences must be registered as FIR under Section 173 BNSS with right to petition Judicial Magistrate."
    },
    "FAMILY_DISPUTE": {
        "id": "C28",
        "name": "Family Dispute & Matrimonial Matters",
        "authority": "Family Court / DLSA Mediation Centre / Taluk Legal Services Committee",
        "act_en": "Hindu Marriage Act, 1955 / Special Marriage Act, 1954 & Family Courts Act, 1984",
        "section_en": "Section 9 (Restitution) / Section 13 (Divorce) / Section 24 (Maintenance)",
        "documents": ["Marriage Certificate / Wedding Invitation", "Identity Proofs", "Income Proof / Bank Statements", "Mediation Record (if any)"],
        "summary_ta": "குடும்பத் தகராறுகள், விவாகரத்து மற்றும் ஜீவனாம்ச வழக்குகளை குடும்ப நல நீதிமன்றம் அல்லது மாவட்ட சட்டப்பணிகள் ஆணைக்குழு சமரச மையம் மூலம் தீர்க்கலாம்.",
        "summary_en": "Matrimonial reconciliation, maintenance, and child custody are mediated and adjudicated through Family Courts and DLSA."
    },
    "WORKPLACE_HARASSMENT": {
        "id": "C29",
        "name": "Workplace Harassment (POSH)",
        "authority": "Internal Complaints Committee (ICC) / Local Complaints Committee (LCC) / District Officer",
        "act_en": "Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013 (POSH Act)",
        "section_en": "Section 9 (Complaint of sexual harassment) & Section 11 (Inquiry into complaint)",
        "documents": ["Employment ID / Appointment Letter", "Written Complaint submitted to ICC", "Email / Chat / Audio Proof", "Witness Names"],
        "summary_ta": "பணியிடத்தில் பெண்களுக்கு ஏற்படும் பாலியல் துன்புறுத்தல்களுக்கு நிறுவனத்தின் உள்ளகக் குழு (ICC) அல்லது மாவட்ட உள்ளூர் குழுவில் (LCC) புகார் செய்யலாம்.",
        "summary_en": "Workplace harassment must be inquired into by the Internal Complaints Committee (ICC) within 90 days under POSH Act."
    },
    "GENERAL_LEGAL_AID": {
        "id": "C10",
        "name": "General Legal Aid & Civic Procedure",
        "authority": "District Legal Services Authority (DLSA) / Taluk Legal Services Committee",
        "act_en": "Legal Services Authorities Act, 1987",
        "section_en": "Section 12 (Criteria for giving legal services)",
        "documents": ["Aadhaar Card", "Income Certificate for Free Legal Aid Eligibility", "Relevant notices, receipts or dispute summary"],
        "summary_ta": "சட்ட ரீதியான உதவி மற்றும் இலவச சட்ட ஆலோசனைக்கு மாவட்ட சட்டப்பணிகள் ஆணைக்குழுவை (DLSA) அணுகலாம்.",
        "summary_en": "Free legal aid, counseling, and pre-litigation settlement through District Legal Services Authority (DLSA)."
    }
}

TANGLISH_MARKERS = [
    "pananum", "pannum", "pannanum", "thrla", "therila", "theriyala", "enga", 
    "yarkita", "yaarkita", "enaku", "enakku", "sottu", "sothu", "nila", "nilam", 
    "patta", "panam", "kuduka", "kudukala", "sambalam", "police", "keta", "solla", 
    "vanakkam", "nan", "illai", "veedu", "vaadagai", "vadagai", "mosadi"
]

def detect_language_smart(raw_text: str, current_session_lang: Optional[str] = None, requested_lang: Optional[str] = None) -> str:
    if requested_lang and requested_lang.startswith("ta"):
        return "ta"
    if requested_lang and requested_lang.startswith("hi"):
        return "hi"
    if requested_lang and requested_lang.startswith("en"):
        return "en"
    
    clean = raw_text.lower().strip()

    if clean in ["hi", "hello", "hey", "good morning", "good evening", "good afternoon", "how are you", "test", "ok", "okay", "thanks", "thank you", "bye", "goodbye"]:
        return "en"

    if re.search(r'[\u0b80-\u0bff]', raw_text):
        return "ta"
    if re.search(r'[\u0900-\u097f]', raw_text):
        return "hi"

    if any(marker in clean for marker in TANGLISH_MARKERS):
        return "ta"
    
    # If session has persisted language and current text is short/neutral, preserve session language
    if current_session_lang and current_session_lang in ["ta", "hi"] and len(clean.split()) <= 4:
        return current_session_lang

    try:
        det = language_detector.detect(raw_text)
        detected = det.get("language", "en")
        if detected in ["ta", "hi", "en"]:
            # Guard against false "hi" detection on short english words
            if detected == "hi" and all(ord(c) < 128 for c in raw_text):
                return current_session_lang or "en"
            return detected
        return current_session_lang or "en"
    except Exception:
        return current_session_lang or "en"

def detect_category_smart(raw_text: str) -> str:
    clean = raw_text.lower()
    
    # Strip negated phrases like "not a property issue", "not about rent", "not property"
    clean_for_cat = re.sub(r'\b(not|never|instead\s+of|no)\s+(a\s+|an\s+|about\s+)?(property|land|rent|tenant|salary|consumer|product|cyber|fraud|cheque)\b(\s+(issue|problem|dispute|case))?', '', clean)
    
    # Helper to test whole word or regex match
    def matches_any(patterns, text):
        for p in patterns:
            if re.search(r'\b' + re.escape(p) + r'\b', text, re.IGNORECASE) or (any(ord(c) >= 128 for c in p) and p in text):
                return True
        return False

    # 1. High-priority compound domain checks
    # Property / Land / Registration Fraud (e.g. sale deed, ownership transfer, document details, patta)
    property_tokens = [
        "property document", "sale deed", "ownership transfer", "patta", "chitta", "encroachment",
        "boundary", "partition", "sothu", "nila", "nilam", "vivasayam", "bhoomi", "survey",
        "sub-registrar", "sub registrar", "registration", "land record", "நிலம்", "நில", "சொத்து",
        "எல்லை", "ஆக்கிரமிப்பு", "பட்டா", "சிட்டா", "பத்திரம்", "பாகப்பிரிவினை", "மனை", "வீட்டுமனை",
        "வில்லங்கம்", "கிரயம்", "கிரய பத்திரம்", "நிலத்தின்"
    ]
    if matches_any(property_tokens, clean_for_cat) or ("property" in clean_for_cat and any(w in clean_for_cat for w in ["document", "problem", "issue", "deed", "transfer", "land", "coimbatore", "chennai"])):
        return "PROPERTY_DISPUTE"

    # Cybercrime & Online Fraud
    cyber_tokens = [
        "cyber", "otp", "phishing", "scam", "hacked", "upi fraud", "telegram scam", "money lost",
        "unauthorized transaction", "online fraud", "இணைய மோசடி", "வங்கி மோசடி", "பணம் பறிப்பு", "சைபர்"
    ]
    if matches_any(cyber_tokens, clean_for_cat):
        return "CYBER_CRIME"

    # Tenancy / Landlord / Rent
    tenancy_tokens = [
        "landlord", "tenant", "rent", "deposit", "advance", "eviction", "vadagai", "vaadagai", "kiraya",
        "வாடகை", "முன்பணம்", "காலி", "வீட்டு உரிமையாளர்", "வாடகைதாரர்"
    ]
    if matches_any(tenancy_tokens, clean_for_cat):
        return "TENANCY_DISPUTE"

    # Labour / Salary / Wages
    labour_tokens = [
        "salary", "wage", "wages", "unpaid salary", "employer", "terminate", "dismiss", "sambalam",
        "velai", "factory", "pf", "esi", "சம்பளம்", "ஊதியம்", "பணி", "வேலை", "முதலாளி", "நிறுவனம்", "பணிநீக்கம்"
    ]
    if matches_any(labour_tokens, clean_for_cat):
        return "LABOUR_DISPUTE"

    # Consumer Complaint / Defective Product
    consumer_tokens = [
        "product", "defective", "warranty", "consumer", "amazon", "flipkart", "store", "repair", "refund",
        "deficiency of service", "defective goods", "நுகர்வோர்", "பொருள்", "பழுது", "சேவை குறைபாடு", "வாரண்டி"
    ]
    if matches_any(consumer_tokens, clean_for_cat):
        return "CONSUMER_COMPLAINT"

    # Cheque Dishonour / Financial Fraud
    if matches_any(["cheque bounce", "dishonour", "section 138", "promissory note", "bounced cheque"], clean_for_cat):
        return "FINANCIAL_FRAUD"

    # Motor Accident Claims
    if matches_any(["accident", "hit and run", "mact", "vehicle hit", "car crashed", "bike collided", "lorry hit", "fracture in accident", "vahan vibath", "vibathu"], clean_for_cat):
        return "MOTOR_ACCIDENT_CLAIM"

    # Medical Negligence
    if matches_any(["doctor", "hospital", "surgery", "operation failed", "medical negligence", "malpractice", "wrong medicine", "maruthuvamanai"], clean_for_cat):
        return "MEDICAL_NEGLIGENCE"

    # Pension & Gratuity (Strict whole-word pattern to prevent 'ippo' matching 'ppo')
    if re.search(r'\b(pension|gratuity\s+delay|retirement\s+benefits?|pf\s+settlement|ppo\s+application|pension\s+payment\s+order|retire\s+panam)\b', clean_for_cat, re.IGNORECASE):
        return "GOVERNMENT_PENSION_DELAY"

    # Senior Citizen Abuse
    if matches_any(["senior citizen", "elderly parent", "father mother maintenance", "old age abuse", "muthiyor"], clean_for_cat):
        return "SENIOR_CITIZEN_ABUSE"

    # Workplace Harassment (POSH)
    if matches_any(["posh", "workplace harassment", "boss harassing female", "office harassment"], clean_for_cat):
        return "WORKPLACE_HARASSMENT"

    # Domestic Violence
    if matches_any(["domestic violence", "husband beating", "in-laws harassment", "dowry", "kodumai", "manaivi"], clean_for_cat):
        return "WOMEN_SAFETY_DOMESTIC_VIOLENCE"

    # Utility / Electricity
    if matches_any(["electricity", "power bill", "eb bill", "meter fast", "tneb", "power cut", "minsaram", "current bill"], clean_for_cat):
        return "ELECTRICITY_UTILITY_DISPUTE"

    # RTI
    if matches_any(["rti", "right to information", "information officer", "pio", "appeal not replied", "thakaval urimai"], clean_for_cat):
        return "RTI_APPLICATION"

    # Corruption / DVAC
    if matches_any(["bribe", "bribery", "dvac", "corruption", "officer asking money", "lanjam"], clean_for_cat):
        return "CORRUPTION_BRIBERY"

    # Police Misconduct
    if matches_any(["police refuse fir", "police beating", "custodial", "kavalthurai"], clean_for_cat):
        return "POLICE_MISCONDUCT"

    # Education
    if matches_any(["school fee", "college fee", "capitation", "tc withholding", "transfer certificate", "school extra fee", "ragging"], clean_for_cat):
        return "EDUCATION_DISPUTE"

    # Fallback to ML / Keyword Classifier
    try:
        pred = predict_category(clean_for_cat)
        cat = pred.get("category", "GENERAL_LEGAL_AID")
        if cat in TAXONOMY_MAP:
            return cat
    except Exception:
        pass
        
    return "GENERAL_LEGAL_AID"

def ask_chatbot_engine(
    message: str,
    language: str = None,
    user_role: str = "CITIZEN",
    complaint_id: int = None,
    case_context: str = None,
    session_id: str = None,
    location: Dict[str, Any] = None
) -> Dict[str, Any]:
    if not message or not message.strip():
        return {
            "responseType": "CLARIFICATION",
            "language": "en",
            "problemSummary": "Please describe your legal grievance or question.",
            "reply": "Please describe your legal issue or question in your own words.",
            "answer": "Please describe your legal issue or question in your own words.",
            "category": "GENERAL_LEGAL_AID",
            "is_conversational": True,
            "questions": ["What type of legal assistance do you need?"],
            "options": ["Property Dispute", "Tenancy Issue", "Labour / Salary", "Consumer Complaint", "Cyber Fraud"]
        }

    raw_message = message.strip()
    session_key = session_id or f"sess_{int(time.time()*1000)}"
    existing_state = conversation_manager.get_or_create_state(session_key, language=language or "en")
    
    # Classify intent first
    intent_type, intent_meta = classify_intent(raw_message)

    # 1. Handle Language Selection Intent (e.g. "tamil?", "தமிழ்ல பேசுங்க", "thannglish la pesa mudium ha")
    if intent_type == INTENTS["LANGUAGE_SELECTION"]:
        target_lang = intent_meta.get("selected_language", "ta")
        conversation_manager.set_language(session_key, "ta" if target_lang == "ta_tanglish" else target_lang)

        if target_lang == "ta_tanglish":
            reply_text = "Kandippa pesa mudiyum! 👍 Ungalukku enna legal problem or doubt irukku nu Tanglish-laye sollunga. Naan ungalukku thelivaana sattam matrum procedure solren."
            opts = []
        elif target_lang == "hi_hinglish":
            reply_text = "Haan zaroor! Main Hinglish mein bhi baat kar sakta hoon. 👍 Aapko kis legal problem ya issue mein madad chahiye? Aap Hinglish ya Hindi mein bataiye, main guide karunga."
            opts = []
        elif target_lang == "ta":
            reply_text = "வணக்கம்! நான் தமிழில் பேசுகிறேன் 👍\n\nஉங்கள் சட்டப் பிரச்சனை அல்லது கேள்வியைப் பற்றி கூறுங்கள். நான் உங்களுக்கு தகுந்த சட்டப் பிரிவுகள் மற்றும் தீர்வு முறைகளை விளக்குகிறேன்."
            opts = []
        elif target_lang == "hi":
            reply_text = "नमस्ते! मैं हिंदी में बात कर सकता हूँ 👍\n\nकृपया अपनी कानूनी समस्या या प्रश्न बताएं। मैं आपको सही कानून, आवश्यक दस्तावेज और शिकायत दर्ज करने की प्रक्रिया के बारे में मार्गदर्शन करूँगा।"
            opts = []
        else:
            reply_text = "Hello! I have switched to English 👍\n\nPlease describe your legal issue or question. I will guide you with relevant statutory sections, required documents, and where to file your grievance."
            opts = []

        return {
            "responseType": "LANGUAGE_SELECTION",
            "language": "hi" if target_lang == "hi_hinglish" else ("ta" if target_lang == "ta_tanglish" else target_lang),
            "category": "CONVERSATIONAL",
            "understanding": reply_text,
            "reply": reply_text,
            "answer": reply_text,
            "is_conversational": True,
            "is_greeting": False,
            "options": [],
            "disclaimer": DISCLAIMER,
            "sessionId": session_key
        }

    # 2. Handle In-Chat Submit Complaint Intent
    if intent_type == INTENTS["SUBMIT_COMPLAINT"]:
        cat = existing_state.get("category") or "GENERAL_LEGAL_AID"
        facts = existing_state.get("facts", [])
        desc = " ".join(facts) if facts else "Citizen Legal Aid Complaint"
        
        reply_submit = "📝 உங்கள் புகார் விவரங்கள் தயார்! கீழேயுள்ள 'Submit Complaint' பட்டனை அழுத்தவும் அல்லது நான் உடனடியாக உங்கள் புகாரை அதிகாரப்பூர்வமாக பதிவு செய்கிறேன்." if (language or "en").startswith("ta") else "📝 Your grievance details are ready! Submitting directly to the official ARAM Legal Registry..."
        
        return {
            "responseType": "SUBMIT_COMPLAINT_READY",
            "language": language or "en",
            "category": cat,
            "title": desc[:60] + "...",
            "description": desc,
            "priority": "HIGH" if cat in ["WOMEN_SAFETY", "DOMESTIC_VIOLENCE", "CRIMINAL_COMPLAINT", "MEDICAL_NEGLIGENCE"] else "MEDIUM",
            "understanding": reply_submit,
            "reply": reply_submit,
            "answer": reply_submit,
            "is_conversational": True,
            "canDirectSubmit": True,
            "complaintPayload": {
                "title": desc[:60] if len(desc) > 5 else "Citizen Legal Grievance",
                "description": desc if len(desc) > 5 else "Legal Aid Assistance Request",
                "category": cat,
                "district": "Coimbatore",
                "priority": "HIGH" if cat in ["WOMEN_SAFETY", "DOMESTIC_VIOLENCE", "CRIMINAL_COMPLAINT", "MEDICAL_NEGLIGENCE"] else "MEDIUM",
                "language": (language or "en").upper()
            },
            "options": ["Confirm & Submit Complaint", "Add More Information", "Cancel"],
            "disclaimer": DISCLAIMER,
            "sessionId": session_key
        }

    # 2. Handle Greeting Intent (e.g. "hi", "hello", "vanakkam")
    resolved_lang = detect_language_smart(raw_message, current_session_lang=existing_state.get("language"), requested_lang=language)
    
    if intent_type == INTENTS["GREETING"]:
        if resolved_lang == "ta":
            greeting_reply = "வணக்கம்! 👋 நான் உங்கள் அறம் (ARAM) AI சட்ட உதவி உதவியாளர். உங்கள் சட்டப் பிரச்சனை அல்லது கேள்வியை விவரிக்கவும், தகுந்த சட்டப் பிரிவுகள் மற்றும் அடுத்த கட்ட நடவடிக்கை முறைகளை விளக்குகிறேன்."
        elif resolved_lang == "hi":
            greeting_reply = "नमस्ते! 👋 मैं आपका अराम (ARAM) AI कानूनी सहायक हूँ। आप अपनी किसी भी कानूनी समस्या का विवरण यहाँ दे सकते हैं।"
        else:
            greeting_reply = "Vanakkam! 👋 I am your ARAM AI Legal Assistant. You can describe any legal problem, dispute, notice, or question in Tamil, English, or Hindi to get legal guidance, required document checklists, and official redressal routing. How can I assist you today?"

        return {
            "responseType": "GREETING",
            "language": resolved_lang,
            "understanding": greeting_reply,
            "category": "CONVERSATIONAL",
            "severity": "LOW",
            "reply": greeting_reply,
            "answer": greeting_reply,
            "disclaimer": DISCLAIMER,
            "provider": "conversational",
            "grounded": True,
            "is_conversational": True,
            "is_greeting": True,
            "options": [],
            "sessionId": session_key
        }


    # 3. Handle Thanks Intent
    if intent_type == INTENTS["THANKS"]:
        if resolved_lang == "ta":
            thx_reply = "மகிழ்ச்சி! 👍 உங்களுக்கு மேலும் சட்ட உதவி அல்லது புகார் பதிவு செய்ய உதவி தேவைப்பட்டால் தயங்காமல் கேளுங்கள்."
        elif resolved_lang == "hi":
            thx_reply = "आपका स्वागत है! यदि आपको किसी और कानूनी सहायता की आवश्यकता है, तो बेझिझक पूछें।"
        else:
            thx_reply = "You're very welcome! If you need further legal clarification or want to file a formal grievance, I am here to help."

        return {
            "responseType": "THANKS",
            "language": resolved_lang,
            "category": "CONVERSATIONAL",
            "understanding": thx_reply,
            "reply": thx_reply,
            "answer": thx_reply,
            "is_conversational": True,
            "is_greeting": False,
            "disclaimer": DISCLAIMER,
            "sessionId": session_key
        }

    # 4. Handle Goodbye Intent
    if intent_type == INTENTS["GOODBYE"]:
        if resolved_lang == "ta":
            bye_reply = "நன்றி, போய் வருகிறேன்! ஏதேனும் சட்ட உதவி தேவைப்படும்போது எப்போது வேண்டுமானாலும் அறம் (ARAM) தளத்திற்கு வரலாம். பாதுகாப்பாக இருங்கள்!"
        elif resolved_lang == "hi":
            bye_reply = "अलविदा! किसी भी कानूनी सहायता के लिए आप कभी भी अराम (ARAM) पर लौट सकते हैं। सुरक्षित रहें!"
        else:
            bye_reply = "Goodbye! Whenever you need legal aid or official guidance, ARAM is always here for you. Stay safe!"

        return {
            "responseType": "GOODBYE",
            "language": resolved_lang,
            "category": "CONVERSATIONAL",
            "understanding": bye_reply,
            "reply": bye_reply,
            "answer": bye_reply,
            "is_conversational": True,
            "is_greeting": False,
            "disclaimer": DISCLAIMER,
            "sessionId": session_key
        }

    # 5. Handle General Conversation / Help Intent
    if intent_type == INTENTS["GENERAL_CONVERSATION"]:
        if resolved_lang == "ta":
            help_reply = "அறம் (ARAM) AI என்பது சாமானிய குடிமக்களுக்கான சட்ட உதவி வழிகாட்டி. \n\nநான் உங்களுக்கு:\n1. நிலம் / பட்டா / எல்லை தகராறுகள்\n2. வாடகை & வீட்டின் முன்பணம் தகராறுகள்\n3. தொழிலாளர் ஊதிய பாக்கிகள்\n4. நுகர்வோர் சேவை குறைபாடுகள்\n5. இணைய வழி பண மோசடி\n\nஆகியவற்றிற்கு சட்டப் பிரிவுகள், தேவையான ஆவணங்கள் மற்றும் அணுக வேண்டிய அதிகாரிகளை (DLSA/RDO) அடையாளம் காட்டி தருகிறேன். உங்கள் பிரச்சனையை விவரிக்கவும்."
        elif resolved_lang == "hi":
            help_reply = "अराम (ARAM) AI नागरिकों के लिए एक कानूनी सहायता प्रणाली है। मैं संपत्ति विवाद, किराया, उपभोक्ता शिकायत, मजदूरी और साइबर अपराध से संबंधित कानूनों और कानूनी प्रक्रियाओं में आपकी मदद कर सकता हूँ। अपनी समस्या बताएं।"
        else:
            help_reply = "ARAM AI is your conversational legal aid assistant. I help citizens understand applicable Indian statutes, required document checklists, and appropriate redressal authorities (DLSA, Tahsildar, Consumer Forum, Labour Commissioner, Cyber Crime Cell). How can I help you today?"

        return {
            "responseType": "GENERAL_CONVERSATION",
            "language": resolved_lang,
            "category": "CONVERSATIONAL",
            "understanding": help_reply,
            "reply": help_reply,
            "answer": help_reply,
            "is_conversational": True,
            "is_greeting": False,
            "options": ["Property Boundary Dispute", "Security Deposit Refund", "Unpaid Salary Claim", "Defective Goods Consumer Redressal", "Online Financial Scam"],
            "disclaimer": DISCLAIMER,
            "sessionId": session_key
        }

    # 6. Emergency & Safety Check
    if intent_type == INTENTS["EMERGENCY"]:
        em_msg = "⚠️ அவசர உதவி / IMMEDIATE SAFETY NOTICE: உங்கள் உயிருக்கோ அல்லது பாதுகாப்பிற்கோ உடனடி அச்சுறுத்தல் இருந்தால், உடனடியாக காவல்துறை அவசர உதவி எண் 112 அல்லது பெண்கள் உதவி எண் 181-ஐ அழைக்கவும்." if resolved_lang == "ta" else "⚠️ IMMEDIATE SAFETY NOTICE: If you are in immediate physical danger, please immediately call Emergency Helpline 112 or Women Helpline 181. ARAM has flagged this grievance for priority human assistance."
        return {
            "responseType": "EMERGENCY",
            "language": resolved_lang,
            "problemSummary": "Urgent Safety / Protection Alert",
            "reply": em_msg,
            "answer": em_msg,
            "category": "WOMEN_SAFETY_DOMESTIC_VIOLENCE",
            "is_conversational": False,
            "human_review_required": True,
            "emergency": True,
            "where_to_complain": ["Police Emergency: 112", "Women Helpline: 181", "Protection Officer"],
            "what_you_can_do_now": ["Contact Emergency 112 immediately", "Reach safe shelter", "Request DLSA emergency legal aid"],
            "disclaimer": DISCLAIMER,
            "sessionId": session_key
        }

    # 6.5 Multi-Case Decomposition Check
    sub_cases = decompose_multi_case(raw_message)
    if len(sub_cases) >= 2:
        case_items = []
        options = []
        for sc in sub_cases:
            ctype = sc["case_type"]
            tax = TAXONOMY_MAP.get(ctype, TAXONOMY_MAP.get("GENERAL_LEGAL_AID"))
            case_items.append({
                "type": ctype,
                "name": tax.get("name"),
                "law": tax.get("act_en"),
                "section": tax.get("section_en"),
                "authority": tax.get("authority")
            })
            options.append(f"Guide on {tax.get('name')}")
        
        if resolved_lang == "ta":
            multi_reply = "நான் உங்கள் மனுவில் பல சட்டச் சிக்கல்களை (Multiple Legal Issues) கண்டறிந்துள்ளேன்:\n\n"
            for i, item in enumerate(case_items):
                multi_reply += f"📌 **{i+1}. {item['name']}:**\n• **சட்டம்:** {item['law']} ({item['section']})\n• **அதிகாரம்:** {item['authority']}\n\n"
            multi_reply += "💡 நீங்கள் இந்த பிரச்சனைகளை தனித்தனியாகவோ அல்லது ஒருங்கிணைத்தோ தீர்க்கலாம். எந்த விவகாரத்திற்கு முதலில் விரிவான உதவி வேண்டும்?"
        elif resolved_lang == "hi":
            multi_reply = "मैंने आपके संदेश में कई कानूनी मामलों (Multiple Legal Issues) की पहचान की है:\n\n"
            for i, item in enumerate(case_items):
                multi_reply += f"📌 **{i+1}. {item['name']}:**\n• **कानून:** {item['law']} ({item['section']})\n• **प्राधिकरण:** {item['authority']}\n\n"
            multi_reply += "💡 आप इनमें से किस विषय पर पहले विस्तृत मार्गदर्शन चाहते हैं?"
        else:
            multi_reply = "I have identified multiple distinct legal issues in your query:\n\n"
            for i, item in enumerate(case_items):
                multi_reply += f"📌 **{i+1}. {item['name']}:**\n• **Statute:** {item['law']} ({item['section']})\n• **Redressal Authority:** {item['authority']}\n\n"
            multi_reply += "💡 You can address these issues individually or file them as separate grievances. Which one would you like detailed guidance on first?"

        options.append("File Formal Complaint for All")

        return {
            "responseType": "MULTI_CASE_ASSESSMENT",
            "language": resolved_lang,
            "category": "MULTI_CASE",
            "understanding": multi_reply,
            "reply": multi_reply,
            "answer": multi_reply,
            "subCases": case_items,
            "options": options,
            "is_conversational": True,
            "is_greeting": False,
            "disclaimer": DISCLAIMER,
            "sessionId": session_key
        }

    # 7. Predict Category & Jurisdiction
    raw_lower = raw_message.lower()
    is_topic_correction = any(phrase in raw_lower for phrase in [
        "not a property", "not property", "not rent", "not salary", "not consumer", "not cyber",
        "actually it is", "actually this is", "instead of", "changed my mind", "wrong category",
        "about my employer", "about salary", "about property", "about rent", "about money lost",
        "about defective", "about landlord"
    ])

    prev_category = existing_state.get("category")
    new_detected_cat = detect_category_smart(raw_message)

    if is_topic_correction or not prev_category or prev_category in ["GENERAL_LEGAL_AID", "CONVERSATIONAL"]:
        predicted_cat = new_detected_cat
    else:
        # If user message is short or doesn't have clear new domain triggers, preserve existing category
        if len(raw_message.split()) <= 5 or new_detected_cat == "GENERAL_LEGAL_AID":
            predicted_cat = prev_category
        else:
            predicted_cat = new_detected_cat

    tax_info = TAXONOMY_MAP.get(predicted_cat, TAXONOMY_MAP["GENERAL_LEGAL_AID"])
    cat_id = tax_info["id"]
    cat_name = predicted_cat
    rec_authority = tax_info["authority"]
    req_docs = tax_info["documents"]

    # Extract user state/district
    user_state = "Tamil Nadu"
    user_district = "Coimbatore"
    if location and isinstance(location, dict):
        user_state = location.get("state", user_state)
        user_district = location.get("district", user_district)
    else:
        text_loc = detect_jurisdiction_from_text(raw_message, default_state="Tamil Nadu")
        user_state = text_loc.get("state", "Tamil Nadu")

    # 8. Multi-Turn Conversation State Check
    sess_state = conversation_manager.update_state(
        session_id=session_key,
        user_message=raw_message,
        category=cat_name,
        language=resolved_lang
    )
    if is_topic_correction:
        sess_state["facts"] = [raw_message]
        sess_state["subCategory"] = None
        conversation_manager.save_state(session_key, sess_state)

    completeness_check = conversation_manager.assess_completeness(sess_state, raw_message)
    if not completeness_check["isComplete"]:
        clarification_text = completeness_check["clarificationPrompt"]
        options = completeness_check["options"]
        return {
            "responseType": "CLARIFICATION",
            "language": resolved_lang,
            "problemSummary": raw_message,
            "category": cat_name,
            "understanding": clarification_text,
            "reply": clarification_text,
            "answer": clarification_text,
            "questions": ["Which specific type of problem best describes your situation?"],
            "options": options,
            "is_conversational": True,
            "is_greeting": False,
            "sessionId": sess_state.get("sessionId"),
            "suggestedActions": options[:3],
            "disclaimer": DISCLAIMER
        }

    # 9. Jurisdiction-Aware RAG Retrieval with Legal Relevance Gating
    history_summary = " ".join(sess_state.get("facts", []))
    retrieval_query = f"{history_summary} {raw_message}".strip() if len(raw_message.split()) <= 4 else raw_message
    retrieval_res = legal_retriever.retrieve(
        query=retrieval_query,
        category=cat_name,
        user_state=user_state,
        language_override=resolved_lang,
        history_summary=history_summary
    )

    # 10. LLM Provider Router & Generation
    rag_response: RAGStructuredResponse = generate_rag_response(
        query=raw_message,
        language=resolved_lang,
        category_id=cat_id,
        category_name=cat_name,
        recommended_authority=rec_authority,
        required_documents=req_docs,
        retrieval_result=retrieval_res,
        case_summary=history_summary
    )

    res_dict = rag_response.model_dump()

    if isinstance(res_dict.get("category"), dict):
        res_dict["category"] = res_dict["category"].get("name", cat_name)

    res_dict["responseType"] = "FULL_ASSESSMENT"
    res_dict["sessionId"] = sess_state.get("sessionId")
    res_dict["understanding"] = res_dict.get("problemUnderstanding")
    res_dict["documents_required"] = res_dict.get("documents")
    res_dict["procedure"] = res_dict.get("nextSteps")
    res_dict["where_to_complain"] = [rec_authority]
    res_dict["human_review_required"] = res_dict.get("humanReviewRequired", False)
    res_dict["humanReviewRequired"] = res_dict["human_review_required"]
    res_dict["what_you_can_do_now"] = res_dict.get("suggestedActions", res_dict.get("nextSteps", []))
    res_dict["is_conversational"] = False
    res_dict["is_greeting"] = False

    laws_list = res_dict.get("laws") or []
    is_fail_closed = (
        res_dict.get("rag_status") == "NO_RELEVANT_SOURCE" or
        not laws_list or
        not retrieval_res.has_sufficient_context
    )

    if is_fail_closed:
        res_dict["applicableLaw"] = None
        res_dict["section"] = None
        res_dict["relevantProvisions"] = []
        res_dict["documents_required"] = []
        res_dict["documents"] = []
        res_dict["where_to_complain"] = []
        res_dict["recommendedAuthority"] = None
        res_dict["authorityVerified"] = False
        res_dict["authorityProvenance"] = {
            "authority": None,
            "verified": False,
            "sourceChunkId": None,
            "routingNote": "No specific authority routing could be verified from available sources."
        }
        res_dict["explanation"] = res_dict.get("problemUnderstanding")
        res_dict["groundedPenalty"] = "No specific statutory penalty could be verified from available sources."
        res_dict["human_review_required"] = True
        res_dict["humanReviewRequired"] = True
    else:
        first_law = laws_list[0]
        res_dict["relevantProvisions"] = laws_list
        res_dict["applicableLaw"] = first_law.get("actName")
        res_dict["section"] = first_law.get("section") or first_law.get("provision")
        res_dict["explanation"] = first_law.get("explanation") or res_dict.get("problemUnderstanding")
        res_dict["where_to_complain"] = [rec_authority] if rec_authority else []
        res_dict["recommendedAuthority"] = rec_authority
        res_dict["authorityVerified"] = True
        res_dict["documents_required"] = req_docs
        res_dict["documents"] = req_docs
        
        punishment_info = res_dict.get("punishment")
        if isinstance(punishment_info, dict):
            res_dict["groundedPenalty"] = punishment_info.get("details")
        elif isinstance(punishment_info, str):
            res_dict["groundedPenalty"] = punishment_info

    if res_dict.get("reply"):
        res_dict["reply"] = sanitize_chat_reply(res_dict["reply"])
    if res_dict.get("answer"):
        res_dict["answer"] = sanitize_chat_reply(res_dict["answer"])

    # Update conversation state with final assessment
    sess_state["legalAssessment"] = {
        "applicableLaw": res_dict.get("applicableLaw"),
        "section": res_dict.get("section"),
        "authority": res_dict.get("recommendedAuthority"),
        "documents": res_dict.get("documents_required", []),
        "summary": res_dict.get("understanding")
    }
    conversation_manager.save_state(sess_state.get("sessionId"), sess_state)

    return res_dict
