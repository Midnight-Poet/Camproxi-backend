import { PartialType } from '@nestjs/mapped-types';
import { CreatePropertyDto } from './create-property.dto';
import { IsOptional, IsBoolean, IsString } from 'class-validator';

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {
  @IsOptional()
  @IsBoolean()
  isVacant?: boolean;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  imagesToDelete?: string[] | string;

  @IsOptional()
  @IsString()
  coverImageId?: string;

  @IsString()
  propertyId: string
}
