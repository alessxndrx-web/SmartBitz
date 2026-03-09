# Script para validar upload de archivos
Write-Host "=== INICIANDO VALIDACIÓN DE UPLOAD DE ARCHIVOS ===" -ForegroundColor Green

# Esperar a que el servidor esté disponible
Start-Sleep -Seconds 5

try {
    # 1. Crear tenant y usuario de prueba
    Write-Host "`n1. Creando tenant de prueba..." -ForegroundColor Yellow
    $tenantBody = @{
        name = "Test Files Tenant"
        slug = "test-files-tenant"
        ruc = "12345678901"
        businessType = "RETAIL"
        subscriptionPlan = "BASIC"
    } | ConvertTo-Json -Depth 10
    
    $tenantResponse = Invoke-RestMethod -Uri http://localhost:3001/api/tenants -Method POST -ContentType "application/json" -Body $tenantBody
    $tenantId = $tenantResponse.id
    Write-Host "✅ Tenant creado: $tenantId" -ForegroundColor Green
    
    # 2. Crear usuario
    Write-Host "`n2. Creando usuario de prueba..." -ForegroundColor Yellow
    $userBody = @{
        fullName = "Test User"
        email = "test@files.com"
        password = "testpassword123"
        role = "USER"
    } | ConvertTo-Json -Depth 10
    
    $userResponse = Invoke-RestMethod -Uri http://localhost:3001/api/auth/register -Method POST -ContentType "application/json" -Body $userBody
    $userId = $userResponse.user.id
    Write-Host "✅ Usuario creado: $userId" -ForegroundColor Green
    
    # 3. Login para obtener token
    Write-Host "`n3. Autenticando usuario..." -ForegroundColor Yellow
    $loginBody = @{
        email = "test@files.com"
        password = "testpassword123"
    } | ConvertTo-Json -Depth 10
    
    $loginResponse = Invoke-RestMethod -Uri http://localhost:3001/api/auth/login -Method POST -ContentType "application/json" -Body $loginBody
    $token = $loginResponse.access_token
    Write-Host "✅ Token obtenido" -ForegroundColor Green
    
    # 4. Crear archivo de prueba
    Write-Host "`n4. Creando archivo de prueba..." -ForegroundColor Yellow
    $testFilePath = ".\test-upload.txt"
    "Este es un archivo de prueba para upload" | Out-File -FilePath $testFilePath -Encoding UTF8
    
    # 5. Subir archivo
    Write-Host "`n5. Subiendo archivo..." -ForegroundColor Yellow
    $headers = @{
        Authorization = "Bearer $token"
        "x-tenant-id" = $tenantId
    }
    
    $fileBytes = [System.IO.File]::ReadAllBytes($testFilePath)
    $fileEnc = [System.Text.Encoding]::GetEncoding('UTF-8').GetString($fileBytes)
    $boundary = [System.Guid]::NewGuid().ToString()
    
    $body = @"
--$boundary
Content-Disposition: form-data; name="file"; filename="test-upload.txt"
Content-Type: text/plain

$fileEnc
--$boundary--
"@
    
    $uploadResponse = Invoke-RestMethod -Uri http://localhost:3001/api/files/upload -Method POST -ContentType "multipart/form-data; boundary=$boundary" -Headers $headers -Body $body
    $fileId = $uploadResponse.id
    Write-Host "✅ Archivo subido: $fileId" -ForegroundColor Green
    
    # 6. Verificar metadata
    Write-Host "`n6. Verificando metadata..." -ForegroundColor Yellow
    $metadataResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/files/$fileId" -Headers $headers
    Write-Host "✅ Metadata verificada: $($metadataResponse.originalName)" -ForegroundColor Green
    
    # 7. Descargar archivo
    Write-Host "`n7. Descargando archivo..." -ForegroundColor Yellow
    $downloadResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/files/$fileId" -Headers $headers
    $downloadedContent = [System.Text.Encoding]::UTF8.GetString($downloadResponse.Content)
    Write-Host "✅ Archivo descargado: $($downloadedContent.Length) bytes" -ForegroundColor Green
    
    # 8. Eliminar archivo
    Write-Host "`n8. Eliminando archivo..." -ForegroundColor Yellow
    Invoke-RestMethod -Uri "http://localhost:3001/api/files/$fileId" -Method DELETE -Headers $headers
    Write-Host "✅ Archivo eliminado" -ForegroundColor Green
    
    # Limpiar
    Remove-Item $testFilePath -ErrorAction SilentlyContinue
    
    Write-Host "`n=== VALIDACIÓN DE UPLOAD COMPLETADA EXITOSAMENTE ===" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ ERROR EN VALIDACIÓN: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
    Write-Host "StackTrace: $($_.Exception.StackTrace)" -ForegroundColor Red
}
