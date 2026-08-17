import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { SearchService } from './search.service';
import { StudentAuthGuard } from '../auth/guards/student-auth.guard';

@Controller('api/student/search')
@UseGuards(StudentAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @Request() req,
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.searchService.search(req.user.schoolId, {
      q,
      category,
      minPrice,
      maxPrice,
      sortBy,
    });
  }
}
