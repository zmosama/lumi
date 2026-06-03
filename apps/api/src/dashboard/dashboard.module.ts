import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TenantsModule],
  controllers: [DashboardController],
})
export class DashboardModule {}
