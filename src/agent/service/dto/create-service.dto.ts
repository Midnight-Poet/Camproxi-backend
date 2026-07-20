import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsString()
  @IsNotEmpty()
  serviceCategory!: string;

  @IsArray()
  @IsNotEmpty()
  availableDays!: string[];

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNotEmpty()
  price!: string | number;

  @IsString()
  @IsNotEmpty()
  perUnit!: string;

  @IsNotEmpty()
  time!: any;
}
