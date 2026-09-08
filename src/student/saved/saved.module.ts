import { Module } from '@nestjs/common';
import { SavedService } from './saved.service';
import { SavedController } from './saved.controller';
import { StudentAuthModule } from '../auth/student-auth.module';

@Module({
	imports: [StudentAuthModule],
	controllers: [SavedController],
	providers: [SavedService],
	exports: [SavedService],
})
export class SavedModule {}
