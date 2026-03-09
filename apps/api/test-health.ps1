# Script para probar endpoints de health
Write-Host "Iniciando pruebas de health endpoints..." -ForegroundColor Green

# Esperar a que el servidor esté disponible
Start-Sleep -Seconds 10

try {
    Write-Host "`n=== Probando /api/health ===" -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri http://localhost:3001/api/health
    $response | ConvertTo-Json -Depth 10
    
    Write-Host "`n=== Probando /api/health/simple ===" -ForegroundColor Yellow
    $simple = Invoke-RestMethod -Uri http://localhost:3001/api/health/simple
    $simple | ConvertTo-Json -Depth 10
    
    Write-Host "`n=== Probando /api/health/database ===" -ForegroundColor Yellow
    $db = Invoke-RestMethod -Uri http://localhost:3001/api/health/database
    $db | ConvertTo-Json -Depth 10
    
    Write-Host "`n=== Probando /api/health/storage ===" -ForegroundColor Yellow
    $storage = Invoke-RestMethod -Uri http://localhost:3001/api/health/storage
    $storage | ConvertTo-Json -Depth 10
    
    Write-Host "`n=== Probando /api/health/server ===" -ForegroundColor Yellow
    $server = Invoke-RestMethod -Uri http://localhost:3001/api/health/server
    $server | ConvertTo-Json -Depth 10
    
    Write-Host "`n=== Todas las pruebas completadas exitosamente ===" -ForegroundColor Green
    
} catch {
    Write-Host "Error en las pruebas: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}
