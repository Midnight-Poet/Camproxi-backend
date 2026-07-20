import { IsOptional, IsString, IsObject } from 'class-validator';
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateAgentDto } from './create-agent.dto';

export class UpdateAgentDto extends PartialType(
  OmitType(CreateAgentDto, ['email', 'password', 'schoolId', 'campusName'] as const),
) {
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  socialLinks?: Record<string, any> | string;

  @IsOptional()
  @IsString()
  profileImage: {
    url: string,
    public_id: string
  }
}
