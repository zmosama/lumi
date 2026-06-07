import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { BranchesModule } from './branches/branches.module';
import { StudentsModule } from './students/students.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AttendanceModule } from './attendance/attendance.module';
import { PlatformModule } from './platform/platform.module';
import { TenantMiddleware } from './tenants/tenant.middleware';
import { I18nModule, AcceptLanguageResolver, QueryResolver, HeaderResolver } from 'nestjs-i18n';
import * as path from 'path';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'ar-EG',
      loaderOptions: {
        path: path.join(__dirname, '..', 'i18n'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-custom-lang']),
      ],
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TenantsModule,
    BranchesModule,
    StudentsModule,
    DashboardModule,
    AttendanceModule,
    PlatformModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        { path: 'api/auth/register-tenant', method: RequestMethod.POST },
        { path: 'auth/register-tenant', method: RequestMethod.POST },
        { path: 'api/auth/login', method: RequestMethod.POST },
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'api/platform/(.*)', method: RequestMethod.ALL },
        { path: 'platform/(.*)', method: RequestMethod.ALL },
        { path: 'api/health', method: RequestMethod.GET },
        { path: 'health', method: RequestMethod.GET },
        { path: 'api/docs', method: RequestMethod.GET },
        { path: 'api/docs/(.*)', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}
