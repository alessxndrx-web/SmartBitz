# PowerShell Script for Multi-Tenant Isolation Testing
$BASE_URL = "http://localhost:3001/api"

function Invoke-ApiRequest {
    param(
        [string]$Method = "GET",
        [string]$Endpoint,
        [string]$Body = $null,
        [hashtable]$Headers = @{}
    )
    
    try {
        $params = @{
            Uri = "$BASE_URL$Endpoint"
            Method = $Method
            Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params -ErrorAction Stop
        return @{ Success = $true; Data = $response; Status = 200 }
    }
    catch {
        $errorData = $null
        if ($_.ErrorDetails.Message) {
            try {
                $errorData = $_.ErrorDetails.Message | ConvertFrom-Json
            }
            catch {
                $errorData = @{ message = $_.ErrorDetails.Message }
            }
        }
        else {
            $errorData = @{ message = $_.Exception.Message }
        }
        
        return @{ 
            Success = $false; 
            Error = $errorData; 
            Status = $_.Exception.Response.StatusCode.value__
        }
    }
}

function Test-BasicSecurity {
    Write-Host "🧪 Testing Basic Multi-Tenant Security with PowerShell" -ForegroundColor Green
    Write-Host ""
    
    $passedTests = 0
    $totalTests = 0
    
    # Test 1: Server requires authentication
    $totalTests++
    Write-Host "🔍 Test 1: Server requires authentication" -ForegroundColor Yellow
    $result1 = Invoke-ApiRequest -Endpoint "/tenants"
    if (-not $result1.Success -and $result1.Status -eq 401) {
        Write-Host "✅ PASS: Server correctly requires authentication" -ForegroundColor Green
        $passedTests++
    }
    else {
        Write-Host "❌ FAIL: Server should require authentication" -ForegroundColor Red
        Write-Host "   Response: $($result1.Error.message)" -ForegroundColor Red
    }
    
    # Test 2: Multiple endpoints require authentication
    $totalTests++
    Write-Host ""
    Write-Host "🔍 Test 2: All endpoints require authentication" -ForegroundColor Yellow
    $endpoints = @("/customers", "/invoices", "/inventory/items", "/purchases", "/support", "/files")
    $allProtected = $true
    
    foreach ($endpoint in $endpoints) {
        $result = Invoke-ApiRequest -Endpoint $endpoint
        if (-not (-not $result.Success -and $result.Status -eq 401)) {
            $allProtected = $false
            Write-Host "   ❌ $endpoint is not properly protected" -ForegroundColor Red
        }
        else {
            Write-Host "   ✅ $endpoint requires authentication" -ForegroundColor Green
        }
    }
    
    if ($allProtected) {
        Write-Host "✅ PASS: All endpoints require authentication" -ForegroundColor Green
        $passedTests++
    }
    
    # Test 3: Invalid token is rejected
    $totalTests++
    Write-Host ""
    Write-Host "🔍 Test 3: Invalid token is rejected" -ForegroundColor Yellow
    $result3 = Invoke-ApiRequest -Endpoint "/tenants" -Headers @{ Authorization = "Bearer invalid-token" }
    if (-not $result3.Success -and $result3.Status -eq 401) {
        Write-Host "✅ PASS: Invalid token is rejected" -ForegroundColor Green
        $passedTests++
    }
    else {
        Write-Host "❌ FAIL: Invalid token should be rejected" -ForegroundColor Red
        Write-Host "   Response: $($result3.Error.message)" -ForegroundColor Red
    }
    
    # Test 4: Registration endpoint validation
    $totalTests++
    Write-Host ""
    Write-Host "🔍 Test 4: Registration endpoint validation" -ForegroundColor Yellow
    $result4 = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/register" -Body '{"fullName":"Test User","email":"test@example.com","password":"password123","role":"owner","tenantSlug":"nonexistent"}'
    if (-not $result4.Success -and $result4.Status -eq 401 -and $result4.Error.message -like "*Tenant not found*") {
        Write-Host "✅ PASS: Registration validates tenant existence" -ForegroundColor Green
        $passedTests++
    }
    else {
        Write-Host "❌ FAIL: Registration should validate tenant" -ForegroundColor Red
        Write-Host "   Response: $($result4.Error.message)" -ForegroundColor Red
    }
    
    # Summary
    Write-Host ""
    Write-Host "📊 POWERSHELL SECURITY TEST RESULTS" -ForegroundColor Cyan
    Write-Host "Passed: $passedTests/$totalTests" -ForegroundColor White
    $successRate = [math]::Round(($passedTests / $totalTests) * 100, 1)
    Write-Host "Success Rate: $successRate%" -ForegroundColor White
    
    if ($passedTests -eq $totalTests) {
        Write-Host ""
        Write-Host "🎉 ALL SECURITY TESTS PASSED - PowerShell Commands Working!" -ForegroundColor Green
        Write-Host "🔐 Multi-tenant isolation foundation is properly secured." -ForegroundColor Green
        return $true
    }
    else {
        Write-Host ""
        Write-Host "⚠️ SOME SECURITY TESTS FAILED - Security Issues Detected!" -ForegroundColor Red
        return $false
    }
}

# Main execution
Write-Host "🚀 Starting PowerShell Multi-Tenant Security Validation" -ForegroundColor Magenta
Write-Host ""

try {
    $allTestsPassed = Test-BasicSecurity
    
    if ($allTestsPassed) {
        Write-Host ""
        Write-Host "✨ POWERSHELL VALIDATION COMPLETE: Security Foundation SECURE" -ForegroundColor Green
        Write-Host "📝 PowerShell commands are working correctly for API testing" -ForegroundColor Green
        Write-Host "🔧 Ready for advanced multi-tenant isolation tests" -ForegroundColor Green
        exit 0
    }
    else {
        Write-Host ""
        Write-Host "🚨 POWERSHELL VALIDATION FAILED: Security Issues Detected!" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "❌ PowerShell test execution failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
