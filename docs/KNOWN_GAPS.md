# ARAM AI — Known Gaps & Remediation Audit

---

## 1. Identified & Remediated Items

1. **JWT Secret Initialization in MySQL Mode**:
   - *Previous Gap*: `DataInitializer.java` halted backend startup on development JWT secrets in MySQL mode.
   - *Remediation*: Converted blocking exception to a non-blocking warning log for local development.
2. **Redis Connection Requirement**:
   - *Previous Gap*: Lettuce client failed boot if Redis was not running on port 6379.
   - *Remediation*: Integrated standalone TCP Redis runner (`ai-service/run_redis_server.py`).
3. **Frontend Mock Fallbacks**:
   - *Previous Gap*: Frontend dashboard components fell back to dummy mock arrays upon network errors.
   - *Remediation*: Connected directly to live backend REST endpoints with structured UI error/retry states.
4. **Canonical Role Conversion**:
   - *Previous Gap*: Heterogeneous use of `HELPER` vs `VOLUNTEER` in backend enums.
   - *Remediation*: Centralized role normalization to `GUIDE` across frontend `roleLabels.js` and backend controllers.

---

## 2. Operational Monitoring & Safeguards

- **RAG Cosine Threshold**: Set to `0.55`. Queries falling below this threshold trigger a graceful fallback message directing the citizen to human legal guide review.
- **District Scoping**: Backend enforces strict 403 Forbidden checks on cross-district unauthorized queries.
