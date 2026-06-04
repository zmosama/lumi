import { IsString, IsOptional, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({ example: 'branch_id_here', description: 'ID الفرع' })
  @IsString()
  @IsNotEmpty()
  branchId: string;

  @ApiProperty({ example: 'محمد أحمد' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'student@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '01012345678' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'أحمد محمد' })
  @IsString()
  @IsOptional()
  parentName?: string;

  @ApiPropertyOptional({ example: '01098765432' })
  @IsString()
  @IsOptional()
  parentPhone?: string;

  @ApiPropertyOptional({ example: 'الصف الثالث الإعدادي' })
  @IsString()
  @IsOptional()
  grade?: string;

  @ApiPropertyOptional({ example: 'مجموعة أ' })
  @IsString()
  @IsOptional()
  className?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
