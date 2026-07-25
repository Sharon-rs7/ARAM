# ARAM: AI-Powered Smart Complaint Management and Legal Aid Triage System
## Academic Project Report

---

### 1. Project Abstract & Overview
In India, low-income citizens and low-literacy individuals face significant hurdles in accessing early legal guidance. When disputes arise, identifying the correct government jurisdiction, drafting petitions, or finding suitable legal volunteers can be complicated and expensive.

**ARAM** is an academic prototype designed to address this problem. It is an AI-powered multilingual portal that helps citizens submit grievances (via text or voice), triages their complaints by predicting categories and priority levels, and maps them to local authorities and recommended checklists. It also facilitates linking citizens to legal aid volunteers and advocates, with built-in protections for sensitive cases (such as gender-based matching rules).

---

### 2. Core Problem Statement
1. **Accessibility Barriers:** High-cost legal consultations prevent underprivileged citizens from getting initial advice.
2. **Procedural Complexity:** Navigating various government departments (Labour, Civil, Land, Domestic) is confusing.
3. **Literacy & Language Constraints:** Citizens may not be able to write down formal complaints in English. Voice input and local languages (Tamil, Hindi) are necessary.
4. **Safety & Privacy in Sensitive Cases:** Domestic or women-centric grievances require strict control over who views the files and who is assigned to mediate.

---

### 3. System Architecture & Tech Stack
The project is built as a three-tier system:

```text
  [ React Frontend ] <----> [ Spring Boot Backend API ] <----> [ H2 In-Memory DB ]
                                     ^
                                     |
                                     v
                           [ FastAPI Python AI Service ]
```

* **Frontend:** React (Vite-based SPA), Tailwind CSS, Framer Motion (for animations), Lucide icons, Recharts (for dashboards).
* **Backend:** Java 17, Spring Boot, Spring Security (with stateless JWT auth), Spring Data JPA.
* **AI & Machine Learning Engine:** Python 3.10, FastAPI, Scikit-Learn (TF-IDF Vectorizer + Classifiers), PyTesseract (for document OCR validation), and OpenAI's Whisper model via `faster-whisper` (for speech transcribing).
* **Database:** H2 Database Engine (with MySQL mode for local dev memory operations) and optional MongoDB for audit logs.

---

### 4. Implementation Status (What We Did)

#### A. Citizen Module
* **Complaint Lodging:** Citizens can submit complaints with a title, description, district, and inputs.
* **Multilingual Voice Input:** Speech-to-text recording translates spoken Tamil, English, and Hindi into text descriptions.
* **Document Locker:** Citizens can upload legal proofs. An OCR system scans the document (e.g., salary slip, notice) to verify if the uploaded document matches the complaint category.
* **AI Analysis Summary:** Shows the predicted department, urgency level, next steps checklist, and draft petition layout.

#### B. Volunteer Module
* **Assigned Cases:** Helpers can view the details of complaints assigned to them by the admin.
* **Mediation Logs:** Volunteers can review the citizen's files, write case reviews, update dispute resolution progress, and submit comments.

#### C. Coordinator Admin Module
* **System Metrics Dashboard:** View active statistics, category distributions, and monthly trends.
* **User & Volunteer Directories:** Create helper accounts, verify registrations, and manage system users.
* **Override Allocation Log:** Assign or re-assign cases to volunteers. If a male helper is assigned to a sensitive domestic case, the system flags a warning and requires a written justification which is written to the audit log.
* **Audit Trail:** Logs user logins, category modifications, and manual assignments.

---

### 5. Mocked Components & System Limitations (What We Couldn't Do)
* **Real-time LLM Chatbot:** Dynamic LLM execution (such as running a large model locally) is constrained by local development hardware. The chatbot uses a pre-seeded, rule-based response template representing legal advice.
* **Multilingual Translation Proxy:** Full translation relies on standard dictionary mappings. Production-grade translation requires commercial translation API keys.
* **Voice Speech-to-Speech:** Read-aloud features use the standard Web Speech API supported by the browser instead of dedicated neural text-to-speech models.

---

### 6. Self-Assessment: Right vs. Wrong

#### What We Did Right (Strengths):
* **Security & Roles:** Role-based route protection on both frontend and backend restricts illegal URL access.
* **Rule-based Fallbacks:** If the Python AI server goes offline, the Spring Boot backend has fallback classifiers that prevent application crashes.
* **PWA offline support:** Service workers catch offline status and display a friendly page when connectivity drops.

#### Mistakes & Issues (Identified Flaws):
* **Documentation Overload:** Initially, the project folder had too many automated test scripts and audit markdown reports, making it look like a corporate deployment rather than a student project. We cleaned these up to maintain a simple structure.
* **Hardcoded Endpoints:** Some services had hardcoded local URLs instead of dynamically fetching endpoints from environment files.
* **H2 In-Memory DB Reset:** Because we use H2 in-memory DB by default, database records are wiped when the server stops. (For persistence, changing the profile to MySQL is required).
