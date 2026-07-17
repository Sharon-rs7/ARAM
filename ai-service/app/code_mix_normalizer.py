def normalize_code_mixed_text(text: str) -> str:
    """Normalize light code-mixed input without changing legal meaning."""
    return " ".join((text or "").split())
