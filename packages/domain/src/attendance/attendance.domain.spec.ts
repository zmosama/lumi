import { AttendanceDomainService } from './attendance.domain';

describe('AttendanceDomainService', () => {
  let service: AttendanceDomainService;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      attendance: {
        findMany: jest.fn(),
        upsert: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    service = new AttendanceDomainService(mockRepo);
  });

  describe('getAttendanceForDate', () => {
    it('should query attendance for a specific date', async () => {
      mockRepo.attendance.findMany.mockResolvedValueOnce([{ id: 1 }]);

      const res = await service.getAttendanceForDate('2023-10-10');

      expect(res).toEqual([{ id: 1 }]);
      expect(mockRepo.attendance.findMany).toHaveBeenCalledWith({
        where: { date: new Date('2023-10-10') },
        include: { student: { select: { name: true } } },
        orderBy: { student: { name: 'asc' } },
      });
    });
  });

  describe('recordDailyAttendance', () => {
    it('should throw an error if the date is in the future', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      
      await expect(
        service.recordDailyAttendance({
          date: futureDate.toISOString(),
          records: [],
        })
      ).rejects.toThrow('Cannot record attendance for future dates');
    });

    it('should record attendance and run transaction', async () => {
      mockRepo.attendance.upsert.mockReturnValue('upsert-promise');
      mockRepo.$transaction.mockResolvedValueOnce(['res1', 'res2']);

      const res = await service.recordDailyAttendance({
        date: '2023-10-10',
        records: [
          { studentId: 'student-1', status: 'present' },
          { studentId: 'student-2', status: 'absent', notes: 'sick' },
        ],
      });

      expect(res).toEqual({ recorded: 2 });
      expect(mockRepo.attendance.upsert).toHaveBeenCalledTimes(2);
      expect(mockRepo.$transaction).toHaveBeenCalledWith(['upsert-promise', 'upsert-promise']);
    });
  });
});
