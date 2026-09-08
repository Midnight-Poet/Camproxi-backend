import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { StudentAuthModule } from '../auth/student-auth.module';

@Module({
	imports: [StudentAuthModule],
	controllers: [ItemsController],
	providers: [ItemsService],
	exports: [ItemsService],
})
export class ItemsModule {}
