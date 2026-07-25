# Secure Case Communication Report

This report documents the security controls, entities, REST endpoints, and privacy shields implemented for the ARAM chat module.

## Database Schema / Entities

### 1. `CaseChatThread` (`case_chat_threads`)
- **id:** Primary key.
- **complaintId:** Foreign key referencing the complaint.
- **publicUserId:** Foreign key referencing the Citizen.
- **legalGuideId:** Foreign key referencing the assigned Guide.
- **status:** `OPEN` or `CLOSED`.
- **timestamps:** `createdAt` and `updatedAt`.

### 2. `CaseMessage` (`case_messages`)
- **id:** Primary key.
- **threadId:** Foreign key referencing the chat thread.
- **senderId:** User ID of the sender.
- **senderRole:** `CITIZEN`, `HELPER`, or `ADMIN`.
- **messageType:** `TEXT`, `DOCUMENT_REQUEST`, `STATUS_UPDATE`, or `SYSTEM`.
- **messageText:** Field-level encrypted content.
- **fileReference:** Optional document path reference.
- **readStatus:** Boolean flag tracking read indicators.

### 3. `LegalGuideCaseNote` (`legal_guide_case_notes`)
- **id:** Primary key.
- **complaintId:** Complaint reference.
- **legalGuideId:** Writer ID.
- **noteText:** Field-level encrypted note content.
- **visibility:** `PRIVATE`, `ADMIN_VISIBLE`, or `USER_VISIBLE`.

---

## Secure API Endpoints

| Method | Endpoint | Access Roles | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/admin/complaints/{id}/assign-legal-guide` | `ADMIN` | Assigns a helper, validates override reasons, initializes chat. |
| **GET** | `/api/admin/complaints/{id}/recommended-guides` | `ADMIN` | Computes match rankings based on specialization and availability. |
| **GET** | `/api/cases/{complaintId}/messages` | `CITIZEN`, `HELPER`, `ADMIN` | Retrieves chronological messages for authorized case participants. |
| **POST** | `/api/cases/{complaintId}/messages` | `CITIZEN`, `HELPER`, `ADMIN` | Posts a new message and sends counterpart alert notifications. |
| **POST** | `/api/volunteer/cases/{id}/notes` | `HELPER` | Records internal notes on assigned case files. |
| **PUT** | `/api/volunteer/cases/{id}/status` | `HELPER`, `ADMIN` | Performs state machine transition with audit history updates. |
| **POST** | `/api/volunteer/cases/{id}/request-documents` | `HELPER` | Issues alert requesting specific document evidence. |
| **POST** | `/api/volunteer/cases/{id}/escalate` | `HELPER` | Escalates complaint file directly to Admin. |

---

## Security & Privacy Control Rules

1. **Access Isolation:** Only the assigned Citizen, assigned Legal Guide, or Portal Administrators can read or write in a case chat room. Unassigned volunteers receive a `403 Forbidden` response.
2. **Contact Shielding:** Contact details (phone numbers and emails) are masked in all user-facing views to enforce in-app communication as the default safe channel.
3. **Identity Visibility Shield:**
   - **HIDDEN:** Legal Guide sees user name as `Protected Identity`.
   - **PARTIAL:** Legal Guide sees only location and preferred language.
   - **VISIBLE:** Standard public name fields are displayed.

---

## Encryption Roadmap (TODO)
> [!NOTE]
> **Pending Field-level Encryption:** Text contents in `CaseMessage.messageText` and `LegalGuideCaseNote.noteText` currently leverage the JPA `EncryptedStringConverter` utility (symmetric AES encryption). A production HSM (Hardware Security Module) integration for dynamic key rotation is planned for Phase 2.
