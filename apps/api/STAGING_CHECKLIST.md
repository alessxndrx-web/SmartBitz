# SmartBitz Backend - Checklist Técnico de Staging

## 🚀 Checklist de Despliegue a Staging

### 1. **Variables de Entorno Requeridas**

#### Base de Datos
```env
DATABASE_URL="postgresql://user:password@localhost:5432/smartbitz_staging"
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=smartbitz_staging
DATABASE_PASSWORD=your_secure_password
DATABASE_NAME=smartbitz_staging
```

#### Aplicación
```env
NODE_ENV=staging
PORT=3001
API_PREFIX=/api
```

#### JWT y Seguridad
```env
JWT_SECRET=your_super_secure_jwt_secret_at_least_32_characters
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12
```

#### Storage
```env
STORAGE_PROVIDER=local
STORAGE_LOCAL_PATH=./uploads
STORAGE_LOCAL_URL=http://localhost:3001/files
MAX_FILE_SIZE=10485760
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/gif,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

#### Seguridad de Archivos
```env
FILE_ENCRYPTION=false
VIRUS_SCAN_ENABLED=false
FILE_RETENTION_DAYS=365
```

#### Cloud Storage (Opcional)
```env
# AWS S3
AWS_S3_REGION=us-east-1
AWS_S3_BUCKET=smartbitz-staging-files
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Google Cloud Storage
GCS_PROJECT_ID=your-project-id
GCS_BUCKET=smartbitz-staging-files
GCS_KEY_FILE=./path/to/service-account.json

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=your_connection_string
AZURE_STORAGE_CONTAINER=staging-files
```

#### Logging y Monitoring
```env
LOG_LEVEL=info
LOG_FORMAT=json
HEALTH_CHECK_INTERVAL=30000
HEALTH_CHECK_TIMEOUT=5000
```

### 2. **Requisitos de Infraestructura**

#### Base de Datos
- [ ] PostgreSQL 14+ instalado
- [ ] Base de datos `smartbitz_staging` creada
- [ ] Usuario `smartbitz_staging` con permisos adecuados
- [ ] Conexión SSL habilitada
- [ ] Backup automatizado configurado

#### Sistema de Archivos
- [ ] Directorio `./uploads` creado con permisos de escritura
- [ ] Espacio en disco mínimo: 10GB
- [ ] Backup de archivos configurado
- [ ] Si usa cloud storage: credenciales configuradas

#### Red y Firewall
- [ ] Puerto 3001 abierto
- [ ] HTTPS configurado (certificado SSL)
- [ ] Rate limiting configurado
- [ ] CORS configurado para dominios de staging

#### Servidor
- [ ] Node.js 18+ instalado
- [ ] Memoria RAM mínima: 2GB
- [ ] CPU mínima: 2 cores
- [ ] Espacio en disco: 20GB

### 3. **Configuración de Staging**

#### package.json Scripts
```json
{
  "scripts": {
    "build": "nest build",
    "start:staging": "node dist/main",
    "migrate:staging": "prisma migrate deploy",
    "seed:staging": "tsx src/database/prisma/seeds/staging-seed.ts"
  }
}
```

#### Environment-specific Config
```typescript
// src/config/staging.config.ts
export default {
  database: {
    url: process.env.DATABASE_URL,
    ssl: true,
    pool: {
      min: 2,
      max: 10,
    },
  },
  storage: {
    provider: 'local',
    local: {
      basePath: process.env.STORAGE_LOCAL_PATH,
    },
  },
  security: {
    bcryptRounds: 12,
    jwtExpiresIn: '24h',
  },
};
```

### 4. **Proceso de Despliegue**

#### 1. Preparación
```bash
# 1. Clonar repositorio
git clone <repository>
cd smartbitz

# 2. Instalar dependencias
npm ci --production

# 3. Configurar variables de entorno
cp .env.staging.example .env.staging
# Editar .env.staging con valores reales
```

#### 2. Base de Datos
```bash
# 1. Crear base de datos
createdb smartbitz_staging

# 2. Ejecutar migraciones
npm run prisma:migrate

# 3. (Opcional) Cargar datos de prueba
npm run seed:staging
```

#### 3. Build y Deploy
```bash
# 1. Build de la aplicación
npm run build

# 2. Verificar build
ls -la dist/

# 3. Iniciar aplicación
npm run start:staging
```

### 5. **Verificación Post-Deploy**

#### Health Checks
```bash
# Health general
curl http://localhost:3001/api/health

# Health individual
curl http://localhost:3001/api/health/database
curl http://localhost:3001/api/health/storage
curl http://localhost:3001/api/health/server
```

#### Tests de Integración
```bash
# Test de autenticación
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test de upload de archivo
curl -X POST http://localhost:3001/api/files/upload \
  -H "Authorization: Bearer <token>" \
  -H "x-tenant-id: test-tenant" \
  -F "file=@test.txt"

# Test de aislamiento de tenant
curl -X GET http://localhost:3001/api/files \
  -H "Authorization: Bearer <token>" \
  -H "x-tenant-id: otro-tenant"
# Debe retornar 403 o 404
```

#### Logs y Errores
```bash
# Ver logs de aplicación
tail -f logs/app.log

# Ver logs de errores
tail -f logs/error.log

# Ver logs de auditoría
tail -f logs/audit.log
```

### 6. **Security Checklist**

#### Autenticación y Autorización
- [ ] JWT secrets configurados
- [ ] Password hashing con bcrypt
- [ ] Rate limiting activo
- [ ] CORS configurado correctamente
- [ ] Headers de seguridad implementados

#### Validación de Datos
- [ ] Input validation en todos los endpoints
- [ ] Sanitización de datos
- [ ] SQL injection prevention
- [ ] XSS prevention

#### Archivos
- [ ] File size limits configurados
- [ ] MIME type validation activo
- [ ] Path traversal protection
- [ ] Virus scanning (si aplica)

#### Red
- [ ] HTTPS configurado
- [ ] Certificado SSL válido
- [ ] HSTS headers
- [ ] Security headers (X-Frame-Options, etc.)

### 7. **Performance Checklist**

#### Base de Datos
- [ ] Índices configurados
- [ ] Connection pooling optimizado
- [ ] Query performance monitoring
- [ ] Slow query log activo

#### Aplicación
- [ ] Response time < 500ms para endpoints críticos
- [ ] Memory usage < 80%
- [ ] CPU usage < 70%
- [ ] Error rate < 1%

#### Caching
- [ ] Response caching configurado
- [ ] CDN configurado (si aplica)
- [ ] Browser cache headers

### 8. **Monitoring y Alertas**

#### Métricas
- [ ] Health checks configurados
- [ ] Application metrics exportadas
- [ ] System metrics monitoring
- [ ] Custom business metrics

#### Alertas
- [ ] Uptime monitoring
- [ ] Error rate alerts
- [ ] Performance alerts
- [ ] Security alerts

#### Logging
- [ ] Structured logging implementado
- [ ] Log levels configurados
- [ ] Log rotation configurado
- [ ] Centralized logging

### 9. **Rollback Plan**

#### Comandos de Rollback
```bash
# 1. Detener aplicación
pm2 stop smartbitz-staging

# 2. Restaurar versión anterior
git checkout <previous-tag>

# 3. Rebuild y restart
npm ci --production
npm run build
npm run start:staging

# 4. Verificar estado
curl http://localhost:3001/api/health
```

#### Database Rollback
```bash
# 1. Backup previo
pg_dump smartbitz_staging > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Si es necesario, restaurar
psql smartbitz_staging < backup_file.sql
```

### 10. **Documentación Final**

#### URLs de Staging
- API: https://staging-api.smartbitz.com
- Health: https://staging-api.smartbitz.com/api/health
- Docs: https://staging-api.smartbitz.com/docs

#### Contactos
- Developer: [email]
- DevOps: [email]
- Emergency: [phone]

#### Notas
- [ ] Revisión de seguridad completada
- [ ] Tests de carga ejecutados
- [ ] Documentación actualizada
- [ ] Equipo entrenado en procedimientos

---

## ✅ **CHECKLIST FINAL**

Antes de ir a producción, confirmar:

- [ ] Todos los items de este checklist están completados
- [ ] Tests automatizados pasan
- [ ] Manual de operación actualizado
- [ ] Equipo de soporte capacitado
- [ ] Procedimientos de emergencia documentados
