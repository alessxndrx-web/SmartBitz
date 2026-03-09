import { IsEnum, IsString, IsNotEmpty } from 'class-validator';

export enum BusinessType {
  BARBERSHOP = 'barbershop',
  RESTAURANT = 'restaurant',
  FLORIST = 'florist',
  GYM = 'gym',
  MANUFACTURING = 'manufacturing',
  CONSTRUCTION = 'construction',
}

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  ruc: string;

  @IsEnum(BusinessType)
  businessType: BusinessType;
}