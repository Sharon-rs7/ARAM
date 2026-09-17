# ARAM AI — Database Relationships & Foreign Key Integrity

**Primary Database**: MySQL 8.0 (`aram_db:3306`)  
**Flyway Versioning**: `V1__init.sql` through `V11__add_missing_relationship_foreign_keys.sql`  

---

## 1. Foreign Key Verification & Cascade Policies

| Source Column | Target Column | On Delete Action | On Update Action | Integrity Guarantee |
| :--- | :--- | :--- | :--- | :--- |
| `complaints.citizen_id` | `users.id` | `RESTRICT` | `CASCADE` | Prevents deleting citizens with active complaints |
| `case_action_plans.complaint_id` | `complaints.id` | `CASCADE` | `CASCADE` | Action plan bound to complaint lifecycle |
| `case_action_plans.helper_id` | `users.id` | `SET NULL` | `CASCADE` | Preserves case milestones if guide is deactivated |
| `ai_analysis_results.complaint_id` | `complaints.id`| `CASCADE` | `CASCADE` | Automatic cascade of AI inference records |
| `audit_logs.complaint_id` | `complaints.id` | `SET NULL` | `CASCADE` | Immutable audit retention |
| `audit_logs.actor_id` | `users.id` | `RESTRICT` | `CASCADE` | Prevents deleting actor records associated with audit entries |

---

## 2. Empirical Orphan Record Verification

```sql
-- 1. Complaints -> Users Orphan Query:
SELECT COUNT(*) FROM complaints c LEFT JOIN users u ON c.citizen_id = u.id WHERE u.id IS NULL;
-- Output: 0 (Zero orphan records)

-- 2. Case Action Plans -> Complaints Orphan Query:
SELECT COUNT(*) FROM case_action_plans p LEFT JOIN complaints c ON p.complaint_id = c.id WHERE c.id IS NULL;
-- Output: 0 (Zero orphan records)

-- 3. AI Analysis Results -> Complaints Orphan Query:
SELECT COUNT(*) FROM ai_analysis_results r LEFT JOIN complaints c ON r.complaint_id = c.id WHERE c.id IS NULL;
-- Output: 0 (Zero orphan records)
```
