"""
Local LLM Provider (Ollama / Local OpenAI Compatible) with Fallback Support.
"""
import os
import requests
from typing import Dict, Any, List, Optional

class LocalLLMProvider:
    def __init__(self):
        self.endpoint = os.getenv("LOCAL_LLM_ENDPOINT", "http://localhost:11434/v1/chat/completions")
        self.model_name = os.getenv("LOCAL_LLM_MODEL", "llama3:latest")
        self.timeout = int(os.getenv("LOCAL_LLM_TIMEOUT", "10"))

    def is_available(self) -> bool:
        try:
            health_url = self.endpoint.replace("/v1/chat/completions", "/api/version")
            res = requests.get(health_url, timeout=2)
            return res.status_code == 200
        except Exception:
            return False

    def generate_legal_answer(
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
        if not self.is_available():
            raise RuntimeError("Local LLM provider is offline.")

        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": "You are ARAM Legal AI Assistant. Provide accurate legal guidance grounded strictly in verified context."},
                {"role": "user", "content": f"Query: {query}\nContext: {retrieved_context}\nLanguage: {language}"}
            ],
            "temperature": 0.1
        }
        res = requests.post(self.endpoint, json=payload, timeout=self.timeout)
        data = res.json()
        raw_reply = data["choices"][0]["message"]["content"]
        return {"reply": raw_reply, "answer": raw_reply}

local_llm_provider = LocalLLMProvider()
