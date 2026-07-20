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
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { AgentAuthGuard } from '../auth/agent-auth.guard';
import { Request } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from 'src/common/enum/enum';

@Controller('api/agent/properties')
export class PropertyController {
	constructor(
		private readonly propertyService: PropertyService,
		private readonly cloudinaryService: CloudinaryService,
	) {}

	@UseGuards(AgentAuthGuard, RolesGuard)
	@Roles(Role.AGENT)
	@Post()
	@UseInterceptors(FilesInterceptor('images', 10))
	async create(
		@Req() req: Request,
		@Body() createPropertyDto: CreatePropertyDto,
		@UploadedFiles() files: Express.Multer.File[],
	) {
		const agentId = req['agent'].id;
		let uploadedImages = [];
		let propertyId = this.propertyService.generatePropertyId()
		if (files && files.length > 0) {
			uploadedImages = await this.cloudinaryService.uploadImages(
				files,
				`upload/properties/${agentId}/${propertyId}`,
			);
		}
		return this.propertyService.create(
			agentId,
			createPropertyDto,
			uploadedImages,
			propertyId
		);
	}

	@UseGuards(AgentAuthGuard, RolesGuard)
	@Roles(Role.AGENT)
	@Get()
	findAllForAgent(@Req() req: Request) {
		return this.propertyService.findAllByAgent(req['agent'].id);
	}

	@UseGuards(AgentAuthGuard, RolesGuard)
	@Roles(Role.AGENT)
	@Get(':id')
	findOne(@Param('id') id: string, @Req() req: Request) {
		return this.propertyService.findOne(id, req['agent'].id);
	}

	@UseGuards(AgentAuthGuard, RolesGuard)
	@Roles(Role.AGENT)
	@Patch(':id')
	@UseInterceptors(FilesInterceptor('newImages', 10))
	async update(
		@Param('id') id: string,
		@Req() req: Request,
		@Body() updatePropertyDto: UpdatePropertyDto,
		@UploadedFiles() files: Express.Multer.File[],
	) {
		const agentId = req['agent'].id;
		let uploadedImages = [];
		if (files && files.length > 0) {
			uploadedImages = await this.cloudinaryService.uploadImages(
				files,
				`upload/properties/${agentId}/${updatePropertyDto.propertyId}`,
			);
		}
		return this.propertyService.update(
			id,
			agentId,
			updatePropertyDto,
			uploadedImages,
		);
	}

	@UseGuards(AgentAuthGuard, RolesGuard)
	@Roles(Role.AGENT)
	@Delete(':id')
	remove(@Param('id') id: string, @Req() req: Request) {
		return this.propertyService.remove(id, req['agent'].id);
	}

	@Get('fetch/students/:schoolId')
	async getAllByStudents(
		@Req() req: Request,
	) {
		const id = req['user'].schoolId;
		const res = await this.propertyService.getAllByStudents();
		const actualRes = res.filter((element: any) => {
			if (element.schoolId === id) {
				return element
			}
		});
		return actualRes
	}
}
