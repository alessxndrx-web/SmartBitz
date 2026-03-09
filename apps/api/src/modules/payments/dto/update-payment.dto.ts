import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class UpdatePaymentDto {
  @IsString()
  @IsOptional()
  invoiceId?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  method?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsDateString()
  @IsOptional()
  paymentDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
