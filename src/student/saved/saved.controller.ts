import {
	BadRequestException,
	Body,
	Controller,
	Get,
	Post,
	Req,
    UseGuards,
    Delete,
    Param,
} from '@nestjs/common';
import { SavedService } from './saved.service';
import { Request } from 'express';
import { StudentAuthGuard } from '../auth/guards/student-auth.guard';

@UseGuards(StudentAuthGuard)
@Controller('api/student/saved')
export class SavedController {
	constructor(private readonly savedService: SavedService) {}

	@Post()
	async saveItem(
		@Body() data: { itemId: string; itemCategory: string },
		@Req() req: Request,
	) {
		const userId = req['user'].sub;
		const schoolId = req['user'].schoolId;
		try {
			const res = await this.savedService.saveItem(
				data.itemId,
				data.itemCategory,
				userId,
				schoolId,
			);
            return res
		} catch (err) {
			throw new BadRequestException(
				'Something Occured during saving, please Retry',
			);
		}
	}

    @Get()
    async getSavedItems(@Req() req: Request) {
        const userId = req['user'].sub;
        return await this.savedService.getAllSavedItem(userId)
    }

    @Get(':id')
    async getSavedItem(@Param('id') id: string, @Req() req: Request) {
        const userId = req['user'].sub;
        return await this.savedService.getSavedItemById(id, userId)
    }

    @Delete(':id')
    async removeSavedItem(@Param('id') id: string, @Req() req: Request) {
        const userId = req['user'].sub;
        return await this.savedService.removeSavedItem(id, userId)
    }

    @Delete()
    async removeAllSavedItems(@Req() req: Request) {
        const userId = req['user'].sub;
        return await this.savedService.removeAllSavedItem(userId)
    }
}
