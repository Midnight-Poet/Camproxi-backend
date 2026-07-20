import { Controller, Post, Get, Param, Body, Req, UseGuards, BadRequestException, NotFoundException } from '@nestjs/common';
import { ReviewsService } from 'src/common/reviews/reviews.service';
import { AgentAuthGuard } from '../auth/agent-auth.guard';
import { Request } from 'express';
import { PrismaService } from 'src/common/prisma/prisma.service';

interface ReplyReviewBody {
  agentReply: string;
}

@Controller('api/agent/reviews')
@UseGuards(AgentAuthGuard)
export class AgentReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('item/:itemId')
  async getItemReviews(@Req() req: Request, @Param('itemId') itemId: string) {
    return this.reviewsService.getItemReviews(itemId);
  }

  @Get('item/:itemId/ratings')
  async getItemRatings(@Req() req: Request, @Param('itemId') itemId: string) {
    return this.reviewsService.getItemRatings(itemId);
  }

  @Post(':id/reply')
  async replyToReview(@Req() req: Request, @Param('id') reviewId: string, @Body() body: ReplyReviewBody) {
    const agentId = req['agent'].id;

    // Verify review exists
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Verify item belongs to agent
    await this.verifyItemOwnership(review.itemId, review.itemCategory, agentId);

    return this.reviewsService.agentReply({
      reviewId,
      agentReply: body.agentReply,
    });
  }

  private async verifyItemOwnership(itemId: string, itemCategory: string, agentId: string) {
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

    if (!item || item.agentId !== agentId) {
      throw new BadRequestException('You do not own this item');
    }
  }
}
