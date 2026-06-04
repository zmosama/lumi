import {
  IsEmail, IsString, MinLength, MaxLength, Matches, IsNotEmpty,
  IsEnum, IsOptional, IsArray, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrgType } from '@prisma/client';

class PlatformInitialBranchDto {
  @ApiProperty({ example: 'الفرع الرئيسي' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'المعادي' })
  @IsString()
  @IsOptional()
  area?: string;

  @ApiPropertyOptional({
    description: 'للمدارس فقط: أنواع المناهج',
    enum: ['ARABIC', 'LANGUAGES', 'IG'],
    isArray: true,
    example: ['LANGUAGES'],
  })
  @IsArray()
  @IsOptional()
  curriculums?: string[];

  @ApiPropertyOptional({
    description: 'للمدارس فقط: PRIVATE | GOVERNMENT',
    example: 'PRIVATE',
  })
  @IsString()
  @IsOptional()
  ownership?: string;
}

export class CreateTenantPlatformDto {
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

  @ApiProperty({ enum: OrgType, example: OrgType.SCHOOL })
  @IsEnum(OrgType)
  orgType: OrgType;

  @ApiProperty({ type: PlatformInitialBranchDto })
  @ValidateNested()
  @Type(() => PlatformInitialBranchDto)
  initialBranch: PlatformInitialBranchDto;

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
