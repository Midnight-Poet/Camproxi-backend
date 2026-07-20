import { Module } from '@nestjs/common';
import { SavedService } from './saved.service';
import { SavedController } from './saved.controller';
import { HashtagProvider } from 'src/common/auth/providers/hashtag.provider';
import { BcryptProvider } from 'src/common/auth/providers/bcrypt.provider';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import authConfig from 'src/common/auth/config/auth.config';

@Module({
	providers: [
		SavedService,
		{ provide: HashtagProvider, useClass: BcryptProvider },
	],
	imports: [
		ConfigModule.forFeature(authConfig),
		JwtModule.registerAsync(authConfig.asProvider()),
	],
	controllers: [SavedController],
})
export class SavedModule {}
