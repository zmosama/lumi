import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlatformRole } from '@prisma/client';

export class CreatePlatformUserDto {
  @ApiProperty({ example: 'sales2@lumi.app' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'موظف مبيعات' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Sales@Lumi123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ enum: PlatformRole, default: PlatformRole.SALES })
  @IsEnum(PlatformRole)
  @IsOptional()
  role?: PlatformRole;
}
