import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecordAttendanceDto } from './dto/record-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async getAttendance(tenantId: string, date: string) {
    const parsedDate = new Date(date);
    return this.prisma.attendance.findMany({
      where: {
        tenantId,
        date: parsedDate,
      },
      include: {
        student: {
          select: { name: true }
        }
      },
      orderBy: {
        student: { name: 'asc' }
      }
    });
  }

  async recordAttendance(tenantId: string, dto: RecordAttendanceDto) {
    const parsedDate = new Date(dto.date);
    let count = 0;

    await this.prisma.$transaction(
      dto.records.map((record) => {
        count++;
        return this.prisma.attendance.upsert({
          where: {
            studentId_date: {
              studentId: record.studentId,
              date: parsedDate,
            }
          },
          create: {
            tenantId,
            studentId: record.studentId,
            date: parsedDate,
            status: record.status,
            notes: record.notes || null,
          },
          update: {
            status: record.status,
            notes: record.notes || null,
          }
        });
      })
    );

    return { recorded: count };
  }
}
