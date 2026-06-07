import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecordAttendanceDto } from './dto/record-attendance.dto';
import { AttendanceDomainService } from '@lumi/domain';

@Injectable()
export class AttendanceService {
  private domainService: AttendanceDomainService;

  constructor(private prisma: PrismaService) {
    this.domainService = new AttendanceDomainService(this.prisma);
  }

  async getAttendance(tenantId: string, date: string) {
    return this.domainService.getAttendanceForDate(date);
  }

  async recordAttendance(tenantId: string, dto: RecordAttendanceDto) {
    return this.domainService.recordDailyAttendance(dto);
  }
}
