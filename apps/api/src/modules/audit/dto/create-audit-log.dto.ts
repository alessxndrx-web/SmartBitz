import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateAuditLogDto {
  @IsString()
  module: string;

  @IsString()
  action: string;

  @IsString()
  @IsOptional()
  entityId?: string;

  @IsString()
  @IsOptional()
  entityType?: string;

  @IsString()
  @IsOptional()
  oldValues?: string; // JSON string

  @IsString()
  @IsOptional()
  newValues?: string; // JSON string

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
