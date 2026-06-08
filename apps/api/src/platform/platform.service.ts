import { I18nContext } from 'nestjs-i18n';
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { TenantsService } from '../tenants/tenants.service';
import { PlatformLoginDto } from './platform-login.dto';
import { CreateTenantPlatformDto } from './create-tenant-platform.dto';
import { CreatePlatformUserDto } from './create-platform-user.dto';
import { PlatformRole } from '@prisma/client';
import { PlatformDomainService } from '@lumi/domain';

@Injectable()
export class PlatformService {
  private domainService: PlatformDomainService;

  constructor(
    private prisma: PrismaService,
    private tenantsService: TenantsService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {
    this.domainService = new PlatformDomainService(this.prisma);
  }

  async login(dto: PlatformLoginDto) {
    const user = await this.prisma.platformUser.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException(I18nContext.current()!.t('messages.auth.invalid_credentials'));
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException(I18nContext.current()!.t('messages.auth.invalid_credentials'));
    }

    const payload = { sub: user.id, type: 'platform', role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async listTenants() {
    return this.domainService.listTenants();
  }

  async createTenantForClient(dto: CreateTenantPlatformDto) {
    const { tenantName, subdomain, orgType, initialBranch, adminEmail, adminPassword, adminName } = dto;

    const { id: tenantId } = await this.tenantsService.provisionTenant({
      name: tenantName,
      subdomain,
      orgType,
      initialBranch,
    });

    const existingUser = await this.prisma.user.findUnique({
      where: { email_tenantId: { email: adminEmail, tenantId } },
    });
    if (existingUser) {
      throw new ConflictException(I18nContext.current()!.t('messages.auth.email_registered_tenant'));
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

    return {
      message: 'Tenant created successfully',
      tenant: { id: tenantId, name: tenantName, subdomain, orgType },
      admin: { id: user.id, email: user.email, name: user.name },
    };
  }

  async toggleTenant(id: string) {
    try {
      const updated = await this.domainService.toggleTenant(id);
      return {
        message: `Tenant ${updated.isActive ? 'activated' : 'deactivated'}`,
        tenant: updated,
      };
    } catch (e: any) {
      if (e.message === 'TENANT_NOT_FOUND') {
        throw new NotFoundException(I18nContext.current()!.t('messages.tenant.not_found'));
      }
      throw e;
    }
  }

  async getStats() {
    return this.domainService.getStats();
  }

  async createPlatformUser(dto: CreatePlatformUserDto) {
    const existing = await this.prisma.platformUser.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException(I18nContext.current()!.t('messages.auth.email_registered'));
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.platformUser.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        role: dto.role ?? PlatformRole.SALES,
      },
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
    });

    return { message: 'Platform user created', user };
  }

  async listPlatformUsers() {
    return this.domainService.listPlatformUsers();
  }
}
