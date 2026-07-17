import re

def clean_text(text: str) -> str:
    if not text:
        return ""
    # Normalize whitespaces, convert to lowercase
    normalized = text.lower().strip()
    normalized = re.sub(r"\s+", " ", normalized)
    return normalized
