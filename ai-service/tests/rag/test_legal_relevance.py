import pytest
from rag.retrieval.retriever import legal_retriever
from rag.retrieval.legal_gate import legal_gate
from app.chatbot_engine import ask_chatbot_engine

def test_property_retrieval_rejects_merchant_shipping_and_lokayukta():
    query = "en property issue yarkita enga complaint pananum nu enaku therla"
    res = legal_retriever.retrieve(
        query=query,
        category="PROPERTY_DISPUTE",
        user_state="Tamil Nadu"
    )
    
    retrieved_titles = [c.act_name for c in res.top_k_chunks]
    
    for title in retrieved_titles:
        t_up = title.upper()
        assert "MERCHANT SHIPPING" not in t_up, f"Contamination: {title} in property query"
        assert "INDIAN PORTS" not in t_up, f"Contamination: {title} in property query"
        assert "LOKAYUKTA" not in t_up, f"Contamination: {title} in Tamil Nadu property query"
        assert "ANTI-DOPING" not in t_up, f"Contamination: {title} in property query"

def test_legal_gate_rejection_rules():
    # Test 1: Merchant shipping chunk on property query
    bad_chunk = {
        "title": "THE MERCHANT SHIPPING ACT, 2025",
        "jurisdiction": "Central",
        "act_name": "THE MERCHANT SHIPPING ACT, 2025"
    }
    valid, reason = legal_gate.validate_chunk(bad_chunk, category="PROPERTY_DISPUTE", user_state="Tamil Nadu")
    assert not valid
    assert "Maritime" in reason or "Domain mismatch" in reason

    # Test 2: Maharashtra Lokayukta chunk on Tamil Nadu query
    lokayukta_chunk = {
        "title": "The Maharashtra Lokayukta Act, 2023",
        "jurisdiction": "Maharashtra",
        "act_name": "The Maharashtra Lokayukta Act, 2023"
    }
    valid_l, reason_l = legal_gate.validate_chunk(lokayukta_chunk, category="PROPERTY_DISPUTE", user_state="Tamil Nadu")
    assert not valid_l

def test_conversational_greeting_intent():
    res = ask_chatbot_engine(message="hi", language="en")
    assert res.get("responseType") == "GREETING"
    assert res.get("is_conversational") is True
    assert len(res.get("sections", [])) == 0

def test_vague_query_triggers_clarification():
    res = ask_chatbot_engine(
        message="en property issue yarkita complaint pananum nu therla",
        language="ta",
        session_id="test_sess_1"
    )
    assert res.get("responseType") == "CLARIFICATION"
    assert res.get("is_conversational") is True
    assert "options" in res
    assert len(res.get("options", [])) > 0
    assert "Patta / Chitta" in res.get("options", [])

def test_detailed_query_returns_full_assessment():
    res = ask_chatbot_engine(
        message="My neighbour has encroached my registered boundary land and patta survey number in Coimbatore without my consent",
        language="en",
        session_id="test_sess_detailed"
    )
    assert res.get("responseType") == "FULL_ASSESSMENT"
    assert res.get("is_conversational") is False
    assert "applicableLaw" in res
    assert "documents" in res
    assert "recommendedAuthority" in res or "authority" in res
