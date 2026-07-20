import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { HashtagProvider } from 'src/common/auth/providers/hashtag.provider';
import { BcryptProvider } from 'src/common/auth/providers/bcrypt.provider';
import authConfig from 'src/common/auth/config/auth.config';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
	controllers: [ItemsController],
	providers: [
		ItemsService,
		{ provide: HashtagProvider, useClass: BcryptProvider },
	],
	imports: [
		ConfigModule.forFeature(authConfig),
		JwtModule.registerAsync(authConfig.asProvider()),
	],
})
export class ItemsModule {}
