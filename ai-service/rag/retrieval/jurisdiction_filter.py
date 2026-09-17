import re
from typing import Dict, Any, List, Optional, Set

STATE_SYNONYMS = {
    'tamil nadu': 'Tamil Nadu',
    'tn': 'Tamil Nadu',
    'tamilnadu': 'Tamil Nadu',
    'chennai': 'Tamil Nadu',
    'coimbatore': 'Tamil Nadu',
    'madurai': 'Tamil Nadu',
    'tiruchirappalli': 'Tamil Nadu',
    'salem': 'Tamil Nadu',
    'tirunelveli': 'Tamil Nadu',
    'tiruppur': 'Tamil Nadu',
    'erode': 'Tamil Nadu',
    'vellore': 'Tamil Nadu',
    'thoothukudi': 'Tamil Nadu',
    'dindigul': 'Tamil Nadu',
    'thanjavur': 'Tamil Nadu',
    'kanyakumari': 'Tamil Nadu',
    'puducherry': 'Puducherry',
    'pondicherry': 'Puducherry',
    'karnataka': 'Karnataka',
    'bangalore': 'Karnataka',
    'bengaluru': 'Karnataka',
    'mysore': 'Karnataka',
    'maharashtra': 'Maharashtra',
    'mumbai': 'Maharashtra',
    'pune': 'Maharashtra',
    'delhi': 'Delhi',
    'new delhi': 'Delhi',
    'uttar pradesh': 'Uttar Pradesh',
    'up': 'Uttar Pradesh',
    'lucknow': 'Uttar Pradesh',
    'kanpur': 'Uttar Pradesh',
    'varanasi': 'Uttar Pradesh',
    'bihar': 'Bihar',
    'patna': 'Bihar',
    'kerala': 'Kerala',
    'kochi': 'Kerala',
    'thiruvananthapuram': 'Kerala',
    'punjab': 'Punjab',
    'chandigarh': 'Punjab',
    'goa': 'Goa',
    'panaji': 'Goa',
    'odisha': 'Odisha',
    'bhubaneswar': 'Odisha',
    'assam': 'Assam',
    'guwahati': 'Assam',
    'haryana': 'Haryana',
    'gurugram': 'Haryana',
    'manipur': 'Manipur',
    'meghalaya': 'Meghalaya',
    'uttarakhand': 'Uttarakhand',
    'dehradun': 'Uttarakhand'
}

ACT_DOMAIN_MAP = {
    'MERCHANT SHIPPING': 'MARITIME_SHIPPING',
    'INDIAN PORTS': 'MARITIME_SHIPPING',
    'NATIONAL ANTI-DOPING': 'SPORTS_ANTI_DOPING',
    'LOKAYUKTA': 'CORRUPTION_LOKAYUKTA',
    'SPECIAL PUBLIC SECURITY': 'STATE_SECURITY',
    'SUGARCANE CESS': 'AGRICULTURE_TAX',
    'AGRICULTURAL PRODUCE AND LIVESTOCK': 'AGRICULTURE',
    'ANIMAL BREEDING': 'AGRICULTURE',
    'SHOPS AND COMMERCIAL ESTABLISHMENTS': 'LABOUR_DISPUTE',
    'SHOPS AND ESTABLISHMENTS': 'LABOUR_DISPUTE',
    'ESSENTIAL SERVICES MAINTENANCE': 'LABOUR_DISPUTE',
    'PAYMENT OF WAGES': 'LABOUR_DISPUTE',
    'INDUSTRIAL DISPUTES': 'LABOUR_DISPUTE',
    'RENT': 'TENANCY_DISPUTE',
    'LANDLORDS AND TENANTS': 'TENANCY_DISPUTE',
    'LAND REFORMS': 'PROPERTY_DISPUTE',
    'PATTA PASS BOOK': 'PROPERTY_DISPUTE',
    'TRANSFER OF PROPERTY': 'PROPERTY_DISPUTE',
    'REGISTRATION': 'PROPERTY_DISPUTE',
    'TOWN IMPROVEMENT': 'PROPERTY_MUNICIPAL',
    'TOWN AND COUNTRY PLANNING': 'PROPERTY_MUNICIPAL',
    'PUDUCHERRY MUNICIPALITIES': 'CIVIC_MUNICIPAL',
    'PANCAYAT RAJ': 'CIVIC_MUNICIPAL',
    'PANCAYAT': 'CIVIC_MUNICIPAL',
    'PANCHAYAT': 'CIVIC_MUNICIPAL',
    'CIVIC AMENITIES': 'CIVIC_MUNICIPAL',
    'URBAN LOCAL BODIES': 'CIVIC_MUNICIPAL',
    'RIGHT TO PUBLIC SERVICE': 'ADMINISTRATIVE',
    'FOOD SAFETY AND CONSUMER PROTECTION': 'CONSUMER_COMPLAINT',
    'CONSUMER PROTECTION': 'CONSUMER_COMPLAINT',
    'FOOD AND SECURITY': 'CONSUMER_COMPLAINT',
    'ADMISSION IN PROFESSIONAL EDUCATIONAL': 'EDUCATION',
    'UNIVERSITIES': 'EDUCATION',
    'EDUCATION SERVICE': 'EDUCATION',
    'FREE AND COMPULSORY EDUCATION': 'EDUCATION',
    'GOODS AND SERVICES TAX': 'TAX_GST',
    'RECOVERY OF ARREARS OF TAX': 'TAX_GST',
    'MOTOR VEHICLES TAXATION': 'TAX_GST',
    'PUBLIC RECORDS': 'ADMINISTRATIVE',
    'MANDIR NYAS': 'RELIGIOUS_TRUST',
    'AUTONOMOUS COUNCIL': 'TRIBAL_ADMIN',
    'SOUHARDA SAHAKARI': 'COOPERATIVE',
    'FIRE FORCE': 'EMERGENCY_SERVICES',
    'PENSION': 'PENSION_BENEFITS',
    'HEALTH SECURITY': 'TAX_CESS',
    'NATIONAL SECURITY CESS': 'TAX_CESS',
    'INFORMATION TECHNOLOGY': 'CYBER_CRIME',
    'BHARATIYA NYAYA SANHITA': 'CRIMINAL_COMPLAINT',
    'BHARATIYA NAGARIK SURAKSHA': 'CRIMINAL_COMPLAINT',
    'PENAL CODE': 'CRIMINAL_COMPLAINT',
    'CODE OF CRIMINAL PROCEDURE': 'CRIMINAL_COMPLAINT',
    'NEGOTIABLE INSTRUMENTS': 'FINANCIAL_FRAUD',
    'MAINTENANCE AND WELFARE OF PARENTS': 'SENIOR_CITIZEN_ABUSE',
    'DOMESTIC VIOLENCE': 'WOMEN_SAFETY_DOMESTIC_VIOLENCE',
    'LEGAL SERVICES AUTHORITIES': 'GENERAL_LEGAL_AID'
}

def detect_jurisdiction_from_text(text: str, default_state: str = 'Tamil Nadu') -> Dict[str, str]:
    if not text:
        return {'state': default_state, 'country': 'India'}
    clean = text.lower()
    for token, state in STATE_SYNONYMS.items():
        pattern = r'\b' + re.escape(token) + r'\b'
        if re.search(pattern, clean):
            return {'state': state, 'country': 'India'}
    return {'state': default_state, 'country': 'India'}

def get_chunk_state(jurisdiction_str: str, title_str: str = '') -> str:
    j_clean = (jurisdiction_str or '').lower()
    t_clean = (title_str or '').lower()
    
    for token, state in STATE_SYNONYMS.items():
        if token in j_clean or token in t_clean:
            return state
            
    if 'central' in j_clean or 'india' in j_clean:
        return 'Central'
    return 'Central'

def get_act_domain(title_str: str) -> str:
    t_upper = (title_str or '').upper()
    for keyword, domain in ACT_DOMAIN_MAP.items():
        if keyword in t_upper:
            return domain
    return 'GENERAL_STATUTE'

def is_chunk_jurisdiction_compatible(chunk_state: str, user_state: str) -> bool:
    if not user_state:
        user_state = 'Tamil Nadu'
    if user_state.lower() in ['central', 'india', 'all', 'national']:
        return True
    if chunk_state == 'Central':
        return True
    if chunk_state.lower() == user_state.lower():
        return True
    if user_state.lower() == 'tamil nadu' and chunk_state.lower() == 'puducherry':
        return True
    return False
