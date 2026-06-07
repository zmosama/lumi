import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.branch.findMany({
      where: { tenantId, isActive: true },
      orderBy: [{ isMain: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async findOne(tenantId: string, id: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id, tenantId, isActive: true },
    });
    if (!branch) throw new NotFoundException(I18nContext.current()!.t('messages.branch.not_found'));
    return branch;
  }

  async create(tenantId: string, dto: CreateBranchDto) {
    return this.prisma.branch.create({
      data: {
        tenantId,
        name: dto.name,
        area: dto.area,
        curriculums: dto.curriculums ?? [],
        ownership: dto.ownership,
        isMain: dto.isMain ?? false,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateBranchDto) {
    await this.findOne(tenantId, id);
    return this.prisma.branch.update({
      where: { id },
      data: {
        name: dto.name,
        area: dto.area,
        curriculums: dto.curriculums,
        ownership: dto.ownership,
        isMain: dto.isMain,
      },
    });
  }

  async deactivate(tenantId: string, id: string) {
    const branch = await this.findOne(tenantId, id);

    if (branch.isMain) {
      throw new BadRequestException(I18nContext.current()!.t('messages.branch.delete_main_error'));
    }

    const activeStudentsCount = await this.prisma.student.count({
      where: {
        tenantId,
        branchId: id,
        status: 'active',
      },
    });

    if (activeStudentsCount > 0) {
      throw new BadRequestException(I18nContext.current()!.t('messages.branch.delete_active_students_error'));
    }

    await this.prisma.branch.update({ where: { id }, data: { isActive: false } });
  }
}
