"""
Multi-Case Decomposition Engine.
Detects when a user statement contains multiple distinct legal issues
(e.g., Unpaid salary + Personal document/Aadhaar misuse + Land dispute) and breaks them into structured sub-cases.
"""
import re
from typing import List, Dict, Any

CASE_INDICATORS = [
    (
        "LABOUR_DISPUTE",
        [
            r"\b(salary|sambalam|wages|unpaid|pending salary|velai panam|employment|employer|manager|office|work panren|working in|company)\b",
            r"\b(not paid|refused|refused to pay|not paying|non-payment|credit aagala|kudukala|tharala|varala|varale|kidaikala|balance|owner|withheld|original documents|certificates|deduction|arrears|did not pay|didn't pay)\b"
        ]
    ),
    (
        "CYBER_CRIME",
        [
            r"\b(aadhaar|pan card|bank details|otp|bank account|personal documents|identity|unauthorized|permission illama|financial transaction|loan)\b",
            r"\b(misuse|misused|fraud|scam|process panna|phishing|hacked|forgery|debited|without permission|unauthorized use|unauthorized|fake|stolen|theft|impersonat)\b"
        ]
    ),
    (
        "CRIMINAL_COMPLAINT",
        [
            r"\b(threat|threatened|mirattal|threaten|adi thadi|beat|violence|kolluven|murder|attack|assault|physical harm)\b"
        ]
    ),
    (
        "PROPERTY_DISPUTE",
        [
            r"\b(land|patta|sothu|property|encroachment|boundary|varampu|pathiram|kabza|sale deed|registration fraud)\b"
        ]
    ),
    (
        "CONSUMER_COMPLAINT",
        [
            r"\b(defective|warranty|refund|shopkeeper|fraud product|porul mosam|amazon|flipkart|service deficiency)\b"
        ]
    ),
    (
        "TENANCY_DISPUTE",
        [
            r"\b(landlord|tenant|vaadagai|vadagai|advance deposit|security deposit|eviction|kali panna|rent)\b"
        ]
    ),
    (
        "WOMEN_SAFETY_DOMESTIC_VIOLENCE",
        [
            r"\b(domestic violence|dowry|varadatchanai|in-laws|husband harassment|abuse|women safety|181)\b"
        ]
    )
]

def decompose_multi_case(text: str) -> List[Dict[str, Any]]:
    """
    Returns a list of detected legal issues if 2 or more distinct issues exist in the text.
    """
    if not text:
        return []

    lower = text.lower()
    detected_issues = []
    
    # Check explicit multi-issue mentions
    has_explicit_multi = bool(re.search(r"\b(2 separate issues|two separate issues|rendu issue|rendu separate|multiple issues|separate case)\b", lower))

    for case_type, pattern_groups in CASE_INDICATORS:
        matched = True
        for p in pattern_groups:
            if not re.search(p, lower):
                matched = False
                break
        if matched:
            detected_issues.append({
                "case_type": case_type,
                "raw_query": text
            })

    if len(detected_issues) >= 2 or (has_explicit_multi and len(detected_issues) >= 1):
        return detected_issues
    return []

