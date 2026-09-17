"""
Multi-Case Decomposition Engine.
Detects when a user statement contains multiple distinct legal issues
(e.g., Unpaid salary + Physical threat + Land dispute) and breaks them into structured sub-cases.
"""
import re
from typing import List, Dict, Any

CASE_INDICATORS = [
    ("LABOUR_DISPUTE", [r"\b(salary|sambalam|wages|unpaid|pending salary|velai panam)\b", r"\b(not paid|kudukala|tharala|balance|owner|employer)\b"]),
    ("CRIMINAL_COMPLAINT", [r"\b(threat|threatened|mirattal|threaten|adi thadi|beat|violence|kolluven|murder|attack)\b"]),
    ("PROPERTY_DISPUTE", [r"\b(land|patta|sothu|property|encroachment|boundary|varampu|pathiram|kabza)\b"]),
    ("CONSUMER_COMPLAINT", [r"\b(defective|warranty|refund|shopkeeper|fraud product|porul mosam|amazon|flipkart)\b"]),
    ("TENANCY_DISPUTE", [r"\b(landlord|tenant|vaadagai|vadagai|advance deposit|eviction|kali panna)\b"]),
    ("CYBER_CRIME", [r"\b(otp|online fraud|phishing|bank scam|cyber|account hacked|unauthorized transaction)\b"])
]

def decompose_multi_case(text: str) -> List[Dict[str, Any]]:
    """
    Returns a list of detected legal issues if 2 or more distinct issues exist.
    """
    lower = text.lower()
    detected_issues = []
    
    for case_type, patterns in CASE_INDICATORS:
        matched = True
        for p in patterns:
            if not re.search(p, lower):
                matched = False
                break
        if matched:
            detected_issues.append({
                "case_type": case_type,
                "raw_query": text
            })
            
    if len(detected_issues) >= 2:
        return detected_issues
    return []
