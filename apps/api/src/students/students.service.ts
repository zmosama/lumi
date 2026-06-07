import { I18nContext } from 'nestjs-i18n';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from '@prisma/client';

export type StudentRecord = Student;

interface FindAllOptions {
  search?: string;
  status?: string;
  branchId?: string;
  page: number;
  limit: number;
}

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, options: FindAllOptions) {
    const { search, status, branchId, page, limit } = options;
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
    };

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
      this.prisma.student.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.student.count({ where }),
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

  async findOne(tenantId: string, id: string): Promise<StudentRecord> {
    const student = await this.prisma.student.findFirst({
      where: { id, tenantId },
    });
    if (!student) {
      throw new NotFoundException(I18nContext.current()!.t('messages.student.not_found'));
    }
    return student;
  }

  async create(tenantId: string, dto: CreateStudentDto): Promise<StudentRecord> {
    return this.prisma.student.create({
      data: {
        tenantId,
        branchId: dto.branchId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        parentName: dto.parentName,
        parentPhone: dto.parentPhone,
        grade: dto.grade,
        className: dto.className,
        notes: dto.notes,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateStudentDto): Promise<StudentRecord> {
    await this.findOne(tenantId, id);

    return this.prisma.student.update({
      where: { id },
      data: {
        branchId: dto.branchId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        parentName: dto.parentName,
        parentPhone: dto.parentPhone,
        grade: dto.grade,
        className: dto.className,
        notes: dto.notes,
      },
    });
  }

  async archive(tenantId: string, id: string): Promise<void> {
    await this.findOne(tenantId, id);
    
    await this.prisma.student.update({
      where: { id },
      data: { status: 'archived' },
    });
  }
}
