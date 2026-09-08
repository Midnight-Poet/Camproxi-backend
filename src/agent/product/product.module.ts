import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { AgentAuthModule } from '../auth/agent-auth.module';
import { CloudinaryModule } from '../../common/cloudinary/cloudinary.module';
import { StudentAuthModule } from 'src/student/auth/student-auth.module';

@Module({
	imports: [
		AgentAuthModule,
		CloudinaryModule,
		StudentAuthModule,
	],
	controllers: [ProductController],
	providers: [ProductService],
	exports: [ProductService],
})
export class ProductModule {}
