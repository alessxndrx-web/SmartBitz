import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageProvider, FileUploadResult, FileDownloadResult } from '../storage.interface';
import { promises as fs } from 'fs';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  constructor(private configService: ConfigService) {}

  async upload(file: Buffer, filename: string, mimeType: string, tenantId: string): Promise<FileUploadResult> {
    const storageConfig = this.configService.get('storage');
    const basePath = storageConfig.local.basePath;
    
    // Crear directorio del tenant si no existe
    const tenantDir = join(basePath, tenantId);
    await fs.mkdir(tenantDir, { recursive: true });

    // Generar nombre de archivo único
    const fileExt = extname(filename);
    const uniqueFilename = `${randomUUID()}${fileExt}`;
    const filePath = join(tenantDir, uniqueFilename);

    // Escribir archivo
    await fs.writeFile(filePath, file);

    // Generar URL
    const baseUrl = storageConfig.local.baseUrl;
    const url = `${baseUrl}/${tenantId}/${uniqueFilename}`;

    return {
      url,
      filename: uniqueFilename,
      size: file.length,
      mimeType,
      path: `${tenantId}/${uniqueFilename}`,
    };
  }

  async download(path: string, tenantId: string): Promise<FileDownloadResult> {
    const storageConfig = this.configService.get('storage');
    const basePath = storageConfig.local.basePath;
    const filePath = join(basePath, path);

    // Validar tenant isolation
    if (!path.startsWith(`${tenantId}/`)) {
      throw new Error('Access denied: Invalid tenant path');
    }

    try {
      const fileBuffer = await fs.readFile(filePath);
      const filename = path.split('/').pop() || 'download';
      
      return {
        stream: fileBuffer,
        filename,
        mimeType: 'application/octet-stream', // Se podría mejorar con un detector de mime types
        size: fileBuffer.length,
      };
    } catch (error) {
      throw new Error('File not found');
    }
  }

  async delete(path: string, tenantId: string): Promise<void> {
    const storageConfig = this.configService.get('storage');
    const basePath = storageConfig.local.basePath;
    const filePath = join(basePath, path);

    // Validar tenant isolation
    if (!path.startsWith(`${tenantId}/`)) {
      throw new Error('Access denied: Invalid tenant path');
    }

    try {
      await fs.unlink(filePath);
    } catch (error) {
      throw new Error('File not found or cannot be deleted');
    }
  }

  getUrl(path: string, tenantId: string): string {
    const storageConfig = this.configService.get('storage');
    const baseUrl = storageConfig.local.baseUrl;
    
    // Validar tenant isolation
    if (!path.startsWith(`${tenantId}/`)) {
      throw new Error('Access denied: Invalid tenant path');
    }

    return `${baseUrl}/${path}`;
  }

  async listFiles(tenantId: string, prefix?: string): Promise<string[]> {
    const storageConfig = this.configService.get('storage');
    const basePath = storageConfig.local.basePath;
    const tenantDir = join(basePath, tenantId);

    try {
      const files = await fs.readdir(tenantDir);
      return files
        .filter(file => !prefix || file.startsWith(prefix))
        .map(file => `${tenantId}/${file}`);
    } catch (error) {
      return [];
    }
  }
}
