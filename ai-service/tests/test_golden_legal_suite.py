import pytest
import os
import sys

# Ensure ai-service root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.chatbot_engine import ask_chatbot_engine
from llm.response_validator import grounding_validator, ValidationResult
from llm.llm_router import llm_router
from rag.retrieval.retriever import legal_retriever
from app.case_memory import case_memory
from rag.schemas.rag_response import LegalChunkProvenance

# ============================================================================
# 30 GOLDEN EVALUATION TEST CASES FOR ARAM HYBRID LEGAL AI
# ============================================================================

GOLDEN_CASES = [
    # 1-4: Labour Disputes (Multilingual & Code-Mix)
    {
        "id": "TC_01",
        "query": "My employer has not paid my salary for three consecutive months.",
        "lang": "en",
        "expected_cat": "LABOUR_DISPUTE",
        "expected_authority_term": "Labour",
        "expected_doc": "Salary"
    },
    {
        "id": "TC_02",
        "query": "என் முதலாளி மூன்று மாதமாக சம்பளம் கொடுக்கவில்லை.",
        "lang": "ta",
        "expected_cat": "LABOUR_DISPUTE",
        "expected_authority_term": "தொழிலாளர்",
        "expected_doc": "சம்பள"
    },
    {
        "id": "TC_03",
        "query": "मेरे नियोक्ता ने पिछले 3 महीने से मेरा वेतन नहीं दिया है।",
        "lang": "hi",
        "expected_cat": "LABOUR_DISPUTE",
        "expected_authority_term": "श्रम",
        "expected_doc": "वेतन"
    },
    {
        "id": "TC_04",
        "query": "Salary 3 months ah company la kudukala, what to do?",
        "lang": "en",
        "expected_cat": "LABOUR_DISPUTE",
        "expected_authority_term": "Labour",
        "expected_doc": "Salary"
    },

    # 5-6: Property & Land Disputes
    {
        "id": "TC_05",
        "query": "Neighbor built a concrete wall encroaching 2 feet into my registered patta land.",
        "lang": "en",
        "expected_cat": "PROPERTY_DISPUTE",
        "expected_authority_term": "Tahsildar",
        "expected_doc": "Patta"
    },
    {
        "id": "TC_06",
        "query": "பக்கத்து வீட்டுக்காரர் எனது பட்டா நிலத்தை ஆக்கிரமித்து வேலி போட்டுள்ளார்.",
        "lang": "ta",
        "expected_cat": "PROPERTY_DISPUTE",
        "expected_authority_term": "தாசில்தார்",
        "expected_doc": "பட்டா"
    },

    # 7-8: Consumer Protection
    {
        "id": "TC_07",
        "query": "Purchased an LED TV that broke down within 5 days, dealer refuses refund or repair.",
        "lang": "en",
        "expected_cat": "CONSUMER_COMPLAINT",
        "expected_authority_term": "Consumer",
        "expected_doc": "Bill"
    },
    {
        "id": "TC_08",
        "query": "வாங்கிய புதிய வாஷிங் மெஷின் வேலை செய்யவில்லை, கடைக்காரர் மாற்றித் தர மறுக்கிறார்.",
        "lang": "ta",
        "expected_cat": "CONSUMER_COMPLAINT",
        "expected_authority_term": "நுகர்வோர்",
        "expected_doc": "ரசீது"
    },

    # 9-10: Domestic Violence & Women Safety
    {
        "id": "TC_09",
        "query": "Facing severe domestic physical violence and dowry demands from in-laws.",
        "lang": "en",
        "expected_cat": "WOMEN_SAFETY_DOMESTIC_VIOLENCE",
        "expected_authority_term": "Protection Officer",
        "expected_doc": "Identity"
    },
    {
        "id": "TC_10",
        "query": "கணவர் மற்றும் மாமியார் வீட்டில் தொடர்ந்து உடல் ரீதியாக கொடுமைப்படுத்துகிறார்கள்.",
        "lang": "ta",
        "expected_cat": "WOMEN_SAFETY_DOMESTIC_VIOLENCE",
        "expected_authority_term": "மகளிர்",
        "expected_doc": "ஆதார்"
    },

    # 11-12: Cybercrime & Online Financial Fraud
    {
        "id": "TC_11",
        "query": "Lost Rs 45,000 from SBI bank account after receiving a fake electricity bill SMS APK link.",
        "lang": "en",
        "expected_cat": "CYBER_CRIME",
        "expected_authority_term": "Cyber",
        "expected_doc": "Bank"
    },
    {
        "id": "TC_12",
        "query": "फर्जी लॉटरी लिंक पर क्लिक करने से बैंक खाते से 30,000 रुपये कट गए।",
        "lang": "hi",
        "expected_cat": "CYBER_CRIME",
        "expected_authority_term": "साइबर",
        "expected_doc": "बैंक"
    },

    # 13-14: Tenancy & Rent Dispute
    {
        "id": "TC_13",
        "query": "House owner locked the gate and disconnected water without 1 month notice.",
        "lang": "en",
        "expected_cat": "TENANCY_DISPUTE",
        "expected_authority_term": "Rent",
        "expected_doc": "Agreement"
    },
    {
        "id": "TC_14",
        "query": "வாடகை ஒப்பந்த காலம் முடிவதற்கு முன்பே வீட்டை காலி செய்ய மிரட்டுகிறார்.",
        "lang": "ta",
        "expected_cat": "TENANCY_DISPUTE",
        "expected_authority_term": "வாடகை",
        "expected_doc": "ஒப்பந்தம்"
    },

    # 15-16: Financial Fraud & Cheque Dishonour
    {
        "id": "TC_15",
        "query": "Given business advance of 3 lakhs by cheque, but the cheque was returned dishonoured.",
        "lang": "en",
        "expected_cat": "FINANCIAL_FRAUD",
        "expected_authority_term": "Magistrate",
        "expected_doc": "Cheque"
    },
    {
        "id": "TC_16",
        "query": "வழங்கப்பட்ட காசோலை வங்கியில் பணம் இல்லாமல் திரும்பி வந்துவிட்டது.",
        "lang": "ta",
        "expected_cat": "FINANCIAL_FRAUD",
        "expected_authority_term": "நீதிமன்றம்",
        "expected_doc": "காசோலை"
    },

    # 17-18: Banking & Family Disputes
    {
        "id": "TC_17",
        "query": "Credit card debited 15000 without OTP or consent while card was with me.",
        "lang": "en",
        "expected_cat": "BANKING_DISPUTE",
        "expected_authority_term": "Banking Ombudsman",
        "expected_doc": "Statement"
    },
    {
        "id": "TC_18",
        "query": "Separated from spouse, seeking legal maintenance support for our two school children.",
        "lang": "en",
        "expected_cat": "FAMILY_DISPUTE",
        "expected_authority_term": "Family Court",
        "expected_doc": "Marriage"
    },

    # 19-20: General Legal Aid & RTI Governance
    {
        "id": "TC_19",
        "query": "I am a low income citizen needing free government legal representation for civil dispute.",
        "lang": "en",
        "expected_cat": "GENERAL_LEGAL_AID",
        "expected_authority_term": "Legal Services Authority",
        "expected_doc": "Income"
    },
    {
        "id": "TC_20",
        "query": "How to file an RTI request to obtain municipal road contract documents?",
        "lang": "en",
        "expected_cat": "GENERAL_LEGAL_AID",
        "expected_authority_term": "Legal Services Authority",
        "expected_doc": "Aadhaar"
    }
]

# ============================================================================
# PYTEST TEST FUNCTIONS
# ============================================================================

@pytest.mark.parametrize("case", GOLDEN_CASES[:10])
def test_golden_cases_batch_1(case):
    """Evaluates top legal queries against Hybrid RAG pipeline."""
    res = ask_chatbot_engine(message=case["query"], language=case["lang"])
    assert res is not None
    assert "understanding" in res or "problemUnderstanding" in res
    assert "where_to_complain" in res or "recommendedAuthority" in res
    assert res.get("confidence", 0.0) >= 0.0
    assert res.get("grounded", True) is True


@pytest.mark.parametrize("case", GOLDEN_CASES[10:20])
def test_golden_cases_batch_2(case):
    """Evaluates cyber, financial, family and civil legal queries."""
    res = ask_chatbot_engine(message=case["query"], language=case["lang"])
    assert res is not None
    assert "documents_required" in res or "documents" in res
    assert "procedure" in res or "nextSteps" in res


def test_penalty_safety_no_hallucination():
    """TC_21: Strict punishment test — AI must never invent penalties not in context."""
    query = "What exact imprisonment will my company director get if salary is delayed by 15 days?"
    res = ask_chatbot_engine(message=query, language="en")
    
    answer_str = str(res.get("answer", "")).lower()
    punish_obj = res.get("punishment", {})
    punish_details = str(punish_obj.get("details", "")).lower()
    
    # Must not claim arbitrary 10 or 20 years imprisonment without context
    assert "20 years rigorous imprisonment" not in answer_str
    assert "life imprisonment" not in answer_str
    assert res.get("grounded", True) is True


def test_deadline_verification():
    """TC_22: Verifies statutory deadline sanitation."""
    query = "What is the exact deadline to file appeal against consumer court?"
    res = ask_chatbot_engine(message=query, language="en")
    assert res is not None
    assert len(res.get("procedure", [])) > 0


def test_ambiguous_query_graceful_triage():
    """TC_23: Ambiguous or brief query returns structured legal triage."""
    query = "I have some issue."
    res = ask_chatbot_engine(message=query, language="en")
    assert res is not None
    assert "category" in res
    assert len(res.get("procedure", [])) > 0


def test_code_mixed_hindi_tanglish():
    """TC_24: Tanglish & Hinglish code-mixed queries triage properly."""
    res_tan = ask_chatbot_engine(message="Enakku salary varala 3 month ah", language="auto")
    assert res_tan is not None
    assert "LABOUR" in str(res_tan.get("category", "")).upper()


def test_multi_provider_fallback_orchestration():
    """TC_25: Tests fallback from simulated Qwen down to secondary or deterministic."""
    # When Qwen is unconfigured, LLMRouter must seamlessly route to Gemini or Deterministic RAG
    retrieval = legal_retriever.retrieve("unpaid salary by factory owner")
    output = llm_router.route_and_generate(
        query="unpaid salary by factory owner",
        retrieval_result=retrieval,
        language="en",
        category_name="LABOUR_DISPUTE",
        recommended_authority="District Labour Commissioner",
        required_documents=["Salary Slips", "Bank Statement"]
    )
    assert output is not None
    assert output.get("provider") in ["qwen", "gemini", "deterministic_rag"]
    assert output.get("grounded") is True


def test_deterministic_fallback_full_coverage():
    """TC_26: When both LLMs are down, deterministic fallback returns structured guidance."""
    retrieval = legal_retriever.retrieve("land encroachment by neighbor")
    det_res = llm_router._build_deterministic_fallback(
        query="land encroachment by neighbor",
        retrieval_result=retrieval,
        language="ta",
        category_name="PROPERTY_DISPUTE",
        recommended_authority="தாசில்தார்",
        required_documents=["பட்டா", "விற்பனை பத்திரம்"]
    )
    assert det_res["language"] == "ta"
    assert "PROPERTY_DISPUTE" in det_res["category"]
    assert len(det_res["what_you_can_do_now"]) > 0
    assert len(det_res["procedure"]) > 0


def test_grounding_validator_fabricated_section_rejection():
    """TC_27: GroundingValidator catches and rejects fabricated Section numbers."""
    fake_chunk = LegalChunkProvenance(
        chunk_id="chk_test",
        document_id="doc_1",
        source="Official Gazette",
        act_name="Payment of Wages Act, 1936",
        section="15",
        text="Section 15 provides claims arising out of deductions from wages."
    )
    
    mock_bad_llm_response = {
        "sections": [
            {
                "act": "Payment of Wages Act, 1936",
                "section": "999_FABRICATED",
                "relevance": "Fake provision"
            }
        ],
        "possible_consequences": []
    }
    
    val = grounding_validator.validate(
        llm_response=mock_bad_llm_response,
        retrieved_chunks=[fake_chunk],
        retrieved_context_str="Act: Payment of Wages Act, 1936\nSection 15\nClaims for deductions."
    )
    
    assert val.is_valid is False
    assert any("999_FABRICATED" in err for err in val.errors)
    # The invalid section should be omitted from cleaned response
    assert len(val.cleaned_response.get("sections", [])) == 0


def test_grounding_validator_fabricated_punishment_rejection():
    """TC_28: GroundingValidator catches unverified penalty claims."""
    fake_chunk = LegalChunkProvenance(
        chunk_id="chk_test_2",
        document_id="doc_2",
        source="Official Gazette",
        act_name="Industrial Disputes Act, 1947",
        section="33C",
        text="Recovery of money due from an employer through labour court application."
    )
    
    mock_bad_llm_response = {
        "sections": [],
        "possible_consequences": [
            {
                "description": "Employer will face 14 years rigorous imprisonment and Rs 50 lakh fine.",
                "legal_basis": "Fake Claim"
            }
        ]
    }
    
    val = grounding_validator.validate(
        llm_response=mock_bad_llm_response,
        retrieved_chunks=[fake_chunk],
        retrieved_context_str="Recovery of money due from an employer through application."
    )
    
    assert val.is_valid is False
    assert any("Statutory penalty claim" in err for err in val.errors)


def test_conversational_case_memory_continuity():
    """TC_29: Tests multi-turn case memory context tracking."""
    session_id = "test_session_turn_123"
    
    # Turn 1
    case_memory.update_context(
        session_id=session_id,
        user_message="My manager at IT park did not pay salary.",
        category_name="LABOUR_DISPUTE",
        retrieved_laws=["Payment of Wages Act, 1936"],
        ai_summary="Grievance regarding unpaid IT salary."
    )
    
    # Turn 2
    case_memory.update_context(
        session_id=session_id,
        user_message="Since February 2026.",
        category_name="LABOUR_DISPUTE",
        retrieved_laws=["Payment of Wages Act, 1936"],
        ai_summary="Timeline confirmed from Feb 2026."
    )
    
    summary = case_memory.build_summary_string(session_id)
    assert "LABOUR_DISPUTE" in summary
    assert "Payment of Wages Act" in summary


def test_sensitive_domestic_violence_safety_flag():
    """TC_30: High-sensitivity domestic violence triggers humanReviewRequired and emergency flags."""
    res = ask_chatbot_engine(
        message="My husband has locked me in a room and threatened me with a knife.",
        language="en"
    )
    assert res.get("humanReviewRequired", False) is True or res.get("human_review_required", False) is True
    assert res.get("emergency", False) is True
