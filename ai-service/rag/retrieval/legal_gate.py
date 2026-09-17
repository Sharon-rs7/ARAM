from typing import Dict, Any, List, Optional, Tuple
from rag.retrieval.jurisdiction_filter import get_chunk_state, get_act_domain, is_chunk_jurisdiction_compatible

ALLOWED_DOMAINS_BY_CATEGORY = {
    'PROPERTY_DISPUTE': {
        'PROPERTY_DISPUTE', 'PROPERTY_CIVIL_DISPUTE', 'PROPERTY_MUNICIPAL', 'TENANCY_DISPUTE', 'GENERAL_LEGAL_AID'
    },
    'PROPERTY_CIVIL_DISPUTE': {
        'PROPERTY_DISPUTE', 'PROPERTY_CIVIL_DISPUTE', 'PROPERTY_MUNICIPAL', 'TENANCY_DISPUTE', 'GENERAL_LEGAL_AID'
    },
    'PROPERTY_MUNICIPAL': {
        'PROPERTY_MUNICIPAL', 'PROPERTY_DISPUTE', 'CIVIC_MUNICIPAL', 'GENERAL_LEGAL_AID'
    },
    'TENANCY_DISPUTE': {
        'TENANCY_DISPUTE', 'PROPERTY_DISPUTE', 'GENERAL_LEGAL_AID'
    },
    'RENT_TENANT_DISPUTE': {
        'TENANCY_DISPUTE', 'PROPERTY_DISPUTE', 'GENERAL_LEGAL_AID'
    },
    'LABOUR_DISPUTE': {
        'LABOUR_DISPUTE', 'GENERAL_LEGAL_AID'
    },
    'CONSUMER_COMPLAINT': {
        'CONSUMER_COMPLAINT', 'CIVIC_MUNICIPAL', 'PUBLIC_HEALTH', 'GENERAL_LEGAL_AID'
    },
    'CYBER_CRIME': {
        'CYBER_CRIME', 'FINANCIAL_FRAUD', 'CRIMINAL_COMPLAINT', 'GENERAL_LEGAL_AID'
    },
    'FINANCIAL_FRAUD': {
        'FINANCIAL_FRAUD', 'CYBER_CRIME', 'CRIMINAL_COMPLAINT', 'TAX_GST', 'GENERAL_LEGAL_AID'
    },
    'TAX_DISPUTE': {
        'TAX_GST', 'TAX_CESS', 'AGRICULTURE_TAX', 'GENERAL_LEGAL_AID'
    },
    'TAX_GST': {
        'TAX_GST', 'TAX_CESS', 'AGRICULTURE_TAX', 'GENERAL_LEGAL_AID'
    },
    'TAX_CESS': {
        'TAX_CESS', 'TAX_GST', 'AGRICULTURE_TAX', 'GENERAL_LEGAL_AID'
    },
    'COOPERATIVE': {
        'COOPERATIVE', 'ADMINISTRATIVE', 'GENERAL_LEGAL_AID'
    },
    'COOPERATIVE_DISPUTE': {
        'COOPERATIVE', 'ADMINISTRATIVE', 'GENERAL_LEGAL_AID'
    },
    'ADMINISTRATIVE': {
        'ADMINISTRATIVE', 'CORRUPTION_LOKAYUKTA', 'GENERAL_LEGAL_AID'
    },
    'ADMINISTRATIVE_DISPUTE': {
        'ADMINISTRATIVE', 'CORRUPTION_LOKAYUKTA', 'GENERAL_LEGAL_AID'
    },
    'STATE_SECURITY': {
        'STATE_SECURITY', 'CRIMINAL_COMPLAINT', 'GENERAL_LEGAL_AID'
    },
    'WOMEN_SAFETY_DOMESTIC_VIOLENCE': {
        'WOMEN_SAFETY_DOMESTIC_VIOLENCE', 'CRIMINAL_COMPLAINT', 'GENERAL_LEGAL_AID'
    },
    'DOMESTIC_VIOLENCE': {
        'WOMEN_SAFETY_DOMESTIC_VIOLENCE', 'CRIMINAL_COMPLAINT', 'GENERAL_LEGAL_AID'
    },
    'WOMEN_SAFETY': {
        'WOMEN_SAFETY_DOMESTIC_VIOLENCE', 'CRIMINAL_COMPLAINT', 'GENERAL_LEGAL_AID'
    },
    'MOTOR_ACCIDENT_CLAIM': {
        'MOTOR_ACCIDENT', 'CRIMINAL_COMPLAINT', 'GENERAL_LEGAL_AID'
    },
    'MEDICAL_NEGLIGENCE': {
        'CONSUMER_COMPLAINT', 'PUBLIC_HEALTH', 'GENERAL_LEGAL_AID'
    },
    'ELECTRICITY_UTILITY_DISPUTE': {
        'ELECTRICITY_UTILITY', 'CIVIC_MUNICIPAL', 'GENERAL_LEGAL_AID'
    },
    'RTI_APPLICATION': {
        'ADMINISTRATIVE', 'GENERAL_LEGAL_AID'
    },
    'GOVERNMENT_PENSION_DELAY': {
        'PENSION_BENEFITS', 'LABOUR_DISPUTE', 'GENERAL_LEGAL_AID'
    },
    'SENIOR_CITIZEN_ABUSE': {
        'SENIOR_CITIZEN_ABUSE', 'PROPERTY_DISPUTE', 'GENERAL_LEGAL_AID'
    },
    'CIVIC_INFRASTRUCTURE': {
        'CIVIC_MUNICIPAL', 'PROPERTY_MUNICIPAL', 'GENERAL_LEGAL_AID'
    },
    'CIVIC_MUNICIPAL': {
        'CIVIC_MUNICIPAL', 'PROPERTY_MUNICIPAL', 'GENERAL_LEGAL_AID'
    },
    'CRIMINAL_COMPLAINT': {
        'CRIMINAL_COMPLAINT', 'CYBER_CRIME', 'WOMEN_SAFETY_DOMESTIC_VIOLENCE', 'STATE_SECURITY', 'GENERAL_LEGAL_AID'
    },
    'POLICE_MISCONDUCT': {
        'CRIMINAL_COMPLAINT', 'ADMINISTRATIVE', 'STATE_SECURITY', 'GENERAL_LEGAL_AID'
    },
    'CORRUPTION_BRIBERY': {
        'CORRUPTION_LOKAYUKTA', 'CRIMINAL_COMPLAINT', 'ADMINISTRATIVE', 'GENERAL_LEGAL_AID'
    },
    'EDUCATION_DISPUTE': {
        'EDUCATION', 'ADMINISTRATIVE', 'GENERAL_LEGAL_AID'
    },
    'MARITIME_DISPUTE': {
        'MARITIME_SHIPPING', 'LABOUR_DISPUTE', 'GENERAL_LEGAL_AID'
    },
    'SPORTS_DISPUTE': {
        'SPORTS_ANTI_DOPING', 'ADMINISTRATIVE', 'GENERAL_LEGAL_AID'
    },
    'AGRICULTURE_DISPUTE': {
        'AGRICULTURE', 'AGRICULTURE_TAX', 'GENERAL_LEGAL_AID'
    },
    'GENERAL_LEGAL_AID': {
        'GENERAL_LEGAL_AID', 'PROPERTY_DISPUTE', 'PROPERTY_CIVIL_DISPUTE', 'PROPERTY_MUNICIPAL',
        'TENANCY_DISPUTE', 'LABOUR_DISPUTE', 'CONSUMER_COMPLAINT', 'CYBER_CRIME', 'EDUCATION',
        'MARITIME_SHIPPING', 'SPORTS_ANTI_DOPING', 'AGRICULTURE', 'AGRICULTURE_TAX', 'TAX_GST',
        'TAX_CESS', 'COOPERATIVE', 'ADMINISTRATIVE', 'STATE_SECURITY', 'CRIMINAL_COMPLAINT',
        'CORRUPTION_LOKAYUKTA', 'CIVIC_MUNICIPAL', 'PENSION_BENEFITS', 'PUBLIC_HEALTH',
        'EMERGENCY_SERVICES', 'FINANCIAL_FRAUD', 'GENERAL_STATUTE'
    }
}

# Domain-specific trigger keywords to prevent false rejection when user legitimately asks about them
NOISE_ACT_EXEMPTION_KEYWORDS = {
    'MERCHANT SHIPPING': ['ship', 'shipping', 'maritime', 'seafarer', 'vessel', 'cargo', 'sea', 'port'],
    'INDIAN PORTS': ['port', 'berthing', 'dock', 'harbor', 'harbour', 'maritime', 'vessel'],
    'NATIONAL ANTI-DOPING': ['doping', 'anti-doping', 'athlete', 'sports', 'prohibited substance', 'wada', 'nada'],
    'SUGARCANE CESS': ['sugarcane', 'cane', 'sugar cess', 'sugar mill'],
    'ANIMAL BREEDING': ['animal breeding', 'breeding', 'livestock', 'cattle breeding', 'canine', 'breeder'],
    'PENSION': ['pension', 'superannuation', 'ppo', 'retirement', 'gratuity delay', 'oyvoothiyam', 'pensioner', 'adhiniyam']
}

GLOBAL_REJECTED_ACT_PATTERNS = [
    'MERCHANT SHIPPING', 'INDIAN PORTS', 'NATIONAL ANTI-DOPING',
    'SUGARCANE CESS', 'ANIMAL BREEDING', 'RABHA HASONG', 'MISING AUTONOMOUS',
    'SONOWAL KACHARI', 'THENGAL KACHARI', 'TIWA AUTONOMOUS', 'DEORI AUTONOMOUS',
    'MANDIR NYAS', 'PENSION'
]

class LegalRelevanceGate:
    """
    Strict validation gate before passing retrieved legal chunks to LLM synthesis.
    Enforces:
    1. Cross-jurisdiction verification (e.g. Maharashtra acts rejected for Tamil Nadu).
    2. Strict Allowlist Domain Matching.
    3. Noise & Irrelevant Act Elimination with context-aware exemptions.
    """

    @staticmethod
    def validate_chunk(
        chunk: Dict[str, Any],
        category: str,
        user_state: str = 'Tamil Nadu',
        user_intent: str = 'GENERAL_GRIEVANCE',
        query_text: str = ''
    ) -> Tuple[bool, str]:
        title = str(chunk.get('title', chunk.get('act_name', '')))
        jurisdiction = str(chunk.get('jurisdiction', ''))
        
        chunk_state = get_chunk_state(jurisdiction, title)
        act_domain = get_act_domain(title)
        t_upper = title.upper()
        q_lower = query_text.lower() if query_text else ''

        # 1. Reject Global Noise Acts unless explicitly exempted by query keywords
        for noise in GLOBAL_REJECTED_ACT_PATTERNS:
            if noise in t_upper:
                exempt_keywords = NOISE_ACT_EXEMPTION_KEYWORDS.get(noise, [])
                has_explicit_intent = any(kw in q_lower for kw in exempt_keywords)
                if not has_explicit_intent and category not in ['MARITIME_DISPUTE', 'SPORTS_DISPUTE', 'AGRICULTURE_DISPUTE']:
                    return False, f"Rejected: Noise act '{noise}' is irrelevant to civic query"

        # 2. Check Jurisdiction Compatibility
        if not is_chunk_jurisdiction_compatible(chunk_state, user_state):
            return False, f"Jurisdiction mismatch: chunk from {chunk_state}, user in {user_state}"

        # 3. Specific State Act Checks
        if 'LOKAYUKTA' in t_upper and user_state.lower() != 'maharashtra':
            return False, f"Rejected: {title} is state-specific to Maharashtra"

        # 4. Strict Domain Allowlist
        allowed_domains = ALLOWED_DOMAINS_BY_CATEGORY.get(category, {'GENERAL_LEGAL_AID'})
        if act_domain not in allowed_domains:
            return False, f"Domain mismatch: {act_domain} is not in allowed domains {allowed_domains} for {category}"

        return True, "Accepted: Chunk passed legal relevance gate"

    @classmethod
    def filter_chunks(
        cls,
        chunks: List[Dict[str, Any]],
        category: str,
        user_state: str = 'Tamil Nadu',
        user_intent: str = 'GENERAL_GRIEVANCE'
    ) -> List[Tuple[Dict[str, Any], str]]:
        passed = []
        for c in chunks:
            ok, reason = cls.validate_chunk(c, category, user_state, user_intent)
            if ok:
                passed.append((c, reason))
        return passed

legal_gate = LegalRelevanceGate()
