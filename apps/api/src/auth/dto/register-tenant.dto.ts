import { i18nValidationMessage } from 'nestjs-i18n';
import {
  IsEmail, IsString, MinLength, MaxLength, Matches, IsNotEmpty,
  IsEnum, IsOptional, IsArray, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrgType } from '@prisma/client';

class InitialBranchDto {
  @ApiProperty({ example: 'الفرع الرئيسي' })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  name: string;

  @ApiPropertyOptional({ example: 'المعادي' })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @IsOptional({ message: i18nValidationMessage('validation.isOptional') })
  area?: string;

  @ApiPropertyOptional({
    description: 'للمدارس فقط: أنواع المناهج',
    enum: ['ARABIC', 'LANGUAGES', 'IG'],
    isArray: true,
    example: ['LANGUAGES'],
  })
  @IsArray({ message: i18nValidationMessage('validation.isArray') })
  @IsOptional({ message: i18nValidationMessage('validation.isOptional') })
  curriculums?: string[];

  @ApiPropertyOptional({
    description: 'للمدارس فقط: PRIVATE | GOVERNMENT',
    example: 'PRIVATE',
  })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @IsOptional({ message: i18nValidationMessage('validation.isOptional') })
  ownership?: string;
}

export class RegisterTenantDto {
  @ApiProperty({ example: 'مدرسة النور' })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  tenantName: string;

  @ApiProperty({ example: 'alnoor', description: 'Subdomain (lowercase, no spaces)' })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @Matches(/^[a-z0-9-]+$/, { message: 'Subdomain must be lowercase alphanumeric with hyphens only' })
  @MinLength(3, { message: i18nValidationMessage('validation.minLength') })
  @MaxLength(30, { message: i18nValidationMessage('validation.maxLength') })
  subdomain: string;

  @ApiProperty({ enum: OrgType, example: OrgType.SCHOOL })
  @IsEnum(OrgType, { message: i18nValidationMessage('validation.isEnum') })
  orgType: OrgType;

  @ApiProperty({ type: InitialBranchDto })
  @ValidateNested()
  @Type(() => InitialBranchDto)
  initialBranch: InitialBranchDto;

  @ApiProperty({ example: 'admin@alnoor.com' })
  @IsEmail({}, { message: i18nValidationMessage('validation.isEmail') })
  adminEmail: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @MinLength(8, { message: i18nValidationMessage('validation.minLength') })
  adminPassword: string;

  @ApiProperty({ example: 'أحمد محمد' })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  adminName: string;
}
