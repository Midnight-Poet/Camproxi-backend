import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceDto } from './create-service.dto';
import { IsOptional, IsBoolean, IsString } from 'class-validator';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  imagesToDelete?: string[] | string;

  @IsOptional()
  @IsString()
  coverImageId?: string;

  @IsString()
  serviceId: string
}
