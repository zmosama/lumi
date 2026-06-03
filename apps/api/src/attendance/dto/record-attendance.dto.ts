import { IsArray, IsDateString, IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class AttendanceEntryDto {
  @IsString()
  studentId: string;

  @IsIn(['present', 'absent', 'late'])
  status: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class RecordAttendanceDto {
  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ type: [AttendanceEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceEntryDto)
  records: AttendanceEntryDto[];
}
