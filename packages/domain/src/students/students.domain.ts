export interface StudentRecord {
  id: string;
  tenantId: string;
  branchId: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  parentName: string | null;
  parentPhone: string | null;
  grade: string | null;
  className: string | null;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentRepository {
  student: {
    findFirst(params: any): Promise<StudentRecord | null>;
    findMany(params: any): Promise<StudentRecord[]>;
    count(params: any): Promise<number>;
    create(params: any): Promise<StudentRecord>;
    update(params: any): Promise<StudentRecord>;
  };
}

export interface FindAllOptions {
  search?: string;
  status?: string;
  branchId?: string;
  page: number;
  limit: number;
}

export interface CreateStudentPayload {
  branchId?: string;
  name: string;
  email?: string;
  phone?: string;
  parentName?: string;
  parentPhone?: string;
  grade?: string;
  className?: string;
  notes?: string;
}

export interface UpdateStudentPayload extends Partial<CreateStudentPayload> {}

export class StudentsDomainService {
  constructor(private readonly repo: StudentRepository) {}

  async findAllStudents(tenantId: string, options: FindAllOptions) {
    const { search, status, branchId, page, limit } = options;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (branchId) {
      where.branchId = branchId;
    }

    if (status) {
      where.status = status;
    } else {
      where.status = { not: 'archived' };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { parentPhone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [students, total] = await Promise.all([
      this.repo.student.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.repo.student.count({ where }),
    ]);

    return {
      data: students,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findStudentById(tenantId: string, id: string): Promise<StudentRecord> {
    const student = await this.repo.student.findFirst({
      where: { id, tenantId },
    });
    if (!student) {
      throw new Error('Student not found');
    }
    return student;
  }

  async enrollStudent(tenantId: string, payload: CreateStudentPayload): Promise<StudentRecord> {
    // Pure domain rule: A student must have a name
    if (!payload.name || payload.name.trim() === '') {
      throw new Error('Student name is required for enrollment');
    }
    
    return this.repo.student.create({
      data: {
        tenantId,
        ...payload,
        status: 'active'
      },
    });
  }

  async updateStudent(tenantId: string, id: string, payload: UpdateStudentPayload): Promise<StudentRecord> {
    await this.findStudentById(tenantId, id);

    return this.repo.student.update({
      where: { id },
      data: {
        ...payload
      },
    });
  }

  async archiveStudent(tenantId: string, id: string): Promise<void> {
    await this.findStudentById(tenantId, id);
    
    await this.repo.student.update({
      where: { id },
      data: { status: 'archived' },
    });
  }
}
