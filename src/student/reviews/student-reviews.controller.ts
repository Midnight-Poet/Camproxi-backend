import { Controller, Post, Delete, Get, Param, Body, Req, UseGuards, BadRequestException, NotFoundException } from '@nestjs/common';
import { ReviewsService } from 'src/common/reviews/reviews.service';
import { StudentAuthGuard } from '../auth/guards/student-auth.guard';
import { Request } from 'express';
import { PrismaService } from 'src/common/prisma/prisma.service';

interface AddRatingBody {
  itemId: string;
  itemCategory: 'PRODUCT' | 'PROPERTY' | 'SERVICE';
  rating: number;
}

interface AddReviewBody {
  itemId: string;
  itemCategory: 'PRODUCT' | 'PROPERTY' | 'SERVICE';
  comment: string;
}

@Controller('api/student')
@UseGuards(StudentAuthGuard)
export class StudentReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly prisma: PrismaService,
  ) {}

  // --- Ratings ---
  @Post('ratings')
  async addRating(@Req() req: Request, @Body() body: AddRatingBody) {
    const studentId = req['user'].sub;
    const schoolId = req['user'].schoolId; // From JWT

    // Verify item belongs to the same school
    await this.verifySchoolMatch(body.itemId, body.itemCategory, schoolId);

    return this.reviewsService.upsertRating({
      studentId,
      itemId: body.itemId,
      itemCategory: body.itemCategory,
      rating: body.rating,
    });
  }

  @Delete('ratings/:itemId')
  async deleteRating(@Req() req: Request, @Param('itemId') itemId: string) {
    const studentId = req['user'].sub;
    return this.reviewsService.deleteRating(itemId, studentId);
  }

  // --- Reviews (Comments) ---
  @Post('reviews')
  async addReview(@Req() req: Request, @Body() body: AddReviewBody) {
    const studentId = req['user'].sub;
    const schoolId = req['user'].schoolId; // From JWT

    // Verify item belongs to the same school
    await this.verifySchoolMatch(body.itemId, body.itemCategory, schoolId);

    return this.reviewsService.addReview({
      studentId,
      itemId: body.itemId,
      itemCategory: body.itemCategory,
      comment: body.comment,
    });
  }

  @Delete('reviews/:id')
  async deleteReview(@Req() req: Request, @Param('id') reviewId: string) {
    const studentId = req['user'].sub;
    return this.reviewsService.deleteReview(reviewId, studentId);
  }

  @Get('reviews/me')
  async getMyReviews(@Req() req: Request) {
    const studentId = req['user'].sub;
    return this.reviewsService.getStudentReviews(studentId);
  }

  @Get('ratings/me')
  async getMyRatings(@Req() req: Request) {
    const studentId = req['user'].sub;
    return this.reviewsService.getStudentRatings(studentId);
  }

  private async verifySchoolMatch(itemId: string, itemCategory: string, schoolId: string) {
    let item = null;
    if (itemCategory === 'PRODUCT') {
      item = await this.prisma.product.findUnique({ where: { id: itemId } });
    } else if (itemCategory === 'PROPERTY') {
      item = await this.prisma.property.findUnique({ where: { id: itemId } });
    } else if (itemCategory === 'SERVICE') {
      item = await this.prisma.service.findUnique({ where: { id: itemId } });
    } else {
      throw new BadRequestException('Invalid itemCategory');
    }

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (item.schoolId !== schoolId) {
      throw new BadRequestException('You cannot review or rate items outside of your school');
    }
  }
}
