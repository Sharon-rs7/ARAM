import pytest
from app.nlp.complaint_summarizer import generate_plain_summary

def test_extractive_summary_specific_details():
    text = "My company supervisor has not paid my monthly salary of Rs 25,000 for 3 months in Chennai district."
    summary = generate_plain_summary(text, category="LABOUR_DISPUTE", lang="en")
    assert len(summary) > 10
    assert "salary" in summary.lower() or "grievance" in summary.lower()

def test_vague_complaint_honest_summary():
    text = "I need help with my issue."
    summary = generate_plain_summary(text, category="GENERAL_LEGAL_AID", lang="en")
    assert len(summary) > 10
    # Confirm honest summary without fabricated details
    assert "25,000" not in summary
    assert "Chennai" not in summary

def test_tamil_summary_generation():
    text = "எனக்கு சம்பளம் 3 மாதமாக வழங்கப்படவில்லை."
    summary = generate_plain_summary(text, category="LABOUR_DISPUTE", lang="ta")
    assert len(summary) > 5
