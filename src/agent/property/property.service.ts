import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PropertyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  public generatePropertyId(): string {
    const prefix = 'C-PRO';
    const uuid = uuidv4().split('-')[0].toUpperCase();
    return `${prefix}-${uuid}`;
  }

  async create(
    agentId: string,
    createDto: CreatePropertyDto,
    images: { url: string; public_id: string }[],
    propertyId: string,
    schoolId: string
  ) {
    try {
      const amenities = Array.isArray(createDto.amenities)
        ? createDto.amenities
        : JSON.parse(createDto.amenities || '[]');
      // const location =
      //   typeof createDto.location === 'string'
      //     ? JSON.parse(createDto.location)
      //     : createDto.location;
      const formattedImages = images.map((img, index) => ({
        url: img.url,
        publicId: img.public_id,
        isCover: index === 0,
      }));

      // const propertyId = this.generatePropertyId();

      return await this.prisma.property.create({
        data: {
          propertyId,
          name: createDto.name,
          address: createDto.address,
          roomType: createDto.roomType,
          amenities,
          description: createDto.description,
          price: Number(createDto.price),
          unitQuantity: Number(createDto.unitQuantity),
          location: createDto.location,
          images: formattedImages,
          agentId,
          schoolId
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to create property: ${error.message}`);
    }
  }

  async findAllByAgent(agentId: string) {
    return this.prisma.property.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, agentId: string) {
    const property = await this.prisma.property.findUnique({ where: { id } });
    if (!property) throw new NotFoundException('Property not found');
    if (property.agentId !== agentId)
      throw new ForbiddenException('Access denied');
    return property;
  }

  async update(
    id: string,
    agentId: string,
    updateDto: UpdatePropertyDto,
    newImages: { url: string; public_id: string }[],
  ) {
    const property = await this.findOne(id, agentId);
    let images = [...(property.images || [])];

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
    if (updateDto.amenities)
      dataToUpdate.amenities = Array.isArray(updateDto.amenities)
        ? updateDto.amenities
        : JSON.parse(updateDto.amenities);
    if (updateDto.location)
      dataToUpdate.location =
        typeof updateDto.location === 'string'
          ? JSON.parse(updateDto.location)
          : updateDto.location;
    if (updateDto.price) dataToUpdate.price = Number(updateDto.price);
    if (updateDto.unitQuantity)
      dataToUpdate.unitQuantity = Number(updateDto.unitQuantity);

    delete dataToUpdate.imagesToDelete;
    delete dataToUpdate.coverImageId;

    return this.prisma.property.update({
      where: { id },
      data: { ...dataToUpdate, images },
    });
  }

  async remove(id: string, agentId: string) {
    const property = await this.findOne(id, agentId);
    if (property.images && property.images.length > 0) {
      const publicIds = property.images.map((img) => img.publicId);
      await this.cloudinary.deleteImages(publicIds);
    }
    await this.prisma.property.delete({ where: { id } });
    return { message: 'Property and associated images deleted successfully' };
  }

  async getAllByStudents() {
		const properties = await this.prisma.property.findMany({
			orderBy: { createdAt: 'desc' },
		});
		return properties;
	}
}
