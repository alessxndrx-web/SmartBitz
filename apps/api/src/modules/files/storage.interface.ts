export interface FileUploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  path: string;
}

export interface FileDownloadResult {
  stream: Buffer | ReadableStream;
  filename: string;
  mimeType: string;
  size: number;
}

export interface StorageProvider {
  upload(file: Buffer, filename: string, mimeType: string, tenantId: string): Promise<FileUploadResult>;
  download(path: string, tenantId: string): Promise<FileDownloadResult>;
  delete(path: string, tenantId: string): Promise<void>;
  getUrl(path: string, tenantId: string): string;
  listFiles(tenantId: string, prefix?: string): Promise<string[]>;
}

export interface FileMetadata {
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  tenantId: string;
  userId?: string;
  uploadedAt: Date;
}
