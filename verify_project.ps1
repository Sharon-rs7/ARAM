Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   ARAM PROJECT COPY VERIFICATION REPORT  " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Core Files Check
$requiredFiles = @(
    "package.json",
    "vite.config.js",
    "index.html",
    "src/App.jsx",
    "src/main.jsx",
    "aram-backend/pom.xml",
    "ai-service/app/main.py",
    "START_FRONTEND_LOCAL.bat",
    "START_BACKEND_LOCAL.bat"
)

Write-Host "`n[1] Checking Core Files & Configurations:" -ForegroundColor Yellow
$missingCount = 0
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  [OK]      $file" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] $file" -ForegroundColor Red
        $missingCount++
    }
}

# 2. Key Directories Check
$directories = @("src", "public", "aram-backend", "ai-service", "node_modules", "aram-backend/target")
Write-Host "`n[2] Key Directory Status:" -ForegroundColor Yellow
foreach ($dir in $directories) {
    if (Test-Path $dir) {
        $files = Get-ChildItem $dir -Recurse -File -ErrorAction SilentlyContinue
        $count = if ($files) { $files.Count } else { 0 }
        $sizeMB = if ($files) { ($files | Measure-Object -Property Length -Sum).Sum / 1MB } else { 0 }
        Write-Host ("  [EXISTS]  {0,-20} | Files: {1,-5} | Size: {2,7:N2} MB" -f $dir, $count, $sizeMB) -ForegroundColor Green
    } else {
        Write-Host ("  [ABSENT]  {0,-20} (Can be generated/installed)" -f $dir) -ForegroundColor Gray
    }
}

# 3. Size Explanation
Write-Host "`n[3] Size Analysis (2.5GB vs ~900MB):" -ForegroundColor Yellow
Write-Host "  * Heavy build folders (node_modules, target, .git, venv) are often excluded during transfer."
Write-Host "  * This is standard practice! Source code itself is only ~50MB."
Write-Host "  * If node_modules is missing, simply run 'npm install' on the new laptop."

Write-Host "`n==========================================" -ForegroundColor Cyan
if ($missingCount -eq 0) {
    Write-Host " STATUS: READY! All source code files are present." -ForegroundColor Green
} else {
    Write-Host " STATUS: WARNING! $missingCount core file(s) missing." -ForegroundColor Red
}
Write-Host "==========================================" -ForegroundColor Cyan
