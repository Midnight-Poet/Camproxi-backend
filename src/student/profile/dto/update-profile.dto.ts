import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto extends PartialType(
  OmitType(CreateUserDto, ['password', 'school', 'location', 'campusName'] as const),
) {
  @IsString()
  @IsOptional()
  bio?: string;

  @IsOptional()
  profileImage?: { url: string; public_id: string };
}

