# ARAM MySQL Database Setup Guide

This guide explains how to set up and verify the MySQL database for the ARAM legal aid application.

## 1. Create MySQL Database

Run the following command in your MySQL terminal or client (e.g., MySQL Workbench, `mysql` CLI):

```sql
CREATE DATABASE aram_db;
```

## 2. Configuration Settings

The application uses the `mysql` Spring Boot profile by default. Ensure the following configurations exist in [application-mysql.properties](file:///e:/prgt/New%20folder/aram/aram-backend/src/main/resources/application-mysql.properties):

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/aram_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=admin
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

## 3. Run the Backend

To start the backend with the MySQL profile activated:

```bash
cd "E:\prgt\New folder\aram\aram-backend"
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```

## 4. Verify Tables & Schema

After the backend compiles and runs successfully, Hibernate will automatically create the tables inside the `aram_db` database. 

To verify the tables have been created, run the following SQL query in MySQL:

```sql
USE aram_db;
SHOW TABLES;
```

Expected tables:
- `users`
- `complaints`
- `uploaded_documents`
- `notifications`
- `audit_logs`
- `volunteer_activity_logs`
- `volunteer_sessions`

## 5. Sample SQL (Verify Users)

You can check if the database has any users registered:

```sql
SELECT id, name, email, role, status FROM users;
```

## 6. Seed Credentials (Local Development Only)

| Email | Plain Password | Role |
| :--- | :--- | :--- |
| `admin@aram.ai` | `Admin@123` | `ADMIN` |
| `citizen@aram.ai` | `Citizen@123` | `CITIZEN` |
| `volunteer@aram.ai` | `Helper@123` | `HELPER` |
| `advocate@aram.ai` | `Advocate@123` | `ADVOCATE` |
| `officer@aram.ai` | `Officer@123` | `AUTHORITY` |

