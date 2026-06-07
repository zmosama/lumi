import { AsyncLocalStorage } from 'async_hooks';

export interface AppRequestContext {
  tenantId?: string;
  userId?: string;
  role?: string;
}

export const appRequestContext = new AsyncLocalStorage<AppRequestContext>();
