import re
from typing import Dict, Any, List, Optional
from rag.retrieval.jurisdiction_filter import detect_jurisdiction_from_text

INTENT_KEYWORDS = {
    'AUTHORITY_DISCOVERY': ['yarkita', 'yaarkita', 'enga', 'where', 'whom', 'who to', 'authority', 'office', 'officer', 'police', 'court', 'tahsildar', 'rdo', 'forum', 'approach'],
    'STATUTE_INQUIRY': ['law', 'act', 'section', 'sattam', 'pirivu', 'dhara', 'statute', 'provision'],
    'PENALTY_INQUIRY': ['punish', 'penalty', 'fine', 'jail', 'imprisonment', 'thandanai', 'dand'],
    'PROCEDURE_INQUIRY': ['procedure', 'steps', 'process', 'how to', 'eppadi', 'kaise', 'complaint pananum', 'apply'],
    'EVIDENCE_INQUIRY': ['document', 'proof', 'evidence', 'aavanam', 'patta', 'chitta', 'receipt', 'deed', 'dastavej']
}

def detect_legal_intent(text: str) -> str:
    clean = text.lower()
    for intent, kws in INTENT_KEYWORDS.items():
        if any(w in clean for w in kws):
            return intent
    return 'GENERAL_GRIEVANCE'

def normalize_legal_query(
    raw_text: str,
    category: str = 'GENERAL_LEGAL_AID',
    user_state: str = 'Tamil Nadu',
    history_summary: str = ''
) -> Dict[str, Any]:
    clean = raw_text.strip()
    intent = detect_legal_intent(clean)
    jur_info = detect_jurisdiction_from_text(clean, default_state=user_state)
    
    # Keep the user's actual semantic words as primary query
    # Only append the state and intent tokens to assist jurisdiction without poisoning domain terms
    combined_search_terms = f"{clean} {jur_info['state']}".strip()
    if history_summary:
        combined_search_terms = f"{combined_search_terms} {history_summary}".strip()
        
    return {
        'originalQuery': clean,
        'intent': intent,
        'category': category,
        'jurisdiction': jur_info,
        'enrichedSearchQuery': combined_search_terms
    }
