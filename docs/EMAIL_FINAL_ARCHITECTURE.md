# ARAM AI — FINAL EMAIL ARCHITECTURE SPECIFICATION
**Accessible Rights & Assistance Management**  
*Official Single Sender Identity: `ouraramsupport@gmail.com`*

---

## 1. System Topology & Mail Pipeline

```mermaid
flowchart TD
    subgraph ClientAndEvents [Event Sources]
        CitizenAuth[Citizen Registration & Password Recovery]
        ComplaintFlow[Complaint Submission & Status Changes]
        AdminActions[Regional Admin Guide Invitations & Assignments]
        LandingContact[Public Landing Page Inquiries]
    end

    subgraph CoreBackend [ARAM Core Backend - Port 8082]
        Controllers[Auth / Complaint / Admin / Contact Controllers]
        EmailService[EmailService - Central Transactional Authority]
        TemplateEngine[EmailTemplateService - Branded HTML Generator]
        MongoBackup[(MongoDB - contact_inquiries & Audit Logs)]
        RedisQueue[(Redis - aram_email_jobs Queue)]
    end

    subgraph SMTPGateway [Google SMTP Infrastructure]
        SMTP[smtp.gmail.com:587 TLS]
        Sender[ouraramsupport@gmail.com]
    end

    subgraph Recipients [Target Inboxes]
        CitizenInbox[Citizen User Inbox]
        GuideInbox[Legal Guide Inbox]
        AdminInbox[Regional Admin Inbox]
        SupportTeam[ARAM Support Inbox - ouraramsupport@gmail.com]
    end

    ClientAndEvents --> Controllers
    Controllers --> EmailService
    EmailService --> TemplateEngine
    EmailService --> MongoBackup
    EmailService --> RedisQueue
    EmailService -->|Async TLS Stream| SMTP
    SMTP --> Sender
    Sender --> CitizenInbox
    Sender --> GuideInbox
    Sender --> AdminInbox
    Sender --> SupportTeam
```

---

## 2. Core Architectural Guarantees

1. **Single Official Sender**: All platform emails originate exclusively from `ouraramsupport@gmail.com`.
2. **Database Integrity Protection**: Failed SMTP connections never roll back or interrupt MySQL complaint filing transactions.
3. **Inquiry Backup**: Landing page contact form submissions are persisted in MongoDB `contact_inquiries` before email dispatch.
4. **Zero Secret Exposure**: SMTP App Passwords are strictly ingested via `SPRING_MAIL_PASSWORD` environment variable.
