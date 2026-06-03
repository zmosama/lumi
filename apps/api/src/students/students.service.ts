import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentRecord } from '../types/api.types';

export type { StudentRecord };

interface FindAllOptions {
  search?: string;
  status?: string;
  page: number;
  limit: number;
}

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(schemaName: string, options: FindAllOptions) {
    const { search, status, page, limit } = options;
    const offset = (page - 1) * limit;

    let whereClause = `WHERE 1=1`;
    const params: unknown[] = [];

    if (status) {
      params.push(status);
      whereClause += ` AND status = $${params.length}`;
    } else {
      whereClause += ` AND status != 'archived'`;
    }

    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (name ILIKE $${params.length} OR phone ILIKE $${params.length} OR parent_phone ILIKE $${params.length})`;
    }

    params.push(limit, offset);

    const students = await this.prisma.$queryRawUnsafe<StudentRecord[]>(
      `SELECT * FROM "${schemaName}"."students" ${whereClause} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      ...params
    );

    const countParams = params.slice(0, -2);
    const countResult = await this.prisma.$queryRawUnsafe<[{ count: bigint }]>(
      `SELECT COUNT(*) as count FROM "${schemaName}"."students" ${whereClause}`,
      ...countParams
    );

    return {
      data: students,
      meta: {
        total: Number(countResult[0]?.count || 0),
        page,
        limit,
        totalPages: Math.ceil(Number(countResult[0]?.count || 0) / limit),
      },
    };
  }

  async findOne(schemaName: string, id: string): Promise<StudentRecord> {
    const results = await this.prisma.$queryRawUnsafe<StudentRecord[]>(
      `SELECT * FROM "${schemaName}"."students" WHERE id = $1`,
      id
    );
    if (!results[0]) {
      throw new NotFoundException('Student not found');
    }
    return results[0];
  }

  async create(schemaName: string, dto: CreateStudentDto): Promise<StudentRecord> {
    const results = await this.prisma.$queryRawUnsafe<StudentRecord[]>(
      `INSERT INTO "${schemaName}"."students" (name, email, phone, parent_name, parent_phone, grade, class_name, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      dto.name, dto.email || null, dto.phone || null, dto.parentName || null,
      dto.parentPhone || null, dto.grade || null, dto.className || null, dto.notes || null
    );
    return results[0];
  }

  async update(schemaName: string, id: string, dto: UpdateStudentDto): Promise<StudentRecord> {
    await this.findOne(schemaName, id);

    const results = await this.prisma.$queryRawUnsafe<StudentRecord[]>(
      `UPDATE "${schemaName}"."students"
       SET name = COALESCE($2, name),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           parent_name = COALESCE($5, parent_name),
           parent_phone = COALESCE($6, parent_phone),
           grade = COALESCE($7, grade),
           class_name = COALESCE($8, class_name),
           notes = COALESCE($9, notes),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      id, dto.name || null, dto.email || null, dto.phone || null,
      dto.parentName || null, dto.parentPhone || null, dto.grade || null,
      dto.className || null, dto.notes || null
    );
    return results[0];
  }

  async archive(schemaName: string, id: string): Promise<void> {
    await this.findOne(schemaName, id);
    await this.prisma.$executeRawUnsafe(
      `UPDATE "${schemaName}"."students" SET status = 'archived', updated_at = NOW() WHERE id = $1`,
      id
    );
  }
}
