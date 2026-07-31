import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()  
  @IsPhoneNumber('NG')
  @IsOptional()
  phone?: string;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  longitude?: number;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  latitude?: number;

  @IsString()
  @IsNotEmpty()
  school!: string;

  @IsOptional()
  location?: {
    longitude: number;
    latitude: number;
  };

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  schoolId!: string;

  @IsString()
  @IsNotEmpty()
  campusName!: string;
}
