import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, ValidateNested, IsOptional, IsArray } from 'class-validator';

export class SchoolLocation {
  @IsNumber()
  @IsNotEmpty()
  longitude!: number;

  @IsNumber()
  @IsNotEmpty()
  latitude!: number;
}

export class CampusDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ValidateNested()
  @Type(() => SchoolLocation)
  @IsNotEmpty()
  location!: SchoolLocation;
}

export class LocationDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CampusDto)
  @IsOptional()
  campus?: CampusDto[];
}
