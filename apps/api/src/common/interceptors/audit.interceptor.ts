import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    return next.handle().pipe(
      tap(async (response) => {
        // Only log mutative actions
        if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
          const user = request.user; // User from JwtStrategy
          const tenantId = request.headers['x-tenant-id'];

          if (user && tenantId) {
            const urlPath = request.url.split('?')[0];
            const entity = urlPath.split('/')[2] || 'unknown'; // e.g. /api/students -> students
            
            // Extract entity ID if possible (e.g., from response or params)
            let entityId = 'unknown';
            if (response && response.id) {
              entityId = response.id;
            } else if (request.params && request.params.id) {
              entityId = request.params.id;
            }

            try {
              await this.prisma.auditLog.create({
                data: {
                  tenantId,
                  userId: user.userId,
                  action: method,
                  entity,
                  entityId,
                  details: {
                    body: request.body,
                    ip: request.ip,
                  },
                },
              });
            } catch (err) {
              console.error('Failed to write audit log:', err);
            }
          }
        }
      }),
    );
  }
}
