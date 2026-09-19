from fastapi import APIRouter
from app.services.telemetry_service import telemetry_service

router = APIRouter(prefix="/telemetry", tags=["AI Operational Telemetry"])

@router.get("/stats")
def get_telemetry_stats():
    """Return aggregated live telemetry metrics for Super Admin Command Center."""
    return telemetry_service.get_summary()

@router.get("/recent")
def get_recent_telemetry():
    """Return recent non-PII operational events."""
    summary = telemetry_service.get_summary()
    return {"recentEvents": summary.get("recentEvents", [])}
