# Script simple para validar endpoints básicos de Files
Write-Host "=== VALIDACIÓN SIMPLE DE MÓDULO FILES ===" -ForegroundColor Green

# Esperar a que el servidor esté disponible
Start-Sleep -Seconds 5

try {
    # Probar endpoint de listado de archivos (debería requerir autenticación)
    Write-Host "`n1. Probando GET /api/files (sin autenticación)..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri http://localhost:3001/api/files -ErrorAction Stop
        Write-Host "❌ ERROR: Endpoint debería requerir autenticación" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "✅ Correcto: Requiere autenticación (401)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Respuesta inesperada: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
        }
    }
    
    # Probar endpoint de upload (debería requerir autenticación)
    Write-Host "`n2. Probando POST /api/files/upload (sin autenticación)..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri http://localhost:3001/api/files/upload -Method POST -ErrorAction Stop
        Write-Host "❌ ERROR: Endpoint debería requerir autenticación" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "✅ Correcto: Requiere autenticación (401)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Respuesta inesperada: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
        }
    }
    
    # Probar endpoint de stats
    Write-Host "`n3. Probando GET /api/files/stats (sin autenticación)..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri http://localhost:3001/api/files/stats -ErrorAction Stop
        Write-Host "❌ ERROR: Endpoint debería requerir autenticación" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "✅ Correcto: Requiere autenticación (401)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Respuesta inesperada: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
        }
    }
    
    # Probar health endpoints
    Write-Host "`n4. Probando health endpoints..." -ForegroundColor Yellow
    try {
        $healthResponse = Invoke-RestMethod -Uri http://localhost:3001/api/health -ErrorAction Stop
        Write-Host "✅ Health endpoint funcionando" -ForegroundColor Green
        Write-Host "   Status: $($healthResponse.status)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Health endpoint no disponible: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "`n=== VALIDACIÓN BÁSICA COMPLETADA ===" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ ERROR GENERAL: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "StackTrace: $($_.Exception.StackTrace)" -ForegroundColor Red
}
