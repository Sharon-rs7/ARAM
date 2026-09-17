# ARAM — Explainable Guide Recommendation & Matching Engine

**Component**: AI Matching & Ranking Engine  
**Model**: `models/volunteer_ranking_model.onnx` + Dynamic Multi-Factor Heuristic  

---

## 1. Weighted Recommendation Formula

When a complaint reaches a Regional Admin, the system evaluates all active district guides using a multi-factor scoring algorithm:

$$\text{Match Score} = 0.25 \cdot D + 0.20 \cdot L + 0.20 \cdot S + 0.15 \cdot E + 0.10 \cdot A + 0.05 \cdot W + 0.05 \cdot C$$

| Factor | Description | Weight | Evaluation Logic |
| :--- | :--- | :--- | :--- |
| **$D$ (District Match)** | Geographic Proximity | `25%` | `1.0` if guide is stationed in complaint district, `0.0` otherwise |
| **$L$ (Language Match)** | Complainant Fluency | `20%` | `1.0` if guide speaks complaint language (e.g. Tamil), `0.0` otherwise |
| **$S$ (Specialization)**| Domain Expertise | `20%` | `1.0` if guide specializes in category (e.g. Labour Rights), `0.0` otherwise |
| **$E$ (Experience/ELO)** | Verified Case History| `15%` | Scaled by ELO rating and resolved case count |
| **$A$ (Availability)** | Real-Time Status | `10%` | `1.0` if marked AVAILABLE, `0.0` if BUSY or OFF_DUTY |
| **$W$ (Workload)** | Active Caseload | `5%` | $1.0 - \left(\frac{\text{Active Cases}}{\text{Max Capacity}}\right)$ |
| **$C$ (Similarity)** | Previous Precedents | `5%` | Historical success rate in identical legal categories |

---

## 2. Women Safety & Sensitive Case Policy

1. **Detection**: If a case is classified under sensitive categories (e.g. `DOMESTIC_VIOLENCE`, `WOMEN_SAFETY`) or the citizen explicitly sets `femaleGuideRequested = true`:
2. **Priority Filtering**: Candidate pool is immediately filtered for verified female legal guides with domestic violence / women safety training.
3. **Graceful Handling of Unavailability**: If no eligible female guide is currently available in the district:
   - System displays explicit warning to Regional Admin: *"No eligible female guide is currently available in this district."*
   - Admin is presented with controlled options:
     - Escalate to District Legal Services Authority (DLSA) Women's Cell.
     - Request statewide female guide cross-assignment.
     - Hold in priority queue with citizen consent.
