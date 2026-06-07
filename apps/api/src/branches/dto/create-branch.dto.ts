import { i18nValidationMessage } from 'nestjs-i18n';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBranchDto {
  @ApiProperty({ example: 'فرع المعادي' })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  name: string;

  @ApiPropertyOptional({ example: 'المعادي' })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @IsOptional({ message: i18nValidationMessage('validation.isOptional') })
  area?: string;

  @ApiPropertyOptional({
    description: 'أنواع المناهج — للمدارس فقط',
    enum: ['ARABIC', 'LANGUAGES', 'IG'],
    isArray: true,
    example: ['LANGUAGES'],
  })
  @IsArray({ message: i18nValidationMessage('validation.isArray') })
  @IsOptional({ message: i18nValidationMessage('validation.isOptional') })
  curriculums?: string[];

  @ApiPropertyOptional({
    description: 'نوع الملكية — للمدارس فقط: PRIVATE | GOVERNMENT',
    example: 'PRIVATE',
  })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @IsIn(['PRIVATE', 'GOVERNMENT'])
  @IsOptional({ message: i18nValidationMessage('validation.isOptional') })
  ownership?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean({ message: i18nValidationMessage('validation.isBoolean') })
  @IsOptional({ message: i18nValidationMessage('validation.isOptional') })
  isMain?: boolean;
}
