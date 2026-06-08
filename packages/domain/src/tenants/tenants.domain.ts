export interface ProvisionTenantCommand {
  name: string;
  subdomain: string;
  orgType: any; // Using enum or string from Prisma
  initialBranch: {
    name: string;
    area?: string;
    curriculums?: string[];
    ownership?: string;
  };
}

export interface TenantResponse {
  id: string;
  name: string;
  subdomain: string;
  orgType: string;
  isActive: boolean;
}
