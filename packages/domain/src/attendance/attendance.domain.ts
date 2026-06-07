// Pure TypeScript Domain Logic
export interface AttendanceRepository {
  findMany(params: any): Promise<any>;
  upsert(params: any): Promise<any>;
  $transaction(promises: any[]): Promise<any[]>;
}

export interface RecordAttendancePayload {
  date: string;
  records: Array<{
    studentId: string;
    status: string;
    notes?: string;
  }>;
}

export class AttendanceDomainService {
  constructor(private readonly repo: AttendanceRepository) {}

  async getAttendanceForDate(date: string) {
    const parsedDate = new Date(date);
    return this.repo.findMany({
      where: { date: parsedDate },
      include: {
        student: { select: { name: true } }
      },
      orderBy: { student: { name: 'asc' } }
    });
  }

  async recordDailyAttendance(payload: RecordAttendancePayload) {
    const parsedDate = new Date(payload.date);
    
    // Core Domain Rule: Can't record attendance in the future
    if (parsedDate > new Date()) {
      throw new Error('Cannot record attendance for future dates');
    }

    let count = 0;
    const promises = payload.records.map((record) => {
      count++;
      return this.repo.upsert({
        where: {
          studentId_date: {
            studentId: record.studentId,
            date: parsedDate,
          }
        },
        create: {
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
    });

    await this.repo.$transaction(promises);

    return { recorded: count };
  }
}
