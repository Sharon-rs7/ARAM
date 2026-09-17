# ARAM AI — EMAIL DEPLOYMENT & SMTP GUIDE
**Accessible Rights & Assistance Management**  
*Production Hosting & Google SMTP Configuration*

---

## 1. Production Environment Variables (.env)

```env
# Central Mail Settings (ouraramsupport@gmail.com)
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=ouraramsupport@gmail.com
SPRING_MAIL_PASSWORD=your_16_digit_google_app_password
APP_MAIL_ENABLED=true
APP_MAIL_FROM_NAME=ARAM Legal Assistance
```

---

## 2. Google App Password Generation Steps

1. Log into Google Account **`ouraramsupport@gmail.com`**.
2. Navigate to **Security** $\rightarrow$ Ensure **2-Step Verification** is active.
3. Open **App Passwords**: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
4. Create an App Password with name: `ARAM AI Backend`.
5. Copy the generated 16-character code (e.g. `abcd efgh ijkl mnop`).
6. Place it in `SPRING_MAIL_PASSWORD`.

---

## 3. Docker Compose Mail Integration

`docker-compose.prod.yml` passes the mail environment variables directly to the `aram-backend` container:

```yaml
  backend:
    image: aram-backend:latest
    environment:
      - SPRING_MAIL_HOST=smtp.gmail.com
      - SPRING_MAIL_PORT=587
      - SPRING_MAIL_USERNAME=ouraramsupport@gmail.com
      - SPRING_MAIL_PASSWORD=${SPRING_MAIL_PASSWORD}
      - APP_MAIL_ENABLED=true
```
