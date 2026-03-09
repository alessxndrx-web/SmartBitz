import { IsEmail, IsString, IsNotEmpty, IsEnum } from 'class-validator';

export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  CASHIER = 'cashier',
  ACCOUNTANT = 'accountant',
  OPERATOR = 'operator',
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  @IsNotEmpty()
  tenantSlug: string;
}
