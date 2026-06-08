import {
  Controller, Get, Post, Patch, Body, Param, UseGuards, Req, Res, UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { Response } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PlatformService } from './platform.service';
import { PlatformLoginDto } from './platform-login.dto';
import { CreateTenantPlatformDto } from './create-tenant-platform.dto';
import { CreatePlatformUserDto } from './create-platform-user.dto';
import { PlatformAuthGuard, PlatformAuthRequest } from './platform-auth.guard';
import { PlatformOwnerGuard } from './platform-owner.guard';

@ApiTags('Platform')
@Controller('platform')
export class PlatformController {
  constructor(private platformService: PlatformService) {}

  // ── Auth ────────────────────────────────────────────────────────────────

  @Post('auth/login')
  @ApiOperation({ summary: 'Platform user login (OWNER or SALES)' })
  async login(@Body() dto: PlatformLoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.platformService.login(dto);
    response.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 hour
    });
    return {
      user: result.user,
      message: 'Logged in successfully',
    };
  }

  // ── Tenants ─────────────────────────────────────────────────────────────

  @Get('tenants')
  @UseGuards(PlatformAuthGuard)
  @ApiOperation({ summary: 'List all tenants — OWNER + SALES' })
  listTenants() {
    return this.platformService.listTenants();
  }

  @Post('tenants')
  @UseGuards(PlatformAuthGuard)
  @ApiOperation({ summary: 'Create a new tenant for a client — OWNER + SALES' })
  createTenant(@Body() dto: CreateTenantPlatformDto) {
    return this.platformService.createTenantForClient(dto);
  }

  @Patch('tenants/:id/toggle')
  @UseGuards(PlatformOwnerGuard)
  @ApiOperation({ summary: 'Activate / deactivate a tenant — OWNER only' })
  toggleTenant(@Param('id') id: string) {
    return this.platformService.toggleTenant(id);
  }

  // ── Stats ────────────────────────────────────────────────────────────────

  @Get('stats')
  @UseGuards(PlatformOwnerGuard)
  @UseInterceptors(CacheInterceptor)
  @CacheKey('platform_stats')
  @CacheTTL(300000) // 5 minutes
  @ApiOperation({ summary: 'Platform-wide stats — OWNER only' })
  getStats() {
    return this.platformService.getStats();
  }

  // ── Platform Users ───────────────────────────────────────────────────────

  @Get('users')
  @UseGuards(PlatformOwnerGuard)
  @ApiOperation({ summary: 'List platform users (OWNER + SALES accounts) — OWNER only' })
  listUsers() {
    return this.platformService.listPlatformUsers();
  }

  @Post('users')
  @UseGuards(PlatformOwnerGuard)
  @ApiOperation({ summary: 'Create a SALES platform user — OWNER only' })
  createUser(@Body() dto: CreatePlatformUserDto) {
    return this.platformService.createPlatformUser(dto);
  }
}
