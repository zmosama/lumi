import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req, HttpCode, HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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
  @ApiOperation({ summary: 'List all students' })
  findAll(
    @Req() req: { user: { schemaName: string } },
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ): Promise<unknown> {
    return this.studentsService.findAll(req.user.schemaName, {
      search,
      status,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student by ID' })
  findOne(
    @Req() req: { user: { schemaName: string } },
    @Param('id') id: string,
  ): Promise<unknown> {
    return this.studentsService.findOne(req.user.schemaName, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new student' })
  create(
    @Req() req: { user: { schemaName: string } },
    @Body() dto: CreateStudentDto,
  ): Promise<unknown> {
    return this.studentsService.create(req.user.schemaName, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update student' })
  update(
    @Req() req: { user: { schemaName: string } },
    @Param('id') id: string,
    @Body() dto: UpdateStudentDto,
  ): Promise<unknown> {
    return this.studentsService.update(req.user.schemaName, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive student (soft delete)' })
  remove(
    @Req() req: { user: { schemaName: string } },
    @Param('id') id: string,
  ): Promise<void> {
    return this.studentsService.archive(req.user.schemaName, id);
  }
}
