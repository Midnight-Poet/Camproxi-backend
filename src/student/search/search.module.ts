import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { StudentAuthModule } from '../auth/student-auth.module';

@Module({
  imports: [PrismaModule, StudentAuthModule],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
