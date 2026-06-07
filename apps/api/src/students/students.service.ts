import { I18nContext } from 'nestjs-i18n';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsDomainService, FindAllOptions, StudentRecord } from '@lumi/domain';

@Injectable()
export class StudentsService {
  private domainService: StudentsDomainService;

  constructor(private prisma: PrismaService) {
    this.domainService = new StudentsDomainService(this.prisma);
  }

  async findAll(tenantId: string, options: FindAllOptions) {
    return this.domainService.findAllStudents(tenantId, options);
  }

  async findOne(tenantId: string, id: string): Promise<StudentRecord> {
    try {
      return await this.domainService.findStudentById(tenantId, id);
    } catch (e) {
      throw new NotFoundException(I18nContext.current()!.t('messages.student.not_found'));
    }
  }

  async create(tenantId: string, dto: CreateStudentDto): Promise<StudentRecord> {
    return this.domainService.enrollStudent(tenantId, dto);
  }

  async update(tenantId: string, id: string, dto: UpdateStudentDto): Promise<StudentRecord> {
    try {
      return await this.domainService.updateStudent(tenantId, id, dto);
    } catch (e) {
      throw new NotFoundException(I18nContext.current()!.t('messages.student.not_found'));
    }
  }

  async archive(tenantId: string, id: string): Promise<void> {
    try {
      await this.domainService.archiveStudent(tenantId, id);
    } catch (e) {
      throw new NotFoundException(I18nContext.current()!.t('messages.student.not_found'));
    }
  }
}
