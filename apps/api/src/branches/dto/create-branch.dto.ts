import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBranchDto {
  @ApiProperty({ example: 'فرع المعادي' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'المعادي' })
  @IsString()
  @IsOptional()
  area?: string;

  @ApiPropertyOptional({
    description: 'أنواع المناهج — للمدارس فقط',
    enum: ['ARABIC', 'LANGUAGES', 'IG'],
    isArray: true,
    example: ['LANGUAGES'],
  })
  @IsArray()
  @IsOptional()
  curriculums?: string[];

  @ApiPropertyOptional({
    description: 'نوع الملكية — للمدارس فقط: PRIVATE | GOVERNMENT',
    example: 'PRIVATE',
  })
  @IsString()
  @IsIn(['PRIVATE', 'GOVERNMENT'])
  @IsOptional()
  ownership?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isMain?: boolean;
}
