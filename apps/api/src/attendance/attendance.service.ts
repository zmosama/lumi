import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecordAttendanceDto } from './dto/record-attendance.dto';
import { AttendanceEntry } from '../types/api.types';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async getAttendance(schemaName: string, date: string): Promise<AttendanceEntry[]> {
    return this.prisma.$queryRawUnsafe<AttendanceEntry[]>(
      `SELECT a.*, s.name as student_name
       FROM "${schemaName}"."attendance" a
       JOIN "${schemaName}"."students" s ON s.id = a.student_id
       WHERE a.date = $1::date
       ORDER BY s.name`,
      date
    );
  }

  async recordAttendance(schemaName: string, dto: RecordAttendanceDto) {
    const results = [];
    for (const record of dto.records) {
      const result = await this.prisma.$queryRawUnsafe(
        `INSERT INTO "${schemaName}"."attendance" (student_id, date, status, notes)
         VALUES ($1, $2::date, $3, $4)
         ON CONFLICT (student_id, date) DO UPDATE SET status = EXCLUDED.status, notes = EXCLUDED.notes
         RETURNING *`,
        record.studentId, dto.date, record.status, record.notes || null
      );
      results.push(result);
    }
    return { recorded: results.length };
  }
}
