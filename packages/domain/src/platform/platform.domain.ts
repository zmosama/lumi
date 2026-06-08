export interface TenantDomainModel {
  id: string;
  name: string;
  subdomain: string;
  orgType: string;
  plan: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlatformUserDomainModel {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  inactiveTenants: number;
}
