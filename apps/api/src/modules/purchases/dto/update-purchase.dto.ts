import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';
import { PurchaseStatus } from './create-purchase.dto';

export class UpdatePurchaseDto {
  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  supplierId?: string;

  @IsOptional()
  @IsEnum(PurchaseStatus)
  status?: PurchaseStatus;

  @IsOptional()
  @IsISO8601()
  purchaseDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
