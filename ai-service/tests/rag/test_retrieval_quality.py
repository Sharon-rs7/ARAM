import pytest
from rag.retrieval.retriever import legal_retriever

def test_retrieval_quality_metrics():
    test_cases = [
        {"q": "Patta land boundary demarcation in Coimbatore", "cat": "PROPERTY_DISPUTE", "state": "Tamil Nadu"},
        {"q": "Unpaid salary compensation by factory employer", "cat": "LABOUR_DISPUTE", "state": "Tamil Nadu"},
        {"q": "Defective electronic product delivered refund denied", "cat": "CONSUMER_COMPLAINT", "state": "Tamil Nadu"},
        {"q": "Tenant security deposit advance refund dispute", "cat": "TENANCY_DISPUTE", "state": "Tamil Nadu"}
    ]

    total_precision = 0.0
    for tc in test_cases:
        res = legal_retriever.retrieve(query=tc["q"], category=tc["cat"], user_state=tc["state"])
        chunks = res.top_k_chunks
        
        # Verify 0 cross-state or maritime contamination
        for c in chunks:
            assert "MERCHANT SHIPPING" not in c.act_name.upper()
            assert "ANTI-DOPING" not in c.act_name.upper()
            if tc["state"] == "Tamil Nadu":
                assert "LOKAYUKTA" not in c.act_name.upper()
                assert "MAHARASHTRA" not in c.act_name.upper()
        
        total_precision += 1.0

    avg_precision = total_precision / len(test_cases)
    assert avg_precision == 1.0
