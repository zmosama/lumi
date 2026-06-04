import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../auth/strategies/jwt.strategy';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('students')
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Get()
  @ApiOperation({ summary: 'List students — filter by branchId, search, status' })
  findAll(
    @Req() req: { user: AuthUser },
    @Query('branchId') branchId?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ): Promise<unknown> {
    return this.studentsService.findAll(req.user.tenantId, {
      branchId,
      search,
      status,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student by ID' })
  findOne(@Req() req: { user: AuthUser }, @Param('id') id: string): Promise<unknown> {
    return this.studentsService.findOne(req.user.tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new student' })
  create(@Req() req: { user: AuthUser }, @Body() dto: CreateStudentDto): Promise<unknown> {
    return this.studentsService.create(req.user.tenantId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update student' })
  update(
    @Req() req: { user: AuthUser },
    @Param('id') id: string,
    @Body() dto: UpdateStudentDto,
  ): Promise<unknown> {
    return this.studentsService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive student (soft delete)' })
  remove(@Req() req: { user: AuthUser }, @Param('id') id: string): Promise<void> {
    return this.studentsService.archive(req.user.tenantId, id);
  }
}
