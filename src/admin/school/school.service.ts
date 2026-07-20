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
}
