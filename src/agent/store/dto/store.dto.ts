import { IsString, IsOptional, IsObject, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class LocationDto {
  @IsOptional()
  lat?: number;

  @IsOptional()
  lng?: number;
}

class OperatingHoursDto {
  @IsString()
  @IsOptional()
  open?: string;

  @IsString()
  @IsOptional()
  close?: string;
}

export class CreateOrUpdateStoreDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  bannerImage?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => OperatingHoursDto)
  operatingHours?: OperatingHoursDto;
}
