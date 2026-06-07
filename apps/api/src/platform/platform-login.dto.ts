import { i18nValidationMessage } from 'nestjs-i18n';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PlatformLoginDto {
  @ApiProperty({ example: 'mohammedosama@gmail.com' })
  @IsEmail({}, { message: i18nValidationMessage('validation.isEmail') })
  email: string;

  @ApiProperty({ example: 'Lumi@Owner2025!' })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @MinLength(8, { message: i18nValidationMessage('validation.minLength') })
  password: string;
}
