import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { AgentAuthModule } from '../auth/agent-auth.module';
import { CloudinaryModule } from '../../common/cloudinary/cloudinary.module';
import { StudentAuthModule } from 'src/student/auth/student-auth.module';
import authConfig from 'src/common/auth/config/auth.config';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
	imports: [
		AgentAuthModule,
		CloudinaryModule,
		StudentAuthModule,
		ConfigModule.forFeature(authConfig),
		JwtModule.registerAsync(authConfig.asProvider()),
	],
	controllers: [ProductController],
	providers: [ProductService],
})
export class ProductModule {}
