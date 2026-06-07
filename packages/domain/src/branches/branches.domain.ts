export interface BranchRecord {
  id: string;
  tenantId: string;
  name: string;
  area: string | null;
  curriculums: string[];
  ownership: string | null;
  isMain: boolean;
  isActive: boolean;
  createdAt: Date;
}

export interface BranchRepository {
  branch: {
    findMany(params: any): Promise<BranchRecord[]>;
    findFirst(params: any): Promise<BranchRecord | null>;
    create(params: any): Promise<BranchRecord>;
    update(params: any): Promise<BranchRecord>;
  };
  student: {
    count(params: any): Promise<number>;
  };
}

export interface CreateBranchPayload {
  name: string;
  area?: string;
  curriculums?: string[];
  ownership?: string;
  isMain?: boolean;
}

export interface UpdateBranchPayload extends Partial<CreateBranchPayload> {}

export class BranchesDomainService {
  constructor(private readonly repo: BranchRepository) {}

  async findAllBranches(tenantId: string) {
    return this.repo.branch.findMany({
      where: { tenantId, isActive: true },
      orderBy: [{ isMain: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async findBranchById(tenantId: string, id: string) {
    const branch = await this.repo.branch.findFirst({
      where: { id, tenantId, isActive: true },
    });
    if (!branch) throw new Error('Branch not found');
    return branch;
  }

  async createBranch(tenantId: string, payload: CreateBranchPayload) {
    return this.repo.branch.create({
      data: {
        tenantId,
        name: payload.name,
        area: payload.area,
        curriculums: payload.curriculums ?? [],
        ownership: payload.ownership,
        isMain: payload.isMain ?? false,
      },
    });
  }

  async updateBranch(tenantId: string, id: string, payload: UpdateBranchPayload) {
    await this.findBranchById(tenantId, id);
    return this.repo.branch.update({
      where: { id },
      data: {
        name: payload.name,
        area: payload.area,
        curriculums: payload.curriculums,
        ownership: payload.ownership,
        isMain: payload.isMain,
      },
    });
  }

  async deactivateBranch(tenantId: string, id: string) {
    const branch = await this.findBranchById(tenantId, id);

    if (branch.isMain) {
      throw new Error('BRANCH_DELETE_MAIN_ERROR');
    }

    const activeStudentsCount = await this.repo.student.count({
      where: {
        tenantId,
        branchId: id,
        status: 'active',
      },
    });

    if (activeStudentsCount > 0) {
      throw new Error('BRANCH_DELETE_ACTIVE_STUDENTS_ERROR');
    }

    await this.repo.branch.update({ where: { id }, data: { isActive: false } });
  }
}
