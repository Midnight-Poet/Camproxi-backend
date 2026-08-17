import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ReportTargetType } from '@prisma/client';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(ReportTargetType)
  targetType: ReportTargetType;

  @IsString()
  @IsOptional()
  targetId?: string;
}
