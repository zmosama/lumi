import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, Req, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../auth/strategies/jwt.strategy';
import { Roles } from '../auth/decorators/roles.decorator';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@ApiTags('Branches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('branches')
export class BranchesController {
  constructor(private branchesService: BranchesService) {}

  @Get()
  @ApiOperation({ summary: 'List all branches/groups for this org' })
  findAll(@Req() req: { user: AuthUser }): Promise<unknown> {
    return this.branchesService.findAll(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get branch by ID' })
  findOne(@Req() req: { user: AuthUser }, @Param('id') id: string): Promise<unknown> {
    return this.branchesService.findOne(req.user.tenantId, id);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new branch/group' })
  create(@Req() req: { user: AuthUser }, @Body() dto: CreateBranchDto): Promise<unknown> {
    return this.branchesService.create(req.user.tenantId, dto);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update branch' })
  update(
    @Req() req: { user: AuthUser },
    @Param('id') id: string,
    @Body() dto: UpdateBranchDto,
  ): Promise<unknown> {
    return this.branchesService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate a branch (only if no active students)' })
  deactivate(@Req() req: { user: AuthUser }, @Param('id') id: string): Promise<void> {
    return this.branchesService.deactivate(req.user.tenantId, id);
  }
}
