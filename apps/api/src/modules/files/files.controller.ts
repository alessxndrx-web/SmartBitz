import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { CreateFileDto, FileCategory } from './dto/create-file.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../roles/guards/permissions.guard';
import { Permissions } from '../roles/decorators/permissions.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

@Controller('files')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  private readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @Permissions('files:create')
  async uploadFile(
    @UploadedFile() file: MulterFile,
    @Body() createFileDto: UploadFileDto,
    @TenantId() tenantId: string,
    @Query('userId') userId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const metadata = {
      description: createFileDto.description,
      category: createFileDto.category,
      isPublic: createFileDto.isPublic,
      tags: createFileDto.tags ? JSON.parse(createFileDto.tags) : undefined,
    };

    return this.filesService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      tenantId,
      userId,
      metadata
    );
  }

  @Post('metadata')
  @Permissions('files:create')
  createFileMetadata(
    @Body() createFileDto: CreateFileDto,
    @TenantId() tenantId: string,
    @Query('userId') userId?: string,
  ) {
    // Este endpoint ahora está obsoleto, se usa uploadFile
    throw new BadRequestException('Use /upload endpoint instead');
  }

  @Get()
  @Permissions('files:read')
  findAll(@TenantId() tenantId: string) {
    return this.filesService.findAll(tenantId);
  }

  @Get('category/:category')
  @Permissions('files:read')
  findByCategory(
    @Param('category') category: FileCategory,
    @TenantId() tenantId: string,
  ) {
    return this.filesService.findByCategory(tenantId, category);
  }

  @Get('user/:userId')
  @Permissions('files:read')
  findByUser(
    @Param('userId') userId: string,
    @TenantId() tenantId: string,
  ) {
    return this.filesService.findByUser(tenantId, userId);
  }

  @Get('search')
  @Permissions('files:read')
  searchFiles(
    @Query('q') query: string,
    @TenantId() tenantId: string,
  ) {
    if (!query) {
      throw new BadRequestException('Search query is required');
    }
    return this.filesService.searchFiles(tenantId, query);
  }

  @Get('stats')
  @Permissions('files:read')
  getStats(@TenantId() tenantId: string) {
    return this.filesService.getStats(tenantId);
  }

  @Get(':id')
  @Permissions('files:read')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.filesService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Permissions('files:update')
  updateFile(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateFileDto>,
    @TenantId() tenantId: string,
  ) {
    return this.filesService.updateFile(id, updateData, tenantId);
  }

  @Delete(':id')
  @Permissions('files:delete')
  removeFile(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.filesService.removeFile(id, tenantId);
  }
}
