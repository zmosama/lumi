import { i18nValidationMessage } from 'nestjs-i18n';
import { IsString, IsOptional, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({ example: 'branch_id_here', description: 'ID الفرع' })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  branchId: string;

  @ApiProperty({ example: 'محمد أحمد' })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  name: string;

  @ApiPropertyOptional({ example: 'student@example.com' })
  @IsEmail({}, { message: i18nValidationMessage('validation.isEmail') })
  @IsOptional({ message: i18nValidationMessage('validation.isOptional') })
  email?: string;

  @ApiPropertyOptional({ example: '01012345678' })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @IsOptional({ message: i18nValidationMessage('validation.isOptional') })
  phone?: string;

  @ApiPropertyOptional({ example: 'أحمد محمد' })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @IsOptional({ message: i18nValidationMessage('validation.isOptional') })
  parentName?: string;

  @ApiPropertyOptional({ example: '01098765432' })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @IsOptional({ message: i18nValidationMessage('validation.isOptional') })
  parentPhone?: string;

  @ApiPropertyOptional({ example: 'الصف الثالث الإعدادي' })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @IsOptional({ message: i18nValidationMessage('validation.isOptional') })
  grade?: string;

  @ApiPropertyOptional({ example: 'مجموعة أ' })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @IsOptional({ message: i18nValidationMessage('validation.isOptional') })
  className?: string;

  @ApiPropertyOptional()
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @IsOptional({ message: i18nValidationMessage('validation.isOptional') })
  notes?: string;
}
