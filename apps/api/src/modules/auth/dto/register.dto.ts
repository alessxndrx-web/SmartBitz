import { IsEmail, IsString, IsNotEmpty, IsEnum } from 'class-validator';

export enum UserRole {
  PLATFORM_ADMIN = 'platform_admin',
  TENANT_OWNER = 'tenant_owner',
  TENANT_ADMIN = 'tenant_admin',
  STAFF = 'staff',
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
