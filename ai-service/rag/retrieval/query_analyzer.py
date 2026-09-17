import re
from typing import Dict, Any, List, Set, Optional
from rag.retrieval.jurisdiction_filter import detect_jurisdiction_from_text, STATE_SYNONYMS

LEGAL_CONCEPT_DICTIONARY = {
    # Property & Registration
    'property': ['property', 'land', 'plot', 'house', 'flat', 'building', 'sothu', 'idam', 'veedu', 'sampatti', 'bhumi', 'jamin'],
    'document': ['document', 'deed', 'sale deed', 'patta', 'chitta', 'ec', 'encumbrance', 'patram', 'aavanam', 'bainama', 'dastavej'],
    'registration': ['registration', 'sub registrar', 'registrar', 'padhivu', 'register', 'panjikaran', 'patta transfer'],
    'unauthorized_transfer': ['unauthorized transfer', 'misuse', 'fake document', 'fraudulent transfer', 'ownership transfer', 'thavarana maatram', 'fraud', 'forgery', 'impersonation', 'dhokhadhadi'],
    
    # Cyber & Technology
    'cyber_crime': ['online', 'internet', 'portal', 'transaction', 'otp', 'cyber', 'phishing', 'hacking', 'unauthorized online', 'inaiyam'],
    
    # Tenancy & Rent
    'tenancy': ['rent', 'tenant', 'landlord', 'eviction', 'deposit', 'security deposit', 'vaadagai', 'kiraya', 'makan malik'],
    
    # Labour & Employment
    'shops_commercial': ['commercial establishment', 'shops and commercial', 'shops and establishments', 'working hours', 'shop license', 'shop registration'],
    'labour_wages': ['salary', 'wages', 'unpaid', 'gratuity', 'termination', 'overtime', 'sambalam', 'velai', 'vetan', 'panikodai', 'workman', 'employee', 'employer'],
    'workplace_harassment': ['posh', 'harassment', 'icc', 'sexual harassment', 'workplace', 'paniyidam'],
    
    # Consumer & Services
    'consumer': ['consumer', 'defective', 'warranty', 'refund', 'replacement', 'service deficiency', 'porul kuraipaadu', 'grahak'],
    'food_safety': ['food safety', 'adulteration', 'food product', 'unhygienic', 'unwholesome', 'kalapadam', 'khadya'],
    
    # Civic, Administrative & Public Service
    'public_service': ['public service', 'delay in certificate', 'citizen charter', 'time limit exceeded', 'sevai thirampu', 'lokayukta', 'corruption', 'bribe', 'lancham'],
    'public_records': ['public records', 'archive', 'historical records', 'public record', 'record officer', 'state archives'],
    'electricity': ['electricity', 'eb bill', 'power supply', 'meter defect', 'minsaaram', 'vidyut'],
    'environmental': ['pollution', 'effluent', 'toxic waste', 'emission', 'canal pollution', 'maasu', 'pradushan'],
    
    # Taxation & Finance
    'tax_cess': ['cess', 'tax', 'gst', 'goods and services tax', 'input tax credit', 'tax arrears', 'recovery of arrears', 'taxation', 'assessment appeal', 'arrears of tax', 'customs'],
    'cooperative': ['cooperative', 'co-operative', 'sahakari', 'souharda', 'society members', 'society arbitration'],
    'state_security': ['special public security', 'unlawful organization', 'unlawful activity', 'public security', 'advisory board'],
    'town_planning': ['town and country planning', 'town improvement', 'planning regulation', 'zoning', 'development authority'],

    # Social & Personal
    'senior_citizen': ['senior citizen', 'parents maintenance', 'old age', 'gift deed cancellation', 'muthiyor', 'vriddha'],
    'domestic_violence': ['domestic violence', 'shared household', 'dowry', 'kudumba vanmurai', 'gharelu hinsa'],
    'motor_accident': ['motor accident', 'mact', 'hit and run', 'vehicle collision', 'vibhathu', 'durghatna'],
    
    # Education
    'education': ['admission', 'university', 'professional educational', 'tuition fee', 'capitation fee', 'transfer certificate', 'bonafide', 'kalvi']
}

DOMAIN_MAPPING = {
    'property': 'PROPERTY_DISPUTE',
    'document': 'PROPERTY_DISPUTE',
    'registration': 'PROPERTY_DISPUTE',
    'unauthorized_transfer': 'PROPERTY_DISPUTE',
    'cyber_crime': 'CYBER_CRIME',
    'tenancy': 'TENANCY_DISPUTE',
    'shops_commercial': 'LABOUR_DISPUTE',
    'labour_wages': 'LABOUR_DISPUTE',
    'workplace_harassment': 'WORKPLACE_HARASSMENT',
    'consumer': 'CONSUMER_COMPLAINT',
    'food_safety': 'CONSUMER_COMPLAINT',
    'public_service': 'ADMINISTRATIVE_DISPUTE',
    'public_records': 'ADMINISTRATIVE_DISPUTE',
    'tax_cess': 'TAX_DISPUTE',
    'cooperative': 'COOPERATIVE_DISPUTE',
    'state_security': 'STATE_SECURITY',
    'town_planning': 'PROPERTY_MUNICIPAL',
    'electricity': 'ELECTRICITY_UTILITY_DISPUTE',
    'environmental': 'ENVIRONMENTAL_POLLUTION',
    'senior_citizen': 'SENIOR_CITIZEN_ABUSE',
    'domestic_violence': 'DOMESTIC_VIOLENCE',
    'motor_accident': 'MOTOR_ACCIDENT_CLAIM',
    'education': 'EDUCATION_DISPUTE'
}

INTENT_KEYWORDS = {
    'STATUTE_INQUIRY': ['law', 'act', 'section', 'sattam', 'pirivu', 'dhara', 'statute', 'provision', 'amendment', 'rules'],
    'AUTHORITY_DISCOVERY': ['authority', 'office', 'officer', 'whom', 'where', 'yarkita', 'yaarkita', 'enga', 'approach', 'complain', 'police', 'court', 'tribunal', 'commission'],
    'EVIDENCE_INQUIRY': ['document', 'proof', 'evidence', 'aavanam', 'patta', 'chitta', 'receipt', 'deed', 'dastavej', 'records', 'ready-a vechikanum', 'documents venum'],
    'PROCEDURE_INQUIRY': ['action', 'step', 'first action', 'procedure', 'how to', 'eppadi', 'kaise', 'complaint pananum', 'edukkanum']
}

STOPWORDS = {
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'with', 'by',
    'and', 'or', 'nu', 'naan', 'en', 'enakku', 'oru', 'kitta', 'dhaan', 'irukku', 'la', 'aana',
    'try', 'panranga', 'therinjadhu', 'nadandhirukku', 'innum', 'kudukkala', 'ippo', 'enna',
    'entha', 'sollunga', 'macha', 'sir', 'recently', 'old', 'check', 'pannumbothu', 'theriyama',
    'yaaro', 'use', 'panni', 'pannirukanga', 'please', 'help', 'me', 'i', 'my', 'have'
}

class QueryAnalyzer:
    """
    Dynamic NLP Multi-Representation Legal Query Analyzer.
    Extracts legal concepts, multi-domain associations, jurisdiction context,
    and generates 5 distinct retrieval representations.
    """

    @staticmethod
    def clean_text(text: str) -> str:
        text = re.sub(r'[^\w\s\-\(\)\.,]', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    @classmethod
    def extract_legal_concepts(cls, text: str) -> List[str]:
        clean = text.lower()
        matched_concepts = []
        for concept_name, triggers in LEGAL_CONCEPT_DICTIONARY.items():
            for trig in triggers:
                pattern = r'\b' + re.escape(trig) + r'\b'
                if re.search(pattern, clean):
                    matched_concepts.append(concept_name)
                    break
        return matched_concepts

    @classmethod
    def detect_domains(cls, text: str, primary_category: Optional[str] = None) -> List[str]:
        concepts = cls.extract_legal_concepts(text)
        domains = []
        for c in concepts:
            dom = DOMAIN_MAPPING.get(c)
            if dom and dom not in domains:
                domains.append(dom)
                
        if primary_category and primary_category not in domains and primary_category != 'GENERAL_LEGAL_AID':
            domains.insert(0, primary_category)
            
        if not domains:
            domains = ['GENERAL_LEGAL_AID'] if not primary_category else [primary_category]
        return domains

    @classmethod
    def extract_keywords(cls, text: str) -> List[str]:
        tokens = re.findall(r'\b[a-zA-Z0-9_\-]{3,}\b', text.lower())
        keywords = [t for t in tokens if t not in STOPWORDS]
        return list(dict.fromkeys(keywords))

    @classmethod
    def detect_intents(cls, text: str) -> List[str]:
        clean = text.lower()
        detected = []
        for intent, kws in INTENT_KEYWORDS.items():
            if any(re.search(r'\b' + re.escape(w) + r'\b', clean) for w in kws):
                detected.append(intent)
        return detected if detected else ['GENERAL_GRIEVANCE']

    @classmethod
    def analyze(
        cls,
        raw_query: str,
        category: str = 'GENERAL_LEGAL_AID',
        user_state: str = 'Tamil Nadu',
        history_summary: str = ''
    ) -> Dict[str, Any]:
        original = raw_query.strip()
        cleaned = cls.clean_text(original)
        
        # 1. Jurisdiction Detection
        jur_info = detect_jurisdiction_from_text(cleaned, default_state=user_state)
        state_name = jur_info.get('state', user_state)

        # 2. Concept & Multi-Domain Detection
        detected_concepts = cls.extract_legal_concepts(cleaned)
        detected_domains = cls.detect_domains(cleaned, primary_category=category)
        intents = cls.detect_intents(cleaned)
        keywords = cls.extract_keywords(cleaned)

        # 3. Generate Multi-Representation Query Formulations
        # Representation 1: Original Query
        rep_original = original

        # Representation 2: Normalized Semantic Query
        norm_tokens = [k for k in keywords if len(k) > 2]
        rep_normalized = " ".join(norm_tokens) if norm_tokens else cleaned

        # Representation 3: Legal Concept Query
        legal_concept_terms = []
        for c in detected_concepts:
            legal_concept_terms.extend(LEGAL_CONCEPT_DICTIONARY.get(c, [])[:3])
        rep_legal_concept = " ".join(list(dict.fromkeys(legal_concept_terms))) if legal_concept_terms else rep_normalized

        # Representation 4: Keyword Query
        rep_keyword = " ".join(keywords[:12])

        # Representation 5: Jurisdiction & Domain-Aware Query
        rep_jurisdiction = f"{rep_legal_concept} {state_name} {category}".strip()

        if history_summary:
            rep_jurisdiction = f"{rep_jurisdiction} {history_summary}".strip()

        return {
            'originalQuery': rep_original,
            'normalizedQuery': rep_normalized,
            'legalConceptQuery': rep_legal_concept,
            'keywordQuery': rep_keyword,
            'jurisdictionAwareQuery': rep_jurisdiction,
            'detectedDomains': detected_domains,
            'jurisdiction': jur_info,
            'intents': intents,
            'keywords': keywords,
            'concepts': detected_concepts,
            'primaryCategory': category
        }

query_analyzer = QueryAnalyzer()
