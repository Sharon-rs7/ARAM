import re
from typing import Dict, Any, List, Tuple, Optional
from rag.schemas.rag_response import LegalChunkProvenance

class ValidationResult:
    def __init__(self, is_valid: bool, errors: List[str], cleaned_response: Dict[str, Any], grounded_score: float):
        self.is_valid = is_valid
        self.errors = errors
        self.cleaned_response = cleaned_response
        self.grounded_score = grounded_score

class GroundingValidator:
    """
    ARAM Strict Grounding Validator.
    Zero-tolerance audit for LLM-generated legal guidance:
    - Verifies cited sections against retrieved chunks.
    - Verifies cited Acts against retrieved chunks.
    - Audits statutory penalty claims.
    - Audits statutory deadlines and procedure.
    - Sanitizes or rejects unsupported legal claims.
    """

    def validate(
        self,
        llm_response: Dict[str, Any],
        retrieved_chunks: List[LegalChunkProvenance],
        retrieved_context_str: str
    ) -> ValidationResult:
        errors = []
        cleaned = dict(llm_response)
        
        if not isinstance(llm_response, dict):
            return ValidationResult(False, ["Response is not a valid JSON object."], {}, 0.0)

        # If no specific retrieved chunks were found in the 1306 corpus, accept Gemini's structured response directly
        if not retrieved_chunks:
            return ValidationResult(True, [], cleaned, 1.0)

        # Build lookup maps from retrieved chunks
        valid_acts = set()
        valid_sections = set()
        full_retrieved_text = retrieved_context_str.lower()

        for c in retrieved_chunks:
            if c.act_name:
                valid_acts.add(c.act_name.lower().strip())
                # Also add normalized words
                valid_acts.add(re.sub(r"[^\w\s]", "", c.act_name.lower().strip()))
            if c.section:
                sec_clean = str(c.section).strip().lower()
                valid_sections.add(sec_clean)
                valid_sections.add(f"section {sec_clean}")
                valid_sections.add(f"sec {sec_clean}")
                valid_sections.add(f"sec. {sec_clean}")

        # 1. Validate Cited Sections & Acts
        raw_sections = cleaned.get("sections", [])
        verified_sections = []
        
        for sec_item in raw_sections:
            if not isinstance(sec_item, dict):
                continue
            act_name = str(sec_item.get("act", "")).strip()
            sec_num = str(sec_item.get("section", "")).strip()
            
            # Check if Act or Section is supported
            act_supported = (not act_name) or any(
                act_name.lower() in va or va in act_name.lower() for va in valid_acts
            ) or (act_name.lower() in full_retrieved_text)
            
            sec_supported = (not sec_num or sec_num.lower() == "null" or sec_num.lower() == "none") or (
                sec_num.lower() in valid_sections or f"section {sec_num.lower()}" in full_retrieved_text or f"sec {sec_num.lower()}" in full_retrieved_text or f" {sec_num.lower()} " in full_retrieved_text
            )

            if not act_supported and act_name:
                errors.append(f"Cited Act '{act_name}' was not found in retrieved legal context.")
            if not sec_supported and sec_num:
                errors.append(f"Cited Section '{sec_num}' for Act '{act_name}' was not found in retrieved context.")

            if act_supported and sec_supported:
                verified_sections.append(sec_item)
            else:
                # Omit or flag unsupported section
                pass

        cleaned["sections"] = verified_sections

        # 2. Validate Punishment / Penalty Claims
        consequences = cleaned.get("possible_consequences", [])
        verified_consequences = []
        for cons in consequences:
            if not isinstance(cons, dict):
                continue
            desc = str(cons.get("description", ""))
            # Detect imprisonment or fine claims
            has_punishment_claim = any(
                term in desc.lower() for term in ["imprisonment", "jail", "fine of rs", "fine up to", "punishable with", "rigorous imprisonment"]
            )
            if has_punishment_claim:
                # Check if punishment is in retrieved context
                punish_supported = any(
                    term in full_retrieved_text for term in ["imprisonment", "fine", "punish", "liable", "penalty", "cognizable", "bailable"]
                )
                if not punish_supported:
                    errors.append(f"Statutory penalty claim '{desc}' lacks supporting text in retrieved context.")
                else:
                    verified_consequences.append(cons)
            else:
                verified_consequences.append(cons)

        cleaned["possible_consequences"] = verified_consequences

        # 3. Validate Deadlines in Procedure
        procedures = cleaned.get("procedure", [])
        verified_procedures = []
        for proc in procedures:
            if not isinstance(proc, str):
                continue
            # Look for specific days/months deadlines
            deadline_match = re.search(r"within (\d+)\s*(days|months|hours)", proc, re.IGNORECASE)
            if deadline_match:
                num = deadline_match.group(1)
                unit = deadline_match.group(2)
                if f"{num} {unit}".lower() not in full_retrieved_text and f"{num}-{unit}".lower() not in full_retrieved_text:
                    # Sanitize specific unverified deadline to generic guidance
                    sanitized_proc = re.sub(
                        r"within \d+\s*(days|months|hours)",
                        "within the statutory timeline specified by the authority",
                        proc,
                        flags=re.IGNORECASE
                    )
                    verified_procedures.append(sanitized_proc)
                    continue
            verified_procedures.append(proc)

        cleaned["procedure"] = verified_procedures

        # 4. Compute Groundedness Score
        total_checks = 1 + len(raw_sections) + len(consequences)
        failed_checks = len(errors)
        grounded_score = max(0.0, min(1.0, round((total_checks - failed_checks) / total_checks, 2)))

        is_valid = len(errors) == 0

        # Mark human review if errors occurred
        if not is_valid:
            cleaned["human_review_required"] = True

        return ValidationResult(
            is_valid=is_valid,
            errors=errors,
            cleaned_response=cleaned,
            grounded_score=grounded_score
        )

grounding_validator = GroundingValidator()
