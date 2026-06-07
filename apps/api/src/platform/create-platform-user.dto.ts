import { i18nValidationMessage } from 'nestjs-i18n';
import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlatformRole } from '@prisma/client';

export class CreatePlatformUserDto {
  @ApiProperty({ example: 'sales2@lumi.app' })
  @IsEmail({}, { message: i18nValidationMessage('validation.isEmail') })
  email: string;

  @ApiProperty({ example: 'موظف مبيعات' })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  name: string;

  @ApiProperty({ example: 'Sales@Lumi123!' })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @MinLength(8, { message: i18nValidationMessage('validation.minLength') })
  password: string;

  @ApiPropertyOptional({ enum: PlatformRole, default: PlatformRole.SALES })
  @IsEnum(PlatformRole, { message: i18nValidationMessage('validation.isEnum') })
  @IsOptional({ message: i18nValidationMessage('validation.isOptional') })
  role?: PlatformRole;
}
