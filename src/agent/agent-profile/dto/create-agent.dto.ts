import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional, IsEnum, IsPhoneNumber } from 'class-validator';
import {AgentCategory} from '@prisma/client'

export class CreateAgentDto {
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
  companyName!: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(AgentCategory, { message: 'Category must be one of AGENT, VENDOR, or SERVICE_PROVIDER' })
  category!: AgentCategory;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;

  @IsString()
  @IsPhoneNumber('NG')
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  schoolId!: string;

  @IsString()
  @IsPhoneNumber('NG')
  @IsOptional()
  whatsapp?: string;

  @IsString()
  @IsNotEmpty()
  campusName!: string;
}
