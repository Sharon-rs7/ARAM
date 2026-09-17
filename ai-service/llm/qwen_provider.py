import os
import re
import json
import httpx
from typing import Dict, Any, List, Optional
from llm.base_provider import BaseLLMProvider
from llm.prompts import STRICT_LEGAL_SYSTEM_PROMPT, STRICT_RETRY_SYSTEM_PROMPT, build_llm_prompt

class QwenProvider(BaseLLMProvider):
    """
    Self-hosted Qwen provider connecting to vLLM, TGI, or any OpenAI-compatible local inference server.
    Target Model: Qwen/Qwen3-30B-A3B-Instruct (or configured via QWEN_MODEL).
    """

    def __init__(self):
        self.base_url = os.environ.get("QWEN_BASE_URL", "").rstrip("/")
        self.model_name = os.environ.get("QWEN_MODEL", "Qwen/Qwen3-30B-A3B-Instruct")
        self.timeout_seconds = float(os.environ.get("QWEN_TIMEOUT_SECONDS", "25.0"))
        self.api_key = os.environ.get("QWEN_API_KEY", "EMPTY")
        self.client = httpx.Client(timeout=self.timeout_seconds)

    def is_available(self) -> bool:
        """Returns True if QWEN_BASE_URL is set and reachable."""
        if not self.base_url:
            return False
        try:
            # Check models endpoint
            url = f"{self.base_url}/models"
            resp = self.client.get(url, headers={"Authorization": f"Bearer {self.api_key}"}, timeout=3.0)
            return resp.status_code == 200
        except Exception:
            return False

    def health_check(self) -> Dict[str, Any]:
        """Diagnostic check for Qwen inference endpoint."""
        available = self.is_available()
        return {
            "provider": "qwen",
            "model": self.model_name,
            "base_url": self.base_url or "not_configured",
            "available": available,
            "status": "ready" if available else ("unreachable" if self.base_url else "unconfigured")
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
        Sends prompt to Qwen inference server and returns parsed JSON.
        """
        if not self.base_url:
            raise RuntimeError("Qwen base URL (QWEN_BASE_URL) is not configured.")

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

        endpoint = f"{self.base_url}/chat/completions"
        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.1,
            "max_tokens": 1500,
            "response_format": {"type": "json_object"}
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }

        try:
            response = self.client.post(endpoint, json=payload, headers=headers)
            response.raise_for_status()
            res_data = response.json()
            
            raw_content = res_data["choices"][0]["message"]["content"].strip()
            
            # Extract JSON cleanly
            if raw_content.startswith("```json"):
                raw_content = re.sub(r"^```json\s*", "", raw_content)
                raw_content = re.sub(r"\s*```$", "", raw_content)
            elif raw_content.startswith("```"):
                raw_content = re.sub(r"^```\s*", "", raw_content)
                raw_content = re.sub(r"\s*```$", "", raw_content)

            parsed_json = json.loads(raw_content)
            return parsed_json

        except httpx.TimeoutException as te:
            raise TimeoutError(f"Qwen inference timed out after {self.timeout_seconds}s: {te}")
        except Exception as e:
            raise RuntimeError(f"Qwen inference error: {e}")

qwen_provider = QwenProvider()
