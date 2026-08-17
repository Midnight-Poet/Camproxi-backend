import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async globalSearch(q: string) {
    const [
      students,
      agents,
      schools,
      products,
      properties,
      services,
    ] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { username: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
      this.prisma.agent.findMany({
        where: {
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { username: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { companyName: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
      this.prisma.school.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { code: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
      this.prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
      this.prisma.property.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
      this.prisma.service.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
    ]);

    const mappedStudents = students.map((s) => ({ ...s, type: 'STUDENT' }));
    const mappedAgents = agents.map((a) => ({ ...a, type: 'AGENT' }));
    const mappedSchools = schools.map((s) => ({ ...s, type: 'SCHOOL' }));
    const mappedProducts = products.map((p) => ({ ...p, type: 'PRODUCT' }));
    const mappedProperties = properties.map((p) => ({ ...p, type: 'PROPERTY' }));
    const mappedServices = services.map((s) => ({ ...s, type: 'SERVICE' }));

    return [
      ...mappedStudents,
      ...mappedAgents,
      ...mappedSchools,
      ...mappedProducts,
      ...mappedProperties,
      ...mappedServices,
    ];
  }
}
