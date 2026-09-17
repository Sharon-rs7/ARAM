# ARAM AI — EMAIL TROUBLESHOOTING GUIDE
**Accessible Rights & Assistance Management**  
*Diagnosing and Resolving SMTP & Delivery Issues*

---

## 1. Common Issues & Resolutions

### Issue 1: `MailAuthenticationException: 535-5.7.8 Username and Password not accepted`
- **Root Cause**: Regular Gmail login password used instead of a 16-character Google App Password, or `SPRING_MAIL_PASSWORD` is empty/unset.
- **Resolution**: Generate a 16-character App Password at `https://myaccount.google.com/apppasswords` and provide it to `SPRING_MAIL_PASSWORD`.

### Issue 2: `MailConnectException / SocketTimeoutException`
- **Root Cause**: Firewall or hosting provider blocks outbound port 587.
- **Resolution**: Verify outbound TLS connectivity on port 587 to `smtp.gmail.com`.

### Issue 3: Inquiries Not Received in Inbox
- **Diagnostic Step**: Check MongoDB `contact_inquiries` collection. All messages submitted on the landing page are saved permanently in MongoDB even if SMTP fails.
