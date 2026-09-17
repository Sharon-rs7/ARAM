import re

def clean_legal_text(text: str) -> str:
    """
    Cleans raw legal document text while preserving section markers,
    statutory numbers, and paragraph structure.
    """
    if not text:
        return ""
    
    # Remove picture placeholders and common PDF extraction artifacts
    text = re.sub(r'==>\s*picture\s*\[.*?\]\s*intentionally\s*omitted\s*<==', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\[Regd\.\s*No\.\s*[^\]]+\]', '', text, flags=re.IGNORECASE)
    text = re.sub(r'RNI\s*No\.\s*[^\n]+', '', text, flags=re.IGNORECASE)
    text = re.sub(r'SERIES\s+[IVXLCDM]+\s+No\.\s*\d+', '', text, flags=re.IGNORECASE)
    text = re.sub(r'EXTRAORDINARY\s+GOVERNMENT\s+OF\s+[^\n]+', '', text, flags=re.IGNORECASE)
    
    # Normalize multiple whitespaces and excessive linebreaks
    text = re.sub(r'\r\n', '\n', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'[ \t]{2,}', ' ', text)
    
    return text.strip()
