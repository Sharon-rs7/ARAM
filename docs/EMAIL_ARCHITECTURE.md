# ARAM AI — CENTRALIZED EMAIL ARCHITECTURE
**Accessible Rights & Assistance Management**  
*Official Sender Identity: `ouraramsupport@gmail.com`*

---

## 1. System Topology & Mail Pipeline

```mermaid
flowchart TD
    subgraph ClientLayer [Client & Role Layer]
        Citizen[Citizen UI - /register, /forgot-password, /contact]
        Admin[Admin UI - /admin/guides/invite]
        CoreEvents[Complaint Lifecycle Events]
    end

    subgraph BackendLayer [Core Backend Service - Port 8082]
        Controllers[AuthController / ComplaintController / ContactController / AdminController]
        ServiceLayer[AuthService / PasswordResetService / ComplaintService]
        CentralMail[EmailService - Central Mail Sender]
        Templates[EmailTemplateService - Branded HTML Builder]
        MongoLog[MongoLogService - Inquiries & Delivery Audit]
    end

    subgraph SMTPGateway [Official Mail Gateway]
        GmailSMTP[Google SMTP - smtp.gmail.com:587 TLS]
        OfficialSender[ouraramsupport@gmail.com]
    end

    subgraph Recipients [Target Inboxes]
        CitizenInbox[Citizen Inbox]
        GuideInbox[Guide Inbox]
        SupportInbox[ARAM Support Inbox (ouraramsupport@gmail.com)]
    end

    Citizen -->|API Request| Controllers
    Admin -->|Invite Request| Controllers
    CoreEvents -->|State Change| ServiceLayer
    Controllers --> ServiceLayer
    ServiceLayer --> CentralMail
    CentralMail --> Templates
    CentralMail --> MongoLog
    CentralMail -->|Async TLS Auth| GmailSMTP
    GmailSMTP --> OfficialSender
    OfficialSender --> CitizenInbox
    OfficialSender --> GuideInbox
    OfficialSender --> SupportInbox
```

---

## 2. Key Architectural Guarantees

1. **Single Authoritative Sender**: Every transactional email originates strictly from `ouraramsupport@gmail.com` (`ARAM Legal Assistance`).
2. **Non-Blocking Asynchronous Delivery**: All SMTP operations run inside a background thread pool (`CompletableFuture.runAsync`), ensuring that database transactions (user registration, complaint filing) are never blocked by network latency.
3. **Database-Backed Fallback**: Contact messages and audit alerts are saved directly to MongoDB / local logs so zero messages are lost even if SMTP network connectivity drops.
4. **Clean Decoupling**: Frontend and AI microservices do not hold email credentials or send emails directly.
