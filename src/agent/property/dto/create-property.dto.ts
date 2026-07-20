import { plainToInstance, Transform, Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsNumber, IsOptional, ValidateNested, IsArray, IsDefined } from 'class-validator';

export class Location {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  lat: number

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  lng: number
}

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsString()
  @IsNotEmpty()
  roomType!: string;

  @IsArray()
  @IsString({ each: true })
  // Handles cases where single string or multiple values are passed via FormData
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return [value];
    return [];
  })
  amenities!: string[]

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNotEmpty()
  price!: string | number;

  @IsNotEmpty()
  unitQuantity!: string | number;

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
      return plainToInstance(Location, parsed);
    }

    return value;
  })
  @ValidateNested()
  @Type(() => Location)
  @IsDefined()
  location!: Location;
}
