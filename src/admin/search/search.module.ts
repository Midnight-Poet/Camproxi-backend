import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { AdminAuthModule } from '../auth/admin-auth.module';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [AdminAuthModule, PrismaModule],
  controllers: [SearchController],
  providers: [SearchService]
})
export class SearchModule {}
