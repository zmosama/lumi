import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { TenantsService } from '../tenants/tenants.service';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private tenantsService: TenantsService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async registerTenant(dto: RegisterTenantDto) {
    const { tenantName, subdomain, adminEmail, adminPassword, adminName } = dto;

    const { id: tenantId, schemaName } = await this.tenantsService.provisionTenant(tenantName, subdomain);

    const existingUser = await this.prisma.user.findUnique({
      where: { email_tenantId: { email: adminEmail, tenantId } },
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const user = await this.prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: adminName,
        role: 'admin',
        tenantId,
      },
    });

    const tokens = this.generateTokens(user.id, tenantId, schemaName, user.role);

    return {
      message: 'Tenant registered successfully',
      tenant: { id: tenantId, name: tenantName, subdomain },
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const { email, password, subdomain } = dto;

    const tenant = await this.prisma.tenant.findUnique({
      where: { subdomain, isActive: true },
    });
    if (!tenant) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.prisma.user.findUnique({
      where: { email_tenantId: { email, tenantId: tenant.id } },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.generateTokens(user.id, tenant.id, tenant.schemaName, user.role);

    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      tenant: { id: tenant.id, name: tenant.name, subdomain: tenant.subdomain },
      ...tokens,
    };
  }

  private generateTokens(userId: string, tenantId: string, schemaName: string, role: string) {
    const payload = { sub: userId, tenantId, schemaName, role };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return { accessToken, refreshToken };
  }
}
