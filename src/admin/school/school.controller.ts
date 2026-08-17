import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Req,
	UnauthorizedException,
	UseGuards,
	Patch,
	Delete,
} from '@nestjs/common';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRole } from '@prisma/client';
import { SchoolService } from './school.service';
import { LocationDto } from './dto/location.dto';
import type { Request } from 'express';

@Controller('api/admin/school')
@UseGuards(AdminAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
export class SchoolController {
	constructor(private readonly schoolService: SchoolService) {}

	@Post('new')
	public async createNewLocation(
		@Body() location: LocationDto,
		@Req() req: Request,
	) {
		try {
			return await this.schoolService.createNewLocation(location);
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	@Get()
	public async getAllLocation() {
		return this.schoolService.getAllLocations();
	}

	@Get(':id')
	public async getSchoolById(@Param('id') id: string) {
		return this.schoolService.getLocationById(id);
	}

	@Patch(':id')
	public async updateSchool(
		@Param('id') id: string,
		@Body() location: Partial<LocationDto>
	) {
		return this.schoolService.updateSchool(id, location);
	}

	@Delete(':id')
	public async deleteSchool(@Param('id') id: string) {
		return this.schoolService.deleteSchool(id);
	}
}
