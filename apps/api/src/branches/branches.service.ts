import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { BranchesDomainService } from '@lumi/domain';

@Injectable()
export class BranchesService {
  private domainService: BranchesDomainService;

  constructor(private prisma: PrismaService) {
    this.domainService = new BranchesDomainService(this.prisma);
  }

  async findAll(tenantId: string) {
    return this.domainService.findAllBranches(tenantId);
  }

  async findOne(tenantId: string, id: string) {
    try {
      return await this.domainService.findBranchById(tenantId, id);
    } catch (e: any) {
      if (e.message === 'Branch not found') {
        throw new NotFoundException(I18nContext.current()!.t('messages.branch.not_found'));
      }
      throw e;
    }
  }

  async create(tenantId: string, dto: CreateBranchDto) {
    return this.domainService.createBranch(tenantId, dto);
  }

  async update(tenantId: string, id: string, dto: UpdateBranchDto) {
    try {
      return await this.domainService.updateBranch(tenantId, id, dto);
    } catch (e: any) {
      if (e.message === 'Branch not found') {
        throw new NotFoundException(I18nContext.current()!.t('messages.branch.not_found'));
      }
      throw e;
    }
  }

  async deactivate(tenantId: string, id: string) {
    try {
      await this.domainService.deactivateBranch(tenantId, id);
    } catch (e: any) {
      if (e.message === 'Branch not found') {
        throw new NotFoundException(I18nContext.current()!.t('messages.branch.not_found'));
      }
      if (e.message === 'BRANCH_DELETE_MAIN_ERROR') {
        throw new BadRequestException(I18nContext.current()!.t('messages.branch.delete_main_error'));
      }
      if (e.message === 'BRANCH_DELETE_ACTIVE_STUDENTS_ERROR') {
        throw new BadRequestException(I18nContext.current()!.t('messages.branch.delete_active_students_error'));
      }
      throw e;
    }
  }
}
