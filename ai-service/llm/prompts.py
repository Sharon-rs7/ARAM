import json
from typing import List, Optional

STRICT_LEGAL_SYSTEM_PROMPT = """You are ARAM Legal Guidance AI (அறம் AI), an official conversational legal aid companion for citizens of Tamil Nadu and India.
Your mission is to provide accurate, empathetic, practical, and structured legal aid guidance.

Key Instructions:
1. Grounding: If verified retrieved legal context is provided, prioritize and quote from it.
2. Comprehensive Knowledge: If retrieved context is partial or absent, apply your genuine knowledge of Indian and Tamil Nadu statutes (such as Bharatiya Nyaya Sanhita (BNS) / IPC, BNSS / CrPC, BSA / Indian Evidence Act, Consumer Protection Act 2019, Transfer of Property Act 1882, Registration Act 1908, Tamil Nadu Regulation of Rights and Responsibilities of Landlords and Tenants Act 2017, Tamil Nadu Patta Passbook Act, Payment of Wages Act 1936, Industrial Disputes Act 1947, Protection of Women from Domestic Violence Act 2005, Information Technology Act 2000, Hindu Marriage Act, Maintenance & Welfare of Parents and Senior Citizens Act, Motor Vehicles Act, etc.).
3. Action-Oriented: Provide genuine, actionable guidance:
   - Plain-language explanation in the citizen's requested language (Tamil, Tanglish, Hindi, or English).
   - Relevant Indian / State acts and sections.
   - Immediate practical steps they should take today.
   - Exact evidence and documents they must collect.
   - The appropriate redressal authority (e.g. DLSA / Taluk Legal Services Committee, Tahsildar / RDO, District Consumer Disputes Redressal Commission, Labour Commissioner, Cyber Crime Police / 1930, Rent Court, Family Court).
4. Safety & Ethics: Do not guarantee court outcomes. Provide legal aid orientation and advisory guidance.
5. Format: Always output valid JSON strictly conforming to the requested ARAM schema."""

STRICT_RETRY_SYSTEM_PROMPT = STRICT_LEGAL_SYSTEM_PROMPT

def build_llm_prompt(
    query: str,
    retrieved_context: str,
    language: str,
    category_name: str,
    recommended_authority: str,
    required_documents: List[str],
    case_summary: Optional[str] = None,
    is_retry: bool = False
) -> str:
    """
    Constructs the standard or strict retry prompt for LLM generation.
    """
    lang_instruction = {
        "ta": "The user speaks Tamil. Respond with 'problemUnderstanding', 'what_you_can_do_now', 'procedure', and 'expected_next_steps' written in clear, accessible Tamil (தமிழ்). Keep Act names and technical legal terminology accurate with English/Tamil transliteration.",
        "hi": "The user speaks Hindi. Respond with 'problemUnderstanding', 'what_you_can_do_now', 'procedure', and 'expected_next_steps' written in clear Hindi (हिंदी). Keep Act names and Section citations accurate.",
        "en": "Respond in clear, accessible English with citizen-friendly explanations."
    }.get(language, "Respond in citizen-friendly English.")

    case_context_block = f"\nACTIVE CASE CONTEXT:\n{case_summary}\n" if case_summary else ""

    schema_example = json.dumps({
        "language": language,
        "understanding": "Brief 1-2 sentence empathetic summary of the citizen's grievance.",
        "category": category_name,
        "severity": "MEDIUM",
        "legal_position": {
            "summary": "Plain-language summary of what the retrieved statutes state regarding this issue.",
            "applicable_laws": ["Name of Act 1", "Name of Act 2"]
        },
        "sections": [
            {
                "act": "Act Name verbatim from context",
                "section": "Section number or null",
                "title": "Short title",
                "relevance": "How this provision applies to user's situation",
                "source": "Source / Citation"
            }
        ],
        "possible_consequences": [
            {
                "description": "Consequence ONLY if supported by retrieved text",
                "legal_basis": "Act & Section",
                "source": "Retrieved Source"
            }
        ],
        "what_you_can_do_now": [
            "Immediate actionable step 1",
            "Immediate actionable step 2"
        ],
        "documents_required": required_documents,
        "where_to_complain": [recommended_authority],
        "procedure": [
            "Step 1: Collect evidence...",
            "Step 2: Submit formal complaint to...",
            "Step 3: Track application..."
        ],
        "expected_next_steps": [
            "What happens after submission..."
        ],
        "emergency": False,
        "human_review_required": False,
        "citations": [
            {
                "documentTitle": "Act Name",
                "section": "Section",
                "sourceChunkId": "chk_xxx"
            }
        ]
    }, indent=2)

    prompt = f"""### CITIZEN QUERY:
"{query}"

{case_context_block}
### DETECTED CLASSIFICATION & RECOMMENDED ROUTING:
- Category: {category_name}
- Recommended Statutory Authority: {recommended_authority}
- Standard Evidentiary Documents: {', '.join(required_documents)}

### VERIFIED RETRIEVED LEGAL CONTEXT (YOUR SINGLE SOURCE OF TRUTH):
{retrieved_context if retrieved_context.strip() else "[NO DIRECT STATUTORY MATCH FOUND IN DATABASE]"}

### LANGUAGE INSTRUCTION:
{lang_instruction}

### MANDATORY RESPONSE FORMAT (JSON ONLY):
You MUST output ONLY a valid JSON object matching this schema. Do not enclose in markdown ticks if possible, or use standard ```json ... ```:
{schema_example}
"""
    return prompt
