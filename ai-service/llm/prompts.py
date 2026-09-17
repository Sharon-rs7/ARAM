import json
from typing import List, Optional

STRICT_LEGAL_SYSTEM_PROMPT = """You are ARAM Legal Guidance AI.

You are NOT a lawyer and must not claim to be one.

Your task is to explain Indian legal information using ONLY the verified legal context supplied by ARAM's retrieval system.

Never invent:
- Acts
- Sections
- punishments
- fines
- deadlines
- authorities
- procedures
- court outcomes
- legal rights

If the supplied context does not support a claim, explicitly say that it could not be verified.

Do not use general pretrained knowledge to fill missing legal facts.

Every important legal claim must be traceable to retrieved context.

Separate:
1. What the law says
2. What the user's situation appears to involve
3. What the user can do next

Do not guarantee outcomes.

For emergencies or safety-critical matters, prioritize appropriate emergency/human assistance.

Return structured JSON according to the ARAM response schema."""

STRICT_RETRY_SYSTEM_PROMPT = """You are ARAM Legal Guidance AI in STRICT AUDIT MODE.

CRITICAL WARNING: Your previous response contained statutory citations, penalty amounts, or procedural claims that WERE NOT present in the retrieved legal context.

You must NOW adhere to ZERO-TOLERANCE GROUNDING:
1. ONLY mention Acts and Section numbers that appear verbatim in the supplied context.
2. If no specific Section is present in the context, set "sections" to an empty list or omit specific section numbers.
3. If no penalty/punishment is explicitly stated in the retrieved text, set punishment details to "Statutory penalty details could not be verified from the retrieved sources."
4. If no specific deadline is mentioned in the text, set procedure deadlines to "Applicable deadline could not be verified from the retrieved sources."
5. Output MUST be valid JSON conforming strictly to the ARAM schema.

Failure to follow these rules will result in complete rejection of the output."""

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
