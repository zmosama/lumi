import { i18nValidationMessage } from 'nestjs-i18n';
import { IsArray, IsDateString, IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class AttendanceEntryDto {
  @IsString({ message: i18nValidationMessage('validation.isString') })
  studentId: string;

  @IsIn(['present', 'absent', 'late'])
  status: string;

  @IsString({ message: i18nValidationMessage('validation.isString') })
  @IsOptional({ message: i18nValidationMessage('validation.isOptional') })
  notes?: string;
}

export class RecordAttendanceDto {
  @ApiProperty({ example: '2024-01-15' })
  @IsDateString({ strict: false }, { message: i18nValidationMessage('validation.isDateString') })
  date: string;

  @ApiProperty({ type: [AttendanceEntryDto] })
  @IsArray({ message: i18nValidationMessage('validation.isArray') })
  @ValidateNested({ each: true })
  @Type(() => AttendanceEntryDto)
  records: AttendanceEntryDto[];
}
