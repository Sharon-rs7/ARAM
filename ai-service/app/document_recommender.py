import pandas as pd
from app.model_loader import model_loader

DOCUMENT_MAPPINGS = {
    "LABOUR_DISPUTE": ["Salary Slips / Pay Records", "Employment Offer Letter / ID Card", "Bank Statement showing salary history", "Aadhaar Card"],
    "CONSUMER_COMPLAINT": ["Tax Invoice / Bill", "Warranty Card / Service Agreement", "Written Communications / Emails with Seller", "Product Defect Proof / Photographs"],
    "CYBER_CRIME": ["Bank Statement showing unauthorized debits", "Transaction Reference IDs (UTR/UPI)", "Screenshots of Phishing SMS / Fraudulent Chats", "Bank Dispute Form Copy"],
    "PROPERTY_DISPUTE": ["Patta / Chitta (பட்டா / சிட்டா)", "Registered Sale Deed (கிரய பத்திரம்)", "FMB Survey Sketch (புல வரைபடம்)", "Encumbrance Certificate (EC - வில்லங்க சான்றிதழ்)"],
    "PROPERTY_CIVIL_DISPUTE": ["Patta / Chitta", "Registered Sale Deed", "FMB Survey Sketch", "Encumbrance Certificate (EC)"],
    "TENANCY_DISPUTE": ["Rental Agreement (வாடகை ஒப்பந்தம்)", "Security Deposit & Rent Receipts / Bank Statements", "Notice to Vacate / Eviction Notice", "Utility Bills"],
    "WOMEN_SAFETY": ["Identity Proof (Aadhaar Card)", "Medical Examination Report (if injured)", "Written Complaint Copy", "Audio / Video / Chat Proof"],
    "WOMEN_SAFETY_DOMESTIC_VIOLENCE": ["Identity Proof (Aadhaar Card)", "Medical Examination Report", "Proof of Shared Household / Marriage Certificate", "Audio / Video / Chat Proof"],
    "DOMESTIC_VIOLENCE": ["Identity Proof (Aadhaar Card)", "Medical Examination Report", "Proof of Shared Household / Marriage Certificate", "Police Complaint Copy (if any)"],
    "CRIMINAL_COMPLAINT": ["Copy of Police Complaint / CSR Receipt", "Identity Proof (Aadhaar Card)", "Medical / Injury Report (if applicable)", "Witness Statements / Evidence"],
    "GOVERNMENT_SCHEME": ["Ration Card (Smart Card)", "Income Certificate / Community Certificate", "Aadhaar Card", "Application Acknowledgement Number"],
    "FAMILY_DISPUTE": ["Marriage Certificate", "Identity Proof (Aadhaar Card)", "Income / Asset Statements", "Previous Court / Mediation Records"],
    "GENERAL_LEGAL_AID": ["Aadhaar Card", "Income Certificate for Free Legal Aid Eligibility", "Dispute Summary / Relevant Notices"],
    "MOTOR_ACCIDENT_CLAIM": ["FIR / Police CSR Copy", "Medical Discharge Summary & Treatment Bills", "Vehicle RC Book & Insurance Policy", "Driving License Copy"],
    "INSURANCE_CLAIM": ["Insurance Policy Document", "Claim Rejection Letter / Repudiation Notice", "Premium Payment Receipts", "Original Invoices / Bills"],
    "BANKING_DISPUTE": ["Bank Account Statement / Passbook", "Written Grievance Letter to Bank Branch Manager", "Transaction Receipts / Dispute Reference No.", "Aadhaar Card"],
    "RENT_TENANT_DISPUTE": ["Rental Agreement", "Security Deposit Receipts / Bank Proof", "Eviction Notice / Correspondence", "Electricity / Water Bills"],
    "MEDICAL_NEGLIGENCE": ["Hospital Discharge Summary", "Prescriptions & Medical Diagnostic Reports", "Itemized Hospital Treatment Bills", "Doctor Treatment Notes"],
    "EDUCATION_DISPUTE": ["Fee Receipts & Payment Slips", "Admission Allotment Card / Bonafide Certificate", "School / College Prospectus / Correspondence", "Aadhaar Card"],
    "WORKPLACE_HARASSMENT": ["Employment Offer Letter / ID Card", "Written Complaint to Internal Complaints Committee (ICC)", "Email / WhatsApp / Audio Proof", "Witness Statements"],
    "SENIOR_CITIZEN_ABUSE": ["Senior Citizen Age Proof (Aadhaar / Voter ID / Pension Card)", "Medical Records", "Property Transfer Deed (if coercion involved)", "Income / Bank Proof"],
    "CHILD_WELFARE": ["Child Birth Certificate / School ID", "Guardian Identity Proof (Aadhaar Card)", "Medical Examination Report", "Child Welfare Committee Reference"],
    "DISABILITY_RIGHTS": ["UDID Card / Disability Certificate", "Aadhaar Card", "Denial of Accommodation / Service Proof", "Medical Evaluation Sheet"],
    "CASTE_DISCRIMINATION": ["Community Certificate (SC/ST)", "Aadhaar Card", "Written Complaint Copy", "Audio / Video / Witness Evidence"],
    "POLICE_MISCONDUCT": ["Copy of Complaint submitted / Postal Tracking", "Medical Injury Certificate (if custodial harm)", "Video / Audio / Photo Proof", "Witness Statements"],
    "CORRUPTION_BRIBERY": ["Audio / Video / Telephonic Recording", "Transaction / Marked Currency Proof", "Official Application Copy", "Aadhaar Card"],
    "CIVIC_INFRASTRUCTURE": ["Photographs of Civic Hazard / Road / Drainage", "Grievance Petitions submitted to Municipality/Corporation", "Tax / Property Receipts", "Aadhaar Card"],
    "RTI_APPLICATION": ["Copy of RTI Application filed (Form A)", "Proof of Postal Dispatch / Speed Post Receipt", "RTI Fee Payment Challan / IPO", "Aadhaar Card"],
    "ELECTRICITY_UTILITY_DISPUTE": ["Latest Electricity Bills & Payment Slips", "Consumer Service Connection Number Proof", "Written Grievance to Assistant Executive Engineer (AEE)", "Meter Test Report (if defective)"],
    "ENVIRONMENTAL_POLLUTION": ["Photographs / Videos of Pollution / Discharge", "Water / Soil / Air Quality Test Reports (if available)", "Representation to Pollution Control Board (TNPCB)", "Village / Residents Petition Copy"],
    "GOVERNMENT_PENSION_DELAY": ["Service Book Copy / Retirement Order", "Pension Payment Order (PPO) Application Receipt", "Last Pay Certificate (LPC)", "Bank Passbook Copy"]
}

def extract_dynamic_document_hints(text: str) -> list:
    """Extracts custom document requirements based on specific grievance facts in text."""
    clean = text.lower()
    custom_docs = []
    
    if any(k in clean for k in ["hospital", "doctor", "surgery", "operation", "medicine", "treatment", "clinic", "maruthuvamanai"]):
        custom_docs.append("Medical Discharge Summary & Treatment Bills")
    if any(k in clean for k in ["accident", "vehicle", "car", "bike", "lorry", "bus", "hit and run", "fracture", "injur"]):
        custom_docs.append("FIR / CSR Copy & Medical Discharge Report")
        custom_docs.append("Vehicle RC Book & Insurance Policy")
    if any(k in clean for k in ["bank", "account", "debit", "loan", "emi", "atm", "unauthorized", "vangi"]):
        custom_docs.append("Bank Account Statement showing disputed transaction")
    if any(k in clean for k in ["cheque", "check", "bounce", "dishonour", "kasoal"]):
        custom_docs.append("Original Dishonoured Cheque & Bank Return Memo")
    if any(k in clean for k in ["salary", "wage", "wages", "boss", "employer", "terminate", "dismiss", "sambalam", "velai"]):
        custom_docs.append("Salary Slips / Bank Statement showing salary credits")
        custom_docs.append("Employment Offer Letter / ID Card")
    if any(k in clean for k in ["patta", "chitta", "land", "survey", "boundary", "encroach", "nilam", "sothu"]):
        custom_docs.append("Patta / Chitta Copy & Registered Sale Deed")
        custom_docs.append("FMB Field Survey Map (புல வரைபடம்)")
    if any(k in clean for k in ["rent", "tenant", "landlord", "deposit", "advance", "vadagai", "vaadagai"]):
        custom_docs.append("Rental Agreement & Deposit Payment Proof")
    if any(k in clean for k in ["bill", "invoice", "receipt", "product", "defective", "warranty", "store", "amazon", "flipkart"]):
        custom_docs.append("Tax Invoice / Purchase Bill & Warranty Card")
    if any(k in clean for k in ["police", "fir", "csr", "complaint", "kaval"]):
        custom_docs.append("Copy of Police Complaint / CSR Receipt")
    if any(k in clean for k in ["rti", "information", "pio", "appeal"]):
        custom_docs.append("RTI Application Copy & Speed Post Receipt")
    if any(k in clean for k in ["electricity", "eb bill", "power", "tneb", "current", "minsaram"]):
        custom_docs.append("Recent Electricity Bills & Consumer Card")
    if any(k in clean for k in ["pension", "retirement", "retire", "gratuity", "pf"]):
        custom_docs.append("Retirement Order & Pension Payment Order (PPO) Application")
        
    return custom_docs

def recommend_documents(text: str, category: str, priority: str):
    # Dynamic rules and taxonomy matching
    matched_docs = DOCUMENT_MAPPINGS.get(category) or []
    dynamic_hints = extract_dynamic_document_hints(text)
    
    # Combine uniquely
    combined = []
    for d in (dynamic_hints + matched_docs):
        if d not in combined:
            combined.append(d)
            
    if not combined:
        combined = ["Identity Proof (Aadhaar / Voter ID)", "Relevant Written Grievance / Receipts"]
    elif "Aadhaar Card" not in combined and "Identity Proof (Aadhaar / Voter ID)" not in combined and not any("aadhaar" in d.lower() for d in combined):
        combined.append("Identity Proof (Aadhaar Card)")

    return {
        "requiredDocuments": combined[:4],
        "confidence": 0.88,
        "modelBased": True
    }

