import {
	Injectable,
	NotFoundException,
	ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { v4 as uuidv4 } from 'uuid';
import { Product } from '@prisma/client';

@Injectable()
export class ProductService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly cloudinary: CloudinaryService,
	) {}

	public generateProductId(): string {
		const prefix = 'C-PRD';
		const uuid = uuidv4().split('-')[0].toUpperCase();
		return `${prefix}-${uuid}`;
	}

	async create(
		agentId: string,
		createDto: CreateProductDto,
		images: { url: string; public_id: string }[],
		productId: string,
		schoolId: string
	) {
		try {
			let delivery = createDto.delivery;
			if (typeof delivery === 'string') {
				try {
					delivery = JSON.parse(delivery);
				} catch (e) {
					delivery = null;
				}
			}

			const formattedImages = images.map((img, index) => ({
				url: img.url,
				publicId: img.public_id,
				isCover: index === 0,
			}));

			// const productId = this.generateProductId();

			return await this.prisma.product.create({
				data: {
					productId,
					name: createDto.name,
					businessCategory: createDto.businessCategory,
					description: createDto.description,
					price: Number(createDto.price),
					delivery,
					images: formattedImages,
					agentId,
					schoolId
				},
			});
		} catch (error: any) {
			throw new Error(`Failed to create product: ${error.message}`);
		}
	}

	async findAllByAgent(agentId: string) {
		return this.prisma.product.findMany({
			where: { agentId },
			orderBy: { createdAt: 'desc' },
		});
	}

	async findOne(id: string, agentId: string) {
		const product = await this.prisma.product.findUnique({ where: { id } });
		if (!product) throw new NotFoundException('Product not found');
		if (product.agentId !== agentId)
			throw new ForbiddenException('Access denied');
		return product;
	}

	async update(
		id: string,
		agentId: string,
		updateDto: UpdateProductDto,
		newImages: { url: string; public_id: string }[],
	) {
		const product = await this.findOne(id, agentId);
		let images = [...(product.images || [])];

		if (updateDto.imagesToDelete) {
			const idsToDelete = Array.isArray(updateDto.imagesToDelete)
				? updateDto.imagesToDelete
				: JSON.parse(updateDto.imagesToDelete);

			if (idsToDelete.length > 0) {
				await this.cloudinary.deleteImages(idsToDelete);
				images = images.filter(
					(img) => !idsToDelete.includes(img.publicId),
				);
			}
		}

		if (newImages.length > 0) {
			const formattedNewImages = newImages.map((img) => ({
				url: img.url,
				publicId: img.public_id,
				isCover: false,
			}));
			images = [...images, ...formattedNewImages];
		}

		if (images.length > 0 && !images.some((img) => img.isCover)) {
			images[0].isCover = true;
		}
		if (updateDto.coverImageId) {
			images = images.map((img) => ({
				...img,
				isCover: img.publicId === updateDto.coverImageId,
			}));
		}

		const dataToUpdate: any = { ...updateDto };
		if (updateDto.price) dataToUpdate.price = Number(updateDto.price);
		if (updateDto.delivery) {
			dataToUpdate.delivery =
				typeof updateDto.delivery === 'string'
					? JSON.parse(updateDto.delivery)
					: updateDto.delivery;
		}

		delete dataToUpdate.imagesToDelete;
		delete dataToUpdate.coverImageId;

		return this.prisma.product.update({
			where: { id },
			data: { ...dataToUpdate, images },
		});
	}

	async remove(id: string, agentId: string) {
		const product = await this.findOne(id, agentId);
		if (product.images && product.images.length > 0) {
			const publicIds = product.images.map((img) => img.publicId);
			await this.cloudinary.deleteImages(publicIds);
		}
		await this.prisma.product.delete({ where: { id } });
		return {
			message: 'Product and associated images deleted successfully',
		};
	}

	async getAllByStudents() {
		const products = await this.prisma.product.findMany({
			orderBy: { createdAt: 'desc' },
		});
		return products;
	}
}
