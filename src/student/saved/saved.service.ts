import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class SavedService {
	constructor(private readonly prisma: PrismaService) {}

	public async saveItem(
		itemId: string,
		itemCategory: string,
		userId: string,
		schoolId: string,
	) {
		// Verify if the item exists and belongs to the student's school
		let isValid = false;
		if (itemCategory === 'PROPERTY') {
			const prop = await this.prisma.property.findFirst({ where: { id: itemId, schoolId } });
			if (prop) isValid = true;
		} else if (itemCategory === 'PRODUCT') {
			const prod = await this.prisma.product.findFirst({ where: { id: itemId, schoolId } });
			if (prod) isValid = true;
		} else if (itemCategory === 'SERVICE') {
			const serv = await this.prisma.service.findFirst({ where: { id: itemId, schoolId } });
			if (serv) isValid = true;
		}

		if (!isValid) {
			throw new BadRequestException('Item not found or does not belong to your school');
		}

		const item = await this.prisma.savedItem.create({
			data: { itemId: itemId, itemCategory, userId },
		});
		return item;
	}

	private async populateItem(savedItem: any) {
		if (!savedItem) return null;
		let details = null;
		if (savedItem.itemCategory === 'PROPERTY') {
			details = await this.prisma.property.findUnique({ where: { id: savedItem.itemId } });
		} else if (savedItem.itemCategory === 'PRODUCT') {
			details = await this.prisma.product.findUnique({ where: { id: savedItem.itemId } });
		} else if (savedItem.itemCategory === 'SERVICE') {
			details = await this.prisma.service.findUnique({ where: { id: savedItem.itemId } });
		}
		return { ...savedItem, item: details };
	}

	public async getSavedItemById(id: string, userId: string) {
        const savedItem = await this.prisma.savedItem.findFirst({
            where: { id, userId }
        });
		return this.populateItem(savedItem);
    }

	public async getAllSavedItem(userId: string) {
        const savedItems = await this.prisma.savedItem.findMany({
            where: { userId },
            orderBy: { savedAt: 'desc' }
        });
		return Promise.all(savedItems.map(item => this.populateItem(item)));
    }

	public async removeSavedItem(id: string, userId: string) {
        return await this.prisma.savedItem.deleteMany({
            where: { id, userId }
        });
    }

	public async removeAllSavedItem(userId: string) {
        return await this.prisma.savedItem.deleteMany({
            where: { userId }
        });
    }
}
