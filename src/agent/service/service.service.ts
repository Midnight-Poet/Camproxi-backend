import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ServiceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  public generateServiceId(): string {
    const prefix = 'C-SVC';
    const uuid = uuidv4().split('-')[0].toUpperCase();
    return `${prefix}-${uuid}`;
  }

  async create(
    agentId: string,
    createDto: CreateServiceDto,
    images: { url: string; public_id: string }[],
    serviceId: string
  ) {
    try {
      const availableDays = Array.isArray(createDto.availableDays)
        ? createDto.availableDays
        : JSON.parse(createDto.availableDays || '[]');
      
      let time = createDto.time;
      if (typeof time === 'string') {
        try {
          time = JSON.parse(time);
        } catch (e) {
          time = { startTime: '', endTime: '' };
        }
      }

      const formattedImages = images.map((img, index) => ({
        url: img.url,
        publicId: img.public_id,
        isCover: index === 0,
      }));

      // const serviceId = this.generateServiceId();

      return await this.prisma.service.create({
        data: {
          serviceId,
          name: createDto.name,
          address: createDto.address,
          serviceCategory: createDto.serviceCategory,
          availableDays,
          description: createDto.description,
          price: Number(createDto.price),
          perUnit: createDto.perUnit,
          time,
          images: formattedImages,
          agentId,
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to create service: ${error.message}`);
    }
  }

  async findAllByAgent(agentId: string) {
    return this.prisma.service.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, agentId: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');
    if (service.agentId !== agentId)
      throw new ForbiddenException('Access denied');
    return service;
  }

  async update(
    id: string,
    agentId: string,
    updateDto: UpdateServiceDto,
    newImages: { url: string; public_id: string }[],
  ) {
    const service = await this.findOne(id, agentId);
    let images = [...(service.images || [])];

    if (updateDto.imagesToDelete) {
      const idsToDelete = Array.isArray(updateDto.imagesToDelete)
        ? updateDto.imagesToDelete
        : JSON.parse(updateDto.imagesToDelete);

      if (idsToDelete.length > 0) {
        await this.cloudinary.deleteImages(idsToDelete);
        images = images.filter((img) => !idsToDelete.includes(img.publicId));
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
    if (updateDto.availableDays) {
      dataToUpdate.availableDays = Array.isArray(updateDto.availableDays)
        ? updateDto.availableDays
        : JSON.parse(updateDto.availableDays);
    }
    if (updateDto.time) {
      dataToUpdate.time =
        typeof updateDto.time === 'string'
          ? JSON.parse(updateDto.time)
          : updateDto.time;
    }
    if (updateDto.price) dataToUpdate.price = Number(updateDto.price);

    delete dataToUpdate.imagesToDelete;
    delete dataToUpdate.coverImageId;

    return this.prisma.service.update({
      where: { id },
      data: { ...dataToUpdate, images },
    });
  }

  async remove(id: string, agentId: string) {
    const service = await this.findOne(id, agentId);
    if (service.images && service.images.length > 0) {
      const publicIds = service.images.map((img) => img.publicId);
      await this.cloudinary.deleteImages(publicIds);
    }
    await this.prisma.service.delete({ where: { id } });
    return { message: 'Service and associated images deleted successfully' };
  }

  async getAllByStudents() {
		const services = await this.prisma.service.findMany({
			orderBy: { createdAt: 'desc' },
		});
		return services;
	}
}
