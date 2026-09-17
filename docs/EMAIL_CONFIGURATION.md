# ARAM AI — EMAIL CONFIGURATION SPECIFICATION
**Accessible Rights & Assistance Management**  
*Production SMTP & Environment Variables*

---

## 1. Required Production Environment Variables

```env
# Central Transactional Mail Settings
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=ouraramsupport@gmail.com
SPRING_MAIL_PASSWORD=your_16_digit_google_app_password
APP_MAIL_ENABLED=true
APP_MAIL_FROM_NAME=ARAM Legal Assistance
APP_MAIL_REPLY_TO=ouraramsupport@gmail.com
APP_PUBLIC_URL=https://your-production-aram-domain.com
```

---

## 2. Google App Password Generation Protocol

1. Sign in to Google Account: `ouraramsupport@gmail.com`.
2. Ensure **2-Step Verification** is turned ON.
3. Open: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
4. Create App Password with name: `ARAM AI Backend`.
5. Copy the 16-character code (format: `xxxx xxxx xxxx xxxx`).
6. Set it in `SPRING_MAIL_PASSWORD`.
