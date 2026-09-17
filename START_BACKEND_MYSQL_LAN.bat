@echo off
title ARAM Backend - MySQL
cd /d "%~dp0\aram-backend"
call mvnw.cmd spring-boot:run -Dmaven.test.skip=true -Dspring.profiles.active=mysql
pause

