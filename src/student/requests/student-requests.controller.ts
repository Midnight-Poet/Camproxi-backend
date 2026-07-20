import { Controller, Post, Get, Body, Req, UseGuards, BadRequestException, NotFoundException } from '@nestjs/common';
import { RequestsService } from 'src/common/requests/requests.service';
import { StudentAuthGuard } from '../auth/guards/student-auth.guard';
import { Request } from 'express';
import { PrismaService } from 'src/common/prisma/prisma.service';

interface CreateRequestBody {
  itemId: string;
  itemCategory: 'PRODUCT' | 'PROPERTY' | 'SERVICE';
  message?: string;
  itemName: string;
}

@Controller('api/student/requests')
@UseGuards(StudentAuthGuard)
export class StudentRequestsController {
  constructor(
    private readonly requestsService: RequestsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async createRequest(@Req() req: Request, @Body() body: CreateRequestBody) {
    const studentId = req['user'].sub;
    const schoolId = req['user'].schoolId; // From JWT

    // Verify item exists and belongs to the same school
    await this.verifySchoolMatch(body.itemId, body.itemCategory, schoolId);

    return await this.requestsService.createRequest({
      studentId,
      itemId: body.itemId,
      itemCategory: body.itemCategory,
      itemName: body.itemName,
      message: body.message,
    });
  }

  @Get()
  async getMyRequests(@Req() req: Request) {
    const studentId = req['user'].sub;
    return this.requestsService.getStudentRequests(studentId);
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
      throw new BadRequestException('You cannot send a request for items outside of your school');
    }
  }
}
