import pandas as pd
from app.model_loader import model_loader

DISTRICT_AUTHORITY_MAPPINGS = {
    "LABOUR_DISPUTE": "District Labour Commissioner Office / Labour Conciliation Officer",
    "CONSUMER_COMPLAINT": "District Consumer Disputes Redressal Commission (DCDRC)",
    "CYBER_CRIME": "Cyber Crime Police Station / National Cybercrime Portal (1930)",
    "PROPERTY_DISPUTE": "Tahsildar / Revenue Divisional Officer (RDO) / Taluk Office",
    "PROPERTY_CIVIL_DISPUTE": "Tahsildar / RDO / Civil Court",
    "TENANCY_DISPUTE": "Rent Court / Rent Tribunal / Taluk Legal Services Committee",
    "WOMEN_SAFETY": "Protection Officer / District Social Welfare Office / Women Helpline 181",
    "WOMEN_SAFETY_DOMESTIC_VIOLENCE": "Protection Officer / District Social Welfare Office / Women Helpline 181",
    "DOMESTIC_VIOLENCE": "Protection Officer / District Social Welfare Office / Women Helpline 181",
    "CRIMINAL_COMPLAINT": "Jurisdictional Police Station / Superintendent of Police (SP) Office",
    "GOVERNMENT_SCHEME": "District Collectorate Grievance Redressal Cell / e-Sevai Center",
    "FAMILY_DISPUTE": "Family Court / DLSA Mediation & Conciliation Centre",
    "GENERAL_LEGAL_AID": "District Legal Services Authority (DLSA)",
    "MOTOR_ACCIDENT_CLAIM": "Motor Accident Claims Tribunal (MACT) / DLSA Lok Adalat",
    "INSURANCE_CLAIM": "Insurance Ombudsman / District Consumer Commission",
    "BANKING_DISPUTE": "Banking Ombudsman (RBI) / Lead District Bank Office",
    "RENT_TENANT_DISPUTE": "Rent Controller Office / Taluk Rent Authority",
    "MEDICAL_NEGLIGENCE": "State Medical Council / District Consumer Disputes Commission",
    "EDUCATION_DISPUTE": "Chief Educational Officer (CEO) / Directorate of School Education",
    "WORKPLACE_HARASSMENT": "Internal Complaints Committee (ICC) / Local Complaints Committee (LCC)",
    "SENIOR_CITIZEN_ABUSE": "Sub-Divisional Magistrate (SDM) / Senior Citizen Maintenance Tribunal",
    "CHILD_WELFARE": "Child Welfare Committee (CWC) / District Child Protection Unit (DCPU)",
    "DISABILITY_RIGHTS": "District Differently Abled Welfare Office (DDAWO) / State Commissioner",
    "CASTE_DISCRIMINATION": "District Vigilance Committee / District Collector Office (SC/ST Cell)",
    "POLICE_MISCONDUCT": "Police Complaints Authority / District Collector Office",
    "CORRUPTION_BRIBERY": "Directorate of Vigilance and Anti-Corruption (DVAC) / Lokayukta",
    "CIVIC_INFRASTRUCTURE": "Municipal Corporation Commissioner / Municipality Grievance Cell",
    "RTI_APPLICATION": "Public Information Officer (PIO) / First Appellate Authority",
    "ELECTRICITY_UTILITY_DISPUTE": "Electricity Consumer Grievance Redressal Forum (CGRF) / Electricity Ombudsman",
    "ENVIRONMENTAL_POLLUTION": "Tamil Nadu Pollution Control Board (TNPCB) / District Collectorate",
    "GOVERNMENT_PENSION_DELAY": "Directorate of Treasuries and Accounts / Accountant General Office"
}

def recommend_authority(text: str, category: str, priority: str = "MEDIUM", district: str = "Coimbatore"):
    dist_clean = (district or "Coimbatore").strip().title()
    clean_text = (text or "").lower()
    
    # Custom keyword overrides
    if any(w in clean_text for w in ["electricity", "eb bill", "power cut", "meter", "tneb"]):
        auth_base = DISTRICT_AUTHORITY_MAPPINGS["ELECTRICITY_UTILITY_DISPUTE"]
    elif any(w in clean_text for w in ["rti", "information act", "pio", "appellate"]):
        auth_base = DISTRICT_AUTHORITY_MAPPINGS["RTI_APPLICATION"]
    elif any(w in clean_text for w in ["accident", "hit and run", "mact", "vehicle crash", "fracture"]):
        auth_base = DISTRICT_AUTHORITY_MAPPINGS["MOTOR_ACCIDENT_CLAIM"]
    elif any(w in clean_text for w in ["hospital", "surgery", "doctor negligence", "medical bills"]):
        auth_base = DISTRICT_AUTHORITY_MAPPINGS["MEDICAL_NEGLIGENCE"]
    elif any(w in clean_text for w in ["pension", "gratuity", "retirement delay"]):
        auth_base = DISTRICT_AUTHORITY_MAPPINGS["GOVERNMENT_PENSION_DELAY"]
    elif any(w in clean_text for w in ["pollution", "chemical waste", "dyeing", "drainage dump"]):
        auth_base = DISTRICT_AUTHORITY_MAPPINGS["ENVIRONMENTAL_POLLUTION"]
    else:
        auth_base = DISTRICT_AUTHORITY_MAPPINGS.get(category, "District Legal Services Authority (DLSA)")
        
    full_authority = f"{auth_base}, {dist_clean}"
    
    return {
        "recommendedAuthority": full_authority,
        "authorityType": category,
        "confidence": 0.90,
        "manualReviewRequired": priority == "URGENT",
        "modelBased": True,
        "prediction_source": "INTELLIGENT_LEGAL_ROUTING"
    }

