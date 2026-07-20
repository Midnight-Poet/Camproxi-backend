import { Module, Global } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
