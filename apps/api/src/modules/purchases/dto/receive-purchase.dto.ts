import { IsString, IsNumber, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ReceivePurchaseItemDto {
  @IsString()
  purchaseItemId: string;

  @IsNumber()
  quantityReceived: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class ReceivePurchaseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceivePurchaseItemDto)
  items: ReceivePurchaseItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;
}
