import re
import unicodedata

def clean_text(text: str) -> str:
    if not text:
        return ""
    # Lowercase
    text = text.lower()
    # Normalize unicode
    text = unicodedata.normalize("NFKC", text)
    # Remove excessive spaces and newlines
    text = re.sub(r"\s+", " ", text)
    # Clean repeated punctuation
    text = re.sub(r"([!?,.])\1+", r"\1", text)
    return text.strip()
