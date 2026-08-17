import { BadRequestException, Injectable } from '@nestjs/common';
import { LocationDto } from './dto/location.dto';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class SchoolService {
	constructor(private readonly prisma: PrismaService) {}

	public async createNewLocation(location: LocationDto) {
		try {
			const res = await this.prisma.school.create({ data: location });
			return res;
		} catch (error: any) {
			throw new BadRequestException(error.message);
		}
	}
	public async getAllLocations() {
		return await this.prisma.school.findMany({});
	}

	public async getLocationById(id: string) {
		return await this.prisma.school.findFirst({
			where: {
				id,
			},
		});
	}

	public async updateSchool(id: string, location: Partial<LocationDto>) {
		try {
			return await this.prisma.school.update({
				where: { id },
				data: location,
			});
		} catch (error: any) {
			throw new BadRequestException(error.message);
		}
	}

	public async deleteSchool(id: string) {
		const agentCount = await this.prisma.agent.count({ where: { schoolId: id } });
		const userCount = await this.prisma.user.count({ where: { schoolId: id } });

		if (agentCount > 0 || userCount > 0) {
			throw new BadRequestException("Cannot delete a school that has registered users.");
		}

		return await this.prisma.school.delete({ where: { id } });
	}
}
