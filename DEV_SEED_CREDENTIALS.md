# Development Seed Credentials

These credentials are automatically seeded in the MySQL database during backend initialization when the tables are empty.

> [!WARNING]
> These credentials are for local development and testing purposes only. Change passwords before deploying to any production or staging environment.

## Seeding Rules
- Seed is triggered automatically on startup.
- Data will only be seeded if the `users` table is empty or the specific user emails do not exist.
- Passwords are encrypted using BCrypt.

## Seeding User Accounts

| **Role** | **Email** | **Plain Password** | **Mapped Role** | **Description** |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@aram.ai` | `Admin@123` | `ADMIN` | Full admin capabilities (dashboard, analytics, assign volunteers). |
| **Citizen** | `citizen@aram.ai` | `Citizen@123` | `CITIZEN` | Legal aid client role (register case, submit audio description). |
| **Volunteer / Helper** | `volunteer@aram.ai` | `Helper@123` | `HELPER` | Sharon Mary (volunteer role). Has 8 pre-seeded complaints (Labour, Consumer, Women Safety, Cyber Crime, Property) including 2 women-sensitive complaints with HIDDEN/PARTIAL visibility, and 30 days of activity logs. Certified as `womenSupportTrained` (Female). |
| **Advocate** | `advocate@aram.ai` | `Advocate@123` | `ADVOCATE` | Legal advocate advisor role. |
| **Authority Officer** | `officer@aram.ai` | `Officer@123` | `AUTHORITY` | Mapped officer role associated with local "Labour Office". |
