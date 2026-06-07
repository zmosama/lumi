import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { appRequestContext } from '@lumi/shared';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();

    const extended = this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const bypassModels = ['Tenant', 'PlatformUser'];
            if (bypassModels.includes(model)) {
              return query(args);
            }

            const context = appRequestContext.getStore();
            const tenantId = context?.tenantId;

            if (tenantId) {
              const isCreate = operation === 'create' || operation === 'createMany';
              const isUpdate = operation === 'update' || operation === 'updateMany';
              const isDelete = operation === 'delete' || operation === 'deleteMany';
              const isFind = operation === 'findFirst' || operation === 'findFirstOrThrow' || operation === 'findMany' || operation === 'findUnique' || operation === 'findUniqueOrThrow' || operation === 'aggregate' || operation === 'count' || operation === 'groupBy';
              
              if (!args) {
                (args as any) = {};
              }
              
              if (isCreate) {
                if ((args as any).data && !Array.isArray((args as any).data)) {
                   if (!(args as any).data.tenantId) {
                     (args as any).data.tenantId = tenantId;
                   }
                } else if (Array.isArray((args as any).data)) {
                   (args as any).data.forEach(d => {
                     if (!d.tenantId) d.tenantId = tenantId;
                   });
                }
              } else if (isFind || isUpdate || isDelete) {
                if (!(args as any).where) {
                  (args as any).where = {};
                }
                (args as any).where.tenantId = tenantId;
              }
            }

            return query(args);
          },
        },
      },
    });

    return new Proxy(this, {
      get: (target, prop) => {
        if (prop in extended) {
          return (extended as any)[prop];
        }
        return (target as any)[prop];
      }
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
