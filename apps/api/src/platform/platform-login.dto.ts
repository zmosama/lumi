import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PlatformLoginDto {
  @ApiProperty({ example: 'mohammedosama@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Lumi@Owner2025!' })
  @IsString()
  @MinLength(8)
  password: string;
}
