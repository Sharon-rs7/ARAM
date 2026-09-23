@echo off
TITLE ARAM Backend (Spring Boot)
echo ========================================================
echo Starting ARAM Spring Boot Backend on Port 8082...
echo ========================================================
cd /d E:\OurAram\My-aram-app\aram-backend
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=mysql
pause
