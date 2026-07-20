import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, ValidateNested } from 'class-validator';
import {DeliveryOption} from '@prisma/client'
import { plainToInstance, Transform, Type } from 'class-transformer';

export class DeliveryOptions {
  @IsString()
  @IsEnum(DeliveryOption)
  option: DeliveryOption

  @IsOptional()
  @IsNumber()
  price?: number

  @IsOptional()
  @IsNumber()
  duration?: number
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  businessCategory!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNotEmpty()
  price!: string | number;

  @Transform(({ value }) => {
      let parsed = value;
  
      // 1. If string (from FormData/Postman), parse it to JS object
      if (typeof value === 'string') {
        try {
          parsed = JSON.parse(value);
        } catch {
          return value;
        }
      }
  
      // 2. Turn the object into an official instance of the Location class
      if (parsed && typeof parsed === 'object') {
        return plainToInstance(DeliveryOptions, parsed);
      }
  
      return value;
    })
  @ValidateNested()
  @Type(() => DeliveryOptions)
  @IsOptional()
  delivery?: DeliveryOptions;
}


