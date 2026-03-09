import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateFileDto, FileCategory } from './dto/create-file.dto';
import { StorageProvider, FileUploadResult, FileDownloadResult } from './storage.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FilesService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    @Inject('StorageProvider') private storageProvider: StorageProvider,
  ) {}

  private sanitizeFileName(fileName: string): string {
    // Remove special characters and replace with underscores
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 255); // Limit to 255 characters
  }

  private validateFile(file: Buffer, filename: string, mimeType: string): void {
    const storageConfig = this.configService.get('storage');
    
    // Check file size
    if (file.length > storageConfig.limits.maxFileSize) {
      throw new BadRequestException(`File size exceeds maximum allowed size of ${storageConfig.limits.maxFileSize} bytes`);
    }

    // Check MIME type
    if (!storageConfig.limits.allowedMimeTypes.includes(mimeType)) {
      throw new BadRequestException(`File type ${mimeType} is not allowed`);
    }
  }

  async uploadFile(
    file: Buffer,
    originalName: string,
    mimeType: string,
    tenantId: string,
    userId?: string,
    metadata?: {
      description?: string;
      category?: string;
      isPublic?: boolean;
      tags?: string[];
    }
  ) {
    // Validate file
    this.validateFile(file, originalName, mimeType);

    // Upload to storage provider
    const uploadResult: FileUploadResult = await this.storageProvider.upload(
      file,
      originalName,
      mimeType,
      tenantId
    );

    // Create file record in database
    const sanitizedOriginalName = this.sanitizeFileName(originalName);

    return this.prisma.file.create({
      data: {
        originalName: sanitizedOriginalName,
        filename: uploadResult.filename,
        mimeType,
        size: uploadResult.size,
        path: uploadResult.path,
        tenantId,
        userId,
        description: metadata?.description,
        category: metadata?.category,
      },
    });
  }

  async downloadFile(fileId: string, tenantId: string): Promise<FileDownloadResult> {
    const file = await this.findOne(fileId, tenantId);

    return this.storageProvider.download(file.path, tenantId);
  }

  async deleteFile(fileId: string, tenantId: string): Promise<void> {
    const file = await this.findOne(fileId, tenantId);

    // Delete from storage
    await this.storageProvider.delete(file.path, tenantId);

    // Soft delete from database
    await this.prisma.file.update({
      where: { id: fileId },
      data: { isActive: false },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.file.findMany({
      where: { 
        tenantId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCategory(tenantId: string, category: FileCategory) {
    return this.prisma.file.findMany({
      where: { 
        tenantId,
        category,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUser(tenantId: string, userId: string) {
    return this.prisma.file.findMany({
      where: { 
        tenantId,
        userId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const file = await this.prisma.file.findFirst({
      where: { 
        id, 
        tenantId,
        isActive: true,
      },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async updateFile(id: string, updateData: Partial<CreateFileDto>, tenantId: string) {
    await this.findOne(id, tenantId);

    const data: any = { ...updateData };
    if (updateData.size !== undefined) {
      data.size = parseFloat(updateData.size.toString());
    }

    return this.prisma.file.update({
      where: { id },
      data,
    });
  }

  async removeFile(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    // Soft delete
    return this.prisma.file.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getStats(tenantId: string) {
    const [total, byCategory, totalSize] = await Promise.all([
      this.prisma.file.count({
        where: { 
          tenantId,
          isActive: true,
        },
      }),
      this.prisma.file.groupBy({
        by: ['category'],
        where: { 
          tenantId,
          isActive: true,
        },
        _count: { category: true },
      }),
      this.prisma.file.aggregate({
        where: { 
          tenantId,
          isActive: true,
        },
        _sum: { size: true },
      }),
    ]);

    return {
      total,
      totalSize: totalSize._sum.size || 0,
      byCategory: byCategory.map(item => ({
        category: item.category,
        count: item._count.category,
      })),
    };
  }

  async searchFiles(tenantId: string, query: string) {
    return this.prisma.file.findMany({
      where: {
        tenantId,
        isActive: true,
        OR: [
          { filename: { contains: query } },
          { originalName: { contains: query } },
          { description: { contains: query } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
