import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageProvider, FileUploadResult, FileDownloadResult } from '../storage.interface';
import { promises as fs } from 'fs';
import { join, extname, resolve, sep, normalize } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  constructor(private configService: ConfigService) {}

  private resolveTenantFilePath(basePath: string, tenantId: string, filePath: string): string {
    if (!filePath || filePath.includes('\0')) {
      throw new Error('Invalid file path');
    }

    const normalized = normalize(filePath).replace(/\\/g, '/').replace(/^\/+/, '');
    if (!normalized.startsWith(`${tenantId}/`)) {
      throw new Error('Access denied: Invalid tenant path');
    }

    const tenantRelativePath = normalized.slice(tenantId.length + 1);
    const tenantRoot = resolve(basePath, tenantId);
    const resolvedPath = resolve(tenantRoot, tenantRelativePath);

    if (resolvedPath !== tenantRoot && !resolvedPath.startsWith(`${tenantRoot}${sep}`)) {
      throw new Error('Access denied: Invalid tenant path');
    }

    return resolvedPath;
  }

  async upload(file: Buffer, filename: string, mimeType: string, tenantId: string): Promise<FileUploadResult> {
    const storageConfig = this.configService.get('storage');
    const basePath = storageConfig.local.basePath;

    const tenantDir = join(basePath, tenantId);
    await fs.mkdir(tenantDir, { recursive: true });

    const fileExt = extname(filename);
    const uniqueFilename = `${randomUUID()}${fileExt}`;
    const filePath = join(tenantDir, uniqueFilename);

    await fs.writeFile(filePath, file);

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
    const filePath = this.resolveTenantFilePath(basePath, tenantId, path);

    try {
      const fileBuffer = await fs.readFile(filePath);
      const filename = path.split('/').pop() || 'download';

      return {
        stream: fileBuffer,
        filename,
        mimeType: 'application/octet-stream',
        size: fileBuffer.length,
      };
    } catch (error) {
      throw new Error('File not found');
    }
  }

  async delete(path: string, tenantId: string): Promise<void> {
    const storageConfig = this.configService.get('storage');
    const basePath = storageConfig.local.basePath;
    const filePath = this.resolveTenantFilePath(basePath, tenantId, path);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      throw new Error('File not found or cannot be deleted');
    }
  }

  getUrl(path: string, tenantId: string): string {
    const storageConfig = this.configService.get('storage');
    const baseUrl = storageConfig.local.baseUrl;

    this.resolveTenantFilePath(storageConfig.local.basePath, tenantId, path);
    const normalized = normalize(path).replace(/\\/g, '/').replace(/^\/+/, '');

    return `${baseUrl}/${normalized}`;
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
