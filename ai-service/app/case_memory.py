import re
import json
import os
import time
from typing import Dict, Any, List, Optional

# Sensitive Data Redaction Patterns
AADHAAR_REGEX = re.compile(r"\b\d{4}\s?\d{4}\s?\d{4}\b")
PAN_REGEX = re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b", re.IGNORECASE)
PHONE_REGEX = re.compile(r"\b(?:\+91|0)?[6-9]\d{9}\b")
BANK_ACC_REGEX = re.compile(r"\b\d{9,18}\b")

def redact_sensitive_pii(text: str) -> str:
    """Masks Aadhaar, PAN, phone numbers, and bank account numbers."""
    if not text:
        return ""
    masked = AADHAAR_REGEX.sub("[REDACTED_AADHAAR]", text)
    masked = PAN_REGEX.sub("[REDACTED_PAN]", masked)
    masked = PHONE_REGEX.sub("[REDACTED_PHONE]", masked)
    return masked

class CaseMemoryManager:
    """
    Session-level Legal Context and Case Memory Manager.
    Maintains conversational case context across multiple dialogue turns.
    """

    def __init__(self):
        self._local_cache: Dict[str, Dict[str, Any]] = {}
        self._redis_client = None
        self._init_redis()

    def _init_redis(self):
        try:
            import redis
            host = os.environ.get("REDIS_HOST", "localhost")
            port = int(os.environ.get("REDIS_PORT", "6379"))
            self._redis_client = redis.Redis(host=host, port=port, db=0, socket_timeout=2.0)
            self._redis_client.ping()
            print("[CASE MEMORY] Connected to Redis for session context caching.")
        except Exception:
            self._redis_client = None
            print("[CASE MEMORY] Redis not available. Using high-performance in-memory case store.")

    def get_context(self, session_id: str) -> Dict[str, Any]:
        """Retrieves active case memory for session."""
        if not session_id:
            return {}

        if self._redis_client:
            try:
                data = self._redis_client.get(f"aram:case_context:{session_id}")
                if data:
                    return json.loads(data.decode("utf-8"))
            except Exception:
                pass

        return self._local_cache.get(session_id, {
            "category": None,
            "jurisdiction": "Tamil Nadu / India",
            "timeline": [],
            "parties": [],
            "facts": [],
            "evidence": [],
            "previous_answers": [],
            "retrieved_laws": []
        })

    def update_context(
        self,
        session_id: str,
        user_message: str,
        category_name: str,
        retrieved_laws: List[str],
        ai_summary: Optional[str] = None
    ):
        """Updates case memory with new user turn and legal context."""
        if not session_id:
            return

        ctx = self.get_context(session_id)
        
        # Clean PII
        clean_msg = redact_sensitive_pii(user_message)
        
        ctx["category"] = category_name or ctx.get("category")
        if clean_msg:
            ctx.setdefault("facts", []).append(clean_msg)
            # Keep max last 6 facts
            ctx["facts"] = ctx["facts"][-6:]

        if retrieved_laws:
            existing = set(ctx.get("retrieved_laws", []))
            existing.update(retrieved_laws)
            ctx["retrieved_laws"] = list(existing)[:8]

        if ai_summary:
            ctx.setdefault("previous_answers", []).append(ai_summary)
            ctx["previous_answers"] = ctx["previous_answers"][-4:]

        ctx["last_updated"] = time.time()

        # Save to Redis and local
        self._local_cache[session_id] = ctx

        if self._redis_client:
            try:
                self._redis_client.setex(
                    f"aram:case_context:{session_id}",
                    7200, # 2 hours TTL
                    json.dumps(ctx)
                )
            except Exception:
                pass

    def build_summary_string(self, session_id: str) -> str:
        """Builds a consolidated case summary string for LLM injection."""
        ctx = self.get_context(session_id)
        if not ctx or not ctx.get("facts"):
            return ""

        facts_str = " | ".join(ctx.get("facts", []))
        laws_str = ", ".join(ctx.get("retrieved_laws", []))
        return f"Case Category: {ctx.get('category')}. Cumulative Facts: {facts_str}. Previous Laws Identified: {laws_str}."

case_memory = CaseMemoryManager()
