import { TenantsDomainService } from './tenants.domain';

describe('TenantsDomainService', () => {
  let service: TenantsDomainService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      tenant: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      branch: {
        create: jest.fn(),
      },
      student: { count: jest.fn() },
      attendance: { count: jest.fn() },
      payment: { aggregate: jest.fn() },
    };
    service = new TenantsDomainService(mockPrisma);
  });

  describe('provisionTenant', () => {
    it('should throw SUBDOMAIN_TAKEN if tenant exists', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValueOnce({ id: '1' });

      await expect(
        service.provisionTenant({
          name: 'Test',
          subdomain: 'test',
          orgType: 'SCHOOL',
          initialBranch: { name: 'Main' },
        })
      ).rejects.toThrow('SUBDOMAIN_TAKEN');
    });

    it('should create tenant and initial branch', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValueOnce(null);
      mockPrisma.tenant.create.mockResolvedValueOnce({ id: 'tenant-1' });
      mockPrisma.branch.create.mockResolvedValueOnce({ id: 'branch-1' });

      const res = await service.provisionTenant({
        name: 'School A',
        subdomain: 'school-a',
        orgType: 'SCHOOL',
        initialBranch: { name: 'Main Branch' },
      });

      expect(res).toEqual({ id: 'tenant-1', branchId: 'branch-1' });
      expect(mockPrisma.tenant.create).toHaveBeenCalledWith({
        data: { name: 'School A', subdomain: 'school-a', orgType: 'SCHOOL' },
      });
      expect(mockPrisma.branch.create).toHaveBeenCalledWith({
        data: {
          tenantId: 'tenant-1',
          name: 'Main Branch',
          area: undefined,
          isMain: true,
          curriculums: [],
          ownership: undefined,
        },
      });
    });
  });

  describe('getTenantStats', () => {
    it('should calculate stats correctly', async () => {
      mockPrisma.student.count.mockResolvedValueOnce(150);
      mockPrisma.attendance.count.mockResolvedValueOnce(140);
      mockPrisma.payment.aggregate.mockResolvedValueOnce({ _sum: { amount: 5000 } });

      const stats = await service.getTenantStats('tenant-1');

      expect(stats.totalStudents).toBe(150);
      expect(stats.presentToday).toBe(140);
      expect(stats.monthlyRevenue).toBe(5000);
    });
  });
});
