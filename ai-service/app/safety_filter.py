import re

DISCLAIMER = "This is preliminary legal aid guidance only, not a final legal opinion."

FORBIDDEN_PATTERNS = [
    (r"you will win", "This guidance is only for preliminary assistance; court decisions are based on evidence presented."),
    (r"court will decide in your favor", "Only a magistrate/judge has authority to make final rulings."),
    (r"final legal advice", "This advice is informative only. Consult an advocate for legal representation."),
    (r"do not contact (police|lawyer)", "It is advised to contact official legal counsel or law enforcement for direct representation.")
]

def sanitize_chat_reply(text: str) -> str:
    if not text:
        return DISCLAIMER
        
    sanitized = text
    for pattern, replacement in FORBIDDEN_PATTERNS:
        sanitized = re.sub(pattern, replacement, sanitized, flags=re.IGNORECASE)
        
    return sanitized
