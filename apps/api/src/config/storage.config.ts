import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  provider: process.env.STORAGE_PROVIDER || 'local', // local, s3, gcs, azure
  local: {
    basePath: process.env.STORAGE_LOCAL_PATH || './uploads',
    baseUrl: process.env.STORAGE_LOCAL_URL || 'http://localhost:3001/files',
  },
  s3: {
    region: process.env.AWS_S3_REGION || 'us-east-1',
    bucket: process.env.AWS_S3_BUCKET || 'smartbitz-files',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: process.env.AWS_S3_ENDPOINT,
  },
  gcs: {
    projectId: process.env.GCS_PROJECT_ID,
    bucket: process.env.GCS_BUCKET || 'smartbitz-files',
    keyFilename: process.env.GCS_KEY_FILE,
  },
  azure: {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
    container: process.env.AZURE_STORAGE_CONTAINER || 'files',
  },
  limits: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
    allowedMimeTypes: process.env.ALLOWED_MIME_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  },
  security: {
    virusScan: process.env.VIRUS_SCAN_ENABLED === 'true',
    encryption: process.env.FILE_ENCRYPTION === 'true',
    retentionDays: parseInt(process.env.FILE_RETENTION_DAYS || '365'),
  },
}));
