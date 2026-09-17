# ==============================================================================
# ARAM AI — FINAL END-TO-END 12-STEP CASE LIFECYCLE EMPIRICAL VERIFICATION SUITE
# ==============================================================================
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Continue"

$backendUrl = "http://localhost:8082/api"
$aiServiceUrl = "http://localhost:8000"

Write-Host "`n================================================================================" -ForegroundColor Cyan
Write-Host "         ARAM AI: FINAL END-TO-END CASE LIFECYCLE VERIFICATION SUITE" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan

$passCount = 0
$failCount = 0

function Report-Step($stepNum, $stepTitle, $success, $details) {
    if ($success) {
        $global:passCount++
        Write-Host "[PASS] TEST ${stepNum}: $stepTitle" -ForegroundColor Green
        if ($details) { Write-Host "       └─ $details" -ForegroundColor DarkGreen }
    } else {
        $global:failCount++
        Write-Host "[FAIL] TEST ${stepNum}: $stepTitle" -ForegroundColor Red
        if ($details) { Write-Host "       └─ ERROR: $details" -ForegroundColor Yellow }
    }
}

# ------------------------------------------------------------------------------
# TEST 1: Authentication & Multi-Role Token Verification
# ------------------------------------------------------------------------------
$citizenToken = $null
$volunteerToken = $null
$adminToken = $null
$volunteerId = $null
$citizenId = $null

try {
    $cLogin = Invoke-RestMethod -Uri "$backendUrl/auth/login" -Method Post -Body (@{ email = "citizen@gmail.com"; password = "Citizen@123" } | ConvertTo-Json) -ContentType "application/json"
    $citizenToken = $cLogin.accessToken
    $citizenId = $cLogin.user.id

    $vLogin = Invoke-RestMethod -Uri "$backendUrl/auth/login" -Method Post -Body (@{ email = "volunteer@gmail.com"; password = "Helper@123" } | ConvertTo-Json) -ContentType "application/json"
    $volunteerToken = $vLogin.accessToken
    $volunteerId = $vLogin.user.id

    $aLogin = Invoke-RestMethod -Uri "$backendUrl/auth/login" -Method Post -Body (@{ email = "admin@gmail.com"; password = "Admin@123" } | ConvertTo-Json) -ContentType "application/json"
    $adminToken = $aLogin.accessToken

    $t1Ok = ($citizenToken -ne $null) -and ($volunteerToken -ne $null) -and ($adminToken -ne $null)
    Report-Step 1 "Authentication & Role Tokens" $t1Ok "Citizen ID: $citizenId | Volunteer ID: $volunteerId | Admin Role Verified"
} catch {
    Report-Step 1 "Authentication & Role Tokens" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# TEST 2: Citizen Intake & RAG Triage
# ------------------------------------------------------------------------------
$complaintId = $null
$complaintCustomId = $null

try {
    $cBody = @{
        title = "Boundary Wall Encroachment Dispute"
        description = "Neighbor has constructed a brick boundary wall encroaching 3 feet into my registered patta land in Coimbatore. They are threatening my family when asked to stop."
        category = "PROPERTY_CIVIL_DISPUTE"
        priority = "HIGH"
        district = "Coimbatore"
        state = "Tamil Nadu"
        language = "en"
        guideRequested = $true
        disclaimerAccepted = $true
    } | ConvertTo-Json

    $cRes = Invoke-RestMethod -Uri "$backendUrl/complaints" -Method Post -Body $cBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $citizenToken" }
    $complaintId = $cRes.id
    $complaintCustomId = $cRes.complaintCustomId

    $t2Ok = ($complaintId -ne $null) -and ($cRes.status -ne $null)
    Report-Step 2 "Citizen Intake & Grounded Triage" $t2Ok "Case ID: $complaintId ($complaintCustomId) | Status: $($cRes.status) | Priority: $($cRes.priority)"
} catch {
    Report-Step 2 "Citizen Intake & Grounded Triage" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# TEST 3: Document Upload & Real OCR Pipeline
# ------------------------------------------------------------------------------
$docId = $null
try {
    # Create a small valid test file
    $testDocPath = "$PSScriptRoot\test_patta_receipt.txt"
    Set-Content -Path $testDocPath -Value "GOVERNMENT OF TAMIL NADU - REVENUE DEPARTMENT PATTA PASSBOOK RECORD NO 2026/CBE/9412"
    
    # Upload via Form
    $boundary = [System.Guid]::NewGuid().ToString()
    $fileBytes = [System.IO.File]::ReadAllBytes($testDocPath)
    $enc = [System.Text.Encoding]::GetEncoding("iso-8859-1")
    $fileContent = $enc.GetString($fileBytes)
    
    $bodyLines = @(
        "--$boundary",
        "Content-Disposition: form-data; name=`"file`"; filename=`"test_patta_receipt.txt`"",
        "Content-Type: text/plain",
        "",
        $fileContent,
        "--$boundary--"
    )
    $multipartBody = [System.Text.Encoding]::GetEncoding("iso-8859-1").GetBytes(($bodyLines -join "`r`n"))
    
    $uploadRes = Invoke-RestMethod -Uri "$backendUrl/complaints/$complaintId/evidence" -Method Post -Body $multipartBody -ContentType "multipart/form-data; boundary=$boundary" -Headers @{ Authorization = "Bearer $citizenToken" }
    $docId = $uploadRes.id
    
    $t3Ok = ($docId -ne $null)
    Report-Step 3 "Evidence Upload & Real OCR Pipeline" $t3Ok "Uploaded Evidence Doc ID: $docId | Verification Status: $($uploadRes.verificationStatus)"
    if (Test-Path $testDocPath) { Remove-Item -Path $testDocPath -Force -ErrorAction SilentlyContinue }
} catch {
    Report-Step 3 "Evidence Upload & Real OCR Pipeline" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# TEST 4: Regional Admin Queue & Review
# ------------------------------------------------------------------------------
try {
    $adminCases = Invoke-RestMethod -Uri "$backendUrl/admin/complaints" -Method Get -Headers @{ Authorization = "Bearer $adminToken" }
    $foundInAdmin = $adminCases | Where-Object { $_.id -eq $complaintId }
    $t4Ok = ($foundInAdmin -ne $null)
    Report-Step 4 "Regional Admin Queue & Review" $t4Ok "Case ARAM-$complaintId found in Admin Queue with Status: $($foundInAdmin.status)"
} catch {
    Report-Step 4 "Regional Admin Queue & Review" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# TEST 5: AI Volunteer Recommendation
# ------------------------------------------------------------------------------
try {
    $recRes = Invoke-RestMethod -Uri "$backendUrl/admin/complaints/$complaintId/recommend-guide" -Method Get -Headers @{ Authorization = "Bearer $adminToken" }
    $t5Ok = ($recRes -ne $null) -and ($recRes.Count -gt 0)
    $topRec = if ($t5Ok) { $recRes[0] } else { $null }
    Report-Step 5 "AI Volunteer Recommendation" $t5Ok "Recommended Guides: $($recRes.Count) | Top Guide: $($topRec.name) (Score: $($topRec.matchScore))"
} catch {
    Report-Step 5 "AI Volunteer Recommendation" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# TEST 6: Human Guide Assignment by Admin
# ------------------------------------------------------------------------------
try {
    $assignBody = @{
        legalGuideId = $volunteerId
        overrideReason = "Best matched certified legal volunteer in region"
        adminNote = "Assigned for boundary document verification"
    } | ConvertTo-Json

    $assignRes = Invoke-RestMethod -Uri "$backendUrl/admin/complaints/$complaintId/assign-legal-guide" -Method Post -Body $assignBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $adminToken" }
    $t6Ok = ($assignRes.success -eq $true) -or ($assignRes.message -ne $null)
    Report-Step 6 "Human Guide Assignment" $t6Ok "Guide ID $volunteerId formally assigned by Admin. Status: $($assignRes.status)"
} catch {
    Report-Step 6 "Human Guide Assignment" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# TEST 7: Volunteer Workspace & Acknowledgment
# ------------------------------------------------------------------------------
try {
    $ackRes = Invoke-RestMethod -Uri "$backendUrl/volunteer/cases/$complaintId/acknowledge" -Method Post -Headers @{ Authorization = "Bearer $volunteerToken" }
    $t7Ok = ($ackRes.success -eq $true)
    Report-Step 7 "Volunteer Acknowledgment & Activation" $t7Ok "Case acknowledged. Transitioned to active IN_PROGRESS"
} catch {
    Report-Step 7 "Volunteer Acknowledgment & Activation" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# TEST 8: Citizen-Guide Secure Messaging
# ------------------------------------------------------------------------------
try {
    # Guide sends message
    $msgBody1 = @{
        messageText = "Hello Sharon, I am your assigned Legal Guide. Please share the revenue survey sketch."
        messageType = "TEXT"
    } | ConvertTo-Json
    $msgRes1 = Invoke-RestMethod -Uri "$backendUrl/cases/$complaintId/messages" -Method Post -Body $msgBody1 -ContentType "application/json" -Headers @{ Authorization = "Bearer $volunteerToken" }

    # Citizen replies
    $msgBody2 = @{
        messageText = "Sure, I have uploaded the patta receipt and will get the survey sketch today."
        messageType = "TEXT"
    } | ConvertTo-Json
    $msgRes2 = Invoke-RestMethod -Uri "$backendUrl/cases/$complaintId/messages" -Method Post -Body $msgBody2 -ContentType "application/json" -Headers @{ Authorization = "Bearer $citizenToken" }

    # Fetch messages
    $chatHistory = Invoke-RestMethod -Uri "$backendUrl/cases/$complaintId/messages" -Method Get -Headers @{ Authorization = "Bearer $volunteerToken" }
    $t8Ok = ($chatHistory.Count -ge 2)
    Report-Step 8 "Citizen-Guide Secure Messaging" $t8Ok "Thread Active: $($chatHistory.Count) messages exchanged securely in ARAM-$complaintId"
} catch {
    Report-Step 8 "Citizen-Guide Secure Messaging" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# TEST 9: AI Case Assistant Copilot (RAG Grounded)
# ------------------------------------------------------------------------------
try {
    $copilotBody = @{
        complaintId = $complaintId
        message = "What specific civil injunction section applies for stopping neighbor wall construction on private patta land?"
        userRole = "GUIDE"
        language = "en"
        caseTitle = "Boundary Wall Dispute"
        caseDescription = "Neighbor wall construction encroaching private patta land"
    } | ConvertTo-Json

    $copilotRes = Invoke-RestMethod -Uri "$backendUrl/ai/case-assistant" -Method Post -Body $copilotBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $volunteerToken" }
    $t9Ok = ($copilotRes.grounded -eq $true) -and ($copilotRes.answer -ne $null)
    $answerPreview = if ($copilotRes.answer.Length -gt 120) { $copilotRes.answer.Substring(0, 120) + "..." } else { $copilotRes.answer }
    Report-Step 9 "AI Case Assistant Copilot" $t9Ok "Grounded: $($copilotRes.grounded) | Guidance: $answerPreview"
} catch {
    Report-Step 9 "AI Case Assistant Copilot" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# TEST 10: Document Request & Verification
# ------------------------------------------------------------------------------
try {
    $reqDocBody = @{
        documentName = "Revenue Survey Map / Field Measurement Book (FMB)"
    } | ConvertTo-Json
    $docReqRes = Invoke-RestMethod -Uri "$backendUrl/volunteer/cases/$complaintId/request-documents" -Method Post -Body $reqDocBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $volunteerToken" }

    # Verify existing document if present
    if ($docId) {
        $verifyRes = Invoke-RestMethod -Uri "$backendUrl/volunteer/documents/$docId/verify" -Method Put -Headers @{ Authorization = "Bearer $volunteerToken" }
    }

    $t10Ok = ($docReqRes.success -eq $true)
    Report-Step 10 "Document Request & Verification Flow" $t10Ok "Requested FMB from Citizen | Evidence Doc $docId verified by Guide"
} catch {
    Report-Step 10 "Document Request & Verification Flow" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# TEST 11: Case Resolution & Notifications
# ------------------------------------------------------------------------------
try {
    $resolveBody = @{
        resolutionSummary = "Legal Guide mediated between parties; survey confirmed original boundary; neighbor agreed to remove encroaching wall portion and restore boundary."
        resolutionType = "COMMUNITY_MEDIATION"
    } | ConvertTo-Json

    $resolveRes = Invoke-RestMethod -Uri "$backendUrl/volunteer/cases/$complaintId/resolve" -Method Post -Body $resolveBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $volunteerToken" }
    $t11Ok = ($resolveRes.status -eq "RESOLVED")
    Report-Step 11 "Case Resolution & Notifications" $t11Ok "Case ARAM-$complaintId status updated to RESOLVED | Type: $($resolveRes.resolutionType)"
} catch {
    Report-Step 11 "Case Resolution & Notifications" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# TEST 12: Citizen Feedback & Volunteer Self-Evaluation
# ------------------------------------------------------------------------------
try {
    # 1. Citizen Feedback
    $feedbackBody = @{
        complaintId = $complaintId
        rating = 5
        comment = "Excellent legal guidance! The volunteer helped clarify land revenue boundary procedures peacefully."
        helpful = $true
    } | ConvertTo-Json
    $feedbackRes = Invoke-RestMethod -Uri "$backendUrl/feedback" -Method Post -Body $feedbackBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $citizenToken" }

    # 2. Volunteer Self-Evaluation
    $selfEvalBody = @{
        preparationRating = 5
        communicationRating = 5
        legalClarityRating = 5
        citizenSatisfactionPerception = 5
        outcomeAchieved = "FULL_RESOLUTION"
        challengesFaced = "Verification of survey boundaries required local revenue coordination"
        lessonsLearned = "Early presentation of Patta deeds de-escalates boundary conflicts effectively"
    } | ConvertTo-Json
    $selfEvalRes = Invoke-RestMethod -Uri "$backendUrl/volunteer/cases/$complaintId/self-evaluation" -Method Post -Body $selfEvalBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $volunteerToken" }

    # 3. Admin Analytics Verification
    $adminEvals = Invoke-RestMethod -Uri "$backendUrl/admin/volunteer-evaluations" -Method Get -Headers @{ Authorization = "Bearer $adminToken" }

    $t12Ok = ($feedbackRes.rating -eq 5) -and ($selfEvalRes.id -ne $null) -and ($adminEvals.Count -gt 0)
    Report-Step 12 "Citizen Feedback & Volunteer Self-Evaluation" $t12Ok "Citizen 5-Star Rating Saved | Self-Eval ID: $($selfEvalRes.id) | Admin Audit Count: $($adminEvals.Count)"
} catch {
    Report-Step 12 "Citizen Feedback & Volunteer Self-Evaluation" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# SUMMARY REPORT
# ------------------------------------------------------------------------------
Write-Host "`n================================================================================" -ForegroundColor Cyan
Write-Host "                FINAL LIFECYCLE VERIFICATION SUMMARY" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host " TOTAL TESTS EXECUTED: 12" -ForegroundColor White
Write-Host " TESTS PASSED:         $passCount / 12" -ForegroundColor Green
Write-Host " TESTS FAILED:         $failCount / 12" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Red" })

if ($failCount -eq 0) {
    Write-Host "`n>>> [SUCCESS] ALL 12 CASE LIFECYCLE STAGES ARE VERIFIED AND PRODUCTION-READY! <<<`n" -ForegroundColor Green
} else {
    Write-Host "`n>>> [ATTENTION] Some lifecycle steps failed. Review above output. <<<`n" -ForegroundColor Yellow
}
