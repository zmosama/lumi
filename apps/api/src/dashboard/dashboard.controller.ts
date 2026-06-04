import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../auth/strategies/jwt.strategy';
import { TenantsService } from '../tenants/tenants.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private tenantsService: TenantsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics — optionally filtered by branchId' })
  getStats(
    @Req() req: { user: AuthUser },
    @Query('branchId') branchId?: string,
  ): Promise<unknown> {
    return this.tenantsService.getTenantStats(req.user.schemaName, branchId);
  }
}
