import { i18nValidationMessage } from 'nestjs-i18n';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@school.com' })
  @IsEmail({}, { message: i18nValidationMessage('validation.isEmail') })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  password: string;

  @ApiProperty({ example: 'alnoor', description: 'School subdomain' })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  subdomain: string;
}
