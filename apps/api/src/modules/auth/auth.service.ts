import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { RolesService } from '../roles/roles.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto, UserRole } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private rolesService: RolesService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: registerDto.tenantSlug },
    });

    if (!tenant) {
      throw new UnauthorizedException('Tenant not found');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        fullName: registerDto.fullName,
        email: registerDto.email,
        role: registerDto.role,
        tenantId: tenant.id,
        password: hashedPassword,
      },
    });

    const membership = await this.prisma.tenantMembership.create({
      data: {
        userId: user.id,
        tenantId: tenant.id,
        role: registerDto.role,
      },
    });

    if (registerDto.role !== UserRole.PLATFORM_ADMIN) {
      await this.rolesService.ensureTenantRoleExists(tenant.id, registerDto.role);
    }

    const payload = {
      sub: user.id,
      userId: user.id,
      email: user.email,
      tenantId: membership.tenantId,
      membershipId: membership.id,
      role: membership.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: membership.role,
        tenantId: membership.tenantId,
        membershipId: membership.id,
      },
      accessToken,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        businessType: tenant.businessType,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password!);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    let membership = await this.prisma.tenantMembership.findFirst({
      where: { userId: user.id },
      include: { tenant: true },
      orderBy: { createdAt: 'asc' },
    });

    if (!membership) {
      throw new UnauthorizedException('User has no tenant membership');
    }

    const userPermissions = await this.rolesService.getUserPermissions(user.id, membership.tenantId, membership.role);

    const payload = {
      sub: user.id,
      userId: user.id,
      email: user.email,
      tenantId: membership.tenantId,
      membershipId: membership.id,
      role: membership.role,
      permissions: userPermissions,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: membership.role,
        tenantId: membership.tenantId,
        membershipId: membership.id,
        permissions: userPermissions,
      },
      accessToken,
      tenant: {
        id: membership.tenant.id,
        name: membership.tenant.name,
        slug: membership.tenant.slug,
        businessType: membership.tenant.businessType,
      },
    };
  }

  async validateUser(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  }
}
