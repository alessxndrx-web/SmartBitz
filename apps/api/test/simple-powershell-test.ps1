# Simple PowerShell Test for API
$BASE_URL = "http://localhost:3001/api"

Write-Host "🧪 Testing API with PowerShell commands" -ForegroundColor Green

# Test 1: Check if server requires authentication
Write-Host "🔍 Test 1: Server requires authentication" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/tenants" -ErrorAction Stop
    Write-Host "❌ FAIL: Server should require authentication" -ForegroundColor Red
}
catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ PASS: Server correctly requires authentication" -ForegroundColor Green
    }
    else {
        Write-Host "❌ FAIL: Unexpected error - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 2: Test multiple endpoints
Write-Host ""
Write-Host "🔍 Test 2: All endpoints require authentication" -ForegroundColor Yellow
$endpoints = @("/customers", "/invoices", "/inventory/items", "/purchases", "/support", "/files")
$allProtected = $true

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL$endpoint" -ErrorAction Stop
        Write-Host "   ❌ $endpoint is not protected" -ForegroundColor Red
        $allProtected = $false
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "   ✅ $endpoint requires authentication" -ForegroundColor Green
        }
        else {
            Write-Host "   ❌ $endpoint unexpected error" -ForegroundColor Red
            $allProtected = $false
        }
    }
}

if ($allProtected) {
    Write-Host "✅ PASS: All endpoints require authentication" -ForegroundColor Green
}

# Test 3: Invalid token
Write-Host ""
Write-Host "🔍 Test 3: Invalid token rejection" -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer invalid-token" }
    $response = Invoke-RestMethod -Uri "$BASE_URL/tenants" -Headers $headers -ErrorAction Stop
    Write-Host "❌ FAIL: Invalid token should be rejected" -ForegroundColor Red
}
catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ PASS: Invalid token is rejected" -ForegroundColor Green
    }
    else {
        Write-Host "❌ FAIL: Unexpected error - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 PowerShell API testing completed!" -ForegroundColor Green
Write-Host "🔧 Commands are working correctly for endpoint validation" -ForegroundColor Green
