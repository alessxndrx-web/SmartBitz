import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class UploadFileDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = false;

  @IsOptional()
  @IsString()
  tags?: string; // JSON array string
}
