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
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AgentAuthGuard } from '../auth/agent-auth.guard';
import { Request } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enum/enum';
import { StudentAuthGuard } from '../../student/auth/guards/student-auth.guard';


@Controller('api/agent/products')
export class ProductController {
	constructor(
		private readonly productService: ProductService,
		private readonly cloudinaryService: CloudinaryService,
	) {}

	@UseGuards(AgentAuthGuard, RolesGuard)
	@Roles(Role.VENDOR)
	@Post()
	@UseInterceptors(FilesInterceptor('images', 10))
	async create(
		@Req() req: Request,
		@Body() createProductDto: CreateProductDto,
		@UploadedFiles() files: Express.Multer.File[],
	) {
		const agentId = req['agent'].id;
		const schoolId = req['agent'].schoolId;
		let uploadedImages = [];
		let productId = this.productService.generateProductId();
		if (files && files.length > 0) {
			uploadedImages = await this.cloudinaryService.uploadImages(
				files,
				`upload/products/${agentId}/${productId}`,
			);
		}
		return this.productService.create(
			agentId,
			createProductDto,
			uploadedImages,
			productId,
			schoolId
		);
	}

	@UseGuards(AgentAuthGuard, RolesGuard)
	@Roles(Role.VENDOR)
	@Get()
	findAllForAgent(@Req() req: Request) {
		return this.productService.findAllByAgent(req['agent'].id);
	}

	@UseGuards(AgentAuthGuard, RolesGuard)
	@Roles(Role.VENDOR)
	@Get(':id')
	findOne(@Param('id') id: string, @Req() req: Request) {
		return this.productService.findOne(id, req['agent'].id);
	}

	@UseGuards(AgentAuthGuard, RolesGuard)
	@Roles(Role.VENDOR)
	@Patch(':id')
	@UseInterceptors(FilesInterceptor('newImages', 10))
	async update(
		@Param('id') id: string,
		@Req() req: Request,
		@Body() updateProductDto: UpdateProductDto,
		@UploadedFiles() files: Express.Multer.File[],
	) {
		const agentId = req['agent'].id;
		let uploadedImages = [];
		// const productId = req
		if (files && files.length > 0) {
			uploadedImages = await this.cloudinaryService.uploadImages(
				files,
				`upload/products/${agentId}/${updateProductDto.productId}`,
			);
		}
		return this.productService.update(
			id,
			agentId,
			updateProductDto,
			uploadedImages,
		);
	}

	@UseGuards(AgentAuthGuard, RolesGuard)
	@Roles(Role.VENDOR)
	@Delete(':id')
	remove(@Param('id') id: string, @Req() req: Request) {
		return this.productService.remove(id, req['agent'].id);
	}

	@UseGuards(StudentAuthGuard)
	@Get('fetch/students')
	async getAllByStudents(
		@Req() req: Request,
	) {
		const id = req['user'].schoolId;
		const res = await this.productService.getAllByStudents();
		const actualRes = res.filter((element: any) => {
			if (element.schoolId === id) {
				return element
			}
		});
		return actualRes
	}

	@UseGuards(StudentAuthGuard)
	@Get('fetch/saved')
	async getSavedByStudents(
		@Req() req: Request,
	) {
		const id = req['user'].schoolId;
		const res = await this.productService.getAllByStudents();
		const actualRes = res.filter((element: any) => {
			if (element.schoolId === id) {
				return element
			}
		});
		return actualRes
	}
}
