import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { AdminRole as UserRole } from '@prisma/client';

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsEnum(UserRole, {
    message: 'Role must be one of the valid AdminRole values',
  })
  role!: UserRole;

  @IsString()
  @IsNotEmpty()
  username!: string;
}
