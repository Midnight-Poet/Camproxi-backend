import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Req,
	UnauthorizedException,
	UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { SchoolService } from './school.service';
import { LocationDto } from './dto/location.dto';
import type { Request } from 'express';

@Controller('api/admin/school')
export class SchoolController {
	constructor(private readonly schoolService: SchoolService) {}

	@UseGuards(AdminAuthGuard)
	@Post('new')
	public async createNewLocation(
		@Body() location: LocationDto,
		@Req() req: Request,
	) {
		try {
			if (
				req['admin']?.role !== 'SUPER_ADMIN' &&
				req['admin']?.role !== 'ADMIN'
			) {
				throw new UnauthorizedException(
					'You do not have permission to perform this action',
				);
			}
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
}
