import os
import re
import json
from typing import Dict, Any, List, Optional
from llm.base_provider import BaseLLMProvider
from llm.prompts import STRICT_LEGAL_SYSTEM_PROMPT, STRICT_RETRY_SYSTEM_PROMPT, build_llm_prompt

class GeminiProvider(BaseLLMProvider):
    """
    Gemini API provider acting as the resilient secondary generator.
    Never used directly without verified RAG context.
    """

    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY")
        self.model_name = os.environ.get("GEMINI_MODEL", "gemini-3.5-flash-lite")
        self.client = None
        self._init_client()

    def _init_client(self):
        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.client = genai.GenerativeModel(self.model_name)
            except Exception as e:
                print(f"[GEMINI PROVIDER INIT ERROR] {e}")
                self.client = None
        else:
            self.client = None

    def is_available(self) -> bool:
        return bool(self.api_key and self.client is not None)

    def health_check(self) -> Dict[str, Any]:
        return {
            "provider": "gemini",
            "model": self.model_name,
            "configured": bool(self.api_key),
            "available": self.is_available(),
            "status": "ready" if self.is_available() else ("unconfigured" if not self.api_key else "init_failed")
        }

    def generate_guidance(
        self,
        query: str,
        retrieved_context: str,
        language: str,
        category_name: str,
        recommended_authority: str,
        required_documents: List[str],
        case_summary: Optional[str] = None,
        is_retry: bool = False
    ) -> Dict[str, Any]:
        """
        Sends generation request to Gemini API and returns validated JSON dict.
        """
        if not self.is_available():
            self._init_client()
            if not self.is_available():
                raise RuntimeError("Gemini API key is not configured or client initialization failed.")

        import google.generativeai as genai

        prompt = build_llm_prompt(
            query=query,
            retrieved_context=retrieved_context,
            language=language,
            category_name=category_name,
            recommended_authority=recommended_authority,
            required_documents=required_documents,
            case_summary=case_summary,
            is_retry=is_retry
        )

        sys_prompt = STRICT_RETRY_SYSTEM_PROMPT if is_retry else STRICT_LEGAL_SYSTEM_PROMPT

        generation_config = genai.types.GenerationConfig(
            temperature=0.1,
            response_mime_type="application/json"
        )

        full_prompt = f"System Instruction: {sys_prompt}\n\nUser Request & Context:\n{prompt}"

        try:
            response = self.client.generate_content(full_prompt, generation_config=generation_config)
            raw_text = response.text.strip()
            
            if raw_text.startswith("```json"):
                raw_text = re.sub(r"^```json\s*", "", raw_text)
                raw_text = re.sub(r"\s*```$", "", raw_text)
            elif raw_text.startswith("```"):
                raw_text = re.sub(r"^```\s*", "", raw_text)
                raw_text = re.sub(r"\s*```$", "", raw_text)

            parsed = json.loads(raw_text)
            return parsed
        except Exception as e:
            raise RuntimeError(f"Gemini API generation error: {e}")

gemini_provider = GeminiProvider()
