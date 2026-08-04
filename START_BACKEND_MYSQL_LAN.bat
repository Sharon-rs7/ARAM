@echo off
title ARAM Backend - MySQL
cd /d "%~dp0\aram-backend"
call mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=mysql
pause

