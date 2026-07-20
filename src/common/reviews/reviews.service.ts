import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { RecipientType, NotificationType } from '@prisma/client';

export interface UpsertRatingDto {
  studentId: string;
  itemId: string;
  itemCategory: 'PRODUCT' | 'PROPERTY' | 'SERVICE';
  rating: number;
}

export interface AddReviewDto {
  studentId: string;
  itemId: string;
  itemCategory: 'PRODUCT' | 'PROPERTY' | 'SERVICE';
  comment: string;
}

export interface ReplyReviewDto {
  reviewId: string;
  agentReply: string;
}

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  // --- Ratings API ---
  async upsertRating(data: UpsertRatingDto) {
    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const ratingRecord = await this.prisma.rating.upsert({
      where: {
        studentId_itemId: {
          studentId: data.studentId,
          itemId: data.itemId,
        },
      },
      update: {
        rating: data.rating,
      },
      create: {
        studentId: data.studentId,
        itemId: data.itemId,
        itemCategory: data.itemCategory,
        rating: data.rating,
      },
    });

    await this.recalculateItemRating(data.itemId, data.itemCategory);
    return ratingRecord;
  }

  async deleteRating(itemId: string, studentId: string) {
    const existing = await this.prisma.rating.findUnique({
      where: {
        studentId_itemId: {
          studentId,
          itemId,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Rating not found');
    }

    await this.prisma.rating.delete({
      where: {
        studentId_itemId: {
          studentId,
          itemId,
        },
      },
    });

    await this.recalculateItemRating(itemId, existing.itemCategory as any);
    return { message: 'Rating deleted successfully' };
  }

  async getItemRatings(itemId: string) {
    return this.prisma.rating.findMany({
      where: { itemId },
    });
  }

  // --- Reviews (Comments) API ---
  async addReview(data: AddReviewDto) {
    if (!data.comment || data.comment.trim() === '') {
      throw new BadRequestException('Comment is required');
    }

    // Check count: max of 3 reviews per item per student
    const existingCount = await this.prisma.review.count({
      where: {
        studentId: data.studentId,
        itemId: data.itemId,
      },
    });

    if (existingCount >= 3) {
      throw new BadRequestException('Maximum of 3 reviews allowed per item');
    }

    const review = await this.prisma.review.create({
      data: {
        studentId: data.studentId,
        itemId: data.itemId,
        itemCategory: data.itemCategory,
        comment: data.comment,
      },
    });

    // Notify the agent who owns the item
    let item = null;
    if (data.itemCategory === 'PRODUCT') {
      item = await this.prisma.product.findUnique({ where: { id: data.itemId } });
    } else if (data.itemCategory === 'PROPERTY') {
      item = await this.prisma.property.findUnique({ where: { id: data.itemId } });
    } else if (data.itemCategory === 'SERVICE') {
      item = await this.prisma.service.findUnique({ where: { id: data.itemId } });
    }

    if (item && item.agentId) {
      await this.notificationService.createNotification({
        recipientId: item.agentId,
        recipientType: RecipientType.AGENT,
        title: 'New Review Comment',
        message: `A student commented on your listing "${item.name}".`,
        type: NotificationType.INFO,
        category: 'REVIEW_CREATED',
        link: `/reviews/item/${data.itemId}`,
        itemId: data.itemId,
        itemCategory: data.itemCategory,
      });
    }

    return review;
  }

  async deleteReview(reviewId: string, studentId: string) {
    const existing = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existing || existing.studentId !== studentId) {
      throw new NotFoundException('Review not found or unauthorized');
    }

    await this.prisma.review.delete({
      where: { id: reviewId },
    });

    return { message: 'Review deleted successfully' };
  }

  async getItemReviews(itemId: string) {
    return this.prisma.review.findMany({
      where: { itemId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStudentReviews(studentId: string) {
    return this.prisma.review.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStudentRatings(studentId: string) {
    return this.prisma.rating.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async agentReply(data: ReplyReviewDto) {
    const updatedReview = await this.prisma.review.update({
      where: { id: data.reviewId },
      data: {
        agentReply: data.agentReply,
        agentRepliedAt: new Date(),
      },
    });

    // Notify the student who wrote the comment
    await this.notificationService.createNotification({
      recipientId: updatedReview.studentId,
      recipientType: RecipientType.STUDENT,
      title: 'Agent Replied to Review',
      message: `An agent replied to your review comment.`,
      type: NotificationType.SUCCESS,
      category: 'REVIEW_CREATED',
      link: `/my-reviews`,
      itemId: updatedReview.itemId,
      itemCategory: updatedReview.itemCategory,
    });

    return updatedReview;
  }

  private async recalculateItemRating(itemId: string, category: 'PRODUCT' | 'PROPERTY' | 'SERVICE') {
    const aggregations = await this.prisma.rating.aggregate({
      where: { itemId },
      _avg: { rating: true },
      _count: { id: true },
    });

    const averageRating = aggregations._avg.rating || 0;
    const totalReviews = aggregations._count.id || 0; // In this setup, totalReviews represents total ratings count

    if (category === 'PRODUCT') {
      await this.prisma.product.update({
        where: { id: itemId },
        data: { averageRating, totalReviews },
      });
    } else if (category === 'PROPERTY') {
      await this.prisma.property.update({
        where: { id: itemId },
        data: { averageRating, totalReviews },
      });
    } else if (category === 'SERVICE') {
      await this.prisma.service.update({
        where: { id: itemId },
        data: { averageRating, totalReviews },
      });
    }
  }
}
