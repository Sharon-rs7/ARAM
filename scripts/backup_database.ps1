# ARAM Database Backup Script
$ErrorActionPreference = "Continue"

$backupDir = "E:\OurAram\My-aram-app\backups"
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

$timestamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
$mysqlBackupFile = "$backupDir\aram_db_backup_$timestamp.sql"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  ARAM DATABASE BACKUP UTILITY ($timestamp) " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. MySQL Dump via mysqldump if available
Write-Host "[1] Checking MySQL dump capability..." -ForegroundColor Yellow
$mysqldumpPath = (Get-Command mysqldump -ErrorAction SilentlyContinue).Source
if ($mysqldumpPath) {
    Write-Host "    -> Running mysqldump to $mysqlBackupFile..."
    & mysqldump -u root -p aram_db --result-file=$mysqlBackupFile
    if (Test-Path $mysqlBackupFile) {
        Write-Host "    -> [SUCCESS] MySQL backup created: $mysqlBackupFile" -ForegroundColor Green
    }
} else {
    Write-Host "    -> [INFO] mysqldump utility not in PATH. Generating REST entity snapshot..." -ForegroundColor Yellow
    
    # Export state via Super Admin authenticated API snapshot
    $headers = @{ "Content-Type" = "application/json" }
    $adminLogin = @{ username = "admin@gmail.com"; password = "Admin@123" } | ConvertTo-Json
    try {
        $authRes = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method Post -Headers $headers -Body $adminLogin
        $authHeader = @{ "Authorization" = "Bearer $($authRes.accessToken)" }
        
        $users = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/users" -Method Get -Headers $authHeader
        $complaints = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/complaints" -Method Get -Headers $authHeader
        $authorities = Invoke-RestMethod -Uri "http://localhost:8082/api/authorities" -Method Get -Headers $authHeader
        
        $snapshot = @{
            timestamp = $timestamp
            usersCount = $users.Count
            complaintsCount = $complaints.Count
            authoritiesCount = $authorities.Count
            users = $users
            complaints = $complaints
            authorities = $authorities
        }
        
        $jsonBackup = "$backupDir\aram_db_snapshot_$timestamp.json"
        $snapshot | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonBackup -Encoding utf8
        Write-Host "    -> [SUCCESS] REST Database Snapshot created: $jsonBackup" -ForegroundColor Green
    } catch {
        Write-Host "    -> [WARN] Could not capture snapshot: $_" -ForegroundColor Red
    }
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  BACKUP STEP COMPLETED                   " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
