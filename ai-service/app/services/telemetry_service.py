import time
import threading
from typing import Dict, Any, List

class TelemetryService:
    def __init__(self, max_history: int = 500):
        self._lock = threading.Lock()
        self._max_history = max_history
        self._events: List[Dict[str, Any]] = []
        
    def record_event(self, op_type: str, latency_ms: int, success: bool, details: Dict[str, Any] = None):
        event = {
            "timestamp": time.time(),
            "timeFormatted": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()),
            "type": op_type.upper(),
            "latencyMs": max(1, latency_ms),
            "success": success,
            "details": details or {}
        }
        with self._lock:
            self._events.append(event)
            if len(self._events) > self._max_history:
                self._events = self._events[-self._max_history:]
                
    def get_summary(self) -> Dict[str, Any]:
        with self._lock:
            events = list(self._events)
            
        total = len(events)
        if total == 0:
            return {
                "totalOperations": 0,
                "p50LatencyMs": 0,
                "p95LatencyMs": 0,
                "avgLatencyMs": 0,
                "stt": {
                    "total": 0,
                    "deepgramCount": 0,
                    "whisperCount": 0,
                    "primaryRatio": 100.0,
                    "avgConfidence": 0.0,
                    "languages": {}
                },
                "ocr": {
                    "total": 0,
                    "avgLegibilityScore": 0.0,
                    "documentTypes": {},
                    "verifiedCount": 0
                },
                "rag": {
                    "total": 0,
                    "groundedCount": 0,
                    "fallbackCount": 0,
                    "groundingPassRate": 100.0
                },
                "recentEvents": []
            }
            
        latencies = [e["latencyMs"] for e in events]
        latencies.sort()
        avg_lat = round(sum(latencies) / len(latencies), 1)
        p50 = latencies[int(len(latencies) * 0.5)]
        p95 = latencies[min(int(len(latencies) * 0.95), len(latencies) - 1)]
        
        # STT aggregates
        stt_events = [e for e in events if e["type"] == "STT"]
        deepgram_cnt = sum(1 for e in stt_events if "deepgram" in str(e["details"].get("provider", "")).lower())
        whisper_cnt = sum(1 for e in stt_events if "whisper" in str(e["details"].get("provider", "")).lower())
        stt_confs = [e["details"].get("confidence", 0) for e in stt_events if "confidence" in e["details"]]
        avg_stt_conf = round(sum(stt_confs) / max(1, len(stt_confs)), 2)
        stt_langs = {}
        for e in stt_events:
            lang = e["details"].get("language", "Unknown")
            stt_langs[lang] = stt_langs.get(lang, 0) + 1
            
        # OCR aggregates
        ocr_events = [e for e in events if e["type"] == "OCR"]
        ocr_scores = [e["details"].get("legibilityScore", 0) for e in ocr_events if "legibilityScore" in e["details"]]
        avg_ocr_score = round(sum(ocr_scores) / max(1, len(ocr_scores)), 1)
        doc_types = {}
        for e in ocr_events:
            dtype = e["details"].get("documentType", "General Document")
            doc_types[dtype] = doc_types.get(dtype, 0) + 1
            
        # RAG aggregates
        rag_events = [e for e in events if e["type"] == "RAG"]
        grounded_cnt = sum(1 for e in rag_events if e["details"].get("status") == "GROUNDED")
        fallback_cnt = sum(1 for e in rag_events if e["details"].get("status") != "GROUNDED")
        rag_pass_rate = round((grounded_cnt / max(1, len(rag_events))) * 100, 1) if rag_events else 100.0
        
        recent = sorted(events[-20:], key=lambda x: x["timestamp"], reverse=True)
        
        return {
            "totalOperations": total,
            "p50LatencyMs": p50,
            "p95LatencyMs": p95,
            "avgLatencyMs": avg_lat,
            "stt": {
                "total": len(stt_events),
                "deepgramCount": deepgram_cnt,
                "whisperCount": whisper_cnt,
                "primaryRatio": round((deepgram_cnt / max(1, len(stt_events))) * 100, 1) if stt_events else 100.0,
                "avgConfidence": avg_stt_conf,
                "languages": stt_langs
            },
            "ocr": {
                "total": len(ocr_events),
                "avgLegibilityScore": avg_ocr_score,
                "documentTypes": doc_types,
                "verifiedCount": sum(1 for e in ocr_events if e["details"].get("legibilityScore", 0) >= 60)
            },
            "rag": {
                "total": len(rag_events),
                "groundedCount": grounded_cnt,
                "fallbackCount": fallback_cnt,
                "groundingPassRate": rag_pass_rate
            },
            "recentEvents": recent
        }

telemetry_service = TelemetryService()
