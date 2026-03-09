import { IsString, IsOptional, IsDateString, ValidateNested, IsArray, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export enum PurchaseStatus {
  PENDING = 'pending',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

export class CreatePurchaseItemDto {
  @IsString()
  itemId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitCost: number;

  @IsNumber()
  @IsOptional()
  discount?: number = 0;

  @IsNumber()
  @IsOptional()
  taxRate?: number = 0;
}

export class CreatePurchaseDto {
  @IsString()
  supplierId: string;

  @IsString()
  @IsOptional()
  number?: string;

  @IsEnum(PurchaseStatus)
  @IsOptional()
  status?: PurchaseStatus = PurchaseStatus.PENDING;

  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseItemDto)
  items: CreatePurchaseItemDto[];
}
