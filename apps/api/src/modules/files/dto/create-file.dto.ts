import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum FileCategory {
  DOCUMENT = 'DOCUMENT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  OTHER = 'OTHER',
}

export class CreateFileDto {
  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  originalName: string;

  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @IsString()
  @IsNotEmpty()
  size: string; // Will be converted to number in service

  @IsString()
  @IsNotEmpty()
  path: string;

  @IsEnum(FileCategory)
  @IsOptional()
  category?: FileCategory;

  @IsString()
  @IsOptional()
  description?: string;
}
