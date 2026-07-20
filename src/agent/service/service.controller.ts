import {
	Controller,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Get,
	UseGuards,
	Req,
	UseInterceptors,
	UploadedFiles,
} from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { AgentAuthGuard } from '../auth/agent-auth.guard';
import { Request } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enum/enum';

@Controller('api/agent/services')
export class ServiceController {
	constructor(
		private readonly serviceService: ServiceService,
		private readonly cloudinaryService: CloudinaryService,
	) {}

	@UseGuards(AgentAuthGuard, RolesGuard)
	@Roles(Role.SERVICE_PROVIDER)
	@Post()
	@UseInterceptors(FilesInterceptor('images', 10))
	async create(
		@Req() req: Request,
		@Body() createServiceDto: CreateServiceDto,
		@UploadedFiles() files: Express.Multer.File[],
	) {
		const agentId = req['agent'].id;
		let uploadedImages = [];
		let serviceId = this.serviceService.generateServiceId();
		if (files && files.length > 0) {
			uploadedImages = await this.cloudinaryService.uploadImages(
				files,
				`upload/services/${agentId}/${serviceId}`,
			);
		}
		return this.serviceService.create(
			agentId,
			createServiceDto,
			uploadedImages,
			serviceId,
		);
	}

	@UseGuards(AgentAuthGuard, RolesGuard)
	@Roles(Role.SERVICE_PROVIDER)
	@Get()
	findAllForAgent(@Req() req: Request) {
		return this.serviceService.findAllByAgent(req['agent'].id);
	}

	@UseGuards(AgentAuthGuard, RolesGuard)
	@Roles(Role.SERVICE_PROVIDER)
	@Get(':id')
	findOne(@Param('id') id: string, @Req() req: Request) {
		return this.serviceService.findOne(id, req['agent'].id);
	}

	@UseGuards(AgentAuthGuard, RolesGuard)
	@Roles(Role.SERVICE_PROVIDER)
	@Patch(':id')
	@UseInterceptors(FilesInterceptor('newImages', 10))
	async update(
		@Param('id') id: string,
		@Req() req: Request,
		@Body() updateServiceDto: UpdateServiceDto,
		@UploadedFiles() files: Express.Multer.File[],
	) {
		const agentId = req['agent'].id;
		let uploadedImages = [];
		if (files && files.length > 0) {
			uploadedImages = await this.cloudinaryService.uploadImages(
				files,
				`upload/services/${agentId}/${updateServiceDto.serviceId} `,
			);
		}
		return this.serviceService.update(
			id,
			agentId,
			updateServiceDto,
			uploadedImages,
		);
	}

	@UseGuards(AgentAuthGuard, RolesGuard)
	@Roles(Role.SERVICE_PROVIDER)
	@Delete(':id')
	remove(@Param('id') id: string, @Req() req: Request) {
		return this.serviceService.remove(id, req['agent'].id);
	}

	@Get('fetch/students/:schoolId')
	async getAllByStudents(
		@Req() req: Request,
	) {
		const id = req['user'].schoolId;
		const res = await this.serviceService.getAllByStudents();
		const actualRes = res.filter((element: any) => {
			if (element.schoolId === id) {
				return element
			}
		});
		return actualRes
	}
}
