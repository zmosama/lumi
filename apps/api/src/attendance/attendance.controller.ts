import { Controller, Get, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AttendanceService } from './attendance.service';
import { RecordAttendanceDto } from './dto/record-attendance.dto';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Get()
  @ApiOperation({ summary: 'Get attendance for a specific date' })
  getAttendance(
    @Req() req: { user: { schemaName: string } },
    @Query('date') date?: string,
  ): Promise<unknown> {
    return this.attendanceService.getAttendance(
      req.user.schemaName,
      date || new Date().toISOString().split('T')[0],
    );
  }

  @Post()
  @ApiOperation({ summary: 'Record attendance for students' })
  recordAttendance(
    @Req() req: { user: { schemaName: string } },
    @Body() dto: RecordAttendanceDto,
  ): Promise<unknown> {
    return this.attendanceService.recordAttendance(req.user.schemaName, dto);
  }
}
