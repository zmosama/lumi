import { IsEmail, IsString, MinLength, MaxLength, Matches, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterTenantDto {
  @ApiProperty({ example: 'مدرسة النور' })
  @IsString()
  @IsNotEmpty()
  tenantName: string;

  @ApiProperty({ example: 'alnoor', description: 'Subdomain (lowercase, no spaces)' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'Subdomain must be lowercase alphanumeric with hyphens only' })
  @MinLength(3)
  @MaxLength(30)
  subdomain: string;

  @ApiProperty({ example: 'admin@alnoor.com' })
  @IsEmail()
  adminEmail: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString()
  @MinLength(8)
  adminPassword: string;

  @ApiProperty({ example: 'أحمد محمد' })
  @IsString()
  @IsNotEmpty()
  adminName: string;
}
