import pytest
from app.nlp.tanglish_normalizer import normalize_text

def test_normalize_tanglish_tokens():
    raw_input = "manager sambalam tharala past 3 months"
    normalized = normalize_text(raw_input)
    assert "salary" in normalized or "salary unpaid" in normalized or "sambalam" in normalized

def test_normalize_tamil_script():
    raw_input = "எனக்கு சம்பளம் கிடைக்கவில்லை"
    normalized = normalize_text(raw_input)
    assert len(normalized) > 0

def test_normalize_empty_input():
    assert normalize_text("") == ""
    assert normalize_text("   ") == ""
